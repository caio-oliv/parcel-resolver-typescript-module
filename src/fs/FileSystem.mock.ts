import { join as joinpath, sep as separator } from 'node:path';
import { Encoding, FileSystem } from "types";

type FsTree = Map<string, Buffer | null>;

/**
 * File System Mock for testing TypescriptModuleResolver
 */
export class FileSystemMock implements FileSystem {
	private readonly tree: FsTree;

	constructor(fsTree: FsTree) {
		const tree: FsTree = new Map;
		for (const [path, file] of fsTree.entries()) {
			tree.set(joinpath(separator, path), file);
		}

		this.tree = tree;
	}

	public async exists(filePath: string): Promise<boolean> {
		const rootFilePath = joinpath(separator, filePath);
		return this.tree.has(rootFilePath);
	}

	public async readFile(filePath: string, encoding?: Encoding): Promise<string> {
		const rootFilePath = joinpath(separator, filePath);
		const buffer = this.tree.get(rootFilePath);
		if (!buffer) {
			throw new Error('ENOENT');
		}

		return buffer.toString(encoding);
	}
}
