/**
 * TypeScript definition validation test
 * This file tests that the type definitions are correct
 */

import {
    createScene,
    Scene,
    SceneInstance,
    Box,
    Sphere,
    Plane,
    Light,
    EventBus,
    Config,
    VERSION,
} from './index';

// Test 1: createScene function
const scene1: SceneInstance = createScene('container-1');
const scene2: SceneInstance = createScene('container-2', {
    camera: { fov: 60, type: 'perspective' },
    lights: false,
    autoStart: true,
});

// Test 2: SceneInstance methods
const box = scene1.createBox(1, 1, 1);
const sphere = scene1.createSphere(0.5, 32);
const plane = scene1.createPlane(10, 10);

// Test 3: Light creation
const light1 = scene1.addLight('sun', { intensity: 1.5 });
const light2 = scene1.addLight('ambient', { color: 0xffffff });

// Test 4: Object factory methods with scene parameter
const box2 = Box.create(2, 2, 2, { color: 0xff0000 }, scene1);
const sphere2 = Sphere.create(1, 32, { wireframe: true }, scene1);
const plane2 = Plane.create(5, 5, undefined, scene1);

// Test 5: Light factory methods with scene parameter
const sun = Light.sun({ intensity: 2 }, scene1);
const ambient = Light.ambient({ color: 0x404040 }, scene1);
const point = Light.point(0, 5, 0, { distance: 10 }, scene1);

// Test 6: Backward compatibility (deprecated API)
const oldScene = Scene.init('old-container');
const oldBox = Box.create(1, 1, 1); // Without scene parameter

// Test 7: Event system
scene1.on('object:added', (event) => {
    console.log('Object added:', event.data);
});

const unsubscribe = scene1.on(
    'frame:rendered',
    (event) => {
        console.log('Frame rendered');
    },
    { once: true, priority: 10 },
);

scene1.emit('custom:event', { foo: 'bar' });

// Test 8: Global events
EventBus.subscribe('global:event', (event) => {
    console.log('Global event:', event.data);
});

// Test 9: Scene properties
const renderer = scene1.renderer;
const camera = scene1.camera;
const lights = scene1.lights;
const objects = scene1.objects;
const isDisposed = scene1.isDisposed;
const isRendering = scene1.isRendering;
const config = scene1.config;

// Test 10: Lifecycle
scene1.startRenderLoop(60);
scene1.render();
scene1.stopRenderLoop();
scene1.destroy();

// Test 11: Object management
const objectId = scene2.add(box);
const found = scene2.find(objectId);
const allObjects = scene2.findAll((data) => data.object instanceof Box);
scene2.remove(objectId);
scene2.clear();

// Test 12: Config
Config.set('debug', true);
const debug = Config.get('debug');
const allConfig = Config.getAll();

// Test 13: Version
console.log('KALYTHESAINZ version:', VERSION);

export {};
