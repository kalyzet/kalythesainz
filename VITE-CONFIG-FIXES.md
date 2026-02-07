# 🔧 Vite Config Fixes - Critical Issues Resolved

**Tanggal:** 7 Februari 2026  
**Status:** ✅ Fixed

---

## 🚨 Masalah yang Ditemukan dan Diperbaiki

### 1. ❌ ALIAS THREE KE CDN - BAHAYA!

#### Masalah:

```javascript
// ❌ SALAH - Ini berbahaya untuk framework!
resolve: {
  alias: {
    three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
  },
}
```

#### Kenapa Berbahaya?

**Untuk App:** ✅ OK - App bisa decide source Three.js  
**Untuk Framework:** ❌ BAHAYA - Framework TIDAK BOLEH paksa source!

**Masalah yang Terjadi:**

1. **User install via npm:**

    ```bash
    npm install kalythesainz three
    ```

    User expect `three` dari `node_modules`, tapi framework force CDN!

2. **Test kacau:**

    ```javascript
    // Test mock three
    jest.mock('three', () => ({ ... }));

    // ❌ Alias CDN bikin mock tidak bekerja!
    ```

3. **Bundler user konflik:**

    ```javascript
    // User punya config sendiri untuk three
    // Framework alias override user config → KONFLIK!
    ```

4. **SSR error:**
    ```javascript
    // Next.js SSR
    import { Scene } from 'kalythesainz';
    // ❌ Error: Cannot fetch CDN URL from server!
    ```

#### ✅ Solusi:

```javascript
// ✅ BENAR - Hapus alias three!
// Biarkan user decide:

// Option 1: npm install
import * as THREE from 'three'; // dari node_modules

// Option 2: CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Option 3: Import maps
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
  }
}
</script>
```

**Framework hanya declare:**

```javascript
// vite.config.js
rollupOptions: {
  external: ['three'], // ✅ Three.js adalah external dependency
  output: {
    globals: { three: 'THREE' } // ✅ Untuk UMD format
  }
}
```

---

### 2. ❌ emptyOutDir: mode === 'production' - RAWAN!

#### Masalah:

```javascript
// ❌ RAWAN
emptyOutDir: mode === 'production';
```

**Apa yang Terjadi:**

- Build prod → hapus dist ✅
- Build dev → dist numpuk file lama ❌

**Contoh Masalah:**

```bash
# Day 1
npm run build:prod
# dist/kalythesainz.esm.js (v1.0.0)
# dist/kalythesainz.umd.min.js (v1.0.0)

# Day 2 - Update code, build dev
npm run build:dev
# dist/kalythesainz.esm.js (v1.0.1) ← Updated
# dist/kalythesainz.umd.min.js (v1.0.0) ← OLD FILE MASIH ADA!

# User import → dapat file lama! 😱
```

#### ✅ Solusi:

```javascript
// ✅ BENAR - Selalu bersihkan dist
emptyOutDir: true;
```

**Keuntungan:**

- ✅ Dist selalu bersih
- ✅ Tidak ada file lama
- ✅ Predictable builds
- ✅ Tidak ada confusion

---

### 3. ❌ VERSION DI BANNER HARDCODED - BOHONG!

#### Masalah:

```javascript
// ❌ HARDCODED
banner: `/**
 * KALYTHESAINZ v1.0.0
 * @license MIT
 */`;
```

**Apa yang Terjadi:**

```bash
# Update version
npm version minor
# package.json: 1.1.0

# Build
npm run build
# dist/kalythesainz.esm.js:
# /**
#  * KALYTHESAINZ v1.0.0  ← BOHONG! 😭
#  */
```

**User confusion:**

```javascript
// User check banner
console.log('Framework version:', '1.0.0'); // dari banner

// User check package.json
console.log('Package version:', '1.1.0'); // dari package.json

// ❓ Versi mana yang benar?
```

#### ✅ Solusi:

```javascript
// ✅ BENAR - Ambil dari package.json
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

banner: `/**
 * KALYTHESAINZ v${pkg.version}
 * @license MIT
 */`;
```

**Keuntungan:**

- ✅ Version selalu sync
- ✅ Tidak perlu manual update
- ✅ Single source of truth
- ✅ `npm version` otomatis update banner

---

## 📋 Vite Config Final (Correct)

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// ✅ Read version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'index.js'),
                name: 'KALYTHESAINZ',
                fileName: (format) => {
                    if (format === 'es') return 'kalythesainz.esm.js';
                    return 'kalythesainz.umd.min.js';
                },
                formats: ['es', 'umd'],
            },
            rollupOptions: {
                // ✅ Three.js adalah external dependency
                external: ['three'],
                output: {
                    globals: { three: 'THREE' },
                    preserveModules: false,
                    // ✅ Dynamic version dari package.json
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
                          // ✅ Dynamic version di terser juga
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
            // ✅ Selalu bersihkan dist
            emptyOutDir: true,
        },
        server: {
            port: 3000,
            open: '/ui/index.html',
        },
        // ✅ TIDAK ADA alias untuk 'three'
        // Biarkan user decide source Three.js
    };
});
```

---

## 🎯 Prinsip Framework Library

### ❌ JANGAN:

1. **Force dependency source**

    ```javascript
    // ❌ Jangan paksa CDN
    alias: {
        three: 'https://cdn...';
    }
    ```

2. **Hardcode version**

    ```javascript
    // ❌ Jangan hardcode
    banner: 'v1.0.0';
    ```

3. **Conditional clean**
    ```javascript
    // ❌ Jangan conditional
    emptyOutDir: mode === 'production';
    ```

### ✅ LAKUKAN:

1. **Declare external dependencies**

    ```javascript
    // ✅ Declare sebagai external
    external: ['three'];
    ```

2. **Dynamic version**

    ```javascript
    // ✅ Ambil dari package.json
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    banner: `v${pkg.version}`;
    ```

3. **Always clean**
    ```javascript
    // ✅ Selalu bersihkan
    emptyOutDir: true;
    ```

---

## 🧪 Testing

### Test 1: Version Sync

```bash
# Update version
npm version patch

# Build
npm run build

# Check banner
head -n 5 dist/kalythesainz.esm.js
# Should show: KALYTHESAINZ v1.0.1 (updated!)
```

### Test 2: Clean Build

```bash
# Build
npm run build

# Check dist
ls dist/
# Should only have:
# - kalythesainz.esm.js
# - kalythesainz.esm.js.map
# - kalythesainz.umd.min.js
# - kalythesainz.umd.min.js.map

# No old files!
```

### Test 3: External Three.js

```bash
# Build
npm run build

# Check bundle
grep -r "import.*three" dist/
# Should NOT find any three.js code bundled
# Three.js should be external
```

---

## 📊 Impact

| Issue          | Before      | After        | Impact          |
| -------------- | ----------- | ------------ | --------------- |
| Three.js alias | CDN forced  | User decides | ✅ No conflicts |
| emptyOutDir    | Conditional | Always true  | ✅ Clean builds |
| Version        | Hardcoded   | Dynamic      | ✅ Always sync  |

---

## 🎓 Lessons Learned

### 1. Framework vs App

**App:**

- ✅ Boleh force dependencies
- ✅ Boleh hardcode config
- ✅ Boleh conditional builds

**Framework:**

- ❌ Jangan force dependencies
- ❌ Jangan hardcode config
- ❌ Jangan conditional builds

### 2. External Dependencies

Framework harus declare dependencies sebagai **external**:

```javascript
// ✅ BENAR
external: ['three', 'react', 'vue', ...]
```

Biarkan user:

- Install dari npm
- Load dari CDN
- Use import maps
- Mock untuk testing

### 3. Single Source of Truth

Version, config, metadata → ambil dari `package.json`:

```javascript
// ✅ BENAR
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

banner: `v${pkg.version}`;
description: pkg.description;
author: pkg.author;
```

---

## ✅ Checklist

- [x] Hapus `resolve.alias` untuk three
- [x] Set `emptyOutDir: true`
- [x] Dynamic version dari package.json
- [x] Test version sync
- [x] Test clean builds
- [x] Test external three.js
- [x] Update dokumentasi

---

**Fixed by:** Kalyzet  
**Date:** 7 Februari 2026  
**Status:** ✅ Production Ready
