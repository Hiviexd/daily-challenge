import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 8118,
        strictPort: true,
        proxy: {
            "/api": {
                target: `http://localhost:${process.env.PORT || "3113"}`,
            },
        },
    },
    build: {
        outDir: "dist/",
    },
    resolve: {
        alias: [
            { find: "@interfaces", replacement: "/interfaces" },
            { find: "@base", replacement: "/src/base" },
            { find: "@components", replacement: "/src/components" },
            { find: "@hooks", replacement: "/src/hooks" },
            { find: "@pages", replacement: "/src/pages" },
            { find: "@sass", replacement: "/src/sass" },
            { find: "@store", replacement: "/src/store" },
            { find: "@themes", replacement: "/src/themes" },
            { find: "@utils", replacement: "/utils" },
        ],
    },
});
