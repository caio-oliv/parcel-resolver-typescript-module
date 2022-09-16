import { FileSystemMock } from 'fs/FileSystem.mock';
import { readTsconfig, TsConfigError } from 'readTsconfig';
import { fakePath } from 'testUtils.mock';
import { Tsconfig } from 'types';


describe('read tsconfig file', () => {

	it('read tsconfig', async () => {
		const tsconfigPathname = 'tsconfig.json';
		const mockFS = new FileSystemMock(new Map([
			[fakePath(tsconfigPathname), Buffer.from(
				JSON.stringify({
					compilerOptions: {
						baseUrl: './src'
					}
				} as Tsconfig)
			)]
		]))

		const tsconfigObj = await readTsconfig(fakePath(), tsconfigPathname, mockFS);

		expect(tsconfigObj).toStrictEqual({
			compilerOptions: {
				baseUrl: './src'
			}
		})
	});

	it('read extended tsconfig', async () => {
		const tsconfigPathname = 'tsconfig.build.json';
		const mockFS = new FileSystemMock(new Map([
			[fakePath('tsconfig.json'), Buffer.from(
				JSON.stringify({
					compilerOptions: {
						baseUrl: 'src'
					}
				} as Tsconfig)
			)],
			[fakePath(tsconfigPathname), Buffer.from(
				JSON.stringify({
					extends: './tsconfig.json',
					compilerOptions: {
						outDir: "./dist",
					},
					exclude: [
						'**/*.test.ts',
					]
				} as Tsconfig)
			)]
		]))

		const tsconfigObj = await readTsconfig(fakePath(), tsconfigPathname, mockFS);

		expect(tsconfigObj).toStrictEqual({
			extends: './tsconfig.json',
			compilerOptions: {
				baseUrl: 'src',
				outDir: "./dist",
			},
			exclude: [
				'**/*.test.ts',
			]
		});
	});

	it('read extended tsconfig updating baseUrl', async () => {
		const tsconfigPathname = 'microservice1/tsconfig.json';
		const mockFS = new FileSystemMock(new Map([
			[fakePath('tsconfig.json'), Buffer.from(
				JSON.stringify({
					compilerOptions: {
						baseUrl: './src'
					}
				} as Tsconfig)
			)],
			[fakePath(tsconfigPathname), Buffer.from(
				JSON.stringify({
					extends: '../tsconfig.json',
					compilerOptions: {
						outDir: "./dist",
						baseUrl: 'src',
					},
					exclude: [
						'**/*.test.ts',
					]
				} as Tsconfig)
			)]
		]))

		const tsconfigObj = await readTsconfig(fakePath(), tsconfigPathname, mockFS);

		expect(tsconfigObj).toStrictEqual({
			extends: '../tsconfig.json',
			compilerOptions: {
				baseUrl: 'src',
				outDir: "./dist",
			},
			exclude: [
				'**/*.test.ts',
			]
		});
	});

	it('read extended tsconfig with the extended baseUrl', async () => {
		const tsconfigPathname = 'microservice1/tsconfig.json';
		const mockFS = new FileSystemMock(new Map([
			[fakePath('tsconfig.json'), Buffer.from(
				JSON.stringify({
					compilerOptions: {
						baseUrl: './src'
					}
				} as Tsconfig)
			)],
			[fakePath(tsconfigPathname), Buffer.from(
				JSON.stringify({
					extends: '../tsconfig.json',
					compilerOptions: {
						outDir: "./dist",
					},
					exclude: [
						'**/*.test.ts',
					]
				} as Tsconfig)
			)]
		]))

		const tsconfigObj = await readTsconfig(fakePath(), tsconfigPathname, mockFS);

		expect(tsconfigObj).toStrictEqual({
			extends: '../tsconfig.json',
			compilerOptions: {
				baseUrl: '../src',
				outDir: "./dist",
			},
			exclude: [
				'**/*.test.ts',
			]
		});
	});

	it('throw an TsConfigError loading a invalid tsconfig.json file', async () => {
		const mockFS = new FileSystemMock(new Map([
			[fakePath('tsconfig.json'), Buffer.from('{"compilerOptions":{"outDir":"./dist",},}')]
		]))

		await expect(() => readTsconfig(fakePath(), 'tsconfig.json', mockFS))
			.rejects
			.toThrowError(TsConfigError);
	});

});
