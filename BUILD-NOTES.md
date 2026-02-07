# 📦 Build & Distribution Notes

## Package Structure

KALYTHESAINZ menggunakan dual-format distribution untuk kompatibilitas maksimal:

### Development (Internal)

```
index.js - Entry point untuk development dan testing (internal only)
```

### Production (Published to npm)

```
dist/kalythesainz.esm.js     - ESM format untuk modern bundlers
dist/kalythesainz.umd.min.js - UMD format untuk CommonJS/browser
```

---

## 🎯 Format Distribution

### ESM (ES Modules) - `dist/kalythesainz.esm.js`

**Untuk:**

- Modern bundlers (Webpack 5+, Vite, Rollup, Parcel)
- Native ES modules di browser
- Tree-shaking support

**Import:**

```javascript
import { Scene, Box, Light } from 'kalythesainz';
```

**Karakteristik:**

- ✅ Tree-shaking enabled
- ✅ Smaller bundle size (unused code dihapus)
- ✅ Modern JavaScript syntax
- ✅ Recommended untuk production

---

### UMD (Universal Module Definition) - `dist/kalythesainz.umd.min.js`

**Untuk:**

- CommonJS (Node.js dengan `require()`)
- Browser langsung dengan `<script>` tag
- Backward compatibility

**Import:**

```javascript
// CommonJS
const { Scene, Box, Light } = require('kalythesainz');

// Browser global
<script src="kalythesainz.umd.min.js"></script>
<script>
  const { Scene, Box, Light } = KALYTHESAINZ;
</script>
```

**Karakteristik:**

- ✅ Universal compatibility
- ✅ Works everywhere
- ✅ Minified dan optimized
- ⚠️ Larger file size (no tree-shaking)

---

## 📋 package.json Configuration

```json
{
    "main": "dist/kalythesainz.umd.min.js",
    "module": "dist/kalythesainz.esm.js",
    "exports": {
        ".": {
            "import": "./dist/kalythesainz.esm.js",
            "require": "./dist/kalythesainz.umd.min.js"
        }
    }
}
```

**Penjelasan:**

- `main` - Default entry point (CommonJS/Node.js)
- `module` - ESM entry point (modern bundlers)
- `exports.import` - Explicit ESM import
- `exports.require` - Explicit CommonJS require

---

## 🔨 Build Process

### Build Command

```bash
npm run build
```

**Output:**

```
dist/
  ├── kalythesainz.esm.js       (ESM format)
  ├── kalythesainz.esm.js.map   (Source map)
  ├── kalythesainz.umd.min.js   (UMD format, minified)
  └── kalythesainz.umd.min.js.map (Source map)
```

### Build Configuration (vite.config.js)

```javascript
{
  lib: {
    entry: 'index.js',
    name: 'KALYTHESAINZ',
    formats: ['es', 'umd']
  },
  rollupOptions: {
    external: ['three'],
    output: {
      globals: { three: 'THREE' }
    }
  }
}
```

---

## 🚀 Usage Examples

### Modern Bundler (Webpack/Vite/Rollup)

```javascript
// Automatically uses ESM format
import { Scene, Box, Light } from 'kalythesainz';

const scene = Scene.init('container');
Light.sun();
const box = Box.create(1, 1, 1);
scene.add(box);
```

**Bundler akan:**

- ✅ Import dari `dist/kalythesainz.esm.js`
- ✅ Tree-shake unused code
- ✅ Optimize bundle size

---

### Node.js (CommonJS)

```javascript
// Automatically uses UMD format
const { Scene, Box, Light } = require('kalythesainz');

const scene = Scene.init('container');
Light.sun();
const box = Box.create(1, 1, 1);
scene.add(box);
```

**Node.js akan:**

- ✅ Import dari `dist/kalythesainz.umd.min.js`
- ✅ Work dengan `require()`

---

### Browser (CDN)

```html
<!-- ESM via CDN -->
<script type="module">
    import {
        Scene,
        Box,
        Light,
    } from 'https://cdn.jsdelivr.net/npm/kalythesainz/dist/kalythesainz.esm.js';

    const scene = Scene.init('container');
    Light.sun();
    const box = Box.create(1, 1, 1);
    scene.add(box);
</script>
```

```html
<!-- UMD via CDN -->
<script src="https://cdn.jsdelivr.net/npm/kalythesainz/dist/kalythesainz.umd.min.js"></script>
<script>
    const { Scene, Box, Light } = KALYTHESAINZ;

    const scene = Scene.init('container');
    Light.sun();
    const box = Box.create(1, 1, 1);
    scene.add(box);
</script>
```

---

## 🔍 How Module Resolution Works

### When user runs: `import { Scene } from 'kalythesainz'`

1. **Bundler checks `package.json`**
    - Looks for `exports` field first
    - Falls back to `module` field
    - Falls back to `main` field

2. **Modern bundlers (Webpack 5+, Vite, Rollup)**
    - Use `exports.import` → `dist/kalythesainz.esm.js`
    - Enable tree-shaking
    - Optimize bundle

3. **Node.js with `require()`**
    - Use `exports.require` → `dist/kalythesainz.umd.min.js`
    - CommonJS compatible

4. **Legacy bundlers**
    - Use `module` field → `dist/kalythesainz.esm.js`
    - Or `main` field → `dist/kalythesainz.umd.min.js`

---

## 📊 File Size Comparison

| Format | Size  | Gzipped | Use Case                      |
| ------ | ----- | ------- | ----------------------------- |
| ESM    | ~50KB | ~15KB   | Modern bundlers (recommended) |
| UMD    | ~55KB | ~16KB   | CommonJS/Browser direct       |

**Note:** Actual sizes depend on Three.js version and build optimization.

---

## ✅ Benefits of This Approach

1. **Tree-Shaking** - ESM format allows bundlers to remove unused code
2. **Universal Compatibility** - UMD works everywhere
3. **Optimal Performance** - Users get the best format for their environment
4. **Developer Experience** - Automatic format selection
5. **Future-Proof** - Follows modern npm best practices

---

## 🔧 Development vs Production

### Development (Local)

```javascript
// Import from source files directly
import { Scene } from './engine/Scene.js';
import { Box } from './objects/Box.js';
```

**Benefits:**

- ✅ Fast iteration
- ✅ No build step needed
- ✅ Easy debugging

### Production (Published)

```javascript
// Import from bundled files
import { Scene, Box } from 'kalythesainz';
```

**Benefits:**

- ✅ Optimized bundle
- ✅ Minified code
- ✅ Tree-shaking support
- ✅ Better performance

---

## 📝 Publishing Checklist

Before publishing to npm:

1. ✅ Run `npm run build` to generate dist files
2. ✅ Verify `dist/kalythesainz.esm.js` exists
3. ✅ Verify `dist/kalythesainz.umd.min.js` exists
4. ✅ Test ESM import: `import { Scene } from 'kalythesainz'`
5. ✅ Test CommonJS require: `require('kalythesainz')`
6. ✅ Check file sizes are reasonable
7. ✅ Verify source maps are generated
8. ✅ Run `npm publish`

---

## 🎓 References

- [Node.js Package Entry Points](https://nodejs.org/api/packages.html#package-entry-points)
- [Rollup.js Library Mode](https://rollupjs.org/guide/en/#outputformat)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Package.json exports field](https://nodejs.org/api/packages.html#exports)

---

**Last Updated:** February 7, 2026
