import { Resolver } from '@parcel/plugin';
import { PluginLogger, ResolveResult } from '@parcel/types';
import { createMatchPath, ReadJsonSync } from 'tsconfig-paths';
import { loadTsConfig } from './loadTsConfig';
import { ParcelFileSystem } from './types';

function createReadJson(fs: ParcelFileSystem, logger: PluginLogger): ReadJsonSync {
	return function readJsonSync(path: string): any {
		logger.info({ message: `reading json from path: ${path}` });

		try {
			const content = fs.readFileSync(path, 'utf-8');
			return JSON.parse(content);
		} catch (err) {
			return;
		}
	}
}

function createFileExists(fs: ParcelFileSystem, logger: PluginLogger): ReadJsonSync {
	return function fileExists(filePath: string): boolean {
		logger.info({ message: `verifying file existence: ${filePath}` });

		try {
			return fs.existsSync(filePath);
		} catch (err) {
			return false;
		}
	}
}

export default new Resolver({
	async resolve({ specifier, options, dependency, logger }): Promise<ResolveResult | null> {
		const { inputFS, projectRoot } = options;
		const { specifierType } = dependency;

		logger.info({ message: `Resolving module (${specifierType}) "${specifier}"` });

		// TODO: cache tsconfig
		const { absoluteBaseUrl, paths } = await loadTsConfig(projectRoot, inputFS);

		const resolver = createMatchPath(absoluteBaseUrl, paths, ['main', 'module']);

		const resolved = resolver(
			specifier,
			createReadJson(inputFS, logger),
			createFileExists(inputFS, logger),
			// TODO: verify tsconfig flags before apply extensions
			['.ts', '.tsx', '.d.ts', '.js', '.mjs', '.jsx']
		);

		if (!resolved) {
			logger.warn({ message: `Could not resolve module "${specifier}"` });
			return null;
		};

		// TODO: cache resolved modules
		logger.info({ message: `Module "${specifier}" resolved: ${resolved + '.ts'}` });
		return {
			filePath: resolved + '.ts',
			invalidateOnFileChange: [resolved],
		};
	},
});
