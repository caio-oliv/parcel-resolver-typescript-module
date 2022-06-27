# parcel-resolver-typescript-module

Parcel resolver for [typescript modules](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

## Support

- [x] [baseUrl](https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url)
- [x] [pathMapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url)
- [ ] node_modules
- [ ] [URL schemes](https://parceljs.org/features/dependency-resolution/#url-schemes)

## Usage

Install as development dependency:

- `pnpm install --save-dev parcel-resolver-typescript-module`
- `npm install --save-dev parcel-resolver-typescript-module`
- `yarn add --dev parcel-resolver-typescript-module`

> `parcel@^2` and `@parcel/plugin` packages must be installed.

Add the `parcel-resolver-typescript-module` in the resolver list of your `.parcelrc` configuration file:

```json
{
	"extends": "@parcel/config-default",
	"resolvers": [
		"parcel-resolver-typescript-module",
		"..."
	],
	"transformers": {
		"*.{ts,tsx}": [
			"@parcel/transformer-typescript-tsc"
		]
	}
}
```

**Note:** since the resolver's order is sequential, use this before parcel default resolver `"..."`.

## Development

Clone this repo and run `pnpm install`.

Run `pnpm run test` for the test suite.

To use a local build in a project, run `pnpm link --global` to create a global link in your machine and run `pnpm link --global parcel-resolver-typescript-module` inside your project. See [pnpm link](https://pnpm.io/cli/link) for more details.
