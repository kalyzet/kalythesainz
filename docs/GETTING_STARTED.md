# Getting Started with KALYTHESAINZ

Welcome to KALYTHESAINZ! This guide will help you create your first 3D web application in minutes.

## What is KALYTHESAINZ?

KALYTHESAINZ is a web-based 3D framework that simplifies Three.js development by providing:

- 🎨 **Declarative API** - Create 3D scenes with simple, intuitive code
- 🛠️ **Visual Tools** - Inspector, scene tree, and transform gizmos
- 💾 **Serialization** - Save and load scenes as JSON
- 🔌 **Plugin System** - Extend functionality with custom objects and tools
- 🚀 **Zero Build** - Use directly from CDN with ES modules
- 🎯 **Three.js Access** - Full access to underlying Three.js when needed

## Prerequisites

- Modern web browser with ES module support (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+)
- Basic knowledge of HTML and JavaScript
- No build tools or npm required!

## Your First Scene

### Step 1: Create an HTML File

Create a new file called `index.html`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My First 3D Scene</title>
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
            // Your code will go here
        </script>
    </body>
</html>
```

### Step 2: Import Dependencies

Add these imports inside the `<script type="module">` tag:

```javascript
// Import Three.js from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
window.THREE = THREE;

// Import KALYTHESAINZ from CDN
import {
    quickStart,
    Box,
    Sphere,
    Light,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';
```

### Step 3: Create Your Scene

Add this code after the imports:

```javascript
// Initialize scene with one line
const scene = quickStart('container');

// Add a box
const box = Box.create(1, 1, 1);
box.position = { x: -2, y: 0, z: 0 };
scene.add(box);

// Add a sphere
const sphere = Sphere.create(0.8, 32);
sphere.position = { x: 2, y: 0, z: 0 };
scene.add(sphere);

// Add lighting
Light.ambient(0.4);

console.log('Scene created with', scene.objects.length, 'objects!');
```

### Step 4: Open in Browser

Open `index.html` in your web browser. You should see a 3D scene with a box and sphere!

## Adding Interactivity

Let's make the scene more interactive by adding animation and user controls.

### Animating Objects

```javascript
// Rotate the box continuously
function animate() {
    box.rotation = {
        x: box.rotation.x + 0.01,
        y: box.rotation.y + 0.01,
        z: 0,
    };

    requestAnimationFrame(animate);
}
animate();
```

### Adding User Controls

```html
<!-- Add buttons to your HTML -->
<div style="position: absolute; top: 20px; left: 20px;">
    <button onclick="addBox()">Add Box</button>
    <button onclick="clearScene()">Clear Scene</button>
</div>

<script type="module">
    // ... previous imports ...

    const scene = quickStart('container');
    Light.sun();

    // Make functions global
    window.addBox = function () {
        const box = Box.create(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        box.position = {
            x: (Math.random() - 0.5) * 10,
            y: Math.random() * 5,
            z: (Math.random() - 0.5) * 10,
        };
        scene.add(box);
        console.log('Added box! Total objects:', scene.objects.length);
    };

    window.clearScene = function () {
        scene.clear();
        console.log('Scene cleared!');
    };
</script>
```

## Using Visual Tools

KALYTHESAINZ includes visual tools for inspecting and editing your scene.

### Scene Tree

Display a hierarchical view of all objects:

```html
<div
    id="scene-tree"
    style="position: absolute; top: 20px; right: 20px; 
     width: 250px; background: rgba(0,0,0,0.8); padding: 15px; color: white;"
></div>

<script type="module">
    import { SceneTree } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

    const sceneTree = new SceneTree('scene-tree');

    // Refresh when objects are added
    scene.add(box);
    sceneTree.refresh();
</script>
```

### Inspector

Edit object properties in real-time:

```html
<div
    id="inspector"
    style="position: absolute; bottom: 20px; right: 20px; 
     width: 250px; background: rgba(0,0,0,0.8); padding: 15px; color: white;"
></div>

<script type="module">
    import { Inspector } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

    const inspector = new Inspector('inspector');

    // Show inspector when object is selected
    sceneTree.onObjectSelect((objectId) => {
        const obj = scene.find(objectId);
        inspector.show(obj);
    });

    // Listen to property changes
    inspector.onPropertyChange((property, value) => {
        console.log(`${property} changed to ${value}`);
    });
</script>
```

## Saving and Loading Scenes

Persist your scenes using the built-in serialization system.

```javascript
import { Serializer } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// Save scene to localStorage
function saveScene() {
    const data = Serializer.serialize(scene);
    localStorage.setItem('myScene', JSON.stringify(data));
    console.log('Scene saved!');
}

// Load scene from localStorage
function loadScene() {
    const json = localStorage.getItem('myScene');
    if (json) {
        const data = JSON.parse(json);
        scene.clear();
        Serializer.deserialize(data, scene);
        console.log('Scene loaded!');
    }
}

// Export scene as JSON file
function exportScene() {
    const data = Serializer.serialize(scene);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.json';
    a.click();
    URL.revokeObjectURL(url);
}
```

## Working with Events

Listen to framework events to react to changes:

```javascript
import { EventBus } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// Listen for object additions
EventBus.subscribe('object:added', (data) => {
    console.log('Object added:', data.object.name || data.object.id);
    updateUI();
});

// Listen for object removals
EventBus.subscribe('object:removed', (data) => {
    console.log('Object removed:', data.id);
    updateUI();
});

// Listen for object modifications
EventBus.subscribe('object:modified', (data) => {
    console.log('Object modified:', data.object.id);
});

// Listen for scene clear
EventBus.subscribe('scene:cleared', () => {
    console.log('Scene cleared');
    updateUI();
});

function updateUI() {
    document.getElementById('object-count').textContent = `Objects: ${scene.objects.length}`;
}
```

## Using Direct Three.js

Access underlying Three.js objects when you need advanced features:

```javascript
// Create object with framework
const box = Box.create(1, 1, 1);
scene.add(box);

// Access Three.js mesh
const threeMesh = box.threeMesh;

// Modify with Three.js directly
threeMesh.material.color.setHex(0xff00ff);
threeMesh.material.wireframe = true;
threeMesh.material.metalness = 0.8;
threeMesh.material.roughness = 0.2;

// Add custom Three.js objects
const threeScene = scene.threeScene;
const customGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const customMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const torus = new THREE.Mesh(customGeometry, customMaterial);
torus.position.set(0, 2, 0);
threeScene.add(torus);
```

## Camera Controls

Use camera presets or create custom camera positions:

```javascript
import { Camera } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// Use camera presets
function setTopView() {
    scene.camera = Camera.topView();
}

function setFrontView() {
    scene.camera = Camera.frontView();
}

function setIsometricView() {
    scene.camera = Camera.isometric();
}

// Custom camera position
const camera = scene.camera;
camera.setPosition(10, 10, 10);
camera.lookAt(0, 0, 0);
```

## Lighting Presets

Add different types of lighting to your scene:

```javascript
import { Light } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// Sun light (directional)
Light.sun(1.0, 0xffffff);

// Ambient light
Light.ambient(0.4, 0xffffff);

// Point light
Light.point(5, 5, 5, 1.0, 0xffffff);

// Spot light
Light.spot(5, 5, 5, { x: 0, y: 0, z: 0 }, 1.0, 0xffffff);

// Colored lights
Light.point(5, 5, 5, 0.8, 0xff0000); // Red point light
Light.ambient(0.3, 0x4444ff); // Blue ambient light
```

## Configuration

Customize the framework behavior:

```javascript
import { Config } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// Set configuration before initializing
Config.set('camera.fov', 60);
Config.set('renderer.antialias', true);

// Or merge configuration
Config.merge({
    renderer: {
        antialias: true,
        alpha: false,
    },
    camera: {
        fov: 75,
        near: 0.1,
        far: 2000,
    },
    scene: {
        background: 0x222222,
    },
});

// Then initialize scene
const scene = quickStart('container');
```

## Complete Example

Here's a complete example combining everything:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>KALYTHESAINZ Complete Example</title>
        <style>
            body {
                margin: 0;
                font-family: Arial;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
            .controls {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                padding: 15px;
                border-radius: 8px;
                color: white;
            }
            button {
                background: #4caf50;
                color: white;
                border: none;
                padding: 10px 15px;
                margin: 5px;
                cursor: pointer;
                border-radius: 4px;
            }
            button:hover {
                background: #45a049;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>
        <div class="controls">
            <h3>Controls</h3>
            <button onclick="app.addBox()">Add Box</button>
            <button onclick="app.addSphere()">Add Sphere</button>
            <button onclick="app.saveScene()">Save</button>
            <button onclick="app.loadScene()">Load</button>
            <button onclick="app.clearScene()">Clear</button>
            <p>Objects: <span id="count">0</span></p>
        </div>

        <script type="module">
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            import {
                quickStart,
                Box,
                Sphere,
                Light,
                EventBus,
                Serializer,
            } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

            class App {
                constructor() {
                    this.scene = quickStart('container');
                    Light.sun();
                    Light.ambient(0.4);
                    this.setupEvents();
                }

                setupEvents() {
                    EventBus.subscribe('object:added', () => this.updateCount());
                    EventBus.subscribe('object:removed', () => this.updateCount());
                    EventBus.subscribe('scene:cleared', () => this.updateCount());
                }

                addBox() {
                    const box = Box.create(
                        Math.random() * 2 + 0.5,
                        Math.random() * 2 + 0.5,
                        Math.random() * 2 + 0.5,
                    );
                    box.position = {
                        x: (Math.random() - 0.5) * 10,
                        y: Math.random() * 5,
                        z: (Math.random() - 0.5) * 10,
                    };
                    this.scene.add(box);
                }

                addSphere() {
                    const sphere = Sphere.create(Math.random() * 1.5 + 0.5, 32);
                    sphere.position = {
                        x: (Math.random() - 0.5) * 10,
                        y: Math.random() * 5,
                        z: (Math.random() - 0.5) * 10,
                    };
                    this.scene.add(sphere);
                }

                saveScene() {
                    const data = Serializer.serialize(this.scene);
                    localStorage.setItem('scene', JSON.stringify(data));
                    alert('Scene saved!');
                }

                loadScene() {
                    const json = localStorage.getItem('scene');
                    if (json) {
                        const data = JSON.parse(json);
                        this.scene.clear();
                        Serializer.deserialize(data, this.scene);
                        alert('Scene loaded!');
                    }
                }

                clearScene() {
                    this.scene.clear();
                }

                updateCount() {
                    document.getElementById('count').textContent = this.scene.objects.length;
                }
            }

            window.app = new App();
        </script>
    </body>
</html>
```

## Next Steps

Now that you've learned the basics, explore:

- [API Documentation](API.md) - Complete API reference
- [Examples](../examples/) - More example applications
- [Plugin System](PLUGIN_SYSTEM.md) - Extend the framework
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

Happy coding! 🎨
