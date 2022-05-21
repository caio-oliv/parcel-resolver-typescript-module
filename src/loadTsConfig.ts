import path from "path";
import { ParcelFileSystem, Tsconfig } from "./types";

export interface ConfigResult {
	absoluteBaseUrl: string;
	paths: { [key: string]: Array<string> };
	baseUrlPresent: boolean;
}

export async function loadTsConfig(projectRoot: string, fs: ParcelFileSystem): Promise<ConfigResult> {
	const tsConfigPath = path.join(projectRoot, "tsconfig.json");
	const tsConfigContent = await fs.readFile(tsConfigPath, "utf-8");

	const tsConfig: Tsconfig = JSON.parse(tsConfigContent) ?? {};
	const { baseUrl = '', paths = {} } = tsConfig?.compilerOptions ?? {};

	const absoluteBaseUrl = path.join(projectRoot, baseUrl);

	return { absoluteBaseUrl, paths, baseUrlPresent: baseUrl !== undefined };
}
