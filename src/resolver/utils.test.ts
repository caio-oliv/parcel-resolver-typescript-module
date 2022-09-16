import { moduleHasExtension, relativeModule } from 'resolver/utils';


describe('TypescriptModuleResolver utils', () => {

	it('verify if module has extension', () => {
		expect(moduleHasExtension('app.ts')).toBe(true);

		expect(moduleHasExtension('app')).toBe(false);

		expect(moduleHasExtension('@config/database.ts')).toBe(true);

		expect(moduleHasExtension('.env')).toBe(false);

		expect(moduleHasExtension('config/.env')).toBe(false);

		expect(moduleHasExtension('..ts')).toBe(true);

		expect(moduleHasExtension('path/..ts')).toBe(true);

		expect(moduleHasExtension('@components/Button/styles.css')).toBe(true);
	});

	it('verify if module is relative', () => {
		expect(relativeModule('./app')).toBe(true);

		expect(relativeModule('@config/database')).toBe(false);

		expect(relativeModule('../../components/Button.tsx')).toBe(true);

		expect(relativeModule('components/Button.tsx')).toBe(false);
	});

})
