# Migration Guide: v1.x to v2.x

## Overview

KALYTHESAINZ v2.0 introduces a new **instance-based API** that replaces the singleton pattern used in v1.x. This guide will help you migrate your existing code to the new API while understanding the benefits and avoiding common pitfalls.

**Good news:** The old API still works! We've maintained full backward compatibility, so you can migrate at your own pace.

---

## Table of Contents

1. [Why Migrate?](#why-migrate)
2. [Quick Start](#quick-start)
3. [API Comparison](#api-comparison)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Common Pitfalls](#common-pitfalls)
6. [React Integration](#react-integration)
7. [Deprecation Timeline](#deprecation-timeline)
8. [FAQ](#faq)

---

## Why Migrate?

The new instance-based API provides several key benefits:

### 1. **Multiple Scene Support**

Create multiple independent 3D scenes in the same application without conflicts.

```javascript
// v2.x - Multiple scenes work perfectly
const scene1 = createScene('container1');
const scene2 = createScene('container2');
```

### 2. **React Strict Mode Compatibility**

No more errors when React double-mounts components in development mode.

```javascript
// v2.x - Works flawlessly in React Strict Mode
useEffect(() => {
    const scene = createScene('container');
    return () => scene.destroy();
}, []);
```

### 3. **Better Resource Management**

Explicit lifecycle control prevents memory leaks and makes cleanup straightforward.

```javascript
// v2.x - Clear ownership and cleanup
const scene = createScene('container');
// ... use scene ...
scene.destroy(); // Clean up everything
```

### 4. **Clearer Code Semantics**

Instance methods make it obvious which scene you're working with.

```javascript
// v2.x - Crystal clear which scene gets the object
scene1.createBox(1, 1, 1);
scene2.createSphere(0.5, 32);
```

### 5. **No Global State**

Each scene is independent, making testing and debugging easier.

---

## Quick Start

### Before (v1.x - Singleton)

```javascript
import { Scene, Box, Light } from 'kalythesainz';

// Initialize singleton scene
Scene.init('container');

// Create objects (added to global scene)
const box = Box.create(1, 1, 1);
Light.sun();

// Cleanup
Scene.destroy();
```

### After (v2.x - Instance-Based)

```javascript
import { createScene } from 'kalythesainz';

// Create scene instance
const scene = createScene('container');

// Create objects (added to this scene)
const box = scene.createBox(1, 1, 1);
scene.addLight('sun');

// Cleanup
scene.destroy();
```

---

## API Comparison

### Scene Initialization

| v1.x (Old)                        | v2.x (New)                                       |
| --------------------------------- | ------------------------------------------------ |
| `Scene.init('container')`         | `const scene = createScene('container')`         |
| `Scene.init('container', config)` | `const scene = createScene('container', config)` |
| Returns singleton instance        | Returns new instance                             |

### Object Creation

#### Box

| v1.x (Old)                      | v2.x (New)                           |
| ------------------------------- | ------------------------------------ |
| `Box.create(1, 1, 1)`           | `scene.createBox(1, 1, 1)`           |
| `Box.create(1, 1, 1, material)` | `scene.createBox(1, 1, 1, material)` |
| Added to singleton scene        | Added to specific scene              |

#### Sphere

| v1.x (Old)                         | v2.x (New)                              |
| ---------------------------------- | --------------------------------------- |
| `Sphere.create(0.5, 32)`           | `scene.createSphere(0.5, 32)`           |
| `Sphere.create(0.5, 32, material)` | `scene.createSphere(0.5, 32, material)` |
| Added to singleton scene           | Added to specific scene                 |

#### Plane

| v1.x (Old)                       | v2.x (New)                            |
| -------------------------------- | ------------------------------------- |
| `Plane.create(10, 10)`           | `scene.createPlane(10, 10)`           |
| `Plane.create(10, 10, material)` | `scene.createPlane(10, 10, material)` |
| Added to singleton scene         | Added to specific scene               |

### Light Creation

| v1.x (Old)                          | v2.x (New)                                         |
| ----------------------------------- | -------------------------------------------------- |
| `Light.sun()`                       | `scene.addLight('sun')`                            |
| `Light.ambient({ intensity: 0.5 })` | `scene.addLight('ambient', { intensity: 0.5 })`    |
| `Light.point(0, 5, 0)`              | `scene.addLight('point', { position: [0, 5, 0] })` |
| Added to singleton scene            | Added to specific scene                            |

### Scene Management

| v1.x (Old)            | v2.x (New)                              |
| --------------------- | --------------------------------------- |
| `Scene.getInstance()` | `scene` (you already have the instance) |
| `Scene.destroy()`     | `scene.destroy()`                       |
| Destroys singleton    | Destroys specific instance              |

---

## Step-by-Step Migration

### Step 1: Update Imports

**Before:**

```javascript
import { Scene, Box, Sphere, Plane, Light } from 'kalythesainz';
```

**After:**

```javascript
import { createScene } from 'kalythesainz';
```

**Note:** You can still import `Box`, `Sphere`, etc. if you need them for the transition period.

### Step 2: Replace Scene.init() with createScene()

**Before:**

```javascript
Scene.init('my-container');
```

**After:**

```javascript
const scene = createScene('my-container');
```

**With configuration:**

**Before:**

```javascript
Scene.init('my-container', {
    camera: { fov: 60 },
    autoStart: true,
});
```

**After:**

```javascript
const scene = createScene('my-container', {
    camera: { fov: 60 },
    autoStart: true,
});
```

### Step 3: Convert Object Creation

**Before:**

```javascript
const box = Box.create(1, 1, 1);
const sphere = Sphere.create(0.5, 32);
const plane = Plane.create(10, 10);
```

**After:**

```javascript
const box = scene.createBox(1, 1, 1);
const sphere = scene.createSphere(0.5, 32);
const plane = scene.createPlane(10, 10);
```

### Step 4: Convert Light Creation

**Before:**

```javascript
Light.sun({ intensity: 1.5 });
Light.ambient({ intensity: 0.3 });
Light.point(0, 5, 0, { intensity: 2 });
```

**After:**

```javascript
scene.addLight('sun', { intensity: 1.5 });
scene.addLight('ambient', { intensity: 0.3 });
scene.addLight('point', { position: [0, 5, 0], intensity: 2 });
```

### Step 5: Update Scene Destruction

**Before:**

```javascript
Scene.destroy();
```

**After:**

```javascript
scene.destroy();
```

### Step 6: Test Your Application

Run your application and verify:

- ✅ Scene renders correctly
- ✅ Objects appear as expected
- ✅ Lights work properly
- ✅ Cleanup happens on unmount (React) or page unload
- ✅ No console warnings (except deprecation notices if using old API)

---

## Common Pitfalls

### Pitfall 1: Forgetting to Store the Scene Instance

**❌ Wrong:**

```javascript
createScene('container'); // Scene created but not stored!

// Later... how do I add objects?
```

**✅ Correct:**

```javascript
const scene = createScene('container');

// Later...
scene.createBox(1, 1, 1); // Works!
```

### Pitfall 2: Mixing Old and New APIs

**❌ Wrong:**

```javascript
const scene = createScene('container');
Box.create(1, 1, 1); // Goes to singleton, not your scene!
```

**✅ Correct:**

```javascript
const scene = createScene('container');
scene.createBox(1, 1, 1); // Goes to your scene
```

**Alternative (Transition Period):**

```javascript
const scene = createScene('container');
Box.create(1, 1, 1, null, scene); // Explicitly pass scene
```

### Pitfall 3: Not Cleaning Up Scenes

**❌ Wrong:**

```javascript
function setupScene() {
    const scene = createScene('container');
    // ... use scene ...
    // Forgot to destroy!
}

setupScene();
setupScene(); // Memory leak! Old scene still exists
```

**✅ Correct:**

```javascript
let scene = null;

function setupScene() {
    if (scene) {
        scene.destroy(); // Clean up old scene
    }
    scene = createScene('container');
}

function cleanup() {
    if (scene) {
        scene.destroy();
        scene = null;
    }
}
```

### Pitfall 4: Accessing Destroyed Scenes

**❌ Wrong:**

```javascript
const scene = createScene('container');
scene.destroy();
scene.createBox(1, 1, 1); // Error! Scene is disposed
```

**✅ Correct:**

```javascript
const scene = createScene('container');
scene.createBox(1, 1, 1); // Use scene first
// ... later ...
scene.destroy(); // Destroy when done
```

### Pitfall 5: Sharing Scenes Across Components (React)

**❌ Wrong:**

```javascript
// Global scope
let sharedScene = null;

function ComponentA() {
    useEffect(() => {
        sharedScene = createScene('container-a');
        return () => sharedScene.destroy();
    }, []);
}

function ComponentB() {
    useEffect(() => {
        // ComponentA might destroy this!
        sharedScene?.createBox(1, 1, 1);
    }, []);
}
```

**✅ Correct:**

```javascript
// Each component manages its own scene
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

---

## React Integration

### Basic React Component (v2.x)

```javascript
import { useEffect, useRef } from 'react';
import { createScene } from 'kalythesainz';

function Scene3D() {
    const sceneRef = useRef(null);

    useEffect(() => {
        // Create scene
        const scene = createScene('scene-container');
        sceneRef.current = scene;

        // Add objects
        scene.createBox(1, 1, 1);
        scene.addLight('sun');

        // Cleanup on unmount
        return () => {
            scene.destroy();
            sceneRef.current = null;
        };
    }, []);

    return <div id="scene-container" />;
}
```

### Multiple Scenes in React

```javascript
function MultiSceneApp() {
    return (
        <div>
            <Scene3D containerId="scene-1" />
            <Scene3D containerId="scene-2" />
            <Scene3D containerId="scene-3" />
        </div>
    );
}

function Scene3D({ containerId }) {
    useEffect(() => {
        const scene = createScene(containerId);
        scene.createSphere(0.5, 32);

        return () => scene.destroy();
    }, [containerId]);

    return <div id={containerId} />;
}
```

### React Strict Mode Compatibility

The new API works perfectly with React Strict Mode (which double-mounts components in development):

```javascript
// This works flawlessly in Strict Mode!
function StrictModeScene() {
    useEffect(() => {
        const scene = createScene('container');

        // Even if this runs twice, each scene is independent
        scene.createBox(1, 1, 1);

        return () => {
            // Cleanup is isolated to this instance
            scene.destroy();
        };
    }, []);

    return <div id="container" />;
}
```

### Migrating Existing React Code

**Before (v1.x):**

```javascript
function OldScene() {
    useEffect(() => {
        Scene.init('container');
        Box.create(1, 1, 1);
        Light.sun();

        return () => Scene.destroy();
    }, []);

    return <div id="container" />;
}
```

**After (v2.x):**

```javascript
function NewScene() {
    useEffect(() => {
        const scene = createScene('container');
        scene.createBox(1, 1, 1);
        scene.addLight('sun');

        return () => scene.destroy();
    }, []);

    return <div id="container" />;
}
```

---

## Deprecation Timeline

### Current Status: v2.0.0 (February 2026)

- ✅ **New instance-based API** is the recommended approach
- ✅ **Old singleton API** still works with deprecation warnings
- ✅ **Full backward compatibility** maintained

### Phase 1: Deprecation Period (v2.x - 12 months)

**Timeline:** February 2026 - February 2027

- Old API continues to work
- Deprecation warnings logged to console
- Documentation emphasizes new API
- Migration guide available (this document)

**What you should do:**

- Start migrating new code to instance-based API
- Plan migration for existing projects
- Test your application with the new API

### Phase 2: Final Warning (v2.9.x - 3 months)

**Timeline:** November 2026 - February 2027

- More prominent deprecation warnings
- Console warnings include removal date
- Final reminder in release notes

**What you should do:**

- Complete migration of all projects
- Update any tutorials or documentation
- Test thoroughly before v3.0

### Phase 3: Removal (v3.0.0)

**Timeline:** March 2027 (estimated)

- Old singleton API removed
- Only instance-based API available
- Breaking change for unmigrated code

**What you should do:**

- Ensure all code is migrated before upgrading to v3.0
- Review migration guide one final time
- Update dependencies carefully

### Checking Your Code

To see if you're using deprecated APIs, look for these console warnings:

```
[DEPRECATED] Scene.init() is deprecated. Use createScene() instead.
[DEPRECATED] Box.create() without scene parameter is deprecated.
[DEPRECATED] Light.sun() without scene parameter is deprecated.
```

---

## FAQ

### Q: Do I have to migrate immediately?

**A:** No! The old API will continue to work throughout v2.x (at least 12 months). However, we recommend migrating new code to the instance-based API and planning migration for existing projects.

### Q: Can I use both APIs in the same project?

**A:** Yes, during the transition period you can mix both APIs. However, be careful not to accidentally use the singleton when you meant to use an instance (see Common Pitfalls).

### Q: Will my existing code break when I upgrade to v2.0?

**A:** No! We've maintained full backward compatibility. Your existing code will work exactly as before, but you'll see deprecation warnings in the console.

### Q: How do I suppress deprecation warnings?

**A:** The best way is to migrate to the new API. However, if you need to suppress them temporarily, you can filter console warnings in your browser dev tools or test environment.

### Q: What if I need the singleton pattern?

**A:** You can create your own singleton wrapper:

```javascript
// mySingleton.js
import { createScene } from 'kalythesainz';

let instance = null;

export function getScene(containerId, config) {
    if (!instance) {
        instance = createScene(containerId, config);
    }
    return instance;
}

export function destroyScene() {
    if (instance) {
        instance.destroy();
        instance = null;
    }
}
```

### Q: Can I have multiple scenes in the same container?

**A:** No, each scene needs its own DOM container. However, you can have multiple containers on the same page, each with its own scene.

### Q: How do I migrate if I'm using TypeScript?

**A:** The TypeScript definitions have been updated to include the new API. Simply update your imports and types:

```typescript
import { createScene, SceneInstance } from 'kalythesainz';

const scene: SceneInstance = createScene('container');
```

### Q: What about performance? Is the new API slower?

**A:** No! The new API has the same performance characteristics as the old API. In fact, it may be slightly more efficient in some cases because it avoids global state lookups.

### Q: I'm getting "Container element not found" errors

**A:** Make sure the DOM element exists before calling `createScene()`. In React, this usually means calling it inside `useEffect()` after the component has mounted.

### Q: Can I access Three.js objects directly?

**A:** Yes! The API hasn't changed:

```javascript
const scene = createScene('container');
const box = scene.createBox(1, 1, 1);

// Access Three.js mesh
const threeMesh = box.mesh;

// Access Three.js scene
const threeScene = scene.threeScene;
```

### Q: How do I migrate event listeners?

**A:** Events are now scoped to scene instances:

**Before:**

```javascript
Scene.init('container');
EventBus.on('object:added', handler);
```

**After:**

```javascript
const scene = createScene('container');
scene.on('object:added', handler);
// or use global EventBus if you need cross-scene events
```

---

## Need Help?

If you encounter issues during migration:

1. **Check the examples** in the `examples/` directory
2. **Review the API documentation** in `docs/API.md`
3. **Look at the test files** in `tests/` for usage patterns
4. **Open an issue** on GitHub with your specific problem

---

## Summary

The migration from v1.x to v2.x is straightforward:

1. Replace `Scene.init()` with `createScene()`
2. Use instance methods (`scene.createBox()`) instead of static factories
3. Store the scene instance and call `scene.destroy()` when done
4. Test your application thoroughly

The new API provides better support for multiple scenes, React Strict Mode, and resource management while maintaining the simplicity you expect from KALYTHESAINZ.

Happy coding! 🚀
