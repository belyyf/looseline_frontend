import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        lib: {
            entry: path.resolve(__dirname, 'main.tsx'),
            name: 'LooselineAssistant',
            fileName: (format) => `assistant.bundle.${format}.js`,
            formats: ['umd']
        },
        rollupOptions: {
            // Ensure we bundle React/ReactDOM since the host page doesn't have them
            external: [],
            output: {
                globals: {}
            }
        },
        // Minify for production
        minify: 'esbuild',
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
});
