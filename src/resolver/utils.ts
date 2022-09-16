import { sep as separator } from 'node:path';


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
	const lastDirEntry = module.lastIndexOf(separator);
	const lastDotIndex = module.lastIndexOf('.');
	return lastDotIndex > 0 && lastDotIndex > lastDirEntry + 1;
}

export function relativeModule(module: string): boolean {
	return module.startsWith('.');
}
