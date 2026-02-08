/**
 * Property-based tests for object isolation between scenes
 * **Feature: instance-based-api, Property 4: Object Isolation Between Scenes**
 * **Validates: Requirements 1.5**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';
import * as THREE from 'three';

describe('Object Isolation Property Tests', () => {
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
    function createTestScene(containerId, config = {}) {
        const container = document.createElement('div');
        container.id = containerId;
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        const scene = new SceneInstance(containerId, { autoStart: false, ...config });
        createdScenes.push(scene);
        return scene;
    }

    /**
     * Property 4: Object Isolation Between Scenes
     * For any two scene instances and any object, adding the object to scene A should result
     * in the object appearing only in scene A's object list, not in scene B's object list.
     */
    test('**Feature: instance-based-api, Property 4: Object Isolation Between Scenes**', () => {
        fc.assert(
            fc.property(
                // Generate object type
                fc.constantFrom('box', 'sphere', 'plane'),
                // Generate object parameters
                fc.record({
                    width: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    height: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    depth: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    radius: fc.double({ min: 0.1, max: 10, noNaN: true }),
                    segments: fc.integer({ min: 3, max: 64 }),
                }),
                (objectType, params) => {
                    // Create two scenes
                    const sceneA = createTestScene('scene-a');
                    const sceneB = createTestScene('scene-b');

                    // Verify both scenes start empty
                    expect(sceneA.objects.size).toBe(0);
                    expect(sceneB.objects.size).toBe(0);

                    // Create object in scene A
                    let object;
                    if (objectType === 'box') {
                        object = sceneA.createBox(params.width, params.height, params.depth);
                    } else if (objectType === 'sphere') {
                        object = sceneA.createSphere(params.radius, params.segments);
                    } else {
                        object = sceneA.createPlane(params.width, params.height);
                    }

                    // Verify object is in scene A
                    expect(sceneA.objects.size).toBe(1);
                    expect(sceneA.find(object.id)).toBe(object);
                    expect(sceneA.threeScene.children).toContain(object.threeMesh);

                    // Verify object is NOT in scene B
                    expect(sceneB.objects.size).toBe(0);
                    expect(sceneB.find(object.id)).toBeNull();
                    expect(sceneB.threeScene.children).not.toContain(object.threeMesh);

                    // Verify scene B's Three.js scene is completely independent
                    expect(sceneB.threeScene).not.toBe(sceneA.threeScene);
                    expect(sceneB.threeScene.children.length).toBeLessThan(
                        sceneA.threeScene.children.length,
                    );
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Adding box to scene A does not add it to scene B', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                (width, height, depth) => {
                    const sceneA = createTestScene('scene-box-a');
                    const sceneB = createTestScene('scene-box-b');

                    const box = sceneA.createBox(width, height, depth);

                    // Verify box is only in scene A
                    expect(sceneA.objects.size).toBe(1);
                    expect(sceneA.find(box.id)).toBe(box);

                    // Verify box is not in scene B
                    expect(sceneB.objects.size).toBe(0);
                    expect(sceneB.find(box.id)).toBeNull();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Adding sphere to scene A does not add it to scene B', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.integer({ min: 3, max: 64 }),
                (radius, segments) => {
                    const sceneA = createTestScene('scene-sphere-a');
                    const sceneB = createTestScene('scene-sphere-b');

                    const sphere = sceneA.createSphere(radius, segments);

                    // Verify sphere is only in scene A
                    expect(sceneA.objects.size).toBe(1);
                    expect(sceneA.find(sphere.id)).toBe(sphere);

                    // Verify sphere is not in scene B
                    expect(sceneB.objects.size).toBe(0);
                    expect(sceneB.find(sphere.id)).toBeNull();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Adding plane to scene A does not add it to scene B', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                (width, height) => {
                    const sceneA = createTestScene('scene-plane-a');
                    const sceneB = createTestScene('scene-plane-b');

                    const plane = sceneA.createPlane(width, height);

                    // Verify plane is only in scene A
                    expect(sceneA.objects.size).toBe(1);
                    expect(sceneA.find(plane.id)).toBe(plane);

                    // Verify plane is not in scene B
                    expect(sceneB.objects.size).toBe(0);
                    expect(sceneB.find(plane.id)).toBeNull();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Multiple objects in scene A do not appear in scene B', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 10 }), (numObjects) => {
                const sceneA = createTestScene('scene-multi-a');
                const sceneB = createTestScene('scene-multi-b');

                const objectsInA = [];

                // Add multiple objects to scene A
                for (let i = 0; i < numObjects; i++) {
                    const objectType = ['box', 'sphere', 'plane'][i % 3];
                    let obj;

                    if (objectType === 'box') {
                        obj = sceneA.createBox(1, 1, 1);
                    } else if (objectType === 'sphere') {
                        obj = sceneA.createSphere(1, 16);
                    } else {
                        obj = sceneA.createPlane(1, 1);
                    }

                    objectsInA.push(obj);
                }

                // Verify all objects are in scene A
                expect(sceneA.objects.size).toBe(numObjects);
                for (const obj of objectsInA) {
                    expect(sceneA.find(obj.id)).toBe(obj);
                }

                // Verify none of the objects are in scene B
                expect(sceneB.objects.size).toBe(0);
                for (const obj of objectsInA) {
                    expect(sceneB.find(obj.id)).toBeNull();
                }
            }),
            { numRuns: 50 },
        );
    });

    test('Objects added to different scenes remain isolated', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 5 }),
                fc.integer({ min: 1, max: 5 }),
                (numScenes, objectsPerScene) => {
                    // Create multiple scenes
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        scenes.push(createTestScene(`scene-isolated-${i}`));
                    }

                    // Add objects to each scene
                    const objectsByScene = [];
                    for (let i = 0; i < scenes.length; i++) {
                        const objects = [];
                        for (let j = 0; j < objectsPerScene; j++) {
                            objects.push(scenes[i].createBox(1, 1, 1));
                        }
                        objectsByScene.push(objects);
                    }

                    // Verify each scene has the correct number of objects
                    for (let i = 0; i < scenes.length; i++) {
                        expect(scenes[i].objects.size).toBe(objectsPerScene);
                    }

                    // Verify objects from scene i are not in scene j
                    for (let i = 0; i < scenes.length; i++) {
                        for (let j = 0; j < scenes.length; j++) {
                            if (i !== j) {
                                for (const obj of objectsByScene[i]) {
                                    expect(scenes[j].find(obj.id)).toBeNull();
                                    expect(scenes[j].threeScene.children).not.toContain(
                                        obj.threeMesh,
                                    );
                                }
                            }
                        }
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Removing object from scene A does not affect scene B', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 5 }), (numObjects) => {
                const sceneA = createTestScene('scene-remove-a');
                const sceneB = createTestScene('scene-remove-b');

                // Add objects to both scenes
                const objectsA = [];
                const objectsB = [];

                for (let i = 0; i < numObjects; i++) {
                    objectsA.push(sceneA.createBox(1, 1, 1));
                    objectsB.push(sceneB.createBox(1, 1, 1));
                }

                // Verify both scenes have objects
                expect(sceneA.objects.size).toBe(numObjects);
                expect(sceneB.objects.size).toBe(numObjects);

                // Remove all objects from scene A
                for (const obj of objectsA) {
                    sceneA.remove(obj.id);
                }

                // Verify scene A is empty
                expect(sceneA.objects.size).toBe(0);

                // Verify scene B still has all its objects
                expect(sceneB.objects.size).toBe(numObjects);
                for (const obj of objectsB) {
                    expect(sceneB.find(obj.id)).toBe(obj);
                }
            }),
            { numRuns: 50 },
        );
    });

    test('Clearing scene A does not affect objects in scene B', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 5 }), (numObjects) => {
                const sceneA = createTestScene('scene-clear-a');
                const sceneB = createTestScene('scene-clear-b');

                // Add objects to both scenes
                for (let i = 0; i < numObjects; i++) {
                    sceneA.createBox(1, 1, 1);
                    sceneB.createSphere(1, 16);
                }

                // Verify both scenes have objects
                expect(sceneA.objects.size).toBe(numObjects);
                expect(sceneB.objects.size).toBe(numObjects);

                // Clear scene A
                sceneA.clear();

                // Verify scene A is empty
                expect(sceneA.objects.size).toBe(0);

                // Verify scene B still has all its objects
                expect(sceneB.objects.size).toBe(numObjects);
            }),
            { numRuns: 50 },
        );
    });

    test('Object IDs are unique across scenes', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 5 }),
                fc.integer({ min: 1, max: 5 }),
                (numScenes, objectsPerScene) => {
                    // Create multiple scenes
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        scenes.push(createTestScene(`scene-unique-${i}`));
                    }

                    // Collect all object IDs
                    const allObjectIds = new Set();

                    // Add objects to each scene
                    for (const scene of scenes) {
                        for (let j = 0; j < objectsPerScene; j++) {
                            const obj = scene.createBox(1, 1, 1);
                            allObjectIds.add(obj.id);
                        }
                    }

                    // Verify all IDs are unique
                    expect(allObjectIds.size).toBe(numScenes * objectsPerScene);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Three.js objects are not shared between scenes', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 4 }), (numScenes) => {
                // Create multiple scenes
                const scenes = [];
                for (let i = 0; i < numScenes; i++) {
                    scenes.push(createTestScene(`scene-three-${i}`));
                }

                // Add one object to each scene
                const objects = [];
                for (const scene of scenes) {
                    objects.push(scene.createBox(1, 1, 1));
                }

                // Verify each Three.js mesh is unique
                const threeMeshes = objects.map((obj) => obj.threeMesh);
                const uniqueMeshes = new Set(threeMeshes);
                expect(uniqueMeshes.size).toBe(numScenes);

                // Verify each Three.js mesh is only in its own scene
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].threeScene.children).toContain(objects[i].threeMesh);

                    for (let j = 0; j < scenes.length; j++) {
                        if (i !== j) {
                            expect(scenes[j].threeScene.children).not.toContain(
                                objects[i].threeMesh,
                            );
                        }
                    }
                }
            }),
            { numRuns: 30 },
        );
    });

    test('Object isolation persists after scene modifications', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 5 }),
                fc.array(fc.constantFrom('addBox', 'addSphere', 'removeFirst', 'clear'), {
                    minLength: 1,
                    maxLength: 5,
                }),
                (initialObjects, operations) => {
                    const sceneA = createTestScene('scene-persist-a');
                    const sceneB = createTestScene('scene-persist-b');

                    // Add initial objects to both scenes
                    const objectsA = [];
                    const objectsB = [];

                    for (let i = 0; i < initialObjects; i++) {
                        objectsA.push(sceneA.createBox(1, 1, 1));
                        objectsB.push(sceneB.createSphere(1, 16));
                    }

                    // Perform operations on scene A
                    for (const op of operations) {
                        switch (op) {
                            case 'addBox':
                                objectsA.push(sceneA.createBox(1, 1, 1));
                                break;
                            case 'addSphere':
                                objectsA.push(sceneA.createSphere(1, 16));
                                break;
                            case 'removeFirst':
                                if (objectsA.length > 0) {
                                    sceneA.remove(objectsA[0].id);
                                    objectsA.shift();
                                }
                                break;
                            case 'clear':
                                sceneA.clear();
                                objectsA.length = 0;
                                break;
                        }
                    }

                    // Verify scene B still has exactly the initial objects
                    expect(sceneB.objects.size).toBe(initialObjects);
                    for (const obj of objectsB) {
                        expect(sceneB.find(obj.id)).toBe(obj);
                    }

                    // Verify none of scene A's objects are in scene B
                    for (const obj of objectsA) {
                        expect(sceneB.find(obj.id)).toBeNull();
                    }
                },
            ),
            { numRuns: 50 },
        );
    });
});
