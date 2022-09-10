import { join as joinpath } from 'node:path';
import { Resolver } from '@parcel/plugin';
import { ResolveResult } from '@parcel/types';
import { TypescriptModuleResolver } from 'resolver/TypescriptModuleResolver';
import { RecordFS } from 'fs/RecordFS';
import { readTsconfig } from 'readTsconfig';


export default new Resolver({
	async resolve({ specifier, options, dependency, logger }): Promise<ResolveResult | null> {
		const { inputFS, projectRoot } = options;
		const { specifierType, resolveFrom } = dependency;
		const recordFS = new RecordFS(inputFS);

		logger.info({ message: `Resolving module (${specifierType}) "${specifier}" from "${resolveFrom}"` });

		const { compilerOptions } = await readTsconfig(projectRoot, 'tsconfig.json', recordFS);

		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: joinpath(projectRoot, compilerOptions?.baseUrl ?? ''),
			paths: compilerOptions?.paths ?? {},
			flags: {
				verifyModuleExtension: true
			},
			fileSystem: recordFS,
		});

		const resolved = await resolver.resolve(specifier, resolveFrom);
		if (!resolved) {
			logger.warn({ message: `Could not resolve module "${specifier}"` });
			return null;
		};

		logger.info({ message: `Module "${specifier}" resolved: ${resolved}` });
		return {
			filePath: resolved,
			invalidateOnFileChange: recordFS.read,
		};
	},
});
