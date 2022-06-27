import deepmerge from "deepmerge";
import path from "node:path";
import { FileSystem, Tsconfig } from "types";


export async function readTsconfig(projectRoot: string, tsconfigFilename: string, fs: FileSystem): Promise<Tsconfig> {
	const tsconfigPath = path.join(projectRoot, tsconfigFilename);
	let tsconfig = await loadAndParse(tsconfigPath, fs);

	let lastExtendedConfig = tsconfig.extends;
	while (lastExtendedConfig) {
		const baseTsconfigPath = path.join(tsconfigPath, '..', lastExtendedConfig);
		const baseTsconfig = await loadAndParse(baseTsconfigPath, fs);
		updateBaseUrl(baseTsconfig, baseTsconfigPath, lastExtendedConfig);
		lastExtendedConfig = baseTsconfig.extends;
		tsconfig = deepmerge(baseTsconfig, tsconfig);
	}

	return tsconfig;
}

async function loadAndParse(tsconfigPath: string, fs: FileSystem): Promise<Tsconfig> {
	const tsConfigContent = await fs.readFile(tsconfigPath, 'utf8');

	const tsconfig: Tsconfig = JSON.parse(tsConfigContent) ?? {};
	return tsconfig;
}

/**
 * Updates baseUrl enrty extending a tsconfig file.
 * @param baseConfig extended tsconfig
 * @param baseConfigPath extended tsconfig file path
 * @param prevConfigPath original tsconfig file path
 * @returns updated baseUrl relative to the original tsconfig file
 */
function updateBaseUrl(baseConfig: Tsconfig, baseConfigPath: string, prevConfigPath: string): string | void {
	// baseUrl should be interpreted as relative to the base tsconfig,
	// but we need to update it so it is relative to the original tsconfig being loaded
	if (baseConfig?.compilerOptions?.baseUrl) {
		const extendsDir = path.dirname(prevConfigPath);
		baseConfig.compilerOptions.baseUrl = path.relative(
			path.dirname(baseConfigPath),
			path.join(extendsDir, baseConfig.compilerOptions.baseUrl),
		);
		return baseConfig.compilerOptions.baseUrl;
	}
}
