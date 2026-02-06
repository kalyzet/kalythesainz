# Build System Documentation

This document describes the KALYTHESAINZ build system and CDN distribution setup.

## Overview

KALYTHESAINZ uses Vite as its build tool to create optimized ES module and UMD bundles for CDN distribution. The build system is configured to:

- Generate both development and production builds
- Create ES module and UMD formats
- Generate source maps for debugging
- Mark Three.js as an external dependency
- Produce minified and unminified versions

## Build Configuration

### Vite Configuration

The build is configured in `vite.config.js`:

```javascript
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
                },
            },
            sourcemap: true,
            minify: isProd ? 'terser' : false,
            outDir: 'dist',
        },
    };
});
```

### Build Scripts

The following npm scripts are available:

```json
{
    "scripts": {
        "build": "npm run build:prod && npm run build:dev",
        "build:prod": "vite build --mode production",
        "build:dev": "vite build --mode development"
    }
}
```

## Build Outputs

Running `npm run build` generates the following files in the `dist/` directory:

### ES Module Builds

| File                      | Description             | Size    | Use Case              |
| ------------------------- | ----------------------- | ------- | --------------------- |
| `kalythesainz.min.js`     | Minified ES module      | ~238 KB | Production CDN usage  |
| `kalythesainz.js`         | Unminified ES module    | ~238 KB | Development/debugging |
| `kalythesainz.min.js.map` | Source map for minified | ~411 KB | Debugging production  |
| `kalythesainz.js.map`     | Source map for dev      | ~411 KB | Debugging development |

### UMD Builds

| File                          | Description             | Size    | Use Case                     |
| ----------------------------- | ----------------------- | ------- | ---------------------------- |
| `kalythesainz.umd.min.js`     | Minified UMD            | ~149 KB | Legacy browsers, script tags |
| `kalythesainz.umd.js`         | Unminified UMD          | ~253 KB | Development UMD              |
| `kalythesainz.umd.min.js.map` | Source map for minified | ~407 KB | Debugging production UMD     |
| `kalythesainz.umd.js.map`     | Source map for dev      | ~412 KB | Debugging development UMD    |

## External Dependencies

Three.js is marked as an external dependency, meaning it's not bundled with KALYTHESAINZ. This:

- Reduces bundle size significantly
- Allows users to control Three.js version
- Enables better caching when Three.js is shared across projects
- Prevents version conflicts

Users must load Three.js separately:

```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {
    Scene,
    Box,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';
```

## Package.json Configuration

The package.json is configured for optimal CDN distribution:

```json
{
    "type": "module",
    "main": "index.js",
    "module": "dist/kalythesainz.min.js",
    "unpkg": "dist/kalythesainz.umd.min.js",
    "jsdelivr": "dist/kalythesainz.min.js",
    "exports": {
        ".": {
            "import": "./index.js",
            "require": "./dist/kalythesainz.umd.min.js"
        }
    },
    "files": ["dist", "core", "engine", "objects", "tools", "utils", "index.js"]
}
```

### Field Explanations

- **type**: "module" enables native ES module support
- **main**: Entry point for Node.js
- **module**: ES module entry for bundlers
- **unpkg**: Specifies file for unpkg CDN
- **jsdelivr**: Specifies file for jsDelivr CDN
- **exports**: Defines export conditions for different environments
- **files**: Lists files to include in npm package

## CDN Distribution

### Supported CDN Providers

KALYTHESAINZ is available from multiple CDN providers:

#### jsDelivr

```
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.js
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js
```

#### unpkg

```
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.min.js
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.js
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js
```

### Version Pinning

Always use specific versions in production:

```javascript
// Good - version pinned
import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

// Risky - uses latest version
import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz/dist/kalythesainz.min.js';
```

## Testing the Build

### Automated Tests

Run the CDN test suite:

```bash
npm run build
node tests/run-cdn-tests.js
```

This validates:

- All build files exist
- Source maps are valid
- Exports are available
- File sizes are reasonable
- Three.js is external
- Version consistency

### Manual Browser Tests

Open the test files in a browser:

```bash
# Start a local server
npm run dev

# Open test files:
# - tests/cdn-test-jsdelivr.html
# - tests/cdn-test-unpkg.html
# - tests/cdn-test-browser-compat.html
# - tests/cdn-test-import-maps.html
```

## Build Process

### Development Build

```bash
npm run build:dev
```

Creates unminified builds with:

- Readable code for debugging
- Full variable names
- Comments preserved
- Source maps included

### Production Build

```bash
npm run build:prod
```

Creates minified builds with:

- Compressed code
- Mangled variable names
- Comments removed (except license)
- Source maps included
- Terser optimization

### Full Build

```bash
npm run build
```

Runs both production and development builds, creating all 8 output files.

## Continuous Integration

For CI/CD pipelines, add these steps:

```yaml
# .github/workflows/build.yml
- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Test build
  run: node tests/run-cdn-tests.js

- name: Upload artifacts
  uses: actions/upload-artifact@v2
  with:
      name: dist
      path: dist/
```

## Publishing to npm

Before publishing:

1. Update version in package.json
2. Run full build: `npm run build`
3. Test build: `node tests/run-cdn-tests.js`
4. Commit changes
5. Create git tag: `git tag v1.0.0`
6. Publish: `npm publish`

The `prepublishOnly` script automatically runs the build before publishing.

## Troubleshooting

### Build fails with "terser not found"

Install terser:

```bash
npm install --save-dev terser
```

### Source maps not generated

Ensure `sourcemap: true` in vite.config.js build options.

### Three.js bundled instead of external

Check that `external: ['three']` is in rollupOptions.

### Wrong file sizes

Clear dist folder and rebuild:

```bash
rm -rf dist
npm run build
```

### Import errors in browser

Ensure you're using `type="module"` in script tags and serving from a web server (not file://).

## Performance Optimization

### Bundle Size

Current bundle sizes (gzipped):

- ES Module: ~40 KB
- UMD: ~32 KB

### Loading Performance

Optimize loading with:

```html
<!-- Preload framework -->
<link
    rel="modulepreload"
    href="https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js"
/>

<!-- Preload Three.js -->
<link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" />
```

### Caching

CDN providers automatically cache files. Use specific versions for optimal caching:

```javascript
// Cacheable
import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';
```

## Future Improvements

Planned build system enhancements:

- [ ] Tree-shaking optimization
- [ ] Code splitting for large applications
- [ ] Brotli compression
- [ ] TypeScript definitions generation
- [ ] Automated performance budgets
- [ ] Bundle size tracking
- [ ] Automated CDN deployment

## References

- [Vite Documentation](https://vitejs.dev/)
- [Rollup Documentation](https://rollupjs.org/)
- [jsDelivr Documentation](https://www.jsdelivr.com/)
- [unpkg Documentation](https://unpkg.com/)
- [ES Modules Specification](https://tc39.es/ecma262/#sec-modules)
