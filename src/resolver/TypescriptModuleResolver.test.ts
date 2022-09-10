import { FileSystemMock } from "fs/FileSystem.mock";
import { TypescriptModuleResolver } from "./TypescriptModuleResolver";
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
		[fakePath('src/config/PageNotFount.tsx'), null],
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
	}, fsMock);

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
			'./config/PageNotFount.tsx',
			null,
		);
	});

	it('not resolve baseUrl with extension', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'config/PageNotFount.tsx',
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
			'./config/PageNotFount',
			fakePath('src/config/PageNotFount.tsx')
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
			'config/PageNotFount',
			fakePath('src/config/PageNotFount.tsx')
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

// TEST: package json, flags, custom extension and node_modules

describe('TypescriptModuleResolver absolute modules', () => {
	const fsMock = new FileSystemMock(new Map([
		[fakePath('src/main.ts'), null],
		[fakePath('src/app.ts'), null],
		[fakePath('src/config/database/postgres.ts'), null],
		[fakePath('src/config/database/sqlite.ts'), null],
		[fakePath('src/config/cloud/aws.ts'), null],
		[fakePath('src/config/env.ts'), null],
		[fakePath('src/config/PageNotFount.tsx'), null],
		[fakePath('src/modules/auth/module.ts'), null],
		[fakePath('src/modules/auth/domain/entity/User.ts'), null],
		[fakePath('src/modules/auth/infra/repositories/UserRepository.ts'), null],
		[fakePath('src/modules/auth/app/UserUseCases/CreateUser.ts'), null],
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath('src'),
		paths: {
			'@config/*': ['config/*', 'config/database/*'],
			'@auth/*': ['modules/auth/*'],
			'@env': ['config/env.ts']
		},
	}, fsMock);

	it('resolve module from path mapping', async () => {
		{
			const modulePath = await resolver.resolve('@config/postgres', fakePath('src/main.ts'));
			expect(modulePath).toBe(fakePath('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/database/postgres', fakePath('src/app.ts'));
			expect(modulePath).toBe(fakePath('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/database/sqlite', fakePath('src/app.ts'));
			expect(modulePath).toBe(fakePath('src/config/database/sqlite.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/sqlite', fakePath('src/main.ts'));
			expect(modulePath).toBe(fakePath('src/config/database/sqlite.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/cloud/aws', fakePath('src/app.ts'));
			expect(modulePath).toBe(fakePath('src/config/cloud/aws.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/env', fakePath('src/main.ts'));
			expect(modulePath).toBe(fakePath('src/config/env.ts'));
		}
		{
			const modulePath = await resolver.resolve('@auth/module', fakePath('src/app.ts'));
			expect(modulePath).toBe(fakePath('src/modules/auth/module.ts'));
		}
		{
			const modulePath = await resolver.resolve('@auth/domain/entity/User', fakePath('src/modules/auth/module.ts'));
			expect(modulePath).toBe(fakePath('src/modules/auth/domain/entity/User.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@auth/infra/repositories/UserRepository',
				fakePath('src/modules/auth/module.ts')
			);
			expect(modulePath).toBe(fakePath('src/modules/auth/infra/repositories/UserRepository.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@auth/app/UserUseCases/CreateUser',
				fakePath('src/modules/auth/module.ts')
			);
			expect(modulePath).toBe(fakePath('src/modules/auth/app/UserUseCases/CreateUser.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@config/database/postgres',
				fakePath('src/modules/auth/infra/repositories/UserRepository.ts')
			);
			expect(modulePath).toBe(fakePath('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/env/not_exists', fakePath('src/main.ts'));
			expect(modulePath).toBe(null);
		}
	});

});

describe('TypescriptModuleResolver relative modules', () => {

	const fsMock = new FileSystemMock(new Map([
		[fakePath('src/app.ts'), null],
		[fakePath('src/components/Button.tsx'), null],
		[fakePath('src/components/Text/index.ts'), null],
		[fakePath('src/components/Text/styles.ts'), null],
		[fakePath('src/main.ts'), null]
	]));

	const resolver = new TypescriptModuleResolver({
		absoluteBaseUrl: fakePath(''),
		paths: {},
	}, fsMock);

	it('resolve relative modules', async () => {
		await assertResolver(
			resolver,
			fakePath('src/main.ts'),
			'./app',
			fakePath('src/app.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'./components/Button',
			fakePath('src/components/Button.tsx')
		);

		await assertResolver(
			resolver,
			fakePath('src/app.ts'),
			'./components/Text',
			fakePath('src/components/Text/index.ts')
		);

		await assertResolver(
			resolver,
			fakePath('src/components/Text/index.ts'),
			'./styles',
			fakePath('src/components/Text/styles.ts')
		);
	});

});
