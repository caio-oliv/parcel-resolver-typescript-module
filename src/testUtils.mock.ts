import { join as joinpath } from 'node:path';
import { cwd } from "node:process";


export function fakePath(aPath: string = '') {
	return joinpath(cwd(), aPath);
}
