import { default as deepmerge } from 'deepmerge';
import { join as joinpath, dirname, relative as relativepath } from 'node:path';
import { FileSystem, Tsconfig } from 'types';


export async function readTsconfig(projectRoot: string, tsconfigFilename: string, fs: FileSystem): Promise<Tsconfig> {
	const tsconfigPath = joinpath(projectRoot, tsconfigFilename);
	let tsconfig = await loadAndParse(tsconfigPath, fs);

	let lastExtendedConfig = tsconfig.extends;
	while (lastExtendedConfig) {
		const baseTsconfigPath = joinpath(tsconfigPath, '..', lastExtendedConfig);
		const baseTsconfig = await loadAndParse(baseTsconfigPath, fs);
		updateBaseUrl(baseTsconfig, baseTsconfigPath, lastExtendedConfig);
		lastExtendedConfig = baseTsconfig.extends;
		tsconfig = deepmerge(baseTsconfig, tsconfig);
	}

	return tsconfig;
}

async function loadAndParse(tsconfigPath: string, fs: FileSystem): Promise<Tsconfig> {
	const tsConfigContent = await fs.readFile(tsconfigPath, 'utf8');

	try {
		const tsconfig: Tsconfig = JSON.parse(tsConfigContent);
		return tsconfig;
	} catch (err) {
		throw new TsConfigError(TsConfigErrorKind.InvalidJson, err);
	}
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
		const extendsDir = dirname(prevConfigPath);
		baseConfig.compilerOptions.baseUrl = relativepath(
			dirname(baseConfigPath),
			joinpath(extendsDir, baseConfig.compilerOptions.baseUrl),
		);
		return baseConfig.compilerOptions.baseUrl;
	}
}

export enum TsConfigErrorKind {
	InvalidJson = 'invalid_json',
}

export class TsConfigError extends Error {
	public readonly kind: TsConfigErrorKind;
	public readonly cause: unknown | null;

	constructor(kind: TsConfigErrorKind, cause: unknown = null) {
		super(`Ts config error ${kind}`);
		this.kind = kind;
		this.cause = cause;
	}
}
