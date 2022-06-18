import path from "path";
import { ParcelFileSystem, Tsconfig } from "./types";
import { TsconfigPaths } from "./TypescriptModuleResolver";

export interface ConfigResult {
	absoluteBaseUrl: string;
	paths?: TsconfigPaths;
}

export async function loadTsConfig(projectRoot: string, fs: ParcelFileSystem): Promise<ConfigResult> {
	const tsConfigPath = path.join(projectRoot, "tsconfig.json");
	const tsConfigContent = await fs.readFile(tsConfigPath, "utf-8");

	const tsConfig: Tsconfig = JSON.parse(tsConfigContent) ?? {};
	const { baseUrl = '', paths } = tsConfig?.compilerOptions ?? {};

	return {
		absoluteBaseUrl: path.join(projectRoot, baseUrl),
		paths
	};
}
