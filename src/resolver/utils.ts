import path from "path";

export function moduleHasExtension(module: string): boolean {
	const lastDotIndex = module.lastIndexOf('.');
	if (lastDotIndex === -1) return false;

	const dotFromLastDirEntry = module.indexOf(path.sep, lastDotIndex) === -1;
	return dotFromLastDirEntry;
}

export function nonRelativeModule(module: string): boolean {
	return module.startsWith('.');
}
