# parcel-resolver-tsconfig-paths

A parcel resolver for typescript module resolution

Implemented using [tsconfig-paths](https://github.com/dividab/tsconfig-paths)

[typescript module resolution reference](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

## Usage

```json
{
	"extends": "@parcel/config-default",
	"resolvers": [
		"parcel-resolver-tsconfig-paths",
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
git clone git@... parcel-resolver-tsconfig-paths
cd parcel-resolver-tsconfig-paths
pnpm install
```
