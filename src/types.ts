import { FilePath } from "@parcel/types";
export type Encoding = "hex" | "utf8" | "utf-8" | "ascii" | "binary" | "base64" | "ucs2" | "ucs-2" | "utf16le" | "latin1";

export interface ParcelFileSystem {
  readFile(filePath: FilePath): Promise<Buffer>;
  readFile(filePath: FilePath, encoding: Encoding): Promise<string>;
  readFileSync(filePath: FilePath): Buffer;
  readFileSync(filePath: FilePath, encoding: Encoding): string;
  // writeFile(filePath: FilePath, contents: Buffer | string, options: FileOptions | null | undefined): Promise<void>;
  // copyFile(source: FilePath, destination: FilePath, flags?: number): Promise<void>;
  // stat(filePath: FilePath): Promise<Stats>;
  // statSync(filePath: FilePath): Stats;
  // readdir(path: FilePath, opts?: {
  //   withFileTypes?: false;
  // }): Promise<FilePath[]>;
  // readdir(path: FilePath, opts: {
  //   withFileTypes: true;
  // }): Promise<Dirent[]>;
  // readdirSync(path: FilePath, opts?: {
  //   withFileTypes?: false;
  // }): FilePath[];
  // readdirSync(path: FilePath, opts: {
  //   withFileTypes: true;
  // }): Dirent[];
  // unlink(path: FilePath): Promise<void>;
  // realpath(path: FilePath): Promise<FilePath>;
  // realpathSync(path: FilePath): FilePath;
  // exists(path: FilePath): Promise<boolean>;
  // existsSync(path: FilePath): boolean;
  // mkdirp(path: FilePath): Promise<void>;
  // rimraf(path: FilePath): Promise<void>;
  // ncp(source: FilePath, destination: FilePath): Promise<void>;
  // createReadStream(path: FilePath, options?: FileOptions | null | undefined): Readable;
  // createWriteStream(path: FilePath, options?: FileOptions | null | undefined): Writable;
  // cwd(): FilePath;
  // chdir(dir: FilePath): void;
  // watch(dir: FilePath, fn: (err: Error | null | undefined, events: Array<Event>) => unknown, opts: WatcherOptions): Promise<AsyncSubscription>;
  // getEventsSince(dir: FilePath, snapshot: FilePath, opts: WatcherOptions): Promise<Array<Event>>;
  // writeSnapshot(dir: FilePath, snapshot: FilePath, opts: WatcherOptions): Promise<void>;
  // findAncestorFile(fileNames: Array<string>, fromDir: FilePath, root: FilePath): FilePath | null | undefined;
  // findNodeModule(moduleName: string, fromDir: FilePath): FilePath | null | undefined;
  // findFirstFile(filePaths: Array<FilePath>): FilePath | null | undefined;
}

export interface Tsconfig {
  extends?: string;
  compilerOptions?: {
    baseUrl?: string;
    paths?: {
      [key: string]: Array<string>;
    };
    strict?: boolean;
  };
}
