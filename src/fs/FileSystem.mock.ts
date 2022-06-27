import { Encoding, FileSystem } from "types";


export class FileSystemMock implements FileSystem {
	constructor(public readonly fsTree: Map<string, Buffer | null>) {
	}

	public async exists(filePath: string): Promise<boolean> {
		for (const path of this.fsTree.keys()) {
			if (path.startsWith(filePath)) {
				return true;
			}
		}

		return false;
	}

	public async readFile(filePath: string, encoding?: Encoding): Promise<string> {
		const buffer = this.fsTree.get(filePath);
		if (!buffer) {
			throw new Error('ENOENT');
		}

		return buffer.toString(encoding);
	}
}
