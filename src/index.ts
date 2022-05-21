import { Resolver } from '@parcel/plugin';
import { ResolveResult } from '@parcel/types';
import { createMatchPath } from 'tsconfig-paths';
import { loadTsConfig } from './loadTsConfig';

export default new Resolver({
	async resolve({ specifier, options, logger }): Promise<ResolveResult | null> {
		const { inputFS, projectRoot } = options;

		const { absoluteBaseUrl, paths, baseUrlPresent } = await loadTsConfig(projectRoot, inputFS);

		const resolver = createMatchPath(absoluteBaseUrl, paths, undefined, baseUrlPresent);

		const resolved = resolver(specifier);
		if (!resolved) {
			logger.info({ message: `Could not resolve module "${specifier}"` });
			return null;
		};

		logger.info({ message: `Module "${specifier}" resolved` });
		return {
			filePath: resolved,
			invalidateOnFileChange: [resolved],
		};
	}
});
