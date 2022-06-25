import { Resolver } from '@parcel/plugin';
import { ResolveResult } from '@parcel/types';
import { loadTsConfig } from './loadTsConfig';
import { TypescriptModuleResolver } from './resolver/TypescriptModuleResolver';


export default new Resolver({
	async resolve({ specifier, options, dependency, logger }): Promise<ResolveResult | null> {
		const { inputFS, projectRoot } = options;
		const { specifierType, resolveFrom } = dependency;

		logger.info({ message: `Resolving module (${specifierType}) "${specifier}" from "${resolveFrom}"` });

		// TODO: cache tsconfig
		const config = await loadTsConfig(projectRoot, inputFS);

		const resolver = new TypescriptModuleResolver(config, inputFS, {
			verifyModuleExtension: true
		});

		const resolved = await resolver.resolve(specifier, resolveFrom);
		if (!resolved) {
			logger.warn({ message: `Could not resolve module "${specifier}"` });
			return null;
		};

		// TODO: cache resolved modules
		logger.info({ message: `Module "${specifier}" resolved: ${resolved}` });
		return {
			filePath: resolved,
			invalidateOnFileChange: [resolved],
		};
	},
});
