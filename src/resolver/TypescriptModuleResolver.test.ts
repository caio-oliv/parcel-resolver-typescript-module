import { FileSystemMock } from 'fs/FileSystem.mock';
import { TypescriptModuleResolver } from 'resolver/TypescriptModuleResolver';
import { fakePath } from 'testUtils.mock';


async function assertResolver(
	resolver: TypescriptModuleResolver,
	importer: string,
	module: string,
	resolved: string | null
): Promise<void> {
	const modulePath = await resolver.resolve(module, importer);
	expect(modulePath).toBe(resolved);
}

describe('TypescriptModuleResolver basic', () => {
	const fsMock = new FileSystemMock(new Map([
		[fakePath('src/main.ts'), null],
		[fakePath('src/config/env.ts'), null],
		[fakePath('src/config/PageNotFound.tsx'), null],
		[fakePath('src/pathMapping/nested/useCases/CreateUser.ts'), null],
		[fakePath('src/staticPathMapping/nested/static.ts'), null],
		[fakePath('src/staticPathMapping/withExtension.ts'), null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath('src'),
		paths: {
			'@pathMapping/*': ['pathMapping/nested/*'],
			'@staticPathMapping': ['staticPathMapping/nested/static'],
		},
		fileSystem: fsMock
	});

	it('not resolve path mapping with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@pathMapping/useCases/CreateUser.ts',
			null
		);
	});

	it('not resolve relative path with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'./config/PageNotFound.tsx',
			null,
		);
	});

	it('not resolve baseUrl with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'config/PageNotFound.tsx',
			null
		);
	});


	it('invalid static path mapping', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@static',
			null
		);
	});

	it('valid static path mapping', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@staticPathMapping',
			fakePath('src/staticPathMapping/nested/static.ts')
		);
	});

	it('valid path mapping', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@pathMapping/useCases/CreateUser',
			fakePath('src/pathMapping/nested/useCases/CreateUser.ts')
		);
	});

	it('invalid path mapping', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@pathMapping/useCases/DeleteUser',
			null
		);
	});

	it('valid relative path', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'./config/PageNotFound',
			fakePath('src/config/PageNotFound.tsx')
		);
	});

	it('invalid relative path', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'./config/invalidModule',
			null
		);
	});

	it('valid baseUrl path', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'config/PageNotFound',
			fakePath('src/config/PageNotFound.tsx')
		);
	});

	it('invalid baseUrl path', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'config/invalidModule',
			null
		);
	});

});

describe('TypescriptModuleResolver absolute modules', () => {
	const fsMock = new FileSystemMock(new Map([
		[fakePath('src/main.ts'), null],
		[fakePath('src/app.ts'), null],
		[fakePath('src/config/database/postgres.ts'), null],
		[fakePath('src/config/database/sqlite.ts'), null],
		[fakePath('src/config/cloud/aws.ts'), null],
		[fakePath('src/config/env.ts'), null],
		[fakePath('src/config/PageNotFound.tsx'), null],
		[fakePath('src/modules/auth/module.ts'), null],
		[fakePath('src/modules/auth/domain/index.ts'), null],
		[fakePath('src/modules/auth/domain/entity/User.ts'), null],
		[fakePath('src/modules/auth/infra/repositories/UserRepository.ts'), null],
		[fakePath('src/modules/auth/app/UserUseCases/CreateUser.ts'), null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath('src'),
		paths: {
			'@config/*': ['config/*', 'config/database/*'],
			'@auth/*': ['modules/auth/*'],
		},
		fileSystem: fsMock
	});

	it('resolve module from path mapping', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@config/postgres',
			fakePath('src/config/database/postgres.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'@config/database/postgres',
			fakePath('src/config/database/postgres.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@config/env/not_exists',
			null
		);

		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'@config/database/sqlite',
			fakePath('src/config/database/sqlite.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@config/sqlite',
			fakePath('src/config/database/sqlite.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'@config/cloud/aws',
			fakePath('src/config/cloud/aws.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'@config/env',
			fakePath('src/config/env.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'@auth/module',
			fakePath('src/modules/auth/module.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/modules/auth/module.ts'),
			'@auth/domain/entity/User',
			fakePath('src/modules/auth/domain/entity/User.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/modules/auth/module.ts'),
			'@auth/infra/repositories/UserRepository',
			fakePath('src/modules/auth/infra/repositories/UserRepository.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/modules/auth/module.ts'),
			'@auth/app/UserUseCases/CreateUser',
			fakePath('src/modules/auth/app/UserUseCases/CreateUser.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/modules/auth/infra/repositories/UserRepository.ts'),
			'@config/database/postgres',
			fakePath('src/config/database/postgres.ts')
		);
	});

	it('resolve index module in auth path mapping', async () => {
		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'@auth/domain',
			fakePath('src/modules/auth/domain/index.ts')
		);
	});

});

describe('TypescriptModuleResolver relative modules', () => {

	const fsMock = new FileSystemMock(new Map([
		[fakePath('src/main.ts'), null],
		[fakePath('src/components/Button.tsx'), null],
		[fakePath('src/components/Text/index.ts'), null],
		[fakePath('src/components/Text/styles.ts'), null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath(''),
		fileSystem: fsMock,
	});

	it('resolve relative modules', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'./components/Button',
			fakePath('src/components/Button.tsx')
		);

		await assertResolver(
			resolver,
			fakePath('src/components/Text/index.ts'),
			'./styles',
			fakePath('src/components/Text/styles.ts')
		);
	});

	it('resolve relative index module', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'./components/Text',
			fakePath('src/components/Text/index.ts')
		);
	})

});

describe('TypescriptModuleResolver package.json', () => {

	const fsMock = new FileSystemMock(new Map([
		[fakePath('package/front/main.ts'), null],
		[fakePath('package/front/app.ts'), null],

		[fakePath('package/back/main.ts'), null],
		[fakePath('package/back/dist/types.d.ts'), null],
		[fakePath('package/back/dist/module.js'), null],
		[fakePath('package/back/dist/main.js'), null],
		[fakePath('package/back/package.json'), Buffer.from(JSON.stringify({
			module: 'dist/module.js',
			main: 'dist/main.js',
			types: 'dist/types.d.ts',
		}))],

		[fakePath('package/shared/types.ts'), null],
		[fakePath('package/shared/dist/types.d.ts'), null],
		[fakePath('package/shared/dist/main.js'), null],
		[fakePath('package/shared/package.json'), Buffer.from(JSON.stringify({
			main: 'dist/main.js',
			types: 'dist/types.d.ts',
		}))],

		[fakePath('package/common/dist/types.d.ts'), null],
		[fakePath('package/common/package.json'), Buffer.from(JSON.stringify({
			types: 'dist/types.d.ts',
		}))],

		[fakePath('package/broken/package.json'), Buffer.from(JSON.stringify({
			name: 'package with no export'
		}))],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath('package'),
		fileSystem: fsMock,
	});

	it('resolve module in "module" property from package.json', async () => {
		await assertResolver(
			resolver,
			fakePath('package/front/app.ts'),
			'back',
			fakePath('package/back/dist/module.js')
		);

		await assertResolver(
			resolver,
			fakePath('package/front/app.ts'),
			'../back',
			fakePath('package/back/dist/module.js')
		);
	});

	it('fallback to "main" property when "module" in shared package is not found', async () => {
		await assertResolver(
			resolver,
			fakePath('package/front/app.ts'),
			'shared',
			fakePath('package/shared/dist/main.js')
		);

		await assertResolver(
			resolver,
			fakePath('package/front/main.ts'),
			'../shared',
			fakePath('package/shared/dist/main.js')
		);
	});

	it('fallback to "types" property when "main" in common package is not found', async () => {
		await assertResolver(
			resolver,
			fakePath('package/back/main.ts'),
			'common',
			fakePath('package/common/dist/types.d.ts')
		);

		await assertResolver(
			resolver,
			fakePath('package/back/main.ts'),
			'../common',
			fakePath('package/common/dist/types.d.ts')
		);
	});

	it('not resolve broken package', async () => {
		await assertResolver(
			resolver,
			fakePath('package/front/main.ts'),
			'broken',
			null
		);

		await assertResolver(
			resolver,
			fakePath('package/front/main.ts'),
			'../broken',
			null
		);
	})

});

describe('TypescriptModuleResolver flags', () => {

	const fsMock = new FileSystemMock(new Map([
		[fakePath('src/main.ts'), null],
		[fakePath('src/app.tsx'), null],
		[fakePath('src/component/Button/index.ts'), null],
		[fakePath('src/component/Button/Button.tsx'), null],
		[fakePath('src/component/Button/Button.module.css'), null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath('src'),
		paths: {
			'@component/*': ['component/*'],
		},
		flags: {
			verifyModuleExtension: true,
		},
		fileSystem: fsMock,
	});

	it('resolve relative module with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/component/Button/index.ts'),
			'./Button.tsx',
			fakePath('src/component/Button/Button.tsx'),
		);
	});

	it('resolve relative module with not supported extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/component/Button/Button.tsx'),
			'./Button.module.css',
			fakePath('src/component/Button/Button.module.css'),
		);
	});

	it('not resolve relative module with wrong extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/component/Button/index.ts'),
			'./Button.ts',
			null,
		);
	});

	it('resolve baseUrl module with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'app.tsx',
			fakePath('src/app.tsx')
		);
	});

	it('not resolve baseUrl module with wrong extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'app.ts',
			null
		);
	});

	it('resolve path mapping module with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/app.tsx'),
			'@component/Button/Button.tsx',
			fakePath('src/component/Button/Button.tsx'),
		);
	});

	it('not resolve path mapping module with wrong extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/app.tsx'),
			'@component/Button/Button.html',
			null,
		);
	});

	it('resolve baseUrl index module with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/app.tsx'),
			'component/Button',
			fakePath('src/component/Button/index.ts'),
		);
	});
});

describe('TypescriptModuleResolver custom extension', () => {

	const fsMock = new FileSystemMock(new Map([
		[fakePath('projects/backend/src/main.ts'), null],
		[fakePath('projects/backend/src/server.ts'), null],
		[fakePath('projects/backend/src/page/404.tsx'), null],
		[fakePath('projects/backend/src/@types/ExpressExtension.d.ts'), null],

		[fakePath('projects/libs/validation/src/lib.rs'), null],
		[fakePath('projects/libs/validation/dist/types.d.ts'), null],
		[fakePath('projects/libs/validation/dist/oxid.wasm'), null],
		[fakePath('projects/libs/validation/dist/oxid.native.so'), null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath('projects'),
		paths: {
			'@back/*': ['backend/src/*'],
			'lib.validation/*': ['libs/validation/src/*', 'libs/validation/dist/*'],
		},
		extensions: ['.ts', '.tsx', '.d.ts', '.rs', '.wasm'],
		fileSystem: fsMock,
	});

	it('resolve relative module', async () => {
		await assertResolver(
			resolver,
			fakePath('projects/backend/src/main.ts'),
			'./server',
			fakePath('projects/backend/src/server.ts'),
		);
	});

	it('resolve path mapping relative module', async () => {
		await assertResolver(
			resolver,
			fakePath('projects/backend/src/main.ts'),
			'@back/page/404',
			fakePath('projects/backend/src/page/404.tsx'),
		);
	});

	it('resolve baseUrl module', async () => {
		await assertResolver(
			resolver,
			fakePath('projects/backend/src/main.ts'),
			'backend/src/@types/ExpressExtension',
			fakePath('projects/backend/src/@types/ExpressExtension.d.ts'),
		);
	});

	it('resolve baseUrl module with custom extension', async () => {
		await assertResolver(
			resolver,
			fakePath('projects/backend/src/main.ts'),
			'lib.validation/oxid',
			fakePath('projects/libs/validation/dist/oxid.wasm'),
		);

		await assertResolver(
			resolver,
			fakePath('projects/backend/src/main.ts'),
			'lib.validation/lib',
			fakePath('projects/libs/validation/src/lib.rs'),
		);
	});

	it('resolve baseUrl module with unspecified custom extension', async () => {
		await assertResolver(
			resolver,
			fakePath('projects/backend/src/main.ts'),
			'lib.validation/oxid.native',
			null,
		);
	});

});

describe('TypescriptModuleResolver node_modules', () => {

	const fsMock = new FileSystemMock(new Map([
		['/home/node/repos/projname/src/main.ts', null],
		['/home/node/repos/projname/src/server.ts', null],
		['/home/node/repos/projname/node_modules/express/package.json', Buffer.from(JSON.stringify({
			module: 'dist/module.js',
			main: 'dist/main.js',
		}))],
		['/home/node/repos/projname/node_modules/prisma/index.js', null],
		['/home/node/repos/projname/node_modules/joi.js', null],
		['/home/node/node_modules/inhome/package.json', Buffer.from(JSON.stringify({
			module: 'dist/module.js',
		}))],
		['/node_modules/inroot/index.ts', null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: '/home/node/repos/projname/src',
		fileSystem: fsMock,
	});

	it('resolve express module in project node_modules', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/main.ts',
			'express',
			'/home/node/repos/projname/node_modules/express/dist/module.js',
		);
	});

	it('resolve prisma module in project node_modules', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/server.ts',
			'prisma',
			'/home/node/repos/projname/node_modules/prisma/index.js',
		);
	});

	it('resolve prisma module in project node_modules', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/main.ts',
			'prisma',
			'/home/node/repos/projname/node_modules/prisma/index.js',
		);
	});

	it('resolve joi module in project node_modules', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/server.ts',
			'joi',
			'/home/node/repos/projname/node_modules/joi.js',
		);
	});

	it('resolve "inhome" module in home node_modules', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/server.ts',
			'inhome',
			'/home/node/node_modules/inhome/dist/module.js',
		);
	});

	it('resolve "inroot" module in root node_modules', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/main.ts',
			'inroot',
			'/node_modules/inroot/index.ts',
		);
	});

	it('not resolve "unknown-module" module', async () => {
		await assertResolver(
			resolver,
			'/home/node/repos/projname/src/main.ts',
			'unknown-module',
			null,
		);
	});

});
