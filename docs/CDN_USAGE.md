# CDN Usage Guide

This guide explains how to use KALYTHESAINZ directly from CDN providers without any build tools or npm installation.

## Quick Start

The simplest way to use KALYTHESAINZ is to import it directly from a CDN:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My 3D Scene</title>
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
            import {
                Scene,
                Box,
                Light,
            } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

            const scene = Scene.init('container');
            Light.sun();
            const box = Box.create(1, 1, 1);
        </script>
    </body>
</html>
```

## CDN Providers

KALYTHESAINZ is available from multiple CDN providers:

### jsDelivr (Recommended)

**Specific version:**

```javascript
import {
    Scene,
    Box,
    Light,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';
```

**Latest version:**

```javascript
import {
    Scene,
    Box,
    Light,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz/dist/kalythesainz.min.js';
```

**Development version (unminified):**

```javascript
import {
    Scene,
    Box,
    Light,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.js';
```

### unpkg

**Specific version:**

```javascript
import { Scene, Box, Light } from 'https://unpkg.com/kalythesainz@1.0.0/dist/kalythesainz.min.js';
```

**Latest version:**

```javascript
import { Scene, Box, Light } from 'https://unpkg.com/kalythesainz/dist/kalythesainz.min.js';
```

## Import Patterns

### Named Imports (Recommended)

Import only what you need for better tree-shaking:

```javascript
import {
    Scene,
    Box,
    Sphere,
    Light,
    Camera,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';
```

### Namespace Import

Import everything under a namespace:

```javascript
import * as KALYTHESAINZ from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

const scene = KALYTHESAINZ.Scene.init('container');
const box = KALYTHESAINZ.Box.create(1, 1, 1);
```

## Using Import Maps

Import maps allow you to use bare specifiers instead of full URLs:

```html
<!DOCTYPE html>
<html>
    <head>
        <script type="importmap">
            {
                "imports": {
                    "kalythesainz": "https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js",
                    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
                }
            }
        </script>
    </head>
    <body>
        <div id="container"></div>

        <script type="module">
            import { Scene, Box, Light } from 'kalythesainz';

            const scene = Scene.init('container');
            Light.sun();
            const box = Box.create(1, 1, 1);
        </script>
    </body>
</html>
```

**Browser Support for Import Maps:**

- Chrome 89+
- Edge 89+
- Safari 16.4+
- Firefox 108+

## Available Builds

KALYTHESAINZ provides multiple build formats:

| File                      | Format    | Size    | Use Case                     |
| ------------------------- | --------- | ------- | ---------------------------- |
| `kalythesainz.min.js`     | ES Module | ~238 KB | Production (recommended)     |
| `kalythesainz.js`         | ES Module | ~238 KB | Development/debugging        |
| `kalythesainz.umd.min.js` | UMD       | ~149 KB | Legacy browsers, script tags |
| `kalythesainz.umd.js`     | UMD       | ~253 KB | Development UMD              |

All builds include source maps (`.map` files) for debugging.

## Dependencies

KALYTHESAINZ requires Three.js as a peer dependency. The framework will automatically load Three.js from CDN when needed.

**Three.js version:** ^0.160.0

If you want to explicitly load Three.js:

```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {
    Scene,
    Box,
    Light,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';
```

## Browser Compatibility

KALYTHESAINZ works in modern browsers with native ES module support:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

**Required Features:**

- ES Modules (import/export)
- WebGL
- Promises
- Async/Await
- Classes
- Arrow Functions

## Examples

### Basic Scene

```html
<script type="module">
    import {
        Scene,
        Box,
        Sphere,
        Light,
    } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

    // Initialize scene
    const scene = Scene.init('container');

    // Add lighting
    Light.sun();
    Light.ambient(0.3);

    // Create objects
    const box = Box.create(1, 1, 1);
    box.position = [-1.5, 0, 0];

    const sphere = Sphere.create(0.7);
    sphere.position = [1.5, 0, 0];
</script>
```

### With Visual Tools

```html
<script type="module">
    import {
        Scene,
        Box,
        Light,
        Inspector,
        SceneTree,
        TransformGizmo,
    } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

    const scene = Scene.init('container');
    Light.sun();

    const box = Box.create(1, 1, 1);

    // Add visual tools
    const inspector = new Inspector('inspector-panel');
    const sceneTree = new SceneTree('scene-tree-panel');
    const gizmo = new TransformGizmo(scene.camera, scene.renderer);

    sceneTree.onObjectSelect((obj) => {
        inspector.show(obj);
        gizmo.attach(obj);
    });
</script>
```

### With Animation

```html
<script type="module">
    import {
        Scene,
        Box,
        Light,
    } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

    const scene = Scene.init('container');
    Light.sun();

    const box = Box.create(1, 1, 1);

    // Animate
    let time = 0;
    function animate() {
        time += 0.01;
        box.rotation = [time, time * 0.7, 0];
        requestAnimationFrame(animate);
    }
    animate();
</script>
```

### With Scene Serialization

```html
<script type="module">
    import {
        Scene,
        Box,
        Sphere,
        Light,
        Serializer,
    } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

    const scene = Scene.init('container');
    Light.sun();

    const box = Box.create(1, 1, 1);
    const sphere = Sphere.create(0.7);

    // Save scene
    const saveScene = () => {
        const data = Serializer.serialize(scene);
        localStorage.setItem('myScene', JSON.stringify(data));
        console.log('Scene saved!');
    };

    // Load scene
    const loadScene = () => {
        const data = JSON.parse(localStorage.getItem('myScene'));
        Serializer.deserialize(data, scene);
        console.log('Scene loaded!');
    };

    // Expose functions globally
    window.saveScene = saveScene;
    window.loadScene = loadScene;
</script>
```

## Performance Tips

1. **Use minified builds in production:**

    ```javascript
    // Good
    import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

    // Avoid in production
    import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.js';
    ```

2. **Import only what you need:**

    ```javascript
    // Good
    import { Scene, Box, Light } from 'kalythesainz';

    // Less optimal
    import * as KALYTHESAINZ from 'kalythesainz';
    ```

3. **Use specific versions to enable browser caching:**

    ```javascript
    // Good - cacheable
    import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js';

    // Less optimal - not cacheable across updates
    import { Scene } from 'https://cdn.jsdelivr.net/npm/kalythesainz/dist/kalythesainz.min.js';
    ```

4. **Preload for faster initial load:**
    ```html
    <link
        rel="modulepreload"
        href="https://cdn.jsdelivr.net/npm/kalythesainz@1.0.0/dist/kalythesainz.min.js"
    />
    <link
        rel="modulepreload"
        href="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    />
    ```

## Troubleshooting

### Module not found

If you see "Failed to resolve module specifier", make sure:

1. You're using `type="module"` in your script tag
2. The CDN URL is correct and accessible
3. Your browser supports ES modules

### CORS errors

CDN providers like jsDelivr and unpkg have proper CORS headers. If you see CORS errors:

1. Make sure you're not running from `file://` protocol (use a local server)
2. Check your browser console for specific error messages

### Three.js version mismatch

KALYTHESAINZ requires Three.js ^0.160.0. If you're loading Three.js separately, ensure version compatibility:

```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
```

## Next Steps

- Check out the [API Documentation](./API.md)
- See [Getting Started Guide](./GETTING_STARTED.md)
- Explore [Examples](../examples/)
- Read [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Support

For issues or questions:

- GitHub Issues: [github.com/kalythesainz/kalythesainz/issues](https://github.com/kalythesainz/kalythesainz/issues)
- Documentation: [github.com/kalythesainz/kalythesainz/docs](https://github.com/kalythesainz/kalythesainz/docs)
