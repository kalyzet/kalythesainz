import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Read version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'index.js'),
                name: 'KALYTHESAINZ',
                fileName: (format) => {
                    if (format === 'es') {
                        return 'kalythesainz.esm.js';
                    }
                    return 'kalythesainz.umd.min.js';
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
 * KALYTHESAINZ v${pkg.version}
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
 * KALYTHESAINZ v${pkg.version}
 * A simple 3D web framework built on top of Three.js
 * @license MIT
 * @requires three@^0.160.0
 */`,
                      },
                  }
                : undefined,
            outDir: 'dist',
            emptyOutDir: true, // Always clean dist folder for predictable builds
        },
        server: {
            port: 3000,
            open: '/ui/index.html',
        },
        // No resolve.alias for 'three' - let users decide where to import from
        // Framework should not force Three.js source
    };
});
