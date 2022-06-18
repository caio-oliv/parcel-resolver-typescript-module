# parcel-resolver-typescript-module

A parcel resolver for typescript module resolution

Implemented using [tsconfig-paths](https://github.com/dividab/tsconfig-paths)

[typescript module resolution reference](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

## Usage

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

## Development

Clone and install

```sh
git clone https://github.com/CaioOliveira793/parcel-resolver-typescript-module.git
cd parcel-resolver-typescript-module
pnpm install
```
