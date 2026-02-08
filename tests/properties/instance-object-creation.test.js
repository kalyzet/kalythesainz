/**
 * Property-based tests for instance-scoped object creation
 * **Feature: instance-based-api, Property 5: Instance Method Object Creation**
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.5**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';
import * as THREE from 'three';

describe('Instance Object Creation Property Tests', () => {
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

        const scene = new SceneInstance(containerId, { autoStart: false });
        createdScenes.push(scene);
        return scene;
    }

    /**
     * Property 5: Instance Method Object Creation
     * For any scene instance and valid object parameters (box dimensions, sphere radius, etc.),
     * calling scene.createBox/createSphere/createPlane should return an object that is
     * automatically present in that scene's object list.
     */
    test('**Feature: instance-based-api, Property 5: Instance Method Object Creation**', () => {
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

                    // Create object based on type
                    if (objectType === 'box') {
                        createdObject = scene.createBox(
                            params.boxWidth,
                            params.boxHeight,
                            params.boxDepth,
                        );
                    } else if (objectType === 'sphere') {
                        createdObject = scene.createSphere(
                            params.sphereRadius,
                            params.sphereSegments,
                        );
                    } else if (objectType === 'plane') {
                        createdObject = scene.createPlane(params.planeWidth, params.planeHeight);
                    }

                    // Verify object was created
                    expect(createdObject).toBeDefined();
                    expect(createdObject).not.toBeNull();

                    // Verify object has required properties
                    expect(createdObject).toHaveProperty('id');
                    expect(createdObject).toHaveProperty('threeMesh');
                    expect(createdObject.threeMesh).toBeDefined();

                    // Verify object was added to scene
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

                    // Verify return value is the created object (not just an ID)
                    expect(typeof createdObject).toBe('object');
                    expect(createdObject.constructor.name).toMatch(/Box|Sphere|Plane/);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('createBox returns Box object added to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                (width, height, depth) => {
                    const scene = createTestScene('test-box-scene');
                    const initialCount = scene.objects.size;

                    const box = scene.createBox(width, height, depth);

                    // Verify box was created and returned
                    expect(box).toBeDefined();
                    expect(box.constructor.name).toBe('Box');

                    // Verify box dimensions
                    expect(box.width).toBeCloseTo(width, 5);
                    expect(box.height).toBeCloseTo(height, 5);
                    expect(box.depth).toBeCloseTo(depth, 5);

                    // Verify box was added to scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(box.id)).toBe(box);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('createSphere returns Sphere object added to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.integer({ min: 3, max: 64 }),
                (radius, segments) => {
                    const scene = createTestScene('test-sphere-scene');
                    const initialCount = scene.objects.size;

                    const sphere = scene.createSphere(radius, segments);

                    // Verify sphere was created and returned
                    expect(sphere).toBeDefined();
                    expect(sphere.constructor.name).toBe('Sphere');

                    // Verify sphere radius
                    expect(sphere.radius).toBeCloseTo(radius, 5);

                    // Verify sphere was added to scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(sphere.id)).toBe(sphere);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('createPlane returns Plane object added to correct scene', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                (width, height) => {
                    const scene = createTestScene('test-plane-scene');
                    const initialCount = scene.objects.size;

                    const plane = scene.createPlane(width, height);

                    // Verify plane was created and returned
                    expect(plane).toBeDefined();
                    expect(plane.constructor.name).toBe('Plane');

                    // Verify plane dimensions
                    expect(plane.width).toBeCloseTo(width, 5);
                    expect(plane.height).toBeCloseTo(height, 5);

                    // Verify plane was added to scene
                    expect(scene.objects.size).toBe(initialCount + 1);
                    expect(scene.find(plane.id)).toBe(plane);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Multiple objects can be created in same scene', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 10 }), (numObjects) => {
                const scene = createTestScene('test-multiple-objects');
                const createdObjects = [];

                // Create multiple objects
                for (let i = 0; i < numObjects; i++) {
                    const objectType = ['box', 'sphere', 'plane'][i % 3];
                    let obj;

                    if (objectType === 'box') {
                        obj = scene.createBox(1, 1, 1);
                    } else if (objectType === 'sphere') {
                        obj = scene.createSphere(1, 16);
                    } else {
                        obj = scene.createPlane(1, 1);
                    }

                    createdObjects.push(obj);
                }

                // Verify all objects were added
                expect(scene.objects.size).toBe(numObjects);

                // Verify all objects are in scene
                for (const obj of createdObjects) {
                    expect(scene.find(obj.id)).toBe(obj);
                    expect(scene.threeScene.children).toContain(obj.threeMesh);
                }

                // Verify all objects are unique
                const ids = createdObjects.map((obj) => obj.id);
                const uniqueIds = new Set(ids);
                expect(uniqueIds.size).toBe(numObjects);
            }),
            { numRuns: 30 },
        );
    });

    test('Objects created with custom materials', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('box', 'sphere', 'plane'),
                fc.integer({ min: 0x000001, max: 0xffffff }), // Avoid 0 which has default behavior
                (objectType, color) => {
                    const scene = createTestScene('test-custom-material');

                    // Create custom material
                    const material = new THREE.MeshStandardMaterial({ color });

                    let obj;
                    if (objectType === 'box') {
                        obj = scene.createBox(1, 1, 1, material);
                    } else if (objectType === 'sphere') {
                        obj = scene.createSphere(1, 16, material);
                    } else {
                        obj = scene.createPlane(1, 1, material);
                    }

                    // Verify object was created with custom material
                    expect(obj).toBeDefined();
                    expect(obj.threeMesh.material).toBe(material);
                    // Verify color was set (allowing for mock behavior)
                    expect(obj.threeMesh.material.color).toBeDefined();
                },
            ),
            { numRuns: 30 },
        );
    });

    test('Objects are isolated between different scenes', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 5 }), (numScenes) => {
                const scenes = [];

                // Create multiple scenes
                for (let i = 0; i < numScenes; i++) {
                    const scene = createTestScene(`test-isolation-${i}`);
                    scenes.push(scene);
                }

                // Add objects to each scene
                const objectsPerScene = [];
                for (let i = 0; i < scenes.length; i++) {
                    const box = scenes[i].createBox(1, 1, 1);
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

    test('createBox/Sphere/Plane throw error on disposed scene', () => {
        fc.assert(
            fc.property(fc.constantFrom('box', 'sphere', 'plane'), (objectType) => {
                const scene = createTestScene('test-disposed-scene');

                // Dispose the scene
                scene.destroy();

                // Verify scene is disposed
                expect(scene.isDisposed).toBe(true);

                // Try to create object on disposed scene
                expect(() => {
                    if (objectType === 'box') {
                        scene.createBox(1, 1, 1);
                    } else if (objectType === 'sphere') {
                        scene.createSphere(1, 16);
                    } else {
                        scene.createPlane(1, 1);
                    }
                }).toThrow('Cannot create');
            }),
            { numRuns: 30 },
        );
    });
});
