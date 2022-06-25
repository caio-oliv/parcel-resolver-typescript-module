import path from "path";
import { loadPackageJson, PackageJson } from "../packageJsonLoader";
import { FileSystem } from "../types";
import { defaultFlags, mergeFlags, TypescriptModuleResolverFlags } from "./flags";
import { moduleHasExtension, relativeModule } from "./utils";


export type TsconfigPaths = Record<string, string[]>;

interface PathAlias {
	prefix: string;
	absolutePaths: string[]
}

export interface TypescriptModuleResolverConfig {
	/**
	 * Absolute path of tsconfig's base url.
	 *
	 * If tsconfig file does not have baseUrl, consider joing the project root
	 * with a empty string
	 *
	 * @example
	 *
	 * ```ts
	 * const absoluteBaseUrl = path.join(projectRoot, baseUrl ?? '')
	 * ```
	 */
	absoluteBaseUrl: string;

	/**
	 * `paths` entry of tsconfig file.
	 */
	paths?: TsconfigPaths;
}

const EXTENSIONS = ['.ts', '.tsx', '.d.ts'];

// TODO: implement node_modules resolution jumping up directories
// https://www.typescriptlang.org/docs/handbook/module-resolution.html#how-nodejs-resolves-modules
// https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders

export class TypescriptModuleResolver {
	private readonly fs: FileSystem;
	private readonly absoluteBaseUrl: string;
	private readonly paths: TsconfigPaths;
	private readonly resolvedAbsolutePathsMap: PathAlias[];
	private readonly extensions: string[];
	private readonly flags: TypescriptModuleResolverFlags;

	constructor(
		config: TypescriptModuleResolverConfig,
		fileSystem: FileSystem,
		flags: Partial<TypescriptModuleResolverFlags> = {},
		extensions: string[] = EXTENSIONS,
	) {
		this.fs = fileSystem;
		this.absoluteBaseUrl = config.absoluteBaseUrl;
		this.paths = config.paths ?? {};
		this.extensions = extensions;
		this.flags = mergeFlags(defaultFlags(), flags);

		this.resolvedAbsolutePathsMap = [];
		const regex = /\*$/;
		for (const pathAlias in this.paths) {
			const reolvedPaths = [];
			for (const pathEntry of this.paths[pathAlias]) {
				reolvedPaths.push(path.join(this.absoluteBaseUrl, pathEntry.replace(regex, '')));
			}

			this.resolvedAbsolutePathsMap.push({
				prefix: pathAlias.replace(regex, ''),
				absolutePaths: reolvedPaths
			});
		}
	}

	public async resolve(module: string, importerAbsolutePath?: string | null): Promise<string | null> {
		if (relativeModule(module)) {
			if (!importerAbsolutePath) return null;

			return this.resolveRelativeModule(module, importerAbsolutePath);
		}

		return this.resolveAbsoluteModule(module);
	}

	private async resolveRelativeModule(relativeModule: string, importerAbsolutePath: string): Promise<string | null> {
		const module = path.join(importerAbsolutePath, '..', relativeModule);
		return this.resolveLookups(module);
	}

	private async resolveAbsoluteModule(absoluteModule: string): Promise<string | null> {
		for (const { prefix, absolutePaths } of this.resolvedAbsolutePathsMap) {
			if (!absoluteModule.startsWith(prefix)) continue;

			const relativePathFromAlias = absoluteModule.substring(prefix.length);
			for (const resolvedAliasPath of absolutePaths) {
				const module = path.join(resolvedAliasPath, relativePathFromAlias);
				const filePath = await this.resolveLookups(module);
				if (filePath) return filePath;
			}
		}

		const absoluteModuleFromBaseUrl = path.join(this.absoluteBaseUrl, absoluteModule);
		const filePath = await this.resolveLookups(absoluteModuleFromBaseUrl);
		if (filePath) return filePath;

		return null;
	}


	private async resolveLookups(absoluteModule: string): Promise<string | null> {
		const filePath = await this.verifyExtensions(absoluteModule);
		if (filePath) return filePath;

		const packageJsonPath = path.join(absoluteModule, 'package.json');
		const content = await loadPackageJson(packageJsonPath, this.fs);
		if (content) {
			const relativeFilePath = this.getPackageJsonProperties(content);
			if (relativeFilePath) return path.join(absoluteModule, relativeFilePath);
		}

		const indexFilePath = await this.verifyExtensions(path.join(absoluteModule, 'index'));
		if (indexFilePath) return indexFilePath;

		return null;
	}

	private async verifyExtensions(module: string): Promise<string | null> {
		if (this.flags.verifyModuleExtension) {
			if (moduleHasExtension(module)) {
				const fileExists = await this.fs.exists(module);
				if (fileExists) return module;
			}
		}

		for (const extension of this.extensions) {
			const filePath = module + extension;
			const fileExists = await this.fs.exists(filePath);
			if (fileExists) return filePath;
		}
		return null;
	}

	private getPackageJsonProperties(packageObj: PackageJson): string | null {
		if (packageObj.types) return packageObj.types;
		if (packageObj.module) return packageObj.module;
		if (packageObj.main) return packageObj.main;
		return null;
	}

}
