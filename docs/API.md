# KALYTHESAINZ Framework - API Documentation

## Table of Contents

- [Getting Started](#getting-started)
- [Core Layer](#core-layer)
- [Engine Layer](#engine-layer)
- [Objects Layer](#objects-layer)
- [Tools Layer](#tools-layer)
- [Utils Layer](#utils-layer)
- [Quick Reference](#quick-reference)

---

## Getting Started

### Installation via CDN

The easiest way to use KALYTHESAINZ is directly from a CDN with ES modules:

```html
<!doctype html>
<html>
    <head>
        <title>My 3D App</title>
    </head>
    <body>
        <div id="container"></div>

        <script type="module">
            // Import Three.js
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            // Import KALYTHESAINZ
            import {
                quickStart,
                Box,
                Light,
            } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

            // Create scene
            const scene = quickStart('container');

            // Add objects
            const box = Box.create(1, 1, 1);
            scene.add(box);
        </script>
    </body>
</html>
```

### Quick Start

The `quickStart()` function initializes a complete 3D scene with one line:

```javascript
import { quickStart } from 'kalythesainz';

// Initialize with default settings
const scene = quickStart('container-id');

// Or with custom configuration
const scene = quickStart('container-id', {
    renderer: { antialias: true, alpha: false },
    camera: { fov: 75, position: [5, 5, 10] },
    scene: { background: 0x222222 },
});
```

---

## Core Layer

### App

The App class manages the application lifecycle and provides event delegation.

#### Methods

##### `App.init(config)`

Initialize the application with configuration.

```javascript
import { App } from 'kalythesainz';

App.init({
    renderer: { antialias: true },
    camera: { fov: 75 },
});
```

##### `App.getInstance()`

Get the singleton app instance.

```javascript
const app = App.getInstance();
```

##### `App.destroy()`

Clean up and destroy the application.

```javascript
App.destroy();
```

##### `App.on(event, callback)` / `App.off(event, callback)` / `App.emit(event, data)`

Event handling methods.

```javascript
App.on('custom:event', (data) => {
    console.log('Event received:', data);
});

App.emit('custom:event', { message: 'Hello' });
```

---

### Config

The Config class manages framework configuration with defaults.

#### Properties

```javascript
Config.defaults = {
    renderer: { antialias: true, alpha: false },
    camera: { fov: 75, near: 0.1, far: 1000 },
    scene: { background: 0x222222 },
};
```

#### Methods

##### `Config.get(key)`

Get a configuration value.

```javascript
const fov = Config.get('camera.fov'); // 75
```

##### `Config.set(key, value)`

Set a configuration value.

```javascript
Config.set('camera.fov', 60);
```

##### `Config.merge(config)`

Merge configuration object.

```javascript
Config.merge({
    renderer: { antialias: false },
    camera: { fov: 90 },
});
```

---

### EventBus

The EventBus provides publish/subscribe pattern for inter-module communication.

#### Methods

##### `EventBus.subscribe(event, callback)`

Subscribe to an event.

```javascript
import { EventBus } from 'kalythesainz';

EventBus.subscribe('object:added', (data) => {
    console.log('Object added:', data.object.id);
});
```

##### `EventBus.unsubscribe(event, callback)`

Unsubscribe from an event.

```javascript
const handler = (data) => console.log(data);
EventBus.subscribe('object:added', handler);
EventBus.unsubscribe('object:added', handler);
```

##### `EventBus.publish(event, data)`

Publish an event.

```javascript
EventBus.publish('custom:event', { message: 'Hello' });
```

##### `EventBus.clear()`

Clear all event subscriptions.

```javascript
EventBus.clear();
```

#### Built-in Events

- `object:added` - Fired when an object is added to the scene
- `object:removed` - Fired when an object is removed
- `object:modified` - Fired when an object is modified
- `scene:cleared` - Fired when the scene is cleared

---

## Engine Layer

### Scene

The Scene class is the main scene manager.

#### Methods

##### `Scene.init(containerId, config)`

Initialize a new scene.

```javascript
import { Scene } from 'kalythesainz';

const scene = Scene.init('canvas-container', {
    renderer: { antialias: true },
    camera: { fov: 75, position: [0, 5, 10] },
});
```

##### `Scene.getInstance()`

Get the current scene instance.

```javascript
const scene = Scene.getInstance();
```

##### `Scene.add(object)`

Add an object to the scene.

```javascript
import { Box } from 'kalythesainz';

const box = Box.create(1, 1, 1);
scene.add(box);
```

##### `Scene.remove(objectId)`

Remove an object from the scene.

```javascript
scene.remove(box.id);
```

##### `Scene.find(id)`

Find an object by ID.

```javascript
const obj = scene.find('obj_12345');
```

##### `Scene.clear()`

Clear all objects from the scene.

```javascript
scene.clear();
```

##### `Scene.serialize()` / `Scene.deserialize(data)`

Serialize/deserialize the scene.

```javascript
// Save scene
const data = scene.serialize();
localStorage.setItem('scene', JSON.stringify(data));

// Load scene
const savedData = JSON.parse(localStorage.getItem('scene'));
scene.deserialize(savedData);
```

#### Properties

- `scene.objects` - Array of all objects in the scene
- `scene.camera` - The scene camera
- `scene.renderer` - The scene renderer
- `scene.threeScene` - Direct access to Three.js scene

---

### Renderer

The Renderer class wraps Three.js WebGLRenderer.

#### Constructor

```javascript
import { Renderer } from 'kalythesainz';

const renderer = new Renderer({
    antialias: true,
    alpha: false,
});
```

#### Methods

##### `renderer.setSize(width, height)`

Set renderer size.

```javascript
renderer.setSize(800, 600);
```

##### `renderer.render(scene, camera)`

Render the scene.

```javascript
renderer.render(scene, camera);
```

##### `renderer.dispose()`

Clean up renderer resources.

```javascript
renderer.dispose();
```

#### Properties

- `renderer.threeRenderer` - Direct access to Three.js WebGLRenderer

---

### Camera

The Camera class provides camera management with presets.

#### Constructor

```javascript
import { Camera } from 'kalythesainz';

const camera = new Camera('perspective', {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
});
```

#### Methods

##### `camera.setPosition(x, y, z)`

Set camera position.

```javascript
camera.setPosition(0, 5, 10);
```

##### `camera.lookAt(x, y, z)`

Point camera at position.

```javascript
camera.lookAt(0, 0, 0);
```

##### `camera.setFov(fov)`

Set field of view.

```javascript
camera.setFov(60);
```

#### Static Presets

##### `Camera.topView()`

Create a top-down camera view.

```javascript
const camera = Camera.topView();
```

##### `Camera.frontView()`

Create a front camera view.

```javascript
const camera = Camera.frontView();
```

##### `Camera.isometric()`

Create an isometric camera view.

```javascript
const camera = Camera.isometric();
```

#### Properties

- `camera.threeCamera` - Direct access to Three.js camera

---

### Light

The Light class provides lighting presets.

#### Static Methods

##### `Light.sun(intensity, color)`

Create a directional sun light.

```javascript
import { Light } from 'kalythesainz';

Light.sun(1.0, 0xffffff);
```

##### `Light.ambient(intensity, color)`

Create ambient lighting.

```javascript
Light.ambient(0.4, 0xffffff);
```

##### `Light.point(x, y, z, intensity, color)`

Create a point light.

```javascript
Light.point(5, 5, 5, 1.0, 0xffffff);
```

##### `Light.spot(x, y, z, target, intensity, color)`

Create a spot light.

```javascript
Light.spot(5, 5, 5, { x: 0, y: 0, z: 0 }, 1.0, 0xffffff);
```

---

## Objects Layer

### Object3D

Base class for all 3D objects.

#### Constructor

```javascript
import { Object3D } from 'kalythesainz';
import * as THREE from 'three';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const obj = new Object3D(geometry, material);
```

#### Properties

##### Transform Properties

```javascript
// Position
obj.position = { x: 0, y: 1, z: 0 };
console.log(obj.position); // { x: 0, y: 1, z: 0 }

// Rotation (in radians)
obj.rotation = { x: 0, y: Math.PI / 4, z: 0 };
console.log(obj.rotation);

// Scale
obj.scale = { x: 2, y: 1, z: 1 };
console.log(obj.scale);
```

##### Metadata Properties

```javascript
// ID (read-only)
console.log(obj.id); // "obj_12345"

// Name
obj.name = 'My Object';
console.log(obj.name);

// Tags
obj.tags = ['interactive', 'important'];

// User data
obj.userData = { health: 100, type: 'enemy' };
```

#### Methods

##### `obj.dispose()`

Clean up object resources.

```javascript
obj.dispose();
```

##### `obj.clone()`

Create a copy of the object.

```javascript
const copy = obj.clone();
```

##### `obj.serialize()`

Serialize object to JSON.

```javascript
const data = obj.serialize();
```

##### `Object3D.deserialize(data)`

Create object from serialized data.

```javascript
const obj = Object3D.deserialize(data);
```

#### Properties

- `obj.threeMesh` - Direct access to Three.js mesh

---

### Box

Create box primitives.

#### Static Methods

##### `Box.create(width, height, depth, material)`

Create a box object.

```javascript
import { Box } from 'kalythesainz';

// Simple box with default material
const box = Box.create(1, 1, 1);

// Box with custom material
import * as THREE from 'three';
const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.5,
    roughness: 0.5,
});
const redBox = Box.create(2, 1, 1, material);

// Position and add to scene
box.position = { x: 0, y: 0, z: 0 };
scene.add(box);
```

---

### Sphere

Create sphere primitives.

#### Static Methods

##### `Sphere.create(radius, segments, material)`

Create a sphere object.

```javascript
import { Sphere } from 'kalythesainz';

// Simple sphere
const sphere = Sphere.create(1, 32);

// High-detail sphere with custom material
const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const blueSphere = Sphere.create(1.5, 64, material);

sphere.position = { x: 2, y: 0, z: 0 };
scene.add(sphere);
```

---

### Plane

Create plane primitives.

#### Static Methods

##### `Plane.create(width, height, material)`

Create a plane object.

```javascript
import { Plane } from 'kalythesainz';

// Simple plane
const plane = Plane.create(10, 10);

// Ground plane
plane.rotation = { x: -Math.PI / 2, y: 0, z: 0 };
plane.position = { x: 0, y: -1, z: 0 };
scene.add(plane);
```

---

## Tools Layer

### SceneTree

Visual component for displaying scene hierarchy.

#### Constructor

```javascript
import { SceneTree } from 'kalythesainz';

const sceneTree = new SceneTree('container-id');
```

#### Methods

##### `sceneTree.refresh()`

Refresh the scene tree display.

```javascript
sceneTree.refresh();
```

##### `sceneTree.selectObject(id)`

Select an object in the tree.

```javascript
sceneTree.selectObject('obj_12345');
```

##### `sceneTree.onObjectSelect(callback)`

Register object selection callback.

```javascript
sceneTree.onObjectSelect((objectId) => {
    console.log('Selected:', objectId);
});
```

##### `sceneTree.onObjectVisibilityToggle(callback)`

Register visibility toggle callback.

```javascript
sceneTree.onObjectVisibilityToggle((objectId, visible) => {
    console.log(`Object ${objectId} visibility: ${visible}`);
});
```

---

### Inspector

Visual component for editing object properties.

#### Constructor

```javascript
import { Inspector } from 'kalythesainz';

const inspector = new Inspector('container-id');
```

#### Methods

##### `inspector.show(object)`

Show inspector for an object.

```javascript
const box = Box.create(1, 1, 1);
inspector.show(box);
```

##### `inspector.hide()`

Hide the inspector.

```javascript
inspector.hide();
```

##### `inspector.refresh()`

Refresh inspector display.

```javascript
inspector.refresh();
```

##### `inspector.onPropertyChange(callback)`

Register property change callback.

```javascript
inspector.onPropertyChange((property, value) => {
    console.log(`${property} changed to ${value}`);
});
```

---

### TransformGizmo

Interactive transform handles for objects.

#### Constructor

```javascript
import { TransformGizmo } from 'kalythesainz';

const gizmo = new TransformGizmo(camera, renderer);
```

#### Methods

##### `gizmo.attach(object)`

Attach gizmo to an object.

```javascript
const box = Box.create(1, 1, 1);
gizmo.attach(box);
```

##### `gizmo.detach()`

Detach gizmo from current object.

```javascript
gizmo.detach();
```

##### `gizmo.setMode(mode)`

Set gizmo mode: 'translate', 'rotate', or 'scale'.

```javascript
gizmo.setMode('translate');
gizmo.setMode('rotate');
gizmo.setMode('scale');
```

##### Event Callbacks

```javascript
gizmo.onTransformStart(() => {
    console.log('Transform started');
});

gizmo.onTransformChange(() => {
    console.log('Transform changed');
});

gizmo.onTransformEnd(() => {
    console.log('Transform ended');
});
```

---

## Utils Layer

### Serializer

Utility for scene serialization.

#### Static Methods

##### `Serializer.serialize(scene)`

Serialize a scene to JSON.

```javascript
import { Serializer } from 'kalythesainz';

const data = Serializer.serialize(scene);
const json = JSON.stringify(data, null, 2);

// Save to file
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'scene.json';
a.click();
```

##### `Serializer.deserialize(data, scene)`

Deserialize JSON data into a scene.

```javascript
// Load from file
const response = await fetch('scene.json');
const data = await response.json();

Serializer.deserialize(data, scene);
```

---

### ThreeJsIntegration

Utility for Three.js integration and synchronization.

#### Static Methods

##### `ThreeJsIntegration.syncFromThree(object)`

Sync framework object from Three.js changes.

```javascript
import { ThreeJsIntegration } from 'kalythesainz';

// Modify with Three.js
box.threeMesh.position.x = 5;

// Sync back to framework
ThreeJsIntegration.syncFromThree(box);
console.log(box.position.x); // 5
```

##### `ThreeJsIntegration.syncToThree(object)`

Sync Three.js object from framework changes.

```javascript
// Modify with framework
box.position = { x: 10, y: 0, z: 0 };

// Sync to Three.js
ThreeJsIntegration.syncToThree(box);
console.log(box.threeMesh.position.x); // 10
```

---

## Quick Reference

### Complete Example

```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
window.THREE = THREE;

import {
    quickStart,
    Box,
    Sphere,
    Plane,
    Light,
    SceneTree,
    Inspector,
    EventBus,
    Serializer,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// Initialize scene
const scene = quickStart('container');

// Add lighting
Light.sun(1.0);
Light.ambient(0.4);

// Create objects
const box = Box.create(1, 1, 1);
box.position = { x: -2, y: 0, z: 0 };
box.name = 'Red Box';
scene.add(box);

const sphere = Sphere.create(0.8, 32);
sphere.position = { x: 2, y: 0, z: 0 };
sphere.name = 'Blue Sphere';
scene.add(sphere);

const plane = Plane.create(10, 10);
plane.rotation = { x: -Math.PI / 2, y: 0, z: 0 };
plane.position = { x: 0, y: -1, z: 0 };
scene.add(plane);

// Setup visual tools
const sceneTree = new SceneTree('scene-tree');
const inspector = new Inspector('inspector');

sceneTree.onObjectSelect((id) => {
    const obj = scene.find(id);
    inspector.show(obj);
});

// Listen to events
EventBus.subscribe('object:added', (data) => {
    console.log('Object added:', data.object.name);
});

// Save/load scene
const saveButton = document.getElementById('save');
saveButton.onclick = () => {
    const data = Serializer.serialize(scene);
    localStorage.setItem('scene', JSON.stringify(data));
};

const loadButton = document.getElementById('load');
loadButton.onclick = () => {
    const data = JSON.parse(localStorage.getItem('scene'));
    scene.clear();
    Serializer.deserialize(data, scene);
};

// Direct Three.js manipulation
box.threeMesh.material.color.setHex(0xff0000);
box.threeMesh.material.metalness = 0.5;
```

---

## Next Steps

- Check out the [Getting Started Guide](GETTING_STARTED.md)
- Explore [Examples](../examples/)
- Read about [Plugin System](PLUGIN_SYSTEM.md)
- See [Troubleshooting](TROUBLESHOOTING.md)
