/**
 * Property-based tests for scene independence
 * **Feature: instance-based-api, Property 2: Multiple Scene Independence**
 * **Validates: Requirements 1.2**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';
import * as THREE from 'three';

describe('Scene Independence Property Tests', () => {
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
     * Helper to capture scene state
     */
    function captureSceneState(scene) {
        return {
            objectCount: scene.objects.size,
            lightCount: scene.lights.length,
            isRendering: scene.isRendering,
            isDisposed: scene.isDisposed,
            objectIds: Array.from(scene.objects.keys()),
            threeSceneChildrenCount: scene.threeScene.children.length,
        };
    }

    /**
     * Helper to compare scene states
     */
    function statesAreEqual(state1, state2) {
        return (
            state1.objectCount === state2.objectCount &&
            state1.lightCount === state2.lightCount &&
            state1.isRendering === state2.isRendering &&
            state1.isDisposed === state2.isDisposed &&
            state1.threeSceneChildrenCount === state2.threeSceneChildrenCount &&
            state1.objectIds.length === state2.objectIds.length &&
            state1.objectIds.every((id, idx) => id === state2.objectIds[idx])
        );
    }

    /**
     * Property 2: Multiple Scene Independence
     * For any set of N scene instances, modifying the state of one scene (adding objects,
     * changing config, etc.) should not affect the state of any other scene instance.
     */
    test('**Feature: instance-based-api, Property 2: Multiple Scene Independence**', () => {
        fc.assert(
            fc.property(
                // Generate number of scenes to create
                fc.integer({ min: 2, max: 5 }),
                // Generate which scene to modify
                fc.integer({ min: 0, max: 4 }),
                // Generate modification type
                fc.constantFrom(
                    'addBox',
                    'addSphere',
                    'addPlane',
                    'addLight',
                    'startRender',
                    'stopRender',
                ),
                (numScenes, sceneToModifyIndex, modificationType) => {
                    // Ensure sceneToModifyIndex is within bounds
                    const modifyIndex = sceneToModifyIndex % numScenes;

                    // Create N scenes
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        const scene = createTestScene(`scene-independence-${i}`);
                        scenes.push(scene);
                    }

                    // Capture initial state of all scenes
                    const initialStates = scenes.map(captureSceneState);

                    // Modify one scene
                    const sceneToModify = scenes[modifyIndex];

                    // Track if modification should cause state change
                    let shouldChangeState = true;

                    switch (modificationType) {
                        case 'addBox':
                            sceneToModify.createBox(1, 2, 3);
                            break;
                        case 'addSphere':
                            sceneToModify.createSphere(1.5, 16);
                            break;
                        case 'addPlane':
                            sceneToModify.createPlane(2, 2);
                            break;
                        case 'addLight':
                            sceneToModify.addLight('point', { x: 0, y: 5, z: 0 });
                            break;
                        case 'startRender':
                            // Only changes state if not already rendering
                            if (!sceneToModify.isRendering) {
                                sceneToModify.startRenderLoop();
                            } else {
                                shouldChangeState = false;
                            }
                            break;
                        case 'stopRender':
                            // Only changes state if currently rendering
                            if (sceneToModify.isRendering) {
                                sceneToModify.stopRenderLoop();
                            } else {
                                shouldChangeState = false;
                            }
                            break;
                    }

                    // Capture state after modification
                    const afterStates = scenes.map(captureSceneState);

                    // Verify that ONLY the modified scene changed (if it should have)
                    for (let i = 0; i < scenes.length; i++) {
                        if (i === modifyIndex && shouldChangeState) {
                            // Modified scene should have changed
                            expect(statesAreEqual(initialStates[i], afterStates[i])).toBe(false);
                        } else {
                            // Other scenes should remain unchanged
                            expect(statesAreEqual(initialStates[i], afterStates[i])).toBe(true);
                        }
                    }

                    // Verify each scene still has its own unique instances
                    for (let i = 0; i < scenes.length; i++) {
                        for (let j = i + 1; j < scenes.length; j++) {
                            expect(scenes[i].threeScene).not.toBe(scenes[j].threeScene);
                            expect(scenes[i].renderer).not.toBe(scenes[j].renderer);
                            expect(scenes[i].camera).not.toBe(scenes[j].camera);
                        }
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Adding objects to one scene does not affect other scenes', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 4 }),
                fc.integer({ min: 1, max: 5 }),
                (numScenes, numObjects) => {
                    // Create multiple scenes
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        scenes.push(createTestScene(`scene-objects-${i}`));
                    }

                    // Add objects to first scene only
                    for (let i = 0; i < numObjects; i++) {
                        scenes[0].createBox(1, 1, 1);
                    }

                    // Verify first scene has objects
                    expect(scenes[0].objects.size).toBe(numObjects);

                    // Verify other scenes are empty
                    for (let i = 1; i < scenes.length; i++) {
                        expect(scenes[i].objects.size).toBe(0);
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Adding lights to one scene does not affect other scenes', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 4 }),
                fc.constantFrom('sun', 'ambient', 'point', 'spot', 'hemisphere'),
                (numScenes, lightType) => {
                    // Create multiple scenes with no default lights
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        scenes.push(createTestScene(`scene-lights-${i}`, { lights: false }));
                    }

                    // Verify all scenes start with no lights
                    for (const scene of scenes) {
                        expect(scene.lights.length).toBe(0);
                    }

                    // Add light to first scene only
                    scenes[0].addLight(lightType);

                    // Verify first scene has one light
                    expect(scenes[0].lights.length).toBe(1);

                    // Verify other scenes still have no lights
                    for (let i = 1; i < scenes.length; i++) {
                        expect(scenes[i].lights.length).toBe(0);
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Starting render loop on one scene does not affect other scenes', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 4 }), (numScenes) => {
                // Create multiple scenes with autoStart: false
                const scenes = [];
                for (let i = 0; i < numScenes; i++) {
                    scenes.push(createTestScene(`scene-render-${i}`, { autoStart: false }));
                }

                // Verify all scenes are not rendering
                for (const scene of scenes) {
                    expect(scene.isRendering).toBe(false);
                }

                // Start render loop on first scene only
                scenes[0].startRenderLoop();

                // Verify first scene is rendering
                expect(scenes[0].isRendering).toBe(true);

                // Verify other scenes are still not rendering
                for (let i = 1; i < scenes.length; i++) {
                    expect(scenes[i].isRendering).toBe(false);
                }
            }),
            { numRuns: 30 },
        );
    });

    test('Clearing one scene does not affect other scenes', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 4 }), (numScenes) => {
                // Create multiple scenes
                const scenes = [];
                for (let i = 0; i < numScenes; i++) {
                    scenes.push(createTestScene(`scene-clear-${i}`));
                }

                // Add objects to all scenes
                for (const scene of scenes) {
                    scene.createBox(1, 1, 1);
                    scene.createSphere(1, 16);
                }

                // Verify all scenes have objects
                for (const scene of scenes) {
                    expect(scene.objects.size).toBe(2);
                }

                // Clear first scene only
                scenes[0].clear();

                // Verify first scene is empty
                expect(scenes[0].objects.size).toBe(0);

                // Verify other scenes still have objects
                for (let i = 1; i < scenes.length; i++) {
                    expect(scenes[i].objects.size).toBe(2);
                }
            }),
            { numRuns: 30 },
        );
    });

    test('Scene instances have isolated state - no shared static variables', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 5 }),
                fc.array(fc.constantFrom('box', 'sphere', 'plane'), { minLength: 1, maxLength: 5 }),
                (numScenes, objectTypes) => {
                    // Create multiple scenes
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        scenes.push(createTestScene(`scene-isolated-${i}`));
                    }

                    // Add different objects to each scene
                    for (let i = 0; i < scenes.length; i++) {
                        const objectType = objectTypes[i % objectTypes.length];
                        if (objectType === 'box') {
                            scenes[i].createBox(i + 1, i + 1, i + 1);
                        } else if (objectType === 'sphere') {
                            scenes[i].createSphere(i + 1, 16);
                        } else {
                            scenes[i].createPlane(i + 1, i + 1);
                        }
                    }

                    // Verify each scene has exactly one object
                    for (const scene of scenes) {
                        expect(scene.objects.size).toBe(1);
                    }

                    // Verify scenes have different Three.js scene instances
                    for (let i = 0; i < scenes.length; i++) {
                        for (let j = i + 1; j < scenes.length; j++) {
                            expect(scenes[i].threeScene).not.toBe(scenes[j].threeScene);
                            expect(scenes[i].threeScene.children).not.toBe(
                                scenes[j].threeScene.children,
                            );
                        }
                    }

                    // Verify each scene's objects are in their own Three.js scene
                    for (const scene of scenes) {
                        const sceneObjects = Array.from(scene.objects.values());
                        for (const objData of sceneObjects) {
                            expect(scene.threeScene.children).toContain(objData.threeObject);

                            // Verify object is NOT in other scenes
                            for (const otherScene of scenes) {
                                if (otherScene !== scene) {
                                    expect(otherScene.threeScene.children).not.toContain(
                                        objData.threeObject,
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

    test('Each scene manages its own renderer independently', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 4 }), (numScenes) => {
                // Create multiple scenes
                const scenes = [];
                for (let i = 0; i < numScenes; i++) {
                    scenes.push(createTestScene(`scene-renderer-${i}`));
                }

                // Verify each scene has its own renderer
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].renderer).toBeDefined();

                    // Verify renderer is unique
                    for (let j = i + 1; j < scenes.length; j++) {
                        expect(scenes[i].renderer).not.toBe(scenes[j].renderer);
                    }
                }

                // Verify each renderer has its own canvas
                const canvases = scenes.map((scene) => scene.renderer.canvas);
                const uniqueCanvases = new Set(canvases);
                expect(uniqueCanvases.size).toBe(numScenes);
            }),
            { numRuns: 30 },
        );
    });

    test('Each scene manages its own camera independently', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 4 }),
                fc.array(fc.constantFrom('perspective', 'orthographic'), {
                    minLength: 2,
                    maxLength: 4,
                }),
                (numScenes, cameraTypes) => {
                    // Create multiple scenes with different camera types
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        const cameraType = cameraTypes[i % cameraTypes.length];
                        scenes.push(
                            createTestScene(`scene-camera-${i}`, {
                                camera: { type: cameraType },
                            }),
                        );
                    }

                    // Verify each scene has its own camera
                    for (let i = 0; i < scenes.length; i++) {
                        expect(scenes[i].camera).toBeDefined();

                        // Verify camera is unique
                        for (let j = i + 1; j < scenes.length; j++) {
                            expect(scenes[i].camera).not.toBe(scenes[j].camera);
                            expect(scenes[i].camera.threeCamera).not.toBe(
                                scenes[j].camera.threeCamera,
                            );
                        }
                    }
                },
            ),
            { numRuns: 30 },
        );
    });

    test('Each scene manages its own lights independently', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 4 }), (numScenes) => {
                // Create multiple scenes with no default lights
                const scenes = [];
                for (let i = 0; i < numScenes; i++) {
                    scenes.push(createTestScene(`scene-lights-mgmt-${i}`, { lights: false }));
                }

                // Add different numbers of lights to each scene
                for (let i = 0; i < scenes.length; i++) {
                    for (let j = 0; j <= i; j++) {
                        scenes[i].addLight('ambient');
                    }
                }

                // Verify each scene has the correct number of lights
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].lights.length).toBe(i + 1);
                }

                // Verify lights are not shared between scenes
                for (let i = 0; i < scenes.length; i++) {
                    const lightsI = scenes[i].lights;
                    for (let j = i + 1; j < scenes.length; j++) {
                        const lightsJ = scenes[j].lights;
                        for (const lightI of lightsI) {
                            expect(lightsJ).not.toContain(lightI);
                        }
                    }
                }
            }),
            { numRuns: 30 },
        );
    });
});
