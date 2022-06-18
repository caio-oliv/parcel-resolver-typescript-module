import { FileSystem } from "./types";


export interface PackageJson {
	types?: string;
	main?: string;
	module?: string;
}

export async function loadPackageJson(filePath: string, fs: FileSystem): Promise<PackageJson | null> {
	try {
		const packageJsonContent = await fs.readFile(filePath, 'utf-8');
		return JSON.parse(packageJsonContent) as PackageJson;
	} catch (err) {
		return null;
	}
}
