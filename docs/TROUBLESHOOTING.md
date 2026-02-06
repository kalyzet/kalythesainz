# Troubleshooting Guide

This guide covers common issues and their solutions when using KALYTHESAINZ.

## Table of Contents

- [Installation & Setup Issues](#installation--setup-issues)
- [Scene Rendering Issues](#scene-rendering-issues)
- [Object Creation Issues](#object-creation-issues)
- [Event System Issues](#event-system-issues)
- [Serialization Issues](#serialization-issues)
- [Performance Issues](#performance-issues)
- [Browser Compatibility](#browser-compatibility)

---

## Installation & Setup Issues

### Issue: "THREE is not defined"

**Problem:** The framework can't find Three.js.

**Solution:** Make sure Three.js is imported and assigned to `window.THREE` before importing KALYTHESAINZ:

```javascript
// ✅ Correct order
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
window.THREE = THREE;

import { quickStart } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// ❌ Wrong - KALYTHESAINZ imported before THREE is available
import { quickStart } from 'kalythesainz';
import * as THREE from 'three';
```

### Issue: "Cannot use import statement outside a module"

**Problem:** Script tag is missing `type="module"`.

**Solution:** Add `type="module"` to your script tag:

```html
<!-- ✅ Correct -->
<script type="module">
    import { quickStart } from 'kalythesainz';
</script>

<!-- ❌ Wrong -->
<script>
    import { quickStart } from 'kalythesainz';
</script>
```

### Issue: CORS errors when loading from file://

**Problem:** Browsers block ES modules loaded from `file://` protocol.

**Solution:** Use a local web server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## Scene Rendering Issues

### Issue: Black screen / Nothing renders

**Possible causes and solutions:**

1. **Container element doesn't exist**

    ```javascript
    // ✅ Make sure element exists
    const container = document.getElementById('container');
    if (!container) {
        console.error('Container not found!');
    }
    const scene = quickStart('container');
    ```

2. **Container has no size**

    ```css
    /* ✅ Give container explicit size */
    #container {
        width: 100vw;
        height: 100vh;
    }

    /* ❌ Container with no size won't render */
    #container {
        /* No width/height */
    }
    ```

3. **No lighting in scene**

    ```javascript
    // ✅ Add lighting
    import { Light } from 'kalythesainz';
    Light.sun();
    Light.ambient(0.4);
    ```

4. **Camera position issues**
    ```javascript
    // ✅ Position camera to see objects
    scene.camera.setPosition(0, 5, 10);
    scene.camera.lookAt(0, 0, 0);
    ```

### Issue: Objects appear too dark

**Solution:** Add more lighting or increase light intensity:

```javascript
// Increase sun light intensity
Light.sun(1.5);

// Add ambient light
Light.ambient(0.6);

// Add point lights
Light.point(5, 5, 5, 1.0);
Light.point(-5, 5, -5, 1.0);
```

### Issue: Canvas doesn't resize with window

**Solution:** Add resize handler:

```javascript
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene.renderer.setSize(width, height);
    scene.camera.threeCamera.aspect = width / height;
    scene.camera.threeCamera.updateProjectionMatrix();
});
```

---

## Object Creation Issues

### Issue: Objects created but not visible

**Possible causes:**

1. **Object not added to scene**

    ```javascript
    // ❌ Object created but not added
    const box = Box.create(1, 1, 1);

    // ✅ Add to scene
    const box = Box.create(1, 1, 1);
    scene.add(box);
    ```

2. **Object positioned outside camera view**

    ```javascript
    // ✅ Check object position
    box.position = { x: 0, y: 0, z: 0 };
    console.log('Box position:', box.position);
    ```

3. **Object scale is zero or very small**
    ```javascript
    // ✅ Check scale
    console.log('Box scale:', box.scale);
    box.scale = { x: 1, y: 1, z: 1 };
    ```

### Issue: "Cannot read property 'create' of undefined"

**Problem:** Object class not imported.

**Solution:** Import the object class:

```javascript
// ✅ Import object classes
import { Box, Sphere, Plane } from 'kalythesainz';

const box = Box.create(1, 1, 1);
```

### Issue: Objects have wrong colors

**Solution:** Create custom materials:

```javascript
import * as THREE from 'three';

const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.5,
    roughness: 0.5,
});

const box = Box.create(1, 1, 1, material);
```

---

## Event System Issues

### Issue: Events not firing

**Possible causes:**

1. **Not subscribed to event**

    ```javascript
    // ✅ Subscribe before events occur
    EventBus.subscribe('object:added', (data) => {
        console.log('Object added:', data.object.id);
    });

    // Then add objects
    scene.add(box);
    ```

2. **Wrong event name**

    ```javascript
    // ❌ Wrong event name
    EventBus.subscribe('objectAdded', handler);

    // ✅ Correct event names
    EventBus.subscribe('object:added', handler);
    EventBus.subscribe('object:removed', handler);
    EventBus.subscribe('object:modified', handler);
    EventBus.subscribe('scene:cleared', handler);
    ```

### Issue: Event handler called multiple times

**Problem:** Handler subscribed multiple times.

**Solution:** Unsubscribe before resubscribing:

```javascript
// Store handler reference
const handler = (data) => console.log(data);

// Unsubscribe if already subscribed
EventBus.unsubscribe('object:added', handler);

// Subscribe
EventBus.subscribe('object:added', handler);
```

### Issue: Memory leak from event handlers

**Solution:** Clean up event subscriptions:

```javascript
class MyComponent {
    constructor() {
        this.handler = (data) => this.onObjectAdded(data);
        EventBus.subscribe('object:added', this.handler);
    }

    destroy() {
        // ✅ Unsubscribe when component is destroyed
        EventBus.unsubscribe('object:added', this.handler);
    }

    onObjectAdded(data) {
        console.log('Object added:', data);
    }
}
```

---

## Serialization Issues

### Issue: "Cannot serialize scene"

**Possible causes:**

1. **Scene not initialized**

    ```javascript
    // ✅ Initialize scene first
    const scene = quickStart('container');

    // Then serialize
    const data = Serializer.serialize(scene);
    ```

2. **Custom objects without serialization support**
    ```javascript
    // If using custom Three.js objects, they may not serialize
    // Use framework objects (Box, Sphere, Plane) for serialization
    ```

### Issue: Deserialized scene looks different

**Possible causes:**

1. **Lighting not serialized**

    ```javascript
    // ✅ Re-add lighting after deserialization
    Serializer.deserialize(data, scene);
    Light.sun();
    Light.ambient(0.4);
    ```

2. **Camera position not restored**

    ```javascript
    // ✅ Save and restore camera separately if needed
    const sceneData = Serializer.serialize(scene);
    const cameraData = {
        position: scene.camera.position,
        rotation: scene.camera.rotation,
    };

    // Later...
    Serializer.deserialize(sceneData, scene);
    scene.camera.setPosition(cameraData.position.x, cameraData.position.y, cameraData.position.z);
    ```

### Issue: Large JSON file size

**Solution:** Optimize scene before serialization:

```javascript
// Remove unnecessary objects
scene.objects.forEach((obj) => {
    if (!obj.visible) {
        scene.remove(obj.id);
    }
});

// Then serialize
const data = Serializer.serialize(scene);

// Compress JSON
const json = JSON.stringify(data); // No pretty printing
```

---

## Performance Issues

### Issue: Low FPS with many objects

**Solutions:**

1. **Reduce object count**

    ```javascript
    // Remove objects that are far from camera
    scene.objects.forEach((obj) => {
        const distance = Math.sqrt(
            Math.pow(obj.position.x - camera.position.x, 2) +
                Math.pow(obj.position.y - camera.position.y, 2) +
                Math.pow(obj.position.z - camera.position.z, 2),
        );

        if (distance > 50) {
            scene.remove(obj.id);
        }
    });
    ```

2. **Use lower polygon counts**

    ```javascript
    // ❌ High polygon sphere
    const sphere = Sphere.create(1, 64);

    // ✅ Lower polygon sphere
    const sphere = Sphere.create(1, 16);
    ```

3. **Disable antialiasing**

    ```javascript
    const scene = quickStart('container', {
        renderer: { antialias: false },
    });
    ```

4. **Batch similar objects**
    ```javascript
    // Use instanced meshes for many identical objects
    const threeMesh = box.threeMesh;
    const instancedMesh = new THREE.InstancedMesh(threeMesh.geometry, threeMesh.material, 100);
    scene.threeScene.add(instancedMesh);
    ```

### Issue: Memory usage keeps increasing

**Problem:** Objects not properly disposed.

**Solution:** Always dispose objects when removing:

```javascript
// ✅ Proper cleanup
const box = Box.create(1, 1, 1);
scene.add(box);

// Later...
scene.remove(box.id);
box.dispose(); // Clean up resources

// Or use scene.clear() which disposes all objects
scene.clear();
```

### Issue: Slow scene initialization

**Solution:** Initialize scene after page load:

```javascript
// ✅ Wait for DOM to be ready
window.addEventListener('load', () => {
    const scene = quickStart('container');
    // Add objects...
});

// Or use DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const scene = quickStart('container');
});
```

---

## Browser Compatibility

### Issue: "Unexpected token 'import'"

**Problem:** Browser doesn't support ES modules.

**Solution:** Use a modern browser:

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

Or use a build tool (Vite, Webpack) to transpile for older browsers.

### Issue: WebGL not supported

**Problem:** Browser or device doesn't support WebGL.

**Solution:** Check for WebGL support:

```javascript
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch (e) {
        return false;
    }
}

if (!checkWebGLSupport()) {
    alert('Your browser does not support WebGL. Please use a modern browser.');
} else {
    const scene = quickStart('container');
}
```

### Issue: Different rendering on mobile devices

**Solutions:**

1. **Adjust quality for mobile**

    ```javascript
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const scene = quickStart('container', {
        renderer: {
            antialias: !isMobile, // Disable AA on mobile
            pixelRatio: isMobile ? 1 : window.devicePixelRatio,
        },
    });

    // Use lower polygon counts on mobile
    const segments = isMobile ? 16 : 32;
    const sphere = Sphere.create(1, segments);
    ```

2. **Handle touch events**

    ```javascript
    // Add touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', (e) => {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        // Rotate camera based on touch
        scene.camera.rotation = {
            x: scene.camera.rotation.x + deltaY * 0.01,
            y: scene.camera.rotation.y + deltaX * 0.01,
            z: 0,
        };

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    ```

---

## Common Error Messages

### "Container element not found"

**Cause:** Element ID doesn't exist in DOM.

**Fix:** Ensure element exists before initializing:

```javascript
<div id="container"></div>

<script type="module">
    // Make sure DOM is loaded
    const scene = quickStart('container');
</script>
```

### "Cannot read property 'threeScene' of null"

**Cause:** Scene not initialized.

**Fix:** Initialize scene before using:

```javascript
const scene = quickStart('container');
// Now you can use scene
```

### "Object has already been disposed"

**Cause:** Trying to use an object after calling dispose().

**Fix:** Don't use objects after disposal:

```javascript
const box = Box.create(1, 1, 1);
scene.add(box);

box.dispose();
// ❌ Don't use box after this point

// ✅ Create new object if needed
const newBox = Box.create(1, 1, 1);
```

---

## Getting Help

If you're still experiencing issues:

1. **Check the console** - Look for error messages in browser developer tools (F12)
2. **Review examples** - Compare your code with working examples in `/examples`
3. **Check API docs** - Verify you're using the correct API in `docs/API.md`
4. **Simplify** - Create a minimal reproduction of the issue
5. **Report bugs** - Open an issue on GitHub with:
    - Browser and version
    - Minimal code to reproduce
    - Expected vs actual behavior
    - Console errors

## Debug Mode

Enable verbose logging for debugging:

```javascript
// Enable debug logging
window.KALYTHESAINZ_DEBUG = true;

// Now framework will log detailed information
const scene = quickStart('container');
```

## Performance Monitoring

Monitor performance in real-time:

```javascript
let frameCount = 0;
let lastTime = performance.now();

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        console.log('FPS:', fps);
        document.getElementById('fps').textContent = `FPS: ${fps}`;

        frameCount = 0;
        lastTime = currentTime;
    }

    requestAnimationFrame(updateFPS);
}
updateFPS();
```

---

**Still need help?** Check out the [API Documentation](API.md) or [Getting Started Guide](GETTING_STARTED.md).
