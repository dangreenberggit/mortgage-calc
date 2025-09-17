import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        globals: true,
        // Performance optimizations
        pool: "threads",
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        // Reduce test timeout for faster feedback
        testTimeout: 10000,
        // Optimize file watching
        watch: false,
        // Reduce memory usage
        isolate: true,
    },
});
