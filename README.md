# KALYTHESAINZ Framework

![npm](https://img.shields.io/npm/v/kalythesainz)
![license](https://img.shields.io/npm/l/kalythesainz)
![downloads](https://img.shields.io/npm/dt/kalythesainz)

Framework 3D web sederhana yang dibangun di atas Three.js dengan API deklaratif dan visual tooling.

A simple 3D web framework built on top of Three.js with declarative API and visual tooling.

---

## 🚀 Quick Start (5 Menit)

### Via npm:

```bash
npm install kalythesainz three
```

```javascript
import * as THREE from 'three';
window.THREE = THREE;

import { Scene, Box, Light } from 'kalythesainz';

const scene = Scene.init('container');
Light.sun();

const box = Box.create(1, 1, 1);
scene.add(box);
```

### Via CDN (ESM):

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

import { Scene, Box, Light } from 'kalythesainz';
```

This applies to both npm and CDN usage.

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

---

## 📦 Installation

KALYTHESAINZ tersedia di npm dan dapat digunakan melalui:

- npm install
- CDN (jsDelivr / unpkg)
- Import Maps

### Option 1: npm (Recommended)

```bash
npm install kalythesainz three
```

### Option 2: CDN - jsDelivr

**ESM:**

```
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.esm.js
```

**UMD:**

```
https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js
```

### Option 3: CDN - unpkg

**ESM:**

```
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.esm.js
```

**UMD:**

```
https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.umd.min.js
```

> Note: Examples use Three.js v0.160.0, but you can use any recent version that supports ES Modules. We recommend using the latest compatible version of Three.js.

---

## 🌐 CDN Usage

### ESM Format (Modern):

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

### UMD Format (Browser Global):

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

### 1. Scene Management

```javascript
import { Scene } from 'kalythesainz';

// Initialize scene
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

### 2. Creating 3D Objects

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

### 3. Lighting

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

### React

```jsx
import { useEffect, useRef } from 'react';

export default function ThreeScene() {
    const containerRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const THREE = await import('three');
            window.THREE = THREE;

            const { Scene, Box, Light } = await import('kalythesainz');

            const scene = Scene.init('container');
            Light.sun();
            const box = Box.create(1, 1, 1);
            scene.add(box);
        };
        init();
    }, []);

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

**Supported Frameworks:**

- ✅ Next.js
- ✅ React
- ✅ Vue.js
- ✅ Angular
- ✅ Svelte
- ✅ Vanilla JS

See [docs/](docs/) for complete integration guides.

---

## 🎯 API Reference (Quick)

### Core

```javascript
import { App, Config, EventBus } from 'kalythesainz';

App.init();
Config.set('camera.fov', 60);
EventBus.subscribe('event', callback);
```

### Engine

```javascript
import { Scene, Camera, Light, Renderer } from 'kalythesainz';

const scene = Scene.init('container');
const camera = Camera.topView();
Light.sun();
```

### Objects

```javascript
import { Box, Sphere, Plane } from 'kalythesainz';

const box = Box.create(1, 1, 1);
const sphere = Sphere.create(0.8, 32);
const plane = Plane.create(10, 10);
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
- [ ] Advanced materials and textures
- [ ] Animation system
- [ ] Performance optimizations
- [ ] Additional primitive objects
- [ ] Advanced lighting effects
- [ ] Physics integration (optional)
- [ ] VR/AR support (future)

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
