import { FileSystemMock } from 'fs/FileSystem.mock';
import { RecordFS } from 'fs/RecordFS';


describe('RecordFS', () => {

	it('record exists calls', async () => {
		const mock = new FileSystemMock(new Map([
			['/tmp/file.obj', null],
			['/tmp/a.so', null],
			['/tmp/b.so', null],
		]));

		const recordFS = new RecordFS(mock);

		expect(await recordFS.exists('/tmp/file.obj')).toBe(true);
		expect(await recordFS.exists('/tmp/a.so')).toBe(true);
		expect(await recordFS.exists('/tmp/other_file.obj')).toBe(false);

		expect(recordFS.verifiedFiles.foundFiles).toStrictEqual([
			'/tmp/file.obj',
			'/tmp/a.so'
		]);
		expect(recordFS.verifiedFiles.notFoundFiles).toStrictEqual([
			'/tmp/other_file.obj'
		]);
		expect(recordFS.readFiles).toStrictEqual([]);
		expect(recordFS.allExistentKnownFiles).toStrictEqual([
			'/tmp/file.obj',
			'/tmp/a.so'
		]);
		expect(recordFS.allKnownFiles).toStrictEqual([
			'/tmp/file.obj',
			'/tmp/a.so',
			'/tmp/other_file.obj'
		]);
	});

	it('record readFile calls', async () => {
		const mock = new FileSystemMock(new Map([
			['/tmp/file.obj', Buffer.from('')],
			['/tmp/a.so', Buffer.from('')],
			['/tmp/b.so', null],
		]));

		const recordFS = new RecordFS(mock);

		expect(await recordFS.readFile('/tmp/file.obj')).toBe('');
		expect(await recordFS.readFile('/tmp/a.so')).toBe('');
		await expect(() => recordFS.readFile('/tmp/other_file.obj'))
			.rejects
			.toThrowError();

		expect(recordFS.verifiedFiles.foundFiles).toStrictEqual([]);
		expect(recordFS.verifiedFiles.notFoundFiles).toStrictEqual([]);
		expect(recordFS.readFiles).toStrictEqual([
			'/tmp/file.obj',
			'/tmp/a.so'
		]);
		expect(recordFS.allExistentKnownFiles).toStrictEqual([
			'/tmp/file.obj',
			'/tmp/a.so'
		]);
		expect(recordFS.allKnownFiles).toStrictEqual([
			'/tmp/file.obj',
			'/tmp/a.so',
		]);
	});

});
