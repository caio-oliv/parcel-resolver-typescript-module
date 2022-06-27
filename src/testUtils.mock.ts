import path from "node:path";
import { cwd } from "node:process";


export function fakePath(aPath: string = '') {
	return path.join(cwd(), aPath);
}
