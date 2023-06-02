# Features

## URL Scheme

- especify pre configured url schemes (node:, ...)
- allow to extend _or_ replace the especified url schemes

```ts
interface UrlSchemeModule {
  /** node: */
  scheme: string;

  /** path */
  path: string;

  /** node:path */
  module: string;
}

interface TypescriptModuleResolverInternal {
  resolveAbsoluteModule(): Promise<string | null>;
  // ...
}

interface UrlSchemeResult {
  // ...
}

// NOTE: pass the resolver instance to the UrlSchemeResolver might be right
interface UrlSchemeResolver {
  resolve(module: UrlSchemeModule, resolver: TypescriptModuleResolver): Promise<UrlSchemeResult>;
  // OR
  resolve(module: UrlSchemeModule, resolver: TypescriptModuleResolverInternal): Promise<UrlSchemeResult>;
}

class NodeUrlSchemeResolver implements UrlSchemeResolver {
  resolve(module: UrlSchemeModule): Promise<UrlSchemeResult>;
}


const resolver = new TypescriptModuleResolver({
  urlSchemesResolvers: {
    'node': new NodeUrlSchemeResolver(),
    '^https?$': new RemoteUrlSchemeResolver(),
  }
});

resolver.resolve();

```

## Query params

```ts
import InlineWorker from './worker.js?worker&inline';
```
