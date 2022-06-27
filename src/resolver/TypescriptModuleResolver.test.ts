import { FileSystemMock } from "fs/FileSystem.mock";
import { TypescriptModuleResolver } from "./TypescriptModuleResolver";
import { fakePath } from 'testUtils.mock';


describe('TypescriptModuleResolver absolute modules', () => {

	it('resolve module from path mapping', async () => {
		const fsMock = new FileSystemMock(new Map([
			[fakePath('src/main.ts'), null],
			[fakePath('src/app.ts'), null],
			[fakePath('src/config/database/postgres.ts'), null],
			[fakePath('src/config/database/sqlite.ts'), null],
			[fakePath('src/config/cloud/aws.ts'), null],
			[fakePath('src/config/env.ts'), null],
			[fakePath('src/modules/auth/module.ts'), null],
			[fakePath('src/modules/auth/domain/entity/User.ts'), null],
			[fakePath('src/modules/auth/infra/repositories/UserRepository.ts'), null],
			[fakePath('src/modules/auth/app/UserUseCases/AuthenticateUser.ts'), null],
			[fakePath('src/modules/auth/app/UserUseCases/CreateUser.ts'), null],
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: fakePath('src'),
			paths: {
				'@config/*': ['config/*', 'config/database/*'],
				'@auth/*': ['modules/auth/*'],
			},
		}, fsMock);

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
				'@auth/app/UserUseCases/AuthenticateUser',
				fakePath('src/modules/auth/module.ts')
			);
			expect(modulePath).toBe(fakePath('src/modules/auth/app/UserUseCases/AuthenticateUser.ts'));
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

	it('resolve module from base url', async () => {
		const fsMock = new FileSystemMock(new Map([
			[fakePath('src/app.ts'), null],
			[fakePath('src/main.ts'), null]
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: fakePath('src'),
			paths: {},
		}, fsMock);

		const modulePath = await resolver.resolve('app', fakePath('src/main.ts'));

		expect(modulePath).toBe(fakePath('src/app.ts'));
	});

})


describe('TypescriptModuleResolver relative modules', () => {

	it('resolve relative modules', async () => {
		const fsMock = new FileSystemMock(new Map([
			[fakePath('src/app.ts'), null],
			[fakePath('src/components/Button.ts'), null],
			[fakePath('src/components/Text/index.ts'), null],
			[fakePath('src/components/Text/styles.ts'), null],
			[fakePath('src/main.ts'), null]
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: fakePath(''),
			paths: {},
		}, fsMock);

		{
			const modulePath = await resolver.resolve('./app', fakePath('src/main.ts'));
			expect(modulePath).toBe(fakePath('src/app.ts'));
		}
		{
			const modulePath = await resolver.resolve('./components/Button', fakePath('src/app.ts'));
			expect(modulePath).toBe(fakePath('src/components/Button.ts'));
		}
		{
			const modulePath = await resolver.resolve('./components/Text', fakePath('src/app.ts'));
			expect(modulePath).toBe(fakePath('src/components/Text/index.ts'));
		}
		{
			const modulePath = await resolver.resolve('./styles', fakePath('src/components/Text/index.ts'));
			expect(modulePath).toBe(fakePath('src/components/Text/styles.ts'));
		}
	});

})
