import { Encoding, FileSystem } from "types";

/**
 * Record the files read
 */
export class RecordFS implements FileSystem {
	private readonly filesRead: string[] = [];
	private readonly fileExists: string[] = [];

	constructor(private readonly fs: FileSystem) { }

	public exists(filePath: string): Promise<boolean> {
		this.fileExists.push(filePath);
		return this.fs.exists(filePath);
	}

	public readFile(filePath: string, encoding?: Encoding | undefined): Promise<string> {
		this.filesRead.push(filePath);
		return this.fs.readFile(filePath, encoding);
	}

	public get read(): string[] { return this.filesRead.slice(); }

	public get verified(): string[] { return this.filesRead.slice(); }

}
