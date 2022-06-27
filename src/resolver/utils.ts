import path from "path";
import { TypescriptModuleResolverConfig } from "./TypescriptModuleResolver";


/**
 * Verify if a module has extension
 *
 * @param module a javascript module (ESM)
 * @returns a boolean for the extension presence
 *
 * ignores the full stop (.dot) as the first character of the last directory entry
 *
 * @example
 * ```
 * moduleHasExtension('.env') === false;
 * moduleHasExtension('config/.env') === false;
 * ```
 */
export function moduleHasExtension(module: string): boolean {
	const lastDirEntry = module.lastIndexOf(path.sep);
	const lastDotIndex = module.lastIndexOf('.');
	return lastDotIndex > 0 && lastDotIndex > lastDirEntry + 1;
}

export function relativeModule(module: string): boolean {
	return module.startsWith('.');
}

export function createTsModuleResolverConfig(
	projectRoot: string,
	baseUrl: string = '',
	paths: Record<string, string[]> = {}
): TypescriptModuleResolverConfig {
	return {
		absoluteBaseUrl: path.join(projectRoot, baseUrl),
		paths
	};
}
