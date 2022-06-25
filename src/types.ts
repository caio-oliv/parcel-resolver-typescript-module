
export type Encoding = "hex" | "utf8" | "utf-8" | "ascii" | "binary" | "base64" | "ucs2" | "ucs-2" | "utf16le" | "latin1";

export interface FileSystem {
  exists(filePath: string): Promise<boolean>;
  readFile(filePath: string, encoding?: Encoding): Promise<string>;
}

export interface ParcelFileSystem {
  readFile(filePath: string): Promise<Buffer>;
  readFile(filePath: string, encoding: Encoding): Promise<string>;
  readFileSync(filePath: string): Buffer;
  readFileSync(filePath: string, encoding: Encoding): string;
  exists(path: string): Promise<boolean>;
  existsSync(path: string): boolean;
}

export interface Tsconfig {
  compilerOptions?: {
    baseUrl?: string;
    paths?: {
      [key: string]: Array<string>;
    };
  };
}
