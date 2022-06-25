import path from 'path';
import { FileSystemMock } from "FileSystem.mock";
import { TypescriptModuleResolver } from "./TypescriptModuleResolver";


function fromProjectDir(aPath: string) {
	return path.join('/home/ts/project', aPath);
}

describe('TypescriptModuleResolver absolute modules', () => {

	it('resolve module from path mapping', async () => {
		const fsMock = new FileSystemMock(new Map([
			[fromProjectDir('src/main.ts'), null],
			[fromProjectDir('src/app.ts'), null],
			[fromProjectDir('src/config/database/postgres.ts'), null],
			[fromProjectDir('src/config/database/sqlite.ts'), null],
			[fromProjectDir('src/config/cloud/aws.ts'), null],
			[fromProjectDir('src/config/env.ts'), null],
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: fromProjectDir('src'),
			paths: {
				'@config/*': ['config/*', 'config/database/*']
			},
		}, fsMock);

		{
			const modulePath = await resolver.resolve('@config/postgres', fromProjectDir('src/main.ts'));
			expect(modulePath).toBe(fromProjectDir('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/database/postgres', fromProjectDir('src/app.ts'));
			expect(modulePath).toBe(fromProjectDir('src/config/database/postgres.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/database/sqlite', fromProjectDir('src/app.ts'));
			expect(modulePath).toBe(fromProjectDir('src/config/database/sqlite.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/sqlite', fromProjectDir('src/main.ts'));
			expect(modulePath).toBe(fromProjectDir('src/config/database/sqlite.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/cloud/aws', fromProjectDir('src/app.ts'));
			expect(modulePath).toBe(fromProjectDir('src/config/cloud/aws.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/env', fromProjectDir('src/main.ts'));
			expect(modulePath).toBe(fromProjectDir('src/config/env.ts'));
		}
		{
			const modulePath = await resolver.resolve('@config/env/not_exists', fromProjectDir('src/main.ts'));
			expect(modulePath).toBe(null);
		}
	});

	it('resolve module from base url', async () => {
		const fsMock = new FileSystemMock(new Map([
			[fromProjectDir('src/app.ts'), null],
			[fromProjectDir('src/main.ts'), null]
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: fromProjectDir('src'),
			paths: {},
		}, fsMock);

		const modulePath = await resolver.resolve('app', fromProjectDir('src/main.ts'));

		expect(modulePath).toBe(fromProjectDir('src/app.ts'));
	});

})


describe('TypescriptModuleResolver relative modules', () => {

	it('resolve relative modules', async () => {
		const fsMock = new FileSystemMock(new Map([
			[fromProjectDir('src/app.ts'), null],
			[fromProjectDir('src/components/Button.ts'), null],
			[fromProjectDir('src/components/Text/index.ts'), null],
			[fromProjectDir('src/components/Text/styles.ts'), null],
			[fromProjectDir('src/main.ts'), null]
		]));
		const resolver = new TypescriptModuleResolver({
			absoluteBaseUrl: fromProjectDir(''),
			paths: {},
		}, fsMock);

		{
			const modulePath = await resolver.resolve('./app', fromProjectDir('src/main.ts'));
			expect(modulePath).toBe(fromProjectDir('src/app.ts'));
		}
		{
			const modulePath = await resolver.resolve('./components/Button', fromProjectDir('src/app.ts'));
			expect(modulePath).toBe(fromProjectDir('src/components/Button.ts'));
		}
		{
			const modulePath = await resolver.resolve('./components/Text', fromProjectDir('src/app.ts'));
			expect(modulePath).toBe(fromProjectDir('src/components/Text/index.ts'));
		}
		{
			const modulePath = await resolver.resolve('./styles', fromProjectDir('src/components/Text/index.ts'));
			expect(modulePath).toBe(fromProjectDir('src/components/Text/styles.ts'));
		}
	});

})
