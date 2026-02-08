# KALYTHESAINZ Framework

![npm](https://img.shields.io/npm/v/kalythesainz)
![license](https://img.shields.io/npm/l/kalythesainz)
![downloads](https://img.shields.io/npm/dt/kalythesainz)
![version](https://img.shields.io/badge/version-2.0.0-blue)
![three.js](https://img.shields.io/badge/three.js-0.160.0+-green)
![tests](https://img.shields.io/badge/tests-730%2B-brightgreen)

Framework 3D web sederhana yang dibangun di atas Three.js dengan API deklaratif dan visual tooling.

A simple 3D web framework built on top of Three.js with declarative API and visual tooling.

**🎉 New in v2.0:** Instance-based API, React Strict Mode compatible, Multiple scenes support!

---

## 🚀 Quick Start (5 Menit)

### Via npm (New Instance-Based API - Recommended):

```bash
npm install kalythesainz three
```

```javascript
import * as THREE from 'three';
window.THREE = THREE;

import { createScene } from 'kalythesainz';

// Create a scene instance
const scene = createScene('container');

// Add lighting
scene.addLight('sun', { intensity: 1.0 });

// Create objects using instance methods
const box = scene.createBox(1, 1, 1);
box.position = { x: 0, y: 0, z: 0 };
```

### Via npm (Legacy Singleton API - Deprecated):

> ⚠️ **Deprecation Notice**: The singleton API (`Scene.init()`) is deprecated and will be removed in v3.0. Please migrate to the new instance-based API using `createScene()`. See [Migration Guide](#-migration-guide-v1x-to-v2x) below.

```bash
npm install kalythesainz three
```

```javascript
import * as THREE from 'three';
window.THREE = THREE;

import { Scene, Box, Light } from 'kalythesainz';

const scene = Scene.init('container'); // Deprecated
Light.sun(); // Deprecated

const box = Box.create(1, 1, 1); // Works but deprecated without scene parameter
scene.add(box);
```

### Via CDN (ESM - New Instance-Based API):

```html
<!DOCTYPE html>
<html>
    <head>
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
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            import { createScene } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.esm.js';

            // Create scene instance
            const scene = createScene('container');

            // Add lighting
            scene.addLight('sun', { intensity: 1.0 });
            scene.addLight('ambient', { intensity: 0.4 });

            // Create objects
            const box = scene.createBox(1, 1, 1);
            box.position = { x: 0, y: 0, z: 0 };
        </script>
    </body>
</html>
```

### Via CDN (ESM - Legacy Singleton API):

> ⚠️ **Deprecated**: Use the instance-based API above instead.

```html
<!DOCTYPE html>
<html>
    <head>
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
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            import {
                Scene,
                Box,
                Light,
            } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.esm.js';

            const scene = Scene.init('container');
            Light.sun();

            const box = Box.create(1, 1, 1);
            scene.add(box);
        </script>
    </body>
</html>
```

### Via CDN (UMD):

> ⚠️ **Note**: UMD format uses the legacy singleton API. For new projects, we recommend using ESM format with the instance-based API.

```html
<!DOCTYPE html>
<html>
    <body>
        <div id="container"></div>

        <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js"></script>

        <script>
            const { Scene, Box, Light } = KALYTHESAINZ;

            const scene = Scene.init('container');
            Light.sun();

            const box = Box.create(1, 1, 1);
            scene.add(box);
        </script>
    </body>
</html>
```

---

## ⚠️ Important Note

KALYTHESAINZ requires THREE.js as a peer dependency and expects `THREE` to be available globally (`window.THREE`). Make sure to set `window.THREE` before importing KALYTHESAINZ:

```javascript
import * as THREE from 'three';
window.THREE = THREE; // Required!

import { createScene } from 'kalythesainz';
```

This applies to both npm and CDN usage.

**Version Compatibility:**

- KALYTHESAINZ v2.x: Tested with Three.js v0.160.0+
- KALYTHESAINZ v1.x: Compatible with Three.js v0.150.0+

---

## ✨ Fitur Utama / Key Features

- 🚀 **Zero Installation**: Gunakan langsung dari CDN dengan ES modules
- 🎯 **Declarative API**: Interface sederhana dan intuitif
- 🛠️ **Visual Tools**: Inspector, scene tree, dan transform gizmos bawaan
- 📦 **Modular Architecture**: Pemisahan yang jelas dengan desain berlapis
- 🔧 **Three.js Integration**: Akses langsung ke objek Three.js
- 💾 **Scene Serialization**: Simpan dan muat scene dalam format JSON
- 🎨 **Plugin System**: Perluas fungsionalitas dengan plugin kustom
- ⚡ **Event-Driven**: Arsitektur reaktif dengan event bus bawaan
- 🔄 **Instance-Based API (v2.0)**: Multiple independent scenes, React Strict Mode compatible
- ⚛️ **React Friendly**: Works perfectly with React, Next.js, and other modern frameworks

---

## 📦 Installation

KALYTHESAINZ tersedia di npm dan dapat digunakan melalui:

- npm install
- CDN (jsDelivr / unpkg)
- Import Maps

**Current Version: 2.0.0**

### What's New in v2.0.0?

- ✨ **Instance-Based API**: Create multiple independent scenes with `createScene()`
- ⚛️ **React Strict Mode Compatible**: No more double-mount issues
- 🔄 **Proper Lifecycle Management**: Explicit cleanup with `scene.destroy()`
- 🎯 **Per-Instance Configuration**: Each scene has its own settings
- 📦 **Better Resource Management**: No memory leaks, proper disposal
- 🔌 **Event Isolation**: Events are scoped to scene instances
- 📝 **TypeScript Definitions**: Full type support for the new API
- ⚠️ **Backward Compatible**: Old singleton API still works (with deprecation warnings)

[📖 Full Migration Guide](#-migration-guide-v1x-to-v2x)

### Option 1: npm (Recommended)

```bash
npm install kalythesainz three
```

### Option 2: CDN - jsDelivr

**ESM (v2.x - Latest):**

```
https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.esm.js
```

**UMD (v2.x - Latest):**

```
https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.umd.min.js
```

**ESM (v1.x - Legacy):**

```
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.esm.js
```

**UMD (v1.x - Legacy):**

```
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js
```

### Option 3: CDN - unpkg

**ESM (v2.x - Latest):**

```
https://unpkg.com/kalythesainz@latest/dist/kalythesainz.esm.js
```

**UMD (v2.x - Latest):**

```
https://unpkg.com/kalythesainz@latest/dist/kalythesainz.umd.min.js
```

**ESM (v1.x - Legacy):**

```
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.esm.js
```

**UMD (v1.x - Legacy):**

```
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js
```

> Note: Examples use Three.js v0.160.0, but you can use any recent version that supports ES Modules. We recommend using the latest compatible version of Three.js.

---

## 🌐 CDN Usage

### ESM Format (Modern - v2.x Instance-Based API):

```html
<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "kalythesainz": "https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.esm.js"
        }
    }
</script>

<script type="module">
    import * as THREE from 'three';
    window.THREE = THREE;

    import { createScene } from 'kalythesainz';

    // Create scene instance
    const scene = createScene('container');

    // Add lighting
    scene.addLight('sun', { intensity: 1.0 });
    scene.addLight('ambient', { intensity: 0.4 });

    // Create objects
    const box = scene.createBox(1, 1, 1);
    box.position = { x: 0, y: 0, z: 0 };
</script>
```

### ESM Format (Legacy - v1.x Singleton API):

> ⚠️ **Deprecated**: Use the instance-based API above instead.

```html
<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "kalythesainz": "https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.esm.js"
        }
    }
</script>

<script type="module">
    import * as THREE from 'three';
    window.THREE = THREE;

    import { Scene, Box, Light } from 'kalythesainz';

    const scene = Scene.init('container');
    Light.sun();
    const box = Box.create(1, 1, 1);
    scene.add(box);
</script>
```

### UMD Format (Browser Global - v2.x):

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.umd.min.js"></script>

<script>
    const { createScene } = KALYTHESAINZ;

    // Create scene instance
    const scene = createScene('container');

    // Add lighting
    scene.addLight('sun', { intensity: 1.0 });
    scene.addLight('ambient', { intensity: 0.4 });

    // Create objects
    const box = scene.createBox(1, 1, 1);
    box.position = { x: 0, y: 0, z: 0 };
</script>
```

### UMD Format (Browser Global - v1.x Legacy):

> ⚠️ **Deprecated**: Use the instance-based API above instead.

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js"></script>

<script>
    const { Scene, Box, Light } = KALYTHESAINZ;

    const scene = Scene.init('container');
    Light.sun();
    const box = Box.create(1, 1, 1);
    scene.add(box);
</script>
```

---

## 📚 Full Documentation

For in-depth guides, complete API reference, and advanced examples, please visit the [docs/](docs/) folder:

- [Getting Started Guide](docs/GETTING_STARTED.md) - Step-by-step tutorial
- [CDN Usage Guide](docs/CDN_USAGE.md) - Complete CDN guide
- [API Documentation](docs/API.md) - Full API reference
- [Plugin System](docs/PLUGIN_SYSTEM.md) - Create custom plugins
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Examples](examples/) - Sample applications

---

## 🧠 Core Concepts (Quick Overview)

### 1. Scene Management (Instance-Based API - v2.x)

```javascript
import { createScene } from 'kalythesainz';

// Create a scene instance
const scene = createScene('container', {
    renderer: { antialias: true },
    camera: { fov: 75 },
    autoStart: true,
});

// Create and add objects using instance methods
const box = scene.createBox(1, 1, 1);
const sphere = scene.createSphere(0.8, 32);
const plane = scene.createPlane(10, 10);

// Add lighting
scene.addLight('sun', { intensity: 1.0 });
scene.addLight('ambient', { intensity: 0.4 });

// Find objects
const obj = scene.find(objectId);

// Remove objects
scene.remove(objectId);

// Clear all
scene.clear();

// Cleanup when done
scene.destroy();
```

### 1b. Scene Management (Legacy Singleton API - Deprecated)

> ⚠️ **Deprecated**: This API is maintained for backward compatibility but will be removed in v3.0.

```javascript
import { Scene } from 'kalythesainz';

// Initialize scene (deprecated)
const scene = Scene.init('container');

// Add objects
scene.add(object);

// Find objects
const obj = scene.find(objectId);

// Remove objects
scene.remove(objectId);

// Clear all
scene.clear();
```

### 2. Creating 3D Objects (Instance-Based API)

```javascript
// Method 1: Using scene instance methods (recommended)
const box = scene.createBox(1, 1, 1);
box.position = { x: 0, y: 1, z: 0 };
box.rotation = { x: 0, y: Math.PI / 4, z: 0 };

const sphere = scene.createSphere(0.8, 32);
sphere.position = { x: 2, y: 0, z: 0 };

const plane = scene.createPlane(10, 10);
plane.position = { x: 0, y: -1, z: 0 };

// Method 2: Using factory methods with scene parameter
import { Box, Sphere, Plane } from 'kalythesainz';

const box2 = Box.create(1, 1, 1, null, scene);
const sphere2 = Sphere.create(0.8, 32, null, scene);
const plane2 = Plane.create(10, 10, null, scene);
```

### 2b. Creating 3D Objects (Legacy API - Deprecated)

> ⚠️ **Deprecated**: Objects created without a scene parameter use the singleton scene.

```javascript
import { Box, Sphere, Plane } from 'kalythesainz';

const box = Box.create(1, 1, 1);
box.position = { x: 0, y: 1, z: 0 };
box.rotation = { x: 0, y: Math.PI / 4, z: 0 };
scene.add(box);

const sphere = Sphere.create(0.8, 32);
sphere.position = { x: 2, y: 0, z: 0 };
scene.add(sphere);
```

### 3. Lighting (Instance-Based API)

```javascript
// Method 1: Using scene instance methods (recommended)
scene.addLight('sun', { intensity: 1.0 });
scene.addLight('ambient', { intensity: 0.4 });
scene.addLight('point', { x: 5, y: 5, z: 5, intensity: 0.8 });

// Method 2: Using Light factory with scene parameter
import { Light } from 'kalythesainz';

Light.sun({ intensity: 1.0 }, scene);
Light.ambient({ intensity: 0.4 }, scene);
Light.point(5, 5, 5, { intensity: 0.8 }, scene);
```

### 3b. Lighting (Legacy API - Deprecated)

> ⚠️ **Deprecated**: Lights created without a scene parameter use the singleton scene.

```javascript
import { Light } from 'kalythesainz';

Light.sun(1.0); // Directional light
Light.ambient(0.4); // Ambient light
Light.point(5, 5, 5); // Point light
```

### 4. Event System

```javascript
import { EventBus } from 'kalythesainz';

EventBus.subscribe('object:added', (event) => {
    console.log('Object added:', event.data.object);
});

EventBus.publish('custom:event', { data: 'value' });
```

### 5. Serialization

```javascript
import { Serializer } from 'kalythesainz';

// Save scene
const data = Serializer.serialize(scene);
localStorage.setItem('scene', JSON.stringify(data));

// Load scene
const saved = JSON.parse(localStorage.getItem('scene'));
Serializer.deserialize(saved, scene);
```

---

## 🔌 Framework Integration (Quick Examples)

### React (with React Strict Mode Support)

> ✅ **React Strict Mode Compatible**: The new instance-based API works perfectly with React Strict Mode!

```jsx
import { useEffect, useRef } from 'react';

export default function ThreeScene() {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const THREE = await import('three');
            window.THREE = THREE;

            const { createScene } = await import('kalythesainz');

            // Create scene instance
            const scene = createScene('container', {
                autoStart: true,
            });
            sceneRef.current = scene;

            // Add lighting
            scene.addLight('sun', { intensity: 1.0 });
            scene.addLight('ambient', { intensity: 0.4 });

            // Create objects
            const box = scene.createBox(1, 1, 1);
            box.position = { x: 0, y: 0, z: 0 };
        };

        init();

        // Cleanup on unmount
        return () => {
            if (sceneRef.current) {
                sceneRef.current.destroy();
                sceneRef.current = null;
            }
        };
    }, []);

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

**Why Instance-Based API is Better for React:**

- ✅ Each component gets its own scene instance
- ✅ No conflicts between multiple components
- ✅ Proper cleanup with `scene.destroy()`
- ✅ Works perfectly with React Strict Mode (double-mount)
- ✅ No singleton state issues

### React (Legacy Singleton API - Not Recommended)

> ⚠️ **Not Recommended**: The singleton API has issues with React Strict Mode and multiple components.

```jsx
import { useEffect, useRef } from 'react';

export default function ThreeScene() {
    const containerRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const THREE = await import('three');
            window.THREE = THREE;

            const { Scene, Box, Light } = await import('kalythesainz');

            const scene = Scene.init('container'); // Deprecated
            Light.sun(); // Deprecated
            const box = Box.create(1, 1, 1); // Deprecated
            scene.add(box);
        };
        init();
    }, []);

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

### Next.js

```jsx
'use client';
import dynamic from 'next/dynamic';

const ThreeScene = dynamic(() => import('./ThreeScene'), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function Page() {
    return <ThreeScene />;
}
```

[📖 Full Next.js Integration Guide](docs/NEXTJS_INTEGRATION.md)

**Supported Frameworks:**

- ✅ Next.js
- ✅ React
- ✅ Vue.js
- ✅ Angular
- ✅ Svelte
- ✅ Vanilla JS

See [docs/](docs/) for complete integration guides.

---

## 🔄 Migration Guide: v1.x to v2.x

### Why Migrate?

The new instance-based API solves several critical issues:

- ✅ **React Strict Mode Compatible**: No more errors with double-mounting
- ✅ **Multiple Scenes**: Create multiple independent 3D scenes
- ✅ **Better Resource Management**: Explicit lifecycle with `destroy()`
- ✅ **No Global State**: Each scene is isolated
- ✅ **Cleaner API**: Objects belong to scenes explicitly

### Quick Migration Steps

#### Step 1: Change Scene Initialization

**Before (v1.x):**

```javascript
import { Scene } from 'kalythesainz';
const scene = Scene.init('container');
```

**After (v2.x):**

```javascript
import { createScene } from 'kalythesainz';
const scene = createScene('container');
```

#### Step 2: Change Object Creation

**Before (v1.x):**

```javascript
import { Box, Sphere, Light } from 'kalythesainz';

const box = Box.create(1, 1, 1);
scene.add(box);

const sphere = Sphere.create(0.8, 32);
scene.add(sphere);

Light.sun();
Light.ambient(0.4);
```

**After (v2.x) - Option 1 (Recommended):**

```javascript
// Use scene instance methods
const box = scene.createBox(1, 1, 1);
const sphere = scene.createSphere(0.8, 32);

scene.addLight('sun', { intensity: 1.0 });
scene.addLight('ambient', { intensity: 0.4 });
```

**After (v2.x) - Option 2:**

```javascript
// Use factory methods with scene parameter
import { Box, Sphere, Light } from 'kalythesainz';

const box = Box.create(1, 1, 1, null, scene);
const sphere = Sphere.create(0.8, 32, null, scene);

Light.sun({ intensity: 1.0 }, scene);
Light.ambient({ intensity: 0.4 }, scene);
```

#### Step 3: Add Cleanup (Important!)

**Before (v1.x):**

```javascript
// No cleanup needed (but caused memory leaks)
```

**After (v2.x):**

```javascript
// Always cleanup when done
scene.destroy();

// In React:
useEffect(() => {
    const scene = createScene('container');
    // ... setup code ...

    return () => {
        scene.destroy(); // Cleanup on unmount
    };
}, []);
```

### Side-by-Side Comparison

#### Complete Example: Before vs After

**Before (v1.x - Singleton API):**

```javascript
import * as THREE from 'three';
window.THREE = THREE;

import { Scene, Box, Sphere, Light } from 'kalythesainz';

// Initialize singleton scene
const scene = Scene.init('container');

// Add lights
Light.sun(1.0);
Light.ambient(0.4);

// Create objects
const box = Box.create(1, 1, 1);
box.position = { x: -2, y: 0, z: 0 };
scene.add(box);

const sphere = Sphere.create(0.8, 32);
sphere.position = { x: 2, y: 0, z: 0 };
scene.add(sphere);

// No cleanup
```

**After (v2.x - Instance-Based API):**

```javascript
import * as THREE from 'three';
window.THREE = THREE;

import { createScene } from 'kalythesainz';

// Create scene instance
const scene = createScene('container', {
    autoStart: true,
});

// Add lights
scene.addLight('sun', { intensity: 1.0 });
scene.addLight('ambient', { intensity: 0.4 });

// Create objects
const box = scene.createBox(1, 1, 1);
box.position = { x: -2, y: 0, z: 0 };

const sphere = scene.createSphere(0.8, 32);
sphere.position = { x: 2, y: 0, z: 0 };

// Cleanup when done
// scene.destroy();
```

### React Migration Example

**Before (v1.x - Problematic with Strict Mode):**

```jsx
import { useEffect } from 'react';
import { Scene, Box, Light } from 'kalythesainz';

function MyComponent() {
    useEffect(() => {
        const scene = Scene.init('container'); // Singleton
        Light.sun();
        const box = Box.create(1, 1, 1);
        scene.add(box);
        // No cleanup - memory leak!
    }, []);

    return <div id="container" />;
}
```

**After (v2.x - Works Perfectly):**

```jsx
import { useEffect, useRef } from 'react';
import { createScene } from 'kalythesainz';

function MyComponent() {
    const sceneRef = useRef(null);

    useEffect(() => {
        const scene = createScene('container');
        sceneRef.current = scene;

        scene.addLight('sun', { intensity: 1.0 });
        const box = scene.createBox(1, 1, 1);

        return () => {
            scene.destroy(); // Proper cleanup!
        };
    }, []);

    return <div id="container" />;
}
```

### Common Migration Pitfalls

#### ❌ Pitfall 1: Forgetting to Cleanup

```javascript
// BAD - Memory leak
useEffect(() => {
    const scene = createScene('container');
    // ... setup ...
}, []); // No cleanup!
```

```javascript
// GOOD - Proper cleanup
useEffect(() => {
    const scene = createScene('container');
    // ... setup ...
    return () => scene.destroy();
}, []);
```

#### ❌ Pitfall 2: Using Old API Without Scene Parameter

```javascript
// BAD - Uses deprecated singleton
const box = Box.create(1, 1, 1); // Warning logged
```

```javascript
// GOOD - Explicit scene
const box = scene.createBox(1, 1, 1);
// OR
const box = Box.create(1, 1, 1, null, scene);
```

#### ❌ Pitfall 3: Multiple Components Sharing Singleton

```javascript
// BAD - Components conflict
function ComponentA() {
    useEffect(() => {
        Scene.init('container-a'); // Singleton!
    }, []);
}

function ComponentB() {
    useEffect(() => {
        Scene.init('container-b'); // Overwrites A!
    }, []);
}
```

```javascript
// GOOD - Independent instances
function ComponentA() {
    useEffect(() => {
        const scene = createScene('container-a');
        return () => scene.destroy();
    }, []);
}

function ComponentB() {
    useEffect(() => {
        const scene = createScene('container-b');
        return () => scene.destroy();
    }, []);
}
```

### Backward Compatibility

The v2.x release maintains full backward compatibility with v1.x:

- ✅ Old singleton API still works
- ✅ Deprecation warnings guide migration
- ⚠️ Singleton API will be removed in v3.0
- 📅 Recommended migration timeline: Before v3.0 release

### Breaking Changes in v2.0.0

**None!** v2.0.0 is fully backward compatible. However, the following are deprecated:

- `Scene.init()` → Use `createScene()` instead
- `Box.create()` without scene → Use `scene.createBox()` or pass scene parameter
- `Sphere.create()` without scene → Use `scene.createSphere()` or pass scene parameter
- `Plane.create()` without scene → Use `scene.createPlane()` or pass scene parameter
- `Light.sun()` without scene → Use `scene.addLight('sun')` or pass scene parameter
- `Light.ambient()` without scene → Use `scene.addLight('ambient')` or pass scene parameter
- `Light.point()` without scene → Use `scene.addLight('point')` or pass scene parameter

All deprecated APIs will log warnings to the console with migration instructions.

### Migration Checklist

- [ ] Replace `Scene.init()` with `createScene()`
- [ ] Replace `Box.create()` with `scene.createBox()` or add scene parameter
- [ ] Replace `Sphere.create()` with `scene.createSphere()` or add scene parameter
- [ ] Replace `Plane.create()` with `scene.createPlane()` or add scene parameter
- [ ] Replace `Light.sun()` with `scene.addLight('sun')` or add scene parameter
- [ ] Replace `Light.ambient()` with `scene.addLight('ambient')` or add scene parameter
- [ ] Add `scene.destroy()` cleanup in appropriate places
- [ ] Test with React Strict Mode enabled
- [ ] Verify no deprecation warnings in console

---

## 🎯 API Reference (Quick)

### Core (v2.x)

```javascript
import { createScene } from 'kalythesainz';

// Create scene instance
const scene = createScene('container', {
    renderer: { antialias: true },
    camera: { fov: 75 },
    autoStart: true,
});

// Scene instance methods
scene.createBox(width, height, depth, material);
scene.createSphere(radius, segments, material);
scene.createPlane(width, height, material);
scene.addLight(type, config);
scene.add(object, id);
scene.remove(objectOrId);
scene.find(id);
scene.clear();
scene.destroy();
```

### Core (v1.x - Deprecated)

```javascript
import { App, Config, EventBus, Scene } from 'kalythesainz';

App.init();
Config.set('camera.fov', 60);
EventBus.subscribe('event', callback);

const scene = Scene.init('container'); // Deprecated
```

### Engine

```javascript
import { Camera, Light, Renderer } from 'kalythesainz';

// Camera views
const camera = Camera.topView();

// Renderer access (usually not needed with instance API)
```

### Objects (v2.x - With Scene Parameter)

```javascript
import { Box, Sphere, Plane } from 'kalythesainz';

// Recommended: Use scene instance methods
const box = scene.createBox(1, 1, 1);
const sphere = scene.createSphere(0.8, 32);
const plane = scene.createPlane(10, 10);

// Alternative: Factory methods with scene parameter
const box = Box.create(1, 1, 1, null, scene);
const sphere = Sphere.create(0.8, 32, null, scene);
const plane = Plane.create(10, 10, null, scene);
```

### Objects (v1.x - Deprecated)

```javascript
import { Box, Sphere, Plane } from 'kalythesainz';

const box = Box.create(1, 1, 1); // Deprecated
const sphere = Sphere.create(0.8, 32); // Deprecated
const plane = Plane.create(10, 10); // Deprecated
```

### Tools

```javascript
import { Inspector, SceneTree, TransformGizmo } from 'kalythesainz';

const inspector = new Inspector('container');
const sceneTree = new SceneTree('tree-container');
const gizmo = new TransformGizmo(camera, renderer);
```

### Utils

```javascript
import { Serializer, ThreeJsIntegration } from 'kalythesainz';

const data = Serializer.serialize(scene);
ThreeJsIntegration.syncFromThree(object);
```

---

## 🧪 Testing & Quality

KALYTHESAINZ v2.0.0 includes a comprehensive test suite to ensure reliability:

- **730+ Tests**: Unit, integration, and property-based tests
- **82%+ Pass Rate**: Core functionality thoroughly tested
- **Property-Based Testing**: Using fast-check for robust validation
- **React Strict Mode Tests**: Verified compatibility with double-mounting
- **Memory Leak Tests**: Ensuring proper cleanup and disposal
- **Cross-Browser Testing**: Verified on Chrome, Firefox, Safari, Edge

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/properties/
npm test -- tests/unit/
npm test -- tests/integration/
```

---

## 🌐 Browser Support

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

---

## 🗺️ Roadmap

### ✅ Completed (v2.0.0)

- [x] Core framework architecture
- [x] Basic 3D objects and lighting
- [x] Scene management and rendering
- [x] Event system
- [x] Serialization system
- [x] Visual tools (Inspector, Scene Tree, Transform Gizmo)
- [x] Three.js integration
- [x] Plugin system
- [x] CDN distribution
- [x] npm publish
- [x] **Instance-based API**
- [x] **React Strict Mode compatibility**
- [x] **Multiple scene support**
- [x] **Per-instance configuration**
- [x] **Proper lifecycle management**
- [x] **TypeScript definitions**
- [x] **Comprehensive test suite (730+ tests)**

### 🚧 In Progress

- [ ] Advanced materials and textures
- [ ] Animation system
- [ ] Performance optimizations

### 📋 Planned

- [ ] Additional primitive objects
- [ ] Advanced lighting effects
- [ ] Physics integration (optional)
- [ ] VR/AR support (future)
- [ ] v3.0: Remove deprecated singleton API

---

## ❓ Frequently Asked Questions (FAQ)

### Why should I upgrade to v2.0?

The instance-based API solves critical issues:

- ✅ Works with React Strict Mode (no double-mount errors)
- ✅ Supports multiple independent scenes
- ✅ Better memory management with explicit cleanup
- ✅ No global state conflicts
- ✅ More predictable behavior in modern frameworks

### Is v2.0 backward compatible?

Yes! All v1.x code will continue to work in v2.0. You'll see deprecation warnings in the console, but nothing will break. The old API will be removed in v3.0.

### How do I migrate from v1.x to v2.x?

Follow our [Migration Guide](#-migration-guide-v1x-to-v2x) above. The main changes are:

1. Replace `Scene.init()` with `createScene()`
2. Use scene instance methods like `scene.createBox()` instead of `Box.create()`
3. Add `scene.destroy()` cleanup when done

### Can I use both APIs in the same project?

Yes, during the migration period you can use both. However, we recommend migrating completely to avoid confusion.

### Does v2.0 work with React Strict Mode?

Yes! This was one of the main reasons for the v2.0 refactor. The instance-based API works perfectly with React Strict Mode's double-mounting behavior.

### What about TypeScript support?

Full TypeScript definitions are included for both the new instance-based API and the legacy singleton API.

### When will v3.0 be released?

We haven't set a date yet, but v3.0 will remove the deprecated singleton API. We'll provide plenty of notice before that happens.

### How do I report bugs or request features?

Please use our [GitHub Issues](https://github.com/kalyzet/kalythesainz/issues) for bug reports and feature requests.

---

## ⚡ Performance & Best Practices

### Instance-Based API Best Practices

```javascript
// ✅ GOOD: Create scene, use it, destroy it
function MyComponent() {
    useEffect(() => {
        const scene = createScene('container');
        // ... use scene ...
        return () => scene.destroy(); // Always cleanup!
    }, []);
}

// ❌ BAD: No cleanup
function MyComponent() {
    useEffect(() => {
        const scene = createScene('container');
        // ... use scene ...
        // Missing cleanup - memory leak!
    }, []);
}

// ✅ GOOD: Use scene instance methods
const box = scene.createBox(1, 1, 1);

// ⚠️ OK but deprecated: Factory with scene parameter
const box = Box.create(1, 1, 1, null, scene);

// ❌ BAD: Factory without scene (uses deprecated singleton)
const box = Box.create(1, 1, 1);
```

### Performance Tips

1. **Reuse Materials**: Create materials once and reuse them
2. **Batch Operations**: Add multiple objects before starting render loop
3. **Dispose Properly**: Always call `scene.destroy()` when done
4. **Optimize Geometry**: Use appropriate segment counts for spheres/cylinders
5. **Limit Lights**: Too many lights can impact performance
6. **Use Instance Methods**: `scene.createBox()` is more efficient than factory methods

### Memory Management

```javascript
// Proper cleanup in React
useEffect(() => {
    const scene = createScene('container');

    // Create objects
    const box = scene.createBox(1, 1, 1);
    const sphere = scene.createSphere(0.8, 32);

    // Cleanup function
    return () => {
        // This will dispose:
        // - Renderer
        // - All objects
        // - All lights
        // - Event listeners
        // - Canvas element
        scene.destroy();
    };
}, []);
```

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan baca [Contributing Guide](CONTRIBUTING.md) untuk detail.

---

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/kalyzet/kalythesainz/issues)
- 💬 [Discussions](https://github.com/kalyzet/kalythesainz/discussions)
- 📧 Email: muhammadhaikal3037@gmail.com
- 📦 [npm Package](https://www.npmjs.com/package/kalythesainz)

---

**Made by Kalyzet**
