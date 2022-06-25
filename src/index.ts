import { Resolver } from '@parcel/plugin';
import { ResolveResult } from '@parcel/types';
import { loadTsConfig } from './loadTsConfig';
import { TypescriptModuleResolver } from './resolver/TypescriptModuleResolver';


export default new Resolver({
	async resolve({ specifier, options, dependency, logger }): Promise<ResolveResult | null> {
		const { inputFS, projectRoot } = options;
		const { specifierType, resolveFrom } = dependency;

		if (!resolveFrom) {
			logger.warn({ message: `Can not resolve module "${specifier}" without the from module` });
			return null
		}

		logger.info({ message: `Resolving module (${specifierType}) "${specifier}" from "${resolveFrom}"` });

		// TODO: cache tsconfig
		const { absoluteBaseUrl, paths } = await loadTsConfig(projectRoot, inputFS);

		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl,
			paths,
		}, inputFS);

		const resolved = await resolver.resolve(specifier, resolveFrom);

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
