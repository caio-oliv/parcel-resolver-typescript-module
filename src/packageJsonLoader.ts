import { FileSystem, PackageJson } from 'types';


export async function loadPackageJson(filePath: string, fs: FileSystem): Promise<PackageJson | null> {
	try {
		const packageJsonContent = await fs.readFile(filePath, 'utf8');
		return JSON.parse(packageJsonContent) as PackageJson;
	} catch (err) {
		return null;
	}
}
