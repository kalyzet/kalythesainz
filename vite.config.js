import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'index.js'),
                name: 'KALYTHESAINZ',
                fileName: (format) => {
                    if (format === 'es') {
                        return isProd ? 'kalythesainz.min.js' : 'kalythesainz.js';
                    }
                    return isProd ? `kalythesainz.${format}.min.js` : `kalythesainz.${format}.js`;
                },
                formats: ['es', 'umd'],
            },
            rollupOptions: {
                external: ['three'],
                output: {
                    globals: {
                        three: 'THREE',
                    },
                    // Preserve module structure for better tree-shaking
                    preserveModules: false,
                    // Add banner with version and license info
                    banner: `/**
 * KALYTHESAINZ v1.0.0
 * A simple 3D web framework built on top of Three.js
 * @license MIT
 * @requires three@^0.160.0
 */`,
                },
            },
            sourcemap: true,
            minify: isProd ? 'terser' : false,
            terserOptions: isProd
                ? {
                      compress: {
                          drop_console: false,
                          drop_debugger: true,
                      },
                      format: {
                          comments: 'all',
                          preamble: `/**
 * KALYTHESAINZ v1.0.0
 * A simple 3D web framework built on top of Three.js
 * @license MIT
 * @requires three@^0.160.0
 */`,
                      },
                  }
                : undefined,
            outDir: 'dist',
            emptyOutDir: mode === 'production', // Only empty on first build
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
    };
});
