/**
 * Property-based tests for scene destruction isolation
 * **Feature: instance-based-api, Property 3: Scene Destruction Isolation**
 * **Validates: Requirements 1.3**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';

describe('Scene Destruction Isolation Property Tests', () => {
    let createdScenes = [];

    beforeEach(() => {
        createdScenes = [];
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
        document.body.innerHTML = '';
    });

    /**
     * Property 3: Scene Destruction Isolation
     * For any set of scene instances, destroying one scene should not affect
     * the functionality of other scene instances (they should continue rendering,
     * accepting objects, etc.).
     */
    test('**Feature: instance-based-api, Property 3: Scene Destruction Isolation**', () => {
        fc.assert(
            fc.property(
                // Generate number of scenes to create (2-5)
                fc.integer({ min: 2, max: 5 }),
                // Generate which scene to destroy (index)
                fc.integer({ min: 0, max: 4 }),
                (numScenes, destroyIndex) => {
                    // Ensure destroyIndex is within bounds
                    const actualDestroyIndex = destroyIndex % numScenes;

                    // Create multiple scenes
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        const containerId = `container-${i}`;
                        const container = document.createElement('div');
                        container.id = containerId;
                        container.style.width = '800px';
                        container.style.height = '600px';
                        document.body.appendChild(container);

                        const scene = new SceneInstance(containerId, {
                            autoStart: false,
                        });
                        scenes.push(scene);
                        createdScenes.push(scene);

                        // Add some objects to each scene
                        scene.createBox(1, 1, 1);
                        scene.createSphere(0.5, 16);
                    }

                    // Verify all scenes are working before destruction
                    for (const scene of scenes) {
                        expect(scene.isDisposed).toBe(false);
                        expect(scene.objects.size).toBe(2);
                    }

                    // Destroy one scene
                    const sceneToDestroy = scenes[actualDestroyIndex];
                    sceneToDestroy.destroy();

                    // Verify the destroyed scene is disposed
                    expect(sceneToDestroy.isDisposed).toBe(true);

                    // Verify other scenes are still functional
                    for (let i = 0; i < scenes.length; i++) {
                        if (i === actualDestroyIndex) {
                            continue; // Skip the destroyed scene
                        }

                        const scene = scenes[i];

                        // Scene should not be disposed
                        expect(scene.isDisposed).toBe(false);

                        // Scene should still have its objects
                        expect(scene.objects.size).toBe(2);

                        // Scene should still accept new objects
                        const newBox = scene.createBox(2, 2, 2);
                        expect(newBox).toBeDefined();
                        expect(scene.objects.size).toBe(3);

                        // Scene should still be able to render
                        expect(() => {
                            scene.render();
                        }).not.toThrow();

                        // Scene should still be able to add lights
                        const light = scene.addLight('ambient', { intensity: 0.5 });
                        expect(light).toBeDefined();
                        expect(scene.lights.length).toBeGreaterThan(0);

                        // Scene should still have valid renderer and camera
                        expect(scene.renderer).toBeDefined();
                        expect(scene.camera).toBeDefined();
                        expect(scene.threeScene).toBeDefined();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Destroying multiple scenes in sequence maintains isolation', () => {
        fc.assert(
            fc.property(fc.integer({ min: 3, max: 5 }), (numScenes) => {
                // Create multiple scenes
                const scenes = [];
                for (let i = 0; i < numScenes; i++) {
                    const containerId = `container-${i}`;
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    const scene = new SceneInstance(containerId, {
                        autoStart: false,
                    });
                    scenes.push(scene);
                    createdScenes.push(scene);
                }

                // Destroy scenes one by one (except the last one)
                for (let i = 0; i < numScenes - 1; i++) {
                    scenes[i].destroy();

                    // Verify destroyed scene is disposed
                    expect(scenes[i].isDisposed).toBe(true);

                    // Verify remaining scenes are still functional
                    for (let j = i + 1; j < numScenes; j++) {
                        expect(scenes[j].isDisposed).toBe(false);
                        expect(() => {
                            scenes[j].render();
                        }).not.toThrow();
                    }
                }

                // Last scene should still be functional
                const lastScene = scenes[numScenes - 1];
                expect(lastScene.isDisposed).toBe(false);
                expect(() => {
                    lastScene.createBox(1, 1, 1);
                }).not.toThrow();
            }),
            { numRuns: 50 },
        );
    });

    test('Destroyed scene operations throw appropriate errors', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                (containerId) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create and destroy scene
                    const scene = new SceneInstance(containerId, { autoStart: false });
                    createdScenes.push(scene);
                    scene.destroy();

                    // Verify scene is disposed
                    expect(scene.isDisposed).toBe(true);

                    // Verify operations throw errors
                    expect(() => scene.createBox(1, 1, 1)).toThrow();
                    expect(() => scene.createSphere(1, 16)).toThrow();
                    expect(() => scene.createPlane(1, 1)).toThrow();
                    expect(() => scene.addLight('ambient', {})).toThrow();
                    expect(() => scene.render()).toThrow();
                    expect(() => scene.startRenderLoop()).toThrow();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Scene destruction is idempotent', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                fc.integer({ min: 1, max: 5 }),
                (containerId, numDestroys) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene
                    const scene = new SceneInstance(containerId, { autoStart: false });
                    createdScenes.push(scene);

                    // Destroy multiple times
                    for (let i = 0; i < numDestroys; i++) {
                        expect(() => {
                            scene.destroy();
                        }).not.toThrow();
                    }

                    // Scene should still be disposed
                    expect(scene.isDisposed).toBe(true);
                },
            ),
            { numRuns: 50 },
        );
    });
});
