import path from "path";
import { loadPackageJson, PackageJson } from "../packageJsonLoader";
import { FileSystem } from "../types";
import { moduleHasExtension, nonRelativeModule } from "./utils";


export type TsconfigPaths = Record<string, string[]>;

export interface PathAlias {
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

export enum TypescriptModuleResolverErrorType {
	PARSE_PACKAGE_JSON,
}

export class ParsePackageJsonResolverError extends Error {
	public type = TypescriptModuleResolverErrorType.PARSE_PACKAGE_JSON;
}

// TODO: implement node_modules resoluution jumping up directories
// https://www.typescriptlang.org/docs/handbook/module-resolution.html#how-nodejs-resolves-modules
// https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders

export class TypescriptModuleResolver {
	private readonly fs: FileSystem;
	private readonly absoluteBaseUrl: string;
	private readonly paths: TsconfigPaths;

	private readonly resolvedAbsolutePathsMap: PathAlias[];

	constructor(options: TypescriptModuleResolverConfig, fileSystem: FileSystem) {
		this.fs = fileSystem;
		this.absoluteBaseUrl = options.absoluteBaseUrl;
		this.paths = options.paths ?? {};

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

	public async resolve(module: string, importerAbsolutePath: string): Promise<string | null> {
		if (nonRelativeModule(module)) {
			return this.resolveRelativePath(module, importerAbsolutePath);
		} else {
			return this.resolveAbsolutePath(module);
		}
	}

	private async resolveRelativePath(relativeModule: string, importerAbsolutePath: string): Promise<string | null> {
		const module = path.join(importerAbsolutePath, relativeModule);
		return this.resolveLookups(module);
	}

	private async resolveAbsolutePath(absoluteModule: string): Promise<string | null> {
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
		// check if a module already has an extension is not part of the typescript module resolution
		// Some project with absolute imports:
		// import { app } from 'app.ts';
		// TODO: control this feature with a flag and disable by default
		if (moduleHasExtension(module)) {
			const fileExists = await this.fs.exists(module);
			if (fileExists) return module;
		}

		for (const extension of TypescriptModuleResolver.fileExtensions) {
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


	private static readonly fileExtensions = ['.ts', '.tsx', '.d.ts'];

}
