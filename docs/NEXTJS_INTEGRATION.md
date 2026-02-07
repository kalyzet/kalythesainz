# 🔷 Next.js Integration Guide

Panduan lengkap untuk mengintegrasikan KALYTHESAINZ Framework dengan Next.js.

## 📋 Table of Contents

- [Overview](#overview)
- [Why Special Setup Needed](#why-special-setup-needed)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Advanced Patterns](#advanced-patterns)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

---

## Overview

KALYTHESAINZ Framework **fully compatible** dengan Next.js, tapi memerlukan setup khusus karena:

- Next.js menggunakan Server-Side Rendering (SSR)
- Framework ini memerlukan browser APIs (window, document, WebGL)
- Three.js hanya bisa dijalankan di client-side

---

## Why Special Setup Needed

### Next.js SSR Flow

```
1. Server renders React components → HTML
2. HTML dikirim ke browser
3. React hydrates di client-side
4. Client-side JavaScript runs
```

### Problem

```javascript
// ❌ Ini akan ERROR di server
import { Scene } from 'kalythesainz';

const scene = Scene.init('container'); // Error: window is not defined
```

**Kenapa error?**

- Code dijalankan di server (Node.js)
- Server tidak punya `window`, `document`, atau WebGL
- Three.js dan KALYTHESAINZ memerlukan browser APIs

### Solution

```javascript
// ✅ Ini BENAR - hanya run di client
useEffect(() => {
    const initScene = async () => {
        const { Scene } = await import('kalythesainz');
        const scene = Scene.init('container');
    };
    initScene();
}, []);
```

---

## Installation

### Saat ini (Package belum di npm):

```bash
# Copy framework ke project Next.js
cp -r /path/to/kalythesainz ./lib/kalythesainz

# Install Three.js
npm install three
```

### Setelah publish ke npm:

```bash
npm install kalythesainz three
```

---

## Basic Setup

### Method 1: Dynamic Import (RECOMMENDED)

**Step 1: Create 3D Component**

```jsx
// components/ThreeScene.jsx
'use client'; // Next.js 13+ App Router

import { useEffect, useRef } from 'react';

export default function ThreeScene() {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        const initScene = async () => {
            // Import hanya di client-side
            const THREE = await import('three');
            window.THREE = THREE;

            const { Scene, Box, Sphere, Light } = await import('kalythesainz');

            // Initialize scene
            const scene = Scene.init(containerRef.current.id);
            sceneRef.current = scene;

            // Setup
            Light.sun({ intensity: 1.0 });
            Light.ambient({ intensity: 0.4 });

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

**Step 2: Use with Dynamic Import**

```jsx
// app/3d-scene/page.js (App Router)
'use client';

import dynamic from 'next/dynamic';

const ThreeScene = dynamic(() => import('../../components/ThreeScene'), {
    ssr: false,
    loading: () => <div>Loading 3D Scene...</div>,
});

export default function ScenePage() {
    return (
        <div className="container">
            <h1>My 3D Scene</h1>
            <ThreeScene />
        </div>
    );
}
```

**Atau untuk Pages Router:**

```jsx
// pages/3d-scene.js (Pages Router)
import dynamic from 'next/dynamic';

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

---

## Advanced Patterns

### Pattern 1: Custom Hook

```jsx
// hooks/useKalythesainz.js
'use client';

import { useEffect, useRef, useState } from 'react';

export function useKalythesainz(containerId, config = {}) {
    const [scene, setScene] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
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
                sceneInstance = KALY.Scene.init(containerId, config);
                setScene(sceneInstance);
                setIsLoaded(true);

                return { scene: sceneInstance, KALY };
            } catch (err) {
                console.error('Failed to initialize KALYTHESAINZ:', err);
                setError(err);
                throw err;
            }
        };

        initFramework();

        // Cleanup
        return () => {
            if (sceneInstance) {
                sceneInstance.dispose();
            }
        };
    }, [containerId, config]);

    return { scene, isLoaded, error, containerRef };
}
```

**Usage:**

```jsx
// components/My3DComponent.jsx
'use client';

import { useEffect } from 'react';
import { useKalythesainz } from '../hooks/useKalythesainz';

export default function My3DComponent() {
    const { scene, isLoaded, error, containerRef } = useKalythesainz('my-3d-container');

    useEffect(() => {
        if (!isLoaded || !scene) return;

        const setupScene = async () => {
            const { Light, Box, Sphere } = await import('kalythesainz');

            Light.sun({ intensity: 1.0 });
            Light.ambient({ intensity: 0.4 });

            const box = Box.create(1, 1, 1);
            scene.add(box);

            const sphere = Sphere.create(0.8, 32);
            sphere.position = { x: 2, y: 0, z: 0 };
            scene.add(sphere);
        };

        setupScene();
    }, [scene, isLoaded]);

    if (error) {
        return <div>Error loading 3D scene: {error.message}</div>;
    }

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

---

### Pattern 2: Context Provider

```jsx
// contexts/ThreeContext.jsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThreeContext = createContext(null);

export function ThreeProvider({ children }) {
    const [THREE, setTHREE] = useState(null);
    const [KALY, setKALY] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadLibraries = async () => {
            const threeLib = await import('three');
            window.THREE = threeLib;
            setTHREE(threeLib);

            const kalyLib = await import('kalythesainz');
            setKALY(kalyLib);

            setIsLoaded(true);
        };

        loadLibraries();
    }, []);

    return (
        <ThreeContext.Provider value={{ THREE, KALY, isLoaded }}>{children}</ThreeContext.Provider>
    );
}

export function useThree() {
    const context = useContext(ThreeContext);
    if (!context) {
        throw new Error('useThree must be used within ThreeProvider');
    }
    return context;
}
```

**Usage:**

```jsx
// app/layout.js
import { ThreeProvider } from '../contexts/ThreeContext';

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <ThreeProvider>{children}</ThreeProvider>
            </body>
        </html>
    );
}
```

```jsx
// components/Scene.jsx
'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '../contexts/ThreeContext';

export default function Scene() {
    const { KALY, isLoaded } = useThree();
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        if (!isLoaded || !KALY) return;

        const scene = KALY.Scene.init('container');
        sceneRef.current = scene;

        KALY.Light.sun();
        const box = KALY.Box.create(1, 1, 1);
        scene.add(box);

        return () => {
            scene.dispose();
        };
    }, [KALY, isLoaded]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

---

### Pattern 3: Server Component + Client Component

```jsx
// app/3d-demo/page.js (Server Component)
import ThreeSceneClient from './ThreeSceneClient';

export default function ThreeDemoPage() {
    // Server-side logic here
    const sceneConfig = {
        background: 0x1a1a1a,
        camera: { fov: 60 },
    };

    return (
        <div>
            <h1>3D Demo</h1>
            <ThreeSceneClient config={sceneConfig} />
        </div>
    );
}
```

```jsx
// app/3d-demo/ThreeSceneClient.jsx (Client Component)
'use client';

import { useEffect, useRef } from 'react';

export default function ThreeSceneClient({ config }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const initScene = async () => {
            const THREE = await import('three');
            window.THREE = THREE;

            const { Scene, Box, Light } = await import('kalythesainz');

            const scene = Scene.init('container', config);
            Light.sun();
            const box = Box.create(1, 1, 1);
            scene.add(box);
        };

        initScene();
    }, [config]);

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

---

## Best Practices

### 1. Always Use `'use client'` Directive

```jsx
// ✅ CORRECT
'use client';

import { useEffect } from 'react';

export default function ThreeScene() {
    // ...
}
```

### 2. Dynamic Import with `ssr: false`

```jsx
// ✅ CORRECT
const ThreeScene = dynamic(() => import('./ThreeScene'), {
    ssr: false,
});
```

### 3. Check Window Availability

```jsx
// ✅ CORRECT
useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize scene
}, []);
```

### 4. Proper Cleanup

```jsx
// ✅ CORRECT
useEffect(() => {
    const scene = Scene.init('container');

    return () => {
        scene.dispose(); // Cleanup
    };
}, []);
```

### 5. Error Handling

```jsx
// ✅ CORRECT
useEffect(() => {
    const initScene = async () => {
        try {
            const { Scene } = await import('kalythesainz');
            const scene = Scene.init('container');
        } catch (error) {
            console.error('Failed to initialize scene:', error);
            // Handle error
        }
    };

    initScene();
}, []);
```

---

## Troubleshooting

### Error: "window is not defined"

**Cause:** Code running on server

**Solution:**

```jsx
// Use dynamic import with ssr: false
const ThreeScene = dynamic(() => import('./ThreeScene'), {
    ssr: false,
});
```

---

### Error: "document is not defined"

**Cause:** Accessing DOM on server

**Solution:**

```jsx
useEffect(() => {
    if (typeof window === 'undefined') return;

    // DOM access here
}, []);
```

---

### Error: "WebGL context could not be created"

**Cause:** Trying to create WebGL context on server

**Solution:**

```jsx
// Import Three.js and framework inside useEffect
useEffect(() => {
    const init = async () => {
        const THREE = await import('three');
        window.THREE = THREE;

        const { Scene } = await import('kalythesainz');
        // ...
    };
    init();
}, []);
```

---

### Build Error: "Module not found"

**Cause:** Import path incorrect

**Solution:**

```jsx
// ✅ CORRECT - relative path
import { Scene } from '../lib/kalythesainz';

// ✅ CORRECT - npm package (after publish)
import { Scene } from 'kalythesainz';
```

---

### Hydration Error

**Cause:** Server HTML doesn't match client HTML

**Solution:**

```jsx
// Use dynamic import with ssr: false
const ThreeScene = dynamic(() => import('./ThreeScene'), {
    ssr: false,
    loading: () => <div>Loading...</div>, // Consistent loading state
});
```

---

## Examples

### Example 1: Simple 3D Scene

```jsx
// app/simple-scene/page.js
'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function SimpleScenePage() {
    return (
        <div>
            <h1>Simple 3D Scene</h1>
            <Scene />
        </div>
    );
}
```

```jsx
// app/simple-scene/Scene.jsx
'use client';

import { useEffect, useRef } from 'react';

export default function Scene() {
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

---

### Example 2: Interactive Scene with State

```jsx
// app/interactive-scene/page.js
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const InteractiveScene = dynamic(() => import('./InteractiveScene'), { ssr: false });

export default function InteractiveScenePage() {
    const [objectCount, setObjectCount] = useState(0);

    return (
        <div>
            <h1>Interactive Scene</h1>
            <p>Objects: {objectCount}</p>
            <InteractiveScene onObjectCountChange={setObjectCount} />
        </div>
    );
}
```

```jsx
// app/interactive-scene/InteractiveScene.jsx
'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveScene({ onObjectCountChange }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const THREE = await import('three');
            window.THREE = THREE;

            const { Scene, Box, Light, EventBus } = await import('kalythesainz');

            const scene = Scene.init('container');
            sceneRef.current = scene;

            Light.sun();

            // Listen to object added events
            EventBus.subscribe('scene:object-added', () => {
                onObjectCountChange(scene.objects.size);
            });

            // Add initial box
            const box = Box.create(1, 1, 1);
            scene.add(box);
        };

        init();

        return () => {
            if (sceneRef.current) {
                sceneRef.current.dispose();
            }
        };
    }, [onObjectCountChange]);

    const addBox = async () => {
        if (!sceneRef.current) return;

        const { Box } = await import('kalythesainz');
        const box = Box.create(1, 1, 1);
        box.position = {
            x: (Math.random() - 0.5) * 5,
            y: Math.random() * 2,
            z: (Math.random() - 0.5) * 5,
        };
        sceneRef.current.add(box);
    };

    return (
        <div>
            <div id="container" ref={containerRef} style={{ width: '100%', height: '600px' }} />
            <button onClick={addBox}>Add Box</button>
        </div>
    );
}
```

---

## Summary

**Key Points:**

1. ✅ Use `'use client'` directive
2. ✅ Dynamic import with `ssr: false`
3. ✅ Import libraries inside `useEffect`
4. ✅ Proper cleanup in return function
5. ✅ Error handling for async imports

**Framework is fully compatible with Next.js when following these patterns!**

---

**Need more help?** Check [main README](../README.md) or [Troubleshooting Guide](./TROUBLESHOOTING.md)
