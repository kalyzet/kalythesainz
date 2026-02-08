/**
 * Property-based tests for factory method scene parameters
 * **Feature: instance-based-api, Property 7: Factory Method Scene Parameter**
 * **Feature: instance-based-api, Property 8: Light Factory Scene Parameter**
 * **Validates: Requirements 2.1.1, 2.1.2, 2.1.3, 2.1.4**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';
import { Box } from '../../objects/Box.js';
import { Sphere } from '../../objects/Sphere.js';
import { Plane } from '../../objects/Plane.js';
import { Light } from '../../engine/Light.js';
import * as THREE from 'three';

describe('Factory Scene Parameter Property Tests', () => {
    let createdScenes = [];

    beforeEach(() => {
        createdScenes = [];

        // Create mock DOM containers for testing
        document.body.innerHTML = '';
    });

    afterEach(() => {
        // Clean up all created scenes
        for (const scene of createdScenes) {
            try {
                if (scene && !scene.isDisposed) {
                    scene.destroy();
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        }
        createdScenes = [];

        // Clean up DOM
        document.body.innerHTML = '';
    });

    /**
     * Helper function to create a test scene
     */
    function createTestScene(containerId) {
        const container = document.createElement('div');
        container.id = containerId;
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        const scene = new SceneInstance(containerId, { autoStart: false, lights: false });
        createdScenes.push(scene);
        return scene;
    }

    /**
     * Property 7: Factory Method Scene Parameter
     * For any scene instance and valid object parameters,
     * calling Box.create/Sphere.create/Plane.create with the scene parameter
     * should add the created object to the specified scene.
     */
    test('**Feature: instance-based-api, Property 7: Factory Method Scene Parameter**', () => {
        fc.assert(
            fc.property(
                // Generate random container ID
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                // Generate random object type
                fc.constantFrom('box', 'sphere', 'plane'),
                // Generate random parameters for each object type
                fc.record({
                    // Box parameters
                    boxWidth: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    boxHeight: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    boxDepth: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    // Sphere parameters
                    sphereRadius: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    sphereSegments: fc.integer({ min: 3, max: 64 }),
                    // Plane parameters
                    planeWidth: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    planeHeight: fc.double({ min: 0.1, max: 10, noNaN: true }),
                }),
                (containerId, objectType, params) => {
                    // Create test scene
                    const scene = createTestScene(containerId);

                    // Get initial object count
                    const initialObjectCount = scene.objects.size;

                    let createdObject;

                    // Create object using factory method with scene parameter
                    if (objectType === 'box') {
                        createdObject = Box.create(
                            params.boxWidth,
                            params.boxHeight,
                            params.boxDepth,
                            null, // material
                            scene, // scene parameter
                        );
                    } else if (objectType === 'sphere') {
                        createdObject = Sphere.create(
                            params.sphereRadius,
                            params.sphereSegments,
                            null, // material
                            scene, // scene parameter
                        );
                    } else if (objectType === 'plane') {
                        createdObject = Plane.create(
                            params.planeWidth,
                            params.planeHeight,
                            null, // material
                            scene, // scene parameter
                        );
                    }

                    // Verify object was created
                    expect(createdObject).toBeDefined();
                    expect(createdObject).not.toBeNull();

                    // Verify object has required properties
                    expect(createdObject).toHaveProperty('id');
                    expect(createdObject).toHaveProperty('threeMesh');
                    expect(createdObject.threeMesh).toBeDefined();

                    // Verify object was added to the specified scene
                    expect(scene.objects.size).toBe(initialObjectCount + 1);

                    // Verify object is in scene's object list
                    const objectInScene = scene.find(createdObject.id);
                    expect(objectInScene).toBe(createdObject);

                    // Verify object is in Three.js scene
                    expect(scene.threeScene.children).toContain(createdObject.threeMesh);

                    // Verify object type-specific properties
                    if (objectType === 'box') {
                        expect(createdObject.width).toBeCloseTo(params.boxWidth, 5);
                        expect(createdObject.height).toBeCloseTo(params.boxHeight, 5);
                        expect(createdObject.depth).toBeCloseTo(params.boxDepth, 5);
                    } else if (objectType === 'sphere') {
                        expect(createdObject.radius).toBeCloseTo(params.sphereRadius, 5);
                    } else if (objectType === 'plane') {
                        expect(createdObject.width).toBeCloseTo(params.planeWidth, 5);
                        expect(createdObject.height).toBeCloseTo(params.planeHeight, 5);
                    }

                    // Verify return value is the created object
                    expect(typeof createdObject).toBe('object');
                    expect(createdObject.constructor.name).toMatch(/Box|Sphere|Plane/);
                },
            ),
            { numRuns: 100 },
        );
    });

    /**
     * Property 8: Light Factory Scene Parameter
     * For any scene instance and valid light config,
     * calling Light.sun/ambient/point with the scene parameter
     * should add the created light to the specified scene.
     */
    test('**Feature: instance-based-api, Property 8: Light Factory Scene Parameter**', () => {
        fc.assert(
            fc.property(
                // Generate random container ID
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                // Generate random light type
                fc.constantFrom('sun', 'ambient', 'point', 'spot', 'hemisphere'),
                // Generate random light configuration
                fc.record({
                    intensity: fc.double({ min: 0.1, max: 2, noNaN: true }),
                    color: fc.integer({ min: 0x000000, max: 0xffffff }),
                    // Point light position
                    x: fc.double({ min: -10, max: 10, noNaN: true }),
                    y: fc.double({ min: 0, max: 20, noNaN: true }),
                    z: fc.double({ min: -10, max: 10, noNaN: true }),
                }),
                (containerId, lightType, config) => {
                    // Create test scene
                    const scene = createTestScene(containerId);

                    // Get initial light count
                    const initialLightCount = scene.lights.length;

                    let createdLight;

                    // Create light using factory method with scene parameter
                    if (lightType === 'sun') {
                        createdLight = Light.sun(
                            {
                                intensity: config.intensity,
                                color: config.color,
                            },
                            scene, // scene parameter
                        );
                    } else if (lightType === 'ambient') {
                        createdLight = Light.ambient(
                            {
                                intensity: config.intensity,
                                color: config.color,
                            },
                            scene, // scene parameter
                        );
                    } else if (lightType === 'point') {
                        createdLight = Light.point(
                            config.x,
                            config.y,
                            config.z,
                            {
                                intensity: config.intensity,
                                color: config.color,
                            },
                            scene, // scene parameter (5th argument)
                        );
                    } else if (lightType === 'spot') {
                        createdLight = Light.spot(
                            {
                                intensity: config.intensity,
                                color: config.color,
                            },
                            scene, // scene parameter
                        );
                    } else if (lightType === 'hemisphere') {
                        createdLight = Light.hemisphere(
                            {
                                intensity: config.intensity,
                                skyColor: config.color,
                            },
                            scene, // scene parameter
                        );
                    }

                    // Verify light was created
                    expect(createdLight).toBeDefined();
                    expect(createdLight).not.toBeNull();

                    // Verify light has required properties
                    expect(createdLight).toHaveProperty('threeLight');
                    expect(createdLight).toHaveProperty('type');
                    expect(createdLight.threeLight).toBeDefined();

                    // Verify light was added to the specified scene's lights array
                    expect(scene.lights.length).toBe(initialLightCount + 1);

                    // Verify light is in scene's lights array
                    expect(scene.lights).toContain(createdLight);

                    // Verify light is in Three.js scene
                    expect(scene.threeScene.children).toContain(createdLight.threeLight);

                    // Verify light type
                    expect(createdLight.type).toBeDefined();
                    expect(typeof createdLight.type).toBe('string');

                    // Verify return value is the created light
                    expect(createdLight).toBeInstanceOf(Light);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Box.create with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                (width, height, depth) => {
                    const scene = createTestScene('test-box-factory-scene');
                    const initialCount = scene.objects.size;

                    const box = Box.create(width, height, depth, null, scene);

                    // Verify box was created and returned
                    expect(box).toBeDefined();
                    expect(box.constructor.name).toBe('Box');

                    // Verify box dimensions
                    expect(box.width).toBeCloseTo(width, 5);
                    expect(box.height).toBeCloseTo(height, 5);
                    expect(box.depth).toBeCloseTo(depth, 5);

                    // Verify box was added to specified scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(box.id)).toBe(box);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Sphere.create with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.integer({ min: 3, max: 64 }),
                (radius, segments) => {
                    const scene = createTestScene('test-sphere-factory-scene');
                    const initialCount = scene.objects.size;

                    const sphere = Sphere.create(radius, segments, null, scene);

                    // Verify sphere was created and returned
                    expect(sphere).toBeDefined();
                    expect(sphere.constructor.name).toBe('Sphere');

                    // Verify sphere radius
                    expect(sphere.radius).toBeCloseTo(radius, 5);

                    // Verify sphere was added to specified scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(sphere.id)).toBe(sphere);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Plane.create with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                (width, height) => {
                    const scene = createTestScene('test-plane-factory-scene');
                    const initialCount = scene.objects.size;

                    const plane = Plane.create(width, height, null, scene);

                    // Verify plane was created and returned
                    expect(plane).toBeDefined();
                    expect(plane.constructor.name).toBe('Plane');

                    // Verify plane dimensions
                    expect(plane.width).toBeCloseTo(width, 5);
                    expect(plane.height).toBeCloseTo(height, 5);

                    // Verify plane was added to specified scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(plane.id)).toBe(plane);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Light.sun with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, color) => {
                    const scene = createTestScene('test-sun-factory-scene');
                    const initialCount = scene.lights.length;

                    const light = Light.sun({ intensity, color }, scene);

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('directional');

                    // Verify light was added to specified scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Light.ambient with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, color) => {
                    const scene = createTestScene('test-ambient-factory-scene');
                    const initialCount = scene.lights.length;

                    const light = Light.ambient({ intensity, color }, scene);

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('ambient');

                    // Verify light was added to specified scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Light.point with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: -10, max: 10, noNaN: true }),
                fc.double({ min: 0, max: 20, noNaN: true }),
                fc.double({ min: -10, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                (x, y, z, intensity) => {
                    const scene = createTestScene('test-point-factory-scene');
                    const initialCount = scene.lights.length;

                    const light = Light.point(x, y, z, { intensity }, scene);

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('point');

                    // Verify light was added to specified scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);

                    // Verify position was set
                    expect(light.threeLight.position.x).toBeCloseTo(x, 5);
                    expect(light.threeLight.position.y).toBeCloseTo(y, 5);
                    expect(light.threeLight.position.z).toBeCloseTo(z, 5);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Light.spot with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, color) => {
                    const scene = createTestScene('test-spot-factory-scene');
                    const initialCount = scene.lights.length;

                    const light = Light.spot({ intensity, color }, scene);

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('spot');

                    // Verify light was added to specified scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Light.hemisphere with scene parameter adds to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, skyColor) => {
                    const scene = createTestScene('test-hemisphere-factory-scene');
                    const initialCount = scene.lights.length;

                    const light = Light.hemisphere({ intensity, skyColor }, scene);

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('hemisphere');

                    // Verify light was added to specified scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Factory methods add objects to correct scene when multiple scenes exist', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 5 }), (numScenes) => {
                const scenes = [];

                // Create multiple scenes
                for (let i = 0; i < numScenes; i++) {
                    const scene = createTestScene(`test-multi-scene-${i}`);
                    scenes.push(scene);
                }

                // Add objects to each scene using factory methods
                const objectsPerScene = [];
                for (let i = 0; i < scenes.length; i++) {
                    const box = Box.create(1, 1, 1, null, scenes[i]);
                    objectsPerScene.push(box);
                }

                // Verify each scene has exactly one object
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].objects.size).toBe(1);

                    // Verify object is in correct scene
                    expect(scenes[i].find(objectsPerScene[i].id)).toBe(objectsPerScene[i]);

                    // Verify object is NOT in other scenes
                    for (let j = 0; j < scenes.length; j++) {
                        if (i !== j) {
                            expect(scenes[j].find(objectsPerScene[i].id)).toBeNull();
                        }
                    }
                }
            }),
            { numRuns: 20 },
        );
    });

    test('Factory methods add lights to correct scene when multiple scenes exist', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 5 }), (numScenes) => {
                const scenes = [];

                // Create multiple scenes
                for (let i = 0; i < numScenes; i++) {
                    const scene = createTestScene(`test-multi-light-scene-${i}`);
                    scenes.push(scene);
                }

                // Add lights to each scene using factory methods
                const lightsPerScene = [];
                for (let i = 0; i < scenes.length; i++) {
                    const light = Light.sun({ intensity: 1 }, scenes[i]);
                    lightsPerScene.push(light);
                }

                // Verify each scene has exactly one light
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].lights.length).toBe(1);

                    // Verify light is in correct scene
                    expect(scenes[i].lights).toContain(lightsPerScene[i]);

                    // Verify light is NOT in other scenes
                    for (let j = 0; j < scenes.length; j++) {
                        if (i !== j) {
                            expect(scenes[j].lights).not.toContain(lightsPerScene[i]);
                        }
                    }
                }
            }),
            { numRuns: 20 },
        );
    });

    test('Factory methods with custom materials add to correct scene', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('box', 'sphere', 'plane'),
                fc.integer({ min: 0x000001, max: 0xffffff }),
                (objectType, color) => {
                    const scene = createTestScene('test-custom-material-factory');
                    const initialCount = scene.objects.size;

                    // Create custom material
                    const material = new THREE.MeshStandardMaterial({ color });

                    let obj;
                    if (objectType === 'box') {
                        obj = Box.create(1, 1, 1, material, scene);
                    } else if (objectType === 'sphere') {
                        obj = Sphere.create(1, 16, material, scene);
                    } else {
                        obj = Plane.create(1, 1, material, scene);
                    }

                    // Verify object was created with custom material
                    expect(obj).toBeDefined();
                    expect(obj.threeMesh.material).toBe(material);

                    // Verify object was added to specified scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(obj.id)).toBe(obj);
                },
            ),
            { numRuns: 30 },
        );
    });

    test('Factory methods throw error when scene parameter is invalid', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('box', 'sphere', 'plane'),
                fc.constantFrom(null, undefined, {}, [], 'invalid', 123, true),
                (objectType, invalidScene) => {
                    // Skip null and undefined as they trigger singleton fallback
                    if (invalidScene === null || invalidScene === undefined) {
                        return;
                    }

                    // Try to create object with invalid scene parameter
                    expect(() => {
                        if (objectType === 'box') {
                            Box.create(1, 1, 1, null, invalidScene);
                        } else if (objectType === 'sphere') {
                            Sphere.create(1, 16, null, invalidScene);
                        } else {
                            Plane.create(1, 1, null, invalidScene);
                        }
                    }).toThrow();
                },
            ),
            { numRuns: 30 },
        );
    });
});
