import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'index.js',
            name: 'KALYTHESAINZ',
            fileName: (format) => `kalythesainz.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['three'],
            output: {
                globals: {
                    three: 'THREE',
                },
            },
        },
        sourcemap: true,
        minify: 'terser',
    },
    server: {
        port: 3000,
        open: '/ui/index.html',
    },
    resolve: {
        alias: {
            three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
        },
    },
});
