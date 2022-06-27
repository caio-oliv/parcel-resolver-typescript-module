
export type Encoding = "hex" | "utf8" | "utf-8" | "ascii" | "binary" | "base64" | "ucs2" | "ucs-2" | "utf16le" | "latin1";

export interface FileSystem {
  exists(filePath: string): Promise<boolean>;
  readFile(filePath: string, encoding?: Encoding): Promise<string>;
}

export interface Tsconfig {
  extends?: string;
  compilerOptions?: {
    baseUrl?: string;
    paths?: {
      [key: string]: Array<string>;
    };
  };
  exclude?: string[];
  include?: string[];
}
