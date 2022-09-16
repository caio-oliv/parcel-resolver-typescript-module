import { Encoding, FileSystem } from 'types';

export interface VerifiedFilesResult {
	foundFiles: string[];
	notFoundFiles: string[];
}

/**
 * Record the files read
 */
export class RecordFS implements FileSystem {
	private readonly filesRead: string[] = [];
	private readonly foundFiles: string[] = [];
	private readonly notFoundFiles: string[] = [];

	constructor(private readonly fs: FileSystem) { }

	/**
	 * Track existent and non existent files
	 */
	public async exists(filePath: string): Promise<boolean> {
		const result = await this.fs.exists(filePath);
		if (result) {
			this.foundFiles.push(filePath);
		} else {
			this.notFoundFiles.push(filePath);
		}
		return result;
	}

	/**
	 * Only tracks the file if exists
	 */
	public async readFile(filePath: string, encoding?: Encoding): Promise<string> {
		const content = await this.fs.readFile(filePath, encoding);
		this.filesRead.push(filePath);
		return content;
	}

	public get readFiles(): string[] { return this.filesRead.slice(); }

	public get verifiedFiles(): VerifiedFilesResult {
		return {
			foundFiles: this.foundFiles.slice(),
			notFoundFiles: this.notFoundFiles.slice()
		};
	}

	public get allExistentKnownFiles(): string[] {
		return [...this.foundFiles, ...this.filesRead];
	}

	public get allKnownFiles(): string[] {
		return [...this.foundFiles, ...this.notFoundFiles, ...this.filesRead];
	}

}
