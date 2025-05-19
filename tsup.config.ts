import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["server/app.ts"],
    outDir: "dist/server",
    target: "node20",
    format: ["esm"],
    splitting: false,
    sourcemap: false,
    clean: true,
    dts: false,
    external: ["express", "express-async-errors"],
    tsconfig: "server/tsconfig.json",
});
