# KALYTHESAINZ Framework

Framework 3D web sederhana yang dibangun di atas Three.js dengan API deklaratif dan visual tooling.

A simple 3D web framework built on top of Three.js with declarative API and visual tooling.

## ✨ Fitur Utama / Key Features

- 🚀 **Zero Installation**: Gunakan langsung dari CDN dengan ES modules - tanpa build tools
- 🎯 **Declarative API**: Interface sederhana dan intuitif untuk pengembangan 3D
- 🛠️ **Visual Tools**: Inspector, scene tree, dan transform gizmos bawaan
- 📦 **Modular Architecture**: Pemisahan yang jelas dengan desain berlapis
- 🔧 **Three.js Integration**: Akses langsung ke objek Three.js ketika diperlukan
- 💾 **Scene Serialization**: Simpan dan muat scene dalam format JSON
- 🎨 **Plugin System**: Perluas fungsionalitas dengan objek, tools, dan modul kustom
- ⚡ **Event-Driven**: Arsitektur reaktif dengan event bus bawaan

## 📚 Dokumentasi / Documentation

- 📖 [Getting Started Guide](docs/GETTING_STARTED.md) - Tutorial langkah demi langkah
- 🌐 [CDN Usage Guide](docs/CDN_USAGE.md) - Gunakan tanpa instalasi dari CDN
- 📚 [API Documentation](docs/API.md) - Referensi API lengkap dengan contoh
- 🔌 [Plugin System](docs/PLUGIN_SYSTEM.md) - Buat ekstensi kustom
- 🐛 [Troubleshooting](docs/TROUBLESHOOTING.md) - Masalah umum dan solusi
- 💡 [Examples](examples/) - Aplikasi contoh yang berfungsi

## 🔍 Cara Kerja Framework / How It Works

### Arsitektur Framework

KALYTHESAINZ dibangun dengan arsitektur berlapis yang modular:

```
┌─────────────────────────────────────────┐
│           User Application              │
│  (Your HTML/JS/React/Next.js code)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        KALYTHESAINZ Framework           │
│  ┌───────────────────────────────────┐  │
│  │  Tools Layer                      │  │
│  │  (Inspector, SceneTree, Gizmo)    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Objects Layer                    │  │
│  │  (Box, Sphere, Plane, Object3D)   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Engine Layer                     │  │
│  │  (Scene, Camera, Light, Renderer) │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Core Layer                       │  │
│  │  (App, Config, EventBus, Plugin)  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│            Three.js Library             │
│     (3D Rendering Engine)               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│            Browser APIs                 │
│  (WebGL, Canvas, DOM, Window)           │
└─────────────────────────────────────────┘
```

### Mengapa Perlu HTTP Server?

Framework ini **memerlukan HTTP server** untuk development. Ini bukan limitasi framework, tapi **requirement dari teknologi web modern**:

#### 1. **ES Modules Requirement**

Framework menggunakan ES Modules (`import/export`):

```javascript
import { Scene } from './engine/Scene.js';
import { Box } from './objects/Box.js';
```

**Browser memblokir ES modules dengan `file://` protocol** karena security policy (CORS). Browser hanya mengizinkan ES modules melalui HTTP/HTTPS.

#### 2. **Import Maps**

Framework menggunakan import maps untuk dependency resolution:

```html
<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        }
    }
</script>
```

Import maps tidak bekerja dengan `file://` protocol.

#### 3. **CORS Policy**

Browser modern memiliki Cross-Origin Resource Sharing (CORS) policy yang mencegah loading resources dari `file://` untuk keamanan.

### HTTP Server Itu Mudah!

Menjalankan HTTP server sangat mudah:

```bash
# Python (paling mudah - 1 command)
python -m http.server 8000

# Node.js
npx http-server -p 8000

# VS Code
# Install extension "Live Server", klik kanan HTML, pilih "Open with Live Server"

# Windows
# Double-click: start-test.bat
```

### Ini Standar Web Development Modern

**Semua framework 3D web modern memerlukan HTTP server:**

- ✅ Three.js - Perlu HTTP server
- ✅ Babylon.js - Perlu HTTP server
- ✅ A-Frame - Perlu HTTP server
- ✅ React Three Fiber - Perlu HTTP server
- ✅ PlayCanvas - Perlu HTTP server

**Untuk production/deployment:**

- User akhir **tidak perlu** HTTP server
- Aplikasi di-host di web server (Netlify, Vercel, GitHub Pages, dll)
- User tinggal buka URL di browser

**Untuk development:**

- Developer perlu HTTP server (tapi sangat mudah - 1 command)
- Sudah disediakan `start-test.bat` untuk Windows
- Atau gunakan VS Code Live Server extension

## 🚀 Cara Implementasi / Implementation Guide

### ⚠️ Catatan Penting / Important Note

**Package ini belum dipublikasikan ke npm.** Untuk menggunakan framework ini, Anda perlu:

1. Clone repository ini
2. Build framework dengan `npm run build`
3. Gunakan file dari folder `dist/`

**This package is not yet published to npm.** To use this framework, you need to:

1. Clone this repository
2. Build the framework with `npm run build`
3. Use files from the `dist/` folder

---

## 🎯 Implementasi di Berbagai Framework / Framework Integration

### 🔷 Next.js (React with SSR)

Framework ini **kompatibel dengan Next.js**, tapi perlu setup khusus karena Next.js menggunakan Server-Side Rendering (SSR).

#### Metode 1: Dynamic Import dengan `ssr: false` (RECOMMENDED)

```jsx
// pages/3d-scene.js (Pages Router)
// atau app/3d-scene/page.js (App Router)
'use client'; // Untuk Next.js 13+ App Router

import dynamic from 'next/dynamic';

// Import component dengan SSR disabled
const ThreeScene = dynamic(() => import('../components/ThreeScene'), {
    ssr: false,
    loading: () => <div>Loading 3D Scene...</div>,
});

export default function ScenePage() {
    return (
        <div>
            <h1>My 3D Scene</h1>
            <ThreeScene />
        </div>
    );
}
```

```jsx
// components/ThreeScene.jsx
'use client';

import { useEffect, useRef } from 'react';

export default function ThreeScene() {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        // Import hanya di client-side
        const initScene = async () => {
            // Import Three.js
            const THREE = await import('three');
            window.THREE = THREE;

            // Import KALYTHESAINZ
            const { Scene, Box, Sphere, Light } = await import('kalythesainz');

            // Initialize scene
            const scene = Scene.init(containerRef.current.id);
            sceneRef.current = scene;

            // Setup lighting
            Light.sun({ intensity: 1.0 });
            Light.ambient({ intensity: 0.4 });

            // Create objects
            const box = Box.create(1, 1, 1);
            box.position = { x: -2, y: 0, z: 0 };
            scene.add(box);

            const sphere = Sphere.create(0.8, 32);
            sphere.position = { x: 2, y: 0, z: 0 };
            scene.add(sphere);

            // Animation
            let frame = 0;
            function animate() {
                frame++;
                box.rotation = { x: frame * 0.01, y: frame * 0.01, z: 0 };
                sphere.rotation = { x: 0, y: frame * 0.02, z: 0 };
                requestAnimationFrame(animate);
            }
            animate();
        };

        initScene();

        // Cleanup
        return () => {
            if (sceneRef.current) {
                sceneRef.current.dispose();
            }
        };
    }, []);

    return (
        <div
            id="kalythesainz-container"
            ref={containerRef}
            style={{ width: '100%', height: '600px' }}
        />
    );
}
```

#### Metode 2: Custom Hook untuk Reusability

```jsx
// hooks/useKalythesainz.js
'use client';

import { useEffect, useRef, useState } from 'react';

export function useKalythesainz(containerId) {
    const [scene, setScene] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        let sceneInstance = null;

        const initFramework = async () => {
            try {
                // Import Three.js
                const THREE = await import('three');
                window.THREE = THREE;

                // Import KALYTHESAINZ
                const KALY = await import('kalythesainz');

                // Initialize scene
                sceneInstance = KALY.Scene.init(containerId);
                setScene(sceneInstance);
                setIsLoaded(true);

                return { scene: sceneInstance, KALY };
            } catch (error) {
                console.error('Failed to initialize KALYTHESAINZ:', error);
                throw error;
            }
        };

        initFramework();

        // Cleanup
        return () => {
            if (sceneInstance) {
                sceneInstance.dispose();
            }
        };
    }, [containerId]);

    return { scene, isLoaded, containerRef };
}
```

```jsx
// components/My3DComponent.jsx
'use client';

import { useEffect } from 'react';
import { useKalythesainz } from '../hooks/useKalythesainz';

export default function My3DComponent() {
    const { scene, isLoaded, containerRef } = useKalythesainz('my-3d-container');

    useEffect(() => {
        if (!isLoaded || !scene) return;

        const setupScene = async () => {
            const { Light, Box, Sphere } = await import('kalythesainz');

            // Setup lighting
            Light.sun({ intensity: 1.0 });
            Light.ambient({ intensity: 0.4 });

            // Create objects
            const box = Box.create(1, 1, 1);
            scene.add(box);

            const sphere = Sphere.create(0.8, 32);
            sphere.position = { x: 2, y: 0, z: 0 };
            scene.add(sphere);
        };

        setupScene();
    }, [scene, isLoaded]);

    return (
        <div>
            {!isLoaded && <div>Loading 3D Scene...</div>}
            <div
                id="my-3d-container"
                ref={containerRef}
                style={{ width: '100%', height: '600px' }}
            />
        </div>
    );
}
```

#### ⚠️ Hal Penting untuk Next.js

1. **Selalu gunakan `'use client'`** (Next.js 13+ App Router)
2. **Dynamic import dengan `ssr: false`** untuk component 3D
3. **Check `typeof window !== 'undefined'`** sebelum akses browser APIs
4. **Cleanup di useEffect return** untuk prevent memory leaks
5. **Import Three.js dan framework di dalam useEffect** (client-side only)

---

### ⚛️ React (Create React App / Vite)

```jsx
// components/ThreeScene.jsx
import { useEffect, useRef } from 'react';

export default function ThreeScene() {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        const initScene = async () => {
            // Import Three.js
            const THREE = await import('three');
            window.THREE = THREE;

            // Import KALYTHESAINZ
            const { Scene, Box, Light } = await import('kalythesainz');

            // Initialize
            const scene = Scene.init('container');
            sceneRef.current = scene;

            Light.sun();
            const box = Box.create(1, 1, 1);
            scene.add(box);
        };

        initScene();

        return () => {
            if (sceneRef.current) {
                sceneRef.current.dispose();
            }
        };
    }, []);

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

---

### 🟢 Vue.js

```vue
<!-- components/ThreeScene.vue -->
<template>
    <div id="container" ref="containerRef" style="width: 100%; height: 600px"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const containerRef = ref(null);
let scene = null;

onMounted(async () => {
    // Import Three.js
    const THREE = await import('three');
    window.THREE = THREE;

    // Import KALYTHESAINZ
    const { Scene, Box, Light } = await import('kalythesainz');

    // Initialize
    scene = Scene.init('container');
    Light.sun();

    const box = Box.create(1, 1, 1);
    scene.add(box);
});

onUnmounted(() => {
    if (scene) {
        scene.dispose();
    }
});
</script>
```

---

### 🅰️ Angular

```typescript
// components/three-scene.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-three-scene',
    template: '<div #container style="width: 100%; height: 600px"></div>',
})
export class ThreeSceneComponent implements OnInit, OnDestroy {
    @ViewChild('container', { static: true }) containerRef!: ElementRef;
    private scene: any;

    async ngOnInit() {
        // Import Three.js
        const THREE = await import('three');
        (window as any).THREE = THREE;

        // Import KALYTHESAINZ
        const { Scene, Box, Light } = await import('kalythesainz');

        // Initialize
        this.scene = Scene.init(this.containerRef.nativeElement);
        Light.sun();

        const box = Box.create(1, 1, 1);
        this.scene.add(box);
    }

    ngOnDestroy() {
        if (this.scene) {
            this.scene.dispose();
        }
    }
}
```

---

### 🔶 Svelte

```svelte
<!-- components/ThreeScene.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  let containerRef;
  let scene;

  onMount(async () => {
    // Import Three.js
    const THREE = await import('three');
    window.THREE = THREE;

    // Import KALYTHESAINZ
    const { Scene, Box, Light } = await import('kalythesainz');

    // Initialize
    scene = Scene.init('container');
    Light.sun();

    const box = Box.create(1, 1, 1);
    scene.add(box);
  });

  onDestroy(() => {
    if (scene) {
      scene.dispose();
    }
  });
</script>

<div id="container" bind:this={containerRef} style="width: 100%; height: 600px"></div>
```

---

### 📦 Vanilla JavaScript (No Framework)

```html
<!DOCTYPE html>
<html>
    <head>
        <title>KALYTHESAINZ - Vanilla JS</title>
        <style>
            body {
                margin: 0;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>

        <script type="module">
            // Import Three.js
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            // Import KALYTHESAINZ
            import { Scene, Box, Light } from './dist/kalythesainz.js';

            // Initialize
            const scene = Scene.init('container');
            Light.sun();

            const box = Box.create(1, 1, 1);
            scene.add(box);
        </script>
    </body>
</html>
```

---

### 🔧 Troubleshooting untuk Framework Modern

#### Error: "window is not defined" (Next.js/SSR)

**Solusi:** Gunakan dynamic import dengan `ssr: false`

#### Error: "document is not defined" (Next.js/SSR)

**Solusi:** Check `typeof window !== 'undefined'` sebelum akses DOM

#### Error: "WebGL context" (React/Vue/Angular)

**Solusi:** Pastikan code hanya dijalankan di client-side (useEffect/onMounted)

#### Build Error (Webpack/Vite)

**Solusi:** Pastikan semua import Three.js dan framework ada di dalam lifecycle hooks

---

### ✅ Framework Compatibility

| Framework      | Status       | Notes                                      |
| -------------- | ------------ | ------------------------------------------ |
| **Next.js**    | ✅ Supported | Gunakan dynamic import dengan `ssr: false` |
| **React**      | ✅ Supported | Import di useEffect                        |
| **Vue.js**     | ✅ Supported | Import di onMounted                        |
| **Angular**    | ✅ Supported | Import di ngOnInit                         |
| **Svelte**     | ✅ Supported | Import di onMount                          |
| **Vanilla JS** | ✅ Supported | Direct import                              |
| **Nuxt.js**    | ✅ Supported | Sama seperti Next.js (SSR handling)        |
| **Gatsby**     | ✅ Supported | Sama seperti Next.js (SSR handling)        |

---

## 📝 Metode Implementasi Lokal / Local Implementation Methods

### Metode 1: Penggunaan Lokal (Setelah Build) - RECOMMENDED

**Langkah 1: Clone dan Build**

```bash
# Clone repository
git clone https://github.com/your-username/kalythesainz.git
cd kalythesainz

# Install dependencies
npm install

# Build framework
npm run build
```

**Langkah 2: Buat file HTML**

Buat file `test.html` di root folder project:

```html
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KALYTHESAINZ - Test Lokal</title>
        <style>
            body {
                margin: 0;
                overflow: hidden;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>

        <script type="module">
            // Import Three.js dari CDN
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            // Import KALYTHESAINZ dari file lokal (setelah build)
            import { Scene, Box, Sphere, Light } from './dist/kalythesainz.js';

            // Inisialisasi scene
            const scene = Scene.init('container');

            // Setup lighting
            Light.sun(1.0);
            Light.ambient(0.4);

            // Buat objek 3D
            const box = Box.create(1, 1, 1);
            box.position = { x: -2, y: 0, z: 0 };
            scene.add(box);

            const sphere = Sphere.create(0.8, 32);
            sphere.position = { x: 2, y: 0, z: 0 };
            scene.add(sphere);

            console.log('Scene siap dengan', scene.objects.length, 'objek!');
        </script>
    </body>
</html>
```

**Langkah 3: Jalankan dengan Local Server**

```bash
# Gunakan Python
python -m http.server 8000

# Atau gunakan Node.js http-server
npx http-server -p 8000

# Atau gunakan Live Server di VS Code
# Klik kanan pada test.html > Open with Live Server
```

**Langkah 4: Buka di Browser**

Buka `http://localhost:8000/test.html` di browser Anda.

### Metode 2: Menggunakan Vite Dev Server (Untuk Development)

Cara termudah untuk development:

```bash
# Di folder project kalythesainz
npm run dev
```

Kemudian buka `http://localhost:5173` dan edit file di folder `ui/`.

### Metode 3: Import Langsung dari Source (Tanpa Build)

Jika Anda tidak ingin build, gunakan import langsung dari source files:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>KALYTHESAINZ - Direct Import</title>
        <style>
            body {
                margin: 0;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>

        <script type="module">
            // Import Three.js
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            // Import langsung dari source files
            import { Scene } from './engine/Scene.js';
            import { Box } from './objects/Box.js';
            import { Sphere } from './objects/Sphere.js';
            import { Light } from './engine/Light.js';

            const scene = Scene.init('container');
            Light.sun();
            Light.ambient(0.4);

            const box = Box.create(1, 1, 1);
            box.position = { x: -2, y: 0, z: 0 };
            scene.add(box);

            const sphere = Sphere.create(0.8, 32);
            sphere.position = { x: 2, y: 0, z: 0 };
            scene.add(sphere);
        </script>
    </body>
</html>
```

### Metode 4: CDN (Setelah Publish ke NPM)

**⚠️ Belum tersedia - Package belum dipublish ke npm**

Setelah package dipublish, Anda bisa menggunakan CDN:

```html
<script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
    window.THREE = THREE;

    import {
        Scene,
        Box,
        Light,
    } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

    const scene = Scene.init('container');
    Light.sun();
    const box = Box.create(1, 1, 1);
    scene.add(box);
</script>
```

**CDN Providers yang Tersedia (setelah publish):**

- **jsDelivr** (Direkomendasikan):
    ```
    https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js
    ```
- **unpkg**:
    ```
    https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.min.js
    ```

### Metode 2: NPM Installation (Untuk Proyek dengan Build Tools)

Jika Anda menggunakan build tools seperti Webpack, Vite, atau Parcel:

**Langkah 1: Install via npm**

```bash
npm install kalythesainz three
```

**Langkah 2: Import dalam JavaScript/TypeScript**

```javascript
// Import Three.js
import * as THREE from 'three';
window.THREE = THREE;

// Import KALYTHESAINZ components
import { Scene, Box, Sphere, Plane, Light } from 'kalythesainz';

// Inisialisasi scene
const scene = Scene.init('container');

// Tambahkan lighting
Light.sun();
Light.ambient(0.4);

// Buat objek
const box = Box.create(1, 1, 1);
scene.add(box);
```

**Langkah 3: Setup HTML**

```html
<!DOCTYPE html>
<html>
    <head>
        <title>KALYTHESAINZ App</title>
        <style>
            body {
                margin: 0;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>
        <script type="module" src="./main.js"></script>
    </body>
</html>
```

### Metode 3: Import Maps (Modern Browsers)

Untuk browser modern yang mendukung import maps:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>KALYTHESAINZ with Import Maps</title>
        <script type="importmap">
            {
                "imports": {
                    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                    "kalythesainz": "https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js"
                }
            }
        </script>
        <style>
            body {
                margin: 0;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>

        <script type="module">
            import * as THREE from 'three';
            window.THREE = THREE;

            import { Scene, Box, Light } from 'kalythesainz';

            const scene = Scene.init('container');
            Light.sun();

            const box = Box.create(1, 1, 1);
            scene.add(box);
        </script>
    </body>
</html>
```

## 📖 Panduan Lengkap / Complete Guide

### 1. Inisialisasi Scene

```javascript
import { Scene, Camera, Light } from 'kalythesainz';

// Cara 1: Inisialisasi sederhana
const scene = Scene.init('container');

// Cara 2: Dengan konfigurasi kustom
const scene = Scene.init('container', {
    camera: {
        fov: 60,
        position: { x: 0, y: 5, z: 10 },
    },
    renderer: {
        antialias: true,
        alpha: false,
    },
    background: 0x222222,
});

// Cara 3: Setup manual untuk kontrol penuh
import { App, Config } from 'kalythesainz';

Config.merge({
    camera: { fov: 75, near: 0.1, far: 1000 },
    renderer: { antialias: true },
});

const app = App.init();
const scene = Scene.init('container');
```

### 2. Membuat dan Mengelola Objek 3D

```javascript
import { Box, Sphere, Plane } from 'kalythesainz';

// Buat objek primitif
const box = Box.create(1, 1, 1); // width, height, depth
const sphere = Sphere.create(0.8, 32); // radius, segments
const plane = Plane.create(10, 10); // width, height

// Set posisi
box.position = { x: 0, y: 1, z: 0 };

// Set rotasi (dalam radian)
box.rotation = { x: 0, y: Math.PI / 4, z: 0 };

// Set skala
box.scale = { x: 2, y: 1, z: 1 };

// Tambahkan ke scene
scene.add(box);
scene.add(sphere);
scene.add(plane);

// Cari objek berdasarkan ID
const foundBox = scene.find(box.id);

// Hapus objek
scene.remove(box.id);

// Bersihkan semua objek
scene.clear();
```

### 3. Lighting

```javascript
import { Light } from 'kalythesainz';

// Directional light (seperti matahari)
Light.sun(1.0, 0xffffff);

// Ambient light (pencahayaan umum)
Light.ambient(0.4, 0xffffff);

// Point light (lampu titik)
Light.point(5, 5, 5, 1.0, 0xffffff);

// Spot light (lampu sorot)
Light.spot(5, 5, 5, { x: 0, y: 0, z: 0 }, 1.0, 0xffffff);

// Kombinasi lighting untuk hasil terbaik
Light.sun(1.0);
Light.ambient(0.3);
```

### 4. Camera Presets

```javascript
import { Camera } from 'kalythesainz';

// Preset kamera
const topCamera = Camera.topView();
const frontCamera = Camera.frontView();
const isoCamera = Camera.isometric();

// Kontrol kamera manual
const camera = scene.camera;
camera.setPosition(0, 5, 10);
camera.lookAt(0, 0, 0);
camera.setFov(60);
```

### 5. Event System

```javascript
import { EventBus } from 'kalythesainz';

// Subscribe ke event
EventBus.subscribe('object:added', (event) => {
    console.log('Objek ditambahkan:', event.data.object.name);
});

EventBus.subscribe('object:modified', (event) => {
    console.log('Objek dimodifikasi:', event.data.property);
});

// Publish event kustom
EventBus.publish('custom:event', { message: 'Hello!' });

// Unsubscribe
const unsubscribe = EventBus.subscribe('test', callback);
unsubscribe(); // Hapus listener
```

### 6. Serialization (Simpan/Muat Scene)

```javascript
import { Serializer } from 'kalythesainz';

// Simpan scene ke JSON
const sceneData = Serializer.serialize(scene);
localStorage.setItem('myScene', JSON.stringify(sceneData));

// Muat scene dari JSON
const savedData = JSON.parse(localStorage.getItem('myScene'));
Serializer.deserialize(savedData, scene);

// Export ke file
const dataStr = JSON.stringify(sceneData, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'scene.json';
link.click();
```

### 7. Visual Tools (Inspector, Scene Tree, Gizmo)

```javascript
import { Inspector, SceneTree, TransformGizmo } from 'kalythesainz';

// Scene Tree - tampilkan hierarki objek
const sceneTree = new SceneTree('tree-container');
sceneTree.onObjectSelect((objectId) => {
    const obj = scene.find(objectId);
    inspector.show(obj);
});

// Inspector - edit properti objek
const inspector = new Inspector('inspector-container');
inspector.show(box);
inspector.onPropertyChange((property, value) => {
    console.log(`${property} berubah menjadi ${value}`);
});

// Transform Gizmo - manipulasi visual
const gizmo = new TransformGizmo(scene.camera, scene.renderer);
gizmo.attach(box);
gizmo.setMode('translate'); // 'translate', 'rotate', atau 'scale'

gizmo.onTransformChange(() => {
    console.log('Objek sedang ditransformasi');
});
```

### 8. Integrasi Three.js Langsung

```javascript
// Akses objek Three.js langsung
const threeMesh = box.threeMesh;
const threeCamera = scene.camera.threeCamera;
const threeRenderer = scene.renderer.threeRenderer;

// Modifikasi langsung
threeMesh.material.color.setHex(0xff0000);
threeMesh.material.metalness = 0.8;
threeMesh.material.roughness = 0.2;

// Sync kembali ke framework
import { ThreeJsIntegration } from 'kalythesainz';
ThreeJsIntegration.syncFromThree(box);
```

### 9. Plugin System

```javascript
import { PluginManager, PluginInterfaces } from 'kalythesainz';

// Buat plugin kustom
class MyCustomObject extends PluginInterfaces.ObjectPlugin {
    constructor() {
        super('MyCustomObject', '1.0.0');
    }

    create(params) {
        // Implementasi pembuatan objek kustom
        const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        return new THREE.Mesh(geometry, material);
    }
}

// Register plugin
PluginManager.register(new MyCustomObject());

// Gunakan plugin
const customObj = PluginManager.createObject('MyCustomObject', {});
scene.add(customObj);
```

## 🎯 Contoh Proyek Lengkap / Complete Project Example

```html
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="UTF-8" />
        <title>KALYTHESAINZ - Aplikasi Lengkap</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: Arial, sans-serif;
                overflow: hidden;
            }

            #container {
                width: 100vw;
                height: 100vh;
            }

            #controls {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 20px;
                border-radius: 8px;
                min-width: 200px;
            }

            button {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: #4caf50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            button:hover {
                background: #45a049;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>

        <div id="controls">
            <h3>Kontrol Scene</h3>
            <button onclick="addBox()">Tambah Box</button>
            <button onclick="addSphere()">Tambah Sphere</button>
            <button onclick="saveScene()">Simpan Scene</button>
            <button onclick="loadScene()">Muat Scene</button>
            <button onclick="clearScene()">Bersihkan Scene</button>
        </div>

        <script type="module">
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            import {
                Scene,
                Box,
                Sphere,
                Light,
                Serializer,
                EventBus,
            } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

            // Inisialisasi scene
            const scene = Scene.init('container');

            // Setup lighting
            Light.sun(1.0);
            Light.ambient(0.4);

            // Event listeners
            EventBus.subscribe('object:added', (event) => {
                console.log('✅ Objek ditambahkan:', event.data.object.name);
            });

            // Fungsi global
            window.addBox = () => {
                const box = Box.create(
                    Math.random() + 0.5,
                    Math.random() + 0.5,
                    Math.random() + 0.5,
                );
                box.position = {
                    x: (Math.random() - 0.5) * 5,
                    y: Math.random() * 2,
                    z: (Math.random() - 0.5) * 5,
                };
                box.name = `Box ${Date.now()}`;
                scene.add(box);
            };

            window.addSphere = () => {
                const sphere = Sphere.create(Math.random() * 0.5 + 0.3, 32);
                sphere.position = {
                    x: (Math.random() - 0.5) * 5,
                    y: Math.random() * 2,
                    z: (Math.random() - 0.5) * 5,
                };
                sphere.name = `Sphere ${Date.now()}`;
                scene.add(sphere);
            };

            window.saveScene = () => {
                const data = Serializer.serialize(scene);
                localStorage.setItem('kalythesainz_scene', JSON.stringify(data));
                alert('✅ Scene berhasil disimpan!');
            };

            window.loadScene = () => {
                const data = localStorage.getItem('kalythesainz_scene');
                if (data) {
                    Serializer.deserialize(JSON.parse(data), scene);
                    alert('✅ Scene berhasil dimuat!');
                } else {
                    alert('❌ Tidak ada scene yang tersimpan');
                }
            };

            window.clearScene = () => {
                if (confirm('Hapus semua objek?')) {
                    scene.clear();
                    alert('✅ Scene dibersihkan!');
                }
            };

            // Tambah objek awal
            addBox();
            addSphere();

            console.log('🚀 KALYTHESAINZ siap digunakan!');
        </script>
    </body>
</html>
```

## 🔧 Konfigurasi Lanjutan / Advanced Configuration

```javascript
import { Config, App } from 'kalythesainz';

// Konfigurasi global sebelum inisialisasi
Config.merge({
    camera: {
        fov: 60,
        near: 0.1,
        far: 2000,
        position: { x: 0, y: 10, z: 20 },
    },
    renderer: {
        antialias: true,
        alpha: true,
        shadowMap: true,
    },
    scene: {
        background: 0x1a1a1a,
        fog: { enabled: true, color: 0x000000, near: 10, far: 100 },
    },
});

// Inisialisasi dengan konfigurasi
const app = App.init();
```

## 📋 API Reference Ringkas / Quick API Reference

### Core Layer

```javascript
import { App, Config, EventBus } from 'kalythesainz';

// Application lifecycle
App.init(config);
const app = App.getInstance();
App.destroy();

// Configuration management
Config.set('camera.fov', 60);
Config.get('camera.fov');
Config.merge({ renderer: { antialias: true } });
Config.reset();

// Event system
const unsubscribe = EventBus.subscribe('event-name', callback);
EventBus.publish('event-name', data);
EventBus.unsubscribe('event-name', callback);
EventBus.clear();
```

### Engine Layer

```javascript
import { Scene, Camera, Light, Renderer } from 'kalythesainz';

// Scene management
const scene = Scene.init('container', config);
scene.add(object);
scene.remove(objectId);
scene.find(objectId);
scene.clear();
const data = scene.serialize();
scene.deserialize(data);

// Camera presets
const camera = Camera.topView();
const camera = Camera.frontView();
const camera = Camera.isometric();
camera.setPosition(x, y, z);
camera.lookAt(x, y, z);

// Lighting presets
Light.sun(intensity, color);
Light.ambient(intensity, color);
Light.point(x, y, z, intensity, color);
Light.spot(x, y, z, target, intensity, color);
```

### Objects Layer

```javascript
import { Box, Sphere, Plane, Object3D } from 'kalythesainz';

// Create primitives
const box = Box.create(width, height, depth, material);
const sphere = Sphere.create(radius, segments, material);
const plane = Plane.create(width, height, material);

// Transform properties
object.position = { x, y, z };
object.rotation = { x, y, z };
object.scale = { x, y, z };

// Metadata
object.id;
object.name = 'My Object';
object.tags = ['tag1', 'tag2'];
object.userData = { custom: 'data' };

// Lifecycle
object.dispose();
const clone = object.clone();
const data = object.serialize();
```

### Tools Layer

```javascript
import { Inspector, SceneTree, TransformGizmo } from 'kalythesainz';

// Scene tree
const sceneTree = new SceneTree('container-id');
sceneTree.refresh();
sceneTree.selectObject(objectId);
sceneTree.onObjectSelect(callback);

// Inspector
const inspector = new Inspector('container-id');
inspector.show(object);
inspector.hide();
inspector.refresh();
inspector.onPropertyChange(callback);

// Transform gizmo
const gizmo = new TransformGizmo(camera, renderer);
gizmo.attach(object);
gizmo.detach();
gizmo.setMode('translate'); // 'translate', 'rotate', 'scale'
gizmo.onTransformStart(callback);
gizmo.onTransformChange(callback);
gizmo.onTransformEnd(callback);
```

### Utilities

```javascript
import { Serializer, ThreeJsIntegration } from 'kalythesainz';

// Serialization
const sceneData = Serializer.serialize(scene);
Serializer.deserialize(data, scene);

// Three.js integration
const threeMesh = object.threeMesh;
const threeCamera = camera.threeCamera;
const threeRenderer = renderer.threeRenderer;
ThreeJsIntegration.syncFromThree(object);
ThreeJsIntegration.syncToThree(object);
```

## 💡 Tips & Best Practices

### 1. Performance Optimization

```javascript
// Gunakan object pooling untuk objek yang sering dibuat/dihapus
const objectPool = [];

function getObject() {
    return objectPool.pop() || Box.create(1, 1, 1);
}

function releaseObject(obj) {
    obj.position = { x: 0, y: 0, z: 0 };
    objectPool.push(obj);
}

// Batasi jumlah objek dalam scene
if (scene.objects.length > 1000) {
    console.warn('Terlalu banyak objek, pertimbangkan optimasi');
}
```

### 2. Error Handling

```javascript
try {
    const scene = Scene.init('container');
    const box = Box.create(1, 1, 1);
    scene.add(box);
} catch (error) {
    console.error('Error inisialisasi:', error);
    // Tampilkan pesan error ke user
}

// Subscribe ke error events
EventBus.subscribe('error', (event) => {
    console.error('Framework error:', event.data);
});
```

### 3. Memory Management

```javascript
// Selalu dispose objek yang tidak digunakan
function removeObject(objectId) {
    const obj = scene.find(objectId);
    if (obj) {
        scene.remove(objectId);
        obj.dispose(); // Penting untuk mencegah memory leak
    }
}

// Cleanup saat aplikasi ditutup
window.addEventListener('beforeunload', () => {
    scene.clear();
    App.destroy();
});
```

## 🌐 Browser Support / Dukungan Browser

| Browser | Version | Status             |
| ------- | ------- | ------------------ |
| Chrome  | 60+     | ✅ Fully Supported |
| Firefox | 55+     | ✅ Fully Supported |
| Safari  | 12+     | ✅ Fully Supported |
| Edge    | 79+     | ✅ Fully Supported |

**Requirements:**

- Native ES Module support
- WebGL support
- Modern JavaScript (ES6+)

## 🛠️ Development / Pengembangan

### Local Development

```bash
# Clone repository
git clone https://github.com/kalyzet/kalythesainz.git
cd kalythesainz

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure

```
kalythesainz/
├── core/              # Core framework (App, Config, EventBus, PluginManager)
├── engine/            # 3D engine (Scene, Renderer, Camera, Light)
├── objects/           # 3D objects (Box, Sphere, Plane, Object3D)
├── tools/             # Visual tools (Inspector, SceneTree, TransformGizmo)
├── utils/             # Utilities (Serializer, ThreeJsIntegration)
├── ui/                # Development UI
├── tests/             # Test files
│   ├── unit/          # Unit tests
│   ├── properties/    # Property-based tests
│   └── __mocks__/     # Test mocks
├── examples/          # Example applications
├── docs/              # Documentation
├── dist/              # Built files (generated)
└── index.js           # Main entry point
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/unit/core/EventBus.test.js

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**

- ✅ 323 passing tests
- ✅ Unit tests for all components
- ✅ Property-based tests for correctness
- ✅ Integration tests

## 📦 Examples / Contoh

Lihat folder [examples/](examples/) untuk demonstrasi lengkap:

- **[complete-demo.html](examples/complete-demo.html)** - Demo lengkap dengan semua fitur
- **[cdn-quickstart.html](examples/cdn-quickstart.html)** - Setup minimal menggunakan CDN
- **[cdn-simple.html](examples/cdn-simple.html)** - Contoh paling sederhana
- **[advanced-features.html](examples/advanced-features.html)** - Events, serialization, Three.js integration
- **[plugin-example.js](examples/plugin-example.js)** - Membuat plugin kustom

## 🤝 Contributing / Kontribusi

Kontribusi sangat diterima! Silakan baca [Contributing Guide](CONTRIBUTING.md) untuk detail.

### How to Contribute

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🗺️ Roadmap

- [x] Core framework architecture
- [x] Basic 3D objects and lighting
- [x] Scene management and rendering
- [x] Event system
- [x] Serialization system
- [x] Visual tools (Inspector, Scene Tree, Transform Gizmo)
- [x] Three.js integration
- [x] Plugin system
- [x] CDN distribution
- [x] Comprehensive documentation
- [ ] Advanced materials and textures
- [ ] Animation system
- [ ] Performance optimizations
- [ ] Additional primitive objects
- [ ] Advanced lighting effects
- [ ] Physics integration (optional)
- [ ] VR/AR support (future)

## 🙏 Acknowledgments

- Built on top of [Three.js](https://threejs.org/)
- Inspired by modern 3D frameworks and game engines
- Thanks to all contributors

## 📞 Support / Dukungan

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/kalyzet/kalythesainz/issues)
- 💬 [Discussions](https://github.com/kalyzet/kalythesainz/discussions)
- 📧 Email: muhammadhaikal3037@gmail.com

## ⭐ Star History

Jika framework ini membantu Anda, berikan ⭐ di GitHub!

---

**Made by Kalyzet**
