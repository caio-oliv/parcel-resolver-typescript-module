import path from "path";
import { FileSystem, Tsconfig } from "./types";
import { TypescriptModuleResolverConfig } from "./resolver/TypescriptModuleResolver";


export async function loadTsConfig(projectRoot: string, fs: FileSystem): Promise<TypescriptModuleResolverConfig> {
	const tsConfigPath = path.join(projectRoot, "tsconfig.json");
	const tsConfigContent = await fs.readFile(tsConfigPath, "utf-8");

	const tsConfig: Tsconfig = JSON.parse(tsConfigContent) ?? {};
	const { baseUrl = '', paths = {} } = tsConfig?.compilerOptions ?? {};

	return {
		absoluteBaseUrl: path.join(projectRoot, baseUrl),
		paths
	};
}
