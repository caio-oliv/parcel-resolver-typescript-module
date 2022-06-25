
export interface TypescriptModuleResolverFlags {
	/**
	 * Verifies if a module already has extension before matching with the resolver specified extensions.
	 */
	verifyModuleExtension: boolean;
}

export function defaultFlags(): TypescriptModuleResolverFlags {
	return {
		verifyModuleExtension: false
	}
}

export function mergeFlags(
	base: TypescriptModuleResolverFlags,
	newf: Partial<TypescriptModuleResolverFlags>
): TypescriptModuleResolverFlags {
	return {
		verifyModuleExtension: newf.verifyModuleExtension ?? base.verifyModuleExtension,
	}
}
