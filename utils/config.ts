import { createRequire } from "node:module";

/**
 * CommonJS require function
 */
const require = createRequire(import.meta.url);

/**
 * Loads a JSON file
 * @param relativePath Path to the JSON file
 * @returns The JSON file
 */
export function loadJson<T = any>(relativePath: string): T {
    return require(relativePath);
}
