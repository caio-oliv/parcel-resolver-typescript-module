import path from 'path';
import { FileSystemMock } from "FileSystem.mock";
import { TypescriptModuleResolver } from "./TypescriptModuleResolver";


function projectDir(aPath: string) {
	return path.join('/home/ts/project', aPath);
}

describe('TypescriptModuleResolver absolute modules', () => {

	it('resolve module from path mapping', async () => {
		const fsMock = new FileSystemMock(new Map([
			[projectDir('src/main.ts'), null],
			[projectDir('src/app.ts'), null],
			[projectDir('src/config/database/postgres.ts'), null],
			[projectDir('src/config/database/sqlite.ts'), null],
			[projectDir('src/config/cloud/aws.ts'), null],
			[projectDir('src/config/env.ts'), null],
			[projectDir('src/modules/auth/module.ts'), null],
			[projectDir('src/modules/auth/domain/entity/User.ts'), null],
			[projectDir('src/modules/auth/infra/repositories/UserRepository.ts'), null],
			[projectDir('src/modules/auth/app/UserUseCases/AuthenticateUser.ts'), null],
			[projectDir('src/modules/auth/app/UserUseCases/CreateUser.ts'), null],
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: projectDir('src'),
			paths: {
				'@config/*': ['config/*', 'config/database/*'],
				'@auth/*': ['modules/auth/*'],
			},
		}, fsMock);

		{
			const modulePath = await resolver.resolve('@config/postgres', projectDir('src/main.ts'));
			expect(modulePath).toBe(projectDir('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/database/postgres', projectDir('src/app.ts'));
			expect(modulePath).toBe(projectDir('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/database/sqlite', projectDir('src/app.ts'));
			expect(modulePath).toBe(projectDir('src/config/database/sqlite.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/sqlite', projectDir('src/main.ts'));
			expect(modulePath).toBe(projectDir('src/config/database/sqlite.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/cloud/aws', projectDir('src/app.ts'));
			expect(modulePath).toBe(projectDir('src/config/cloud/aws.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/env', projectDir('src/main.ts'));
			expect(modulePath).toBe(projectDir('src/config/env.ts'));
		}
		{
			const modulePath = await resolver.resolve('@auth/module', projectDir('src/app.ts'));
			expect(modulePath).toBe(projectDir('src/modules/auth/module.ts'));
		}
		{
			const modulePath = await resolver.resolve('@auth/domain/entity/User', projectDir('src/modules/auth/module.ts'));
			expect(modulePath).toBe(projectDir('src/modules/auth/domain/entity/User.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@auth/infra/repositories/UserRepository',
				projectDir('src/modules/auth/module.ts')
			);
			expect(modulePath).toBe(projectDir('src/modules/auth/infra/repositories/UserRepository.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@auth/app/UserUseCases/AuthenticateUser',
				projectDir('src/modules/auth/module.ts')
			);
			expect(modulePath).toBe(projectDir('src/modules/auth/app/UserUseCases/AuthenticateUser.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@auth/app/UserUseCases/CreateUser',
				projectDir('src/modules/auth/module.ts')
			);
			expect(modulePath).toBe(projectDir('src/modules/auth/app/UserUseCases/CreateUser.ts'));
		}
		{
			const modulePath = await resolver.resolve(
				'@config/database/postgres',
				projectDir('src/modules/auth/infra/repositories/UserRepository.ts')
			);
			expect(modulePath).toBe(projectDir('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/env/not_exists', projectDir('src/main.ts'));
			expect(modulePath).toBe(null);
		}
	});

	it('resolve module from base url', async () => {
		const fsMock = new FileSystemMock(new Map([
			[projectDir('src/app.ts'), null],
			[projectDir('src/main.ts'), null]
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: projectDir('src'),
			paths: {},
		}, fsMock);

		const modulePath = await resolver.resolve('app', projectDir('src/main.ts'));

		expect(modulePath).toBe(projectDir('src/app.ts'));
	});

})


describe('TypescriptModuleResolver relative modules', () => {

	it('resolve relative modules', async () => {
		const fsMock = new FileSystemMock(new Map([
			[projectDir('src/app.ts'), null],
			[projectDir('src/components/Button.ts'), null],
			[projectDir('src/components/Text/index.ts'), null],
			[projectDir('src/components/Text/styles.ts'), null],
			[projectDir('src/main.ts'), null]
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: projectDir(''),
			paths: {},
		}, fsMock);

		{
			const modulePath = await resolver.resolve('./app', projectDir('src/main.ts'));
			expect(modulePath).toBe(projectDir('src/app.ts'));
		}
		{
			const modulePath = await resolver.resolve('./components/Button', projectDir('src/app.ts'));
			expect(modulePath).toBe(projectDir('src/components/Button.ts'));
		}
		{
			const modulePath = await resolver.resolve('./components/Text', projectDir('src/app.ts'));
			expect(modulePath).toBe(projectDir('src/components/Text/index.ts'));
		}
		{
			const modulePath = await resolver.resolve('./styles', projectDir('src/components/Text/index.ts'));
			expect(modulePath).toBe(projectDir('src/components/Text/styles.ts'));
		}
	});

})
