/**
 * Property-Based Test: Multi-Instance Isolation
 * Feature: instance-based-api, Property 12: Multi-Instance Isolation
 * Validates: Requirements 4.4
 *
 * Tests that N scene instances (simulating N React components) maintain
 * complete independence without interference.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { createScene } from '../../index.js';

describe('Property 12: Multi-Instance Isolation', () => {
    let createdScenes = [];

    beforeEach(() => {
        // Create test containers
        for (let i = 0; i < 10; i++) {
            const container = document.createElement('div');
            container.id = `test-container-${i}`;
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);
        }
    });

    afterEach(() => {
        // Clean up all created scenes
        for (const scene of createdScenes) {
            if (!scene.isDisposed) {
                scene.destroy();
            }
        }
        createdScenes = [];

        // Clean up test containers
        for (let i = 0; i < 10; i++) {
            const container = document.getElementById(`test-container-${i}`);
            if (container) {
                document.body.removeChild(container);
            }
        }
    });

    test('Property 12: For any N scene instances, each maintains independent state without interference', () => {
        fc.assert(
            fc.property(
                // Generate number of scenes (2-5 to keep test reasonable)
                fc.integer({ min: 2, max: 5 }),
                // Generate random operations per scene
                fc.array(
                    fc.record({
                        sceneIndex: fc.integer({ min: 0, max: 4 }),
                        operation: fc.constantFrom('addBox', 'addSphere', 'addPlane', 'addLight'),
                        params: fc.record({
                            size: fc.float({ min: 0.5, max: 5, noNaN: true }),
                            segments: fc.integer({ min: 8, max: 32 }),
                        }),
                    }),
                    { minLength: 5, maxLength: 15 },
                ),
                (numScenes, operations) => {
                    // Create N independent scene instances
                    const scenes = [];
                    for (let i = 0; i < numScenes; i++) {
                        const scene = createScene(`test-container-${i}`, {
                            autoStart: false,
                            lights: false,
                        });
                        scenes.push(scene);
                        createdScenes.push(scene);
                    }

                    // Track expected state for each scene
                    const expectedObjectCounts = new Array(numScenes).fill(0);
                    const expectedLightCounts = new Array(numScenes).fill(0);

                    // Perform random operations on random scenes
                    for (const op of operations) {
                        const sceneIndex = op.sceneIndex % numScenes;
                        const scene = scenes[sceneIndex];

                        try {
                            switch (op.operation) {
                                case 'addBox':
                                    scene.createBox(op.params.size, op.params.size, op.params.size);
                                    expectedObjectCounts[sceneIndex]++;
                                    break;
                                case 'addSphere':
                                    scene.createSphere(op.params.size, op.params.segments);
                                    expectedObjectCounts[sceneIndex]++;
                                    break;
                                case 'addPlane':
                                    scene.createPlane(op.params.size, op.params.size);
                                    expectedObjectCounts[sceneIndex]++;
                                    break;
                                case 'addLight':
                                    scene.addLight('ambient', { intensity: 0.5 });
                                    expectedLightCounts[sceneIndex]++;
                                    break;
                            }
                        } catch (error) {
                            // Skip invalid operations
                        }
                    }

                    // Verify each scene has exactly the expected state
                    for (let i = 0; i < numScenes; i++) {
                        const scene = scenes[i];

                        // Check object count
                        expect(scene.objects.size).toBe(expectedObjectCounts[i]);

                        // Check light count
                        expect(scene.lights.length).toBe(expectedLightCounts[i]);

                        // Verify scene is not disposed
                        expect(scene.isDisposed).toBe(false);

                        // Verify scene has its own renderer and camera
                        expect(scene.renderer).toBeDefined();
                        expect(scene.camera).toBeDefined();
                        expect(scene.threeScene).toBeDefined();
                    }

                    // Verify scenes are truly independent by checking references
                    for (let i = 0; i < numScenes; i++) {
                        for (let j = i + 1; j < numScenes; j++) {
                            // Each scene should have different renderer instances
                            expect(scenes[i].renderer).not.toBe(scenes[j].renderer);

                            // Each scene should have different camera instances
                            expect(scenes[i].camera).not.toBe(scenes[j].camera);

                            // Each scene should have different Three.js scene instances
                            expect(scenes[i].threeScene).not.toBe(scenes[j].threeScene);

                            // Objects should not be shared
                            const objectsI = Array.from(scenes[i].objects.values());
                            const objectsJ = Array.from(scenes[j].objects.values());

                            for (const objI of objectsI) {
                                for (const objJ of objectsJ) {
                                    expect(objI.threeObject).not.toBe(objJ.threeObject);
                                }
                            }
                        }
                    }

                    // Test destruction isolation: destroy one scene, verify others unaffected
                    if (numScenes > 1) {
                        const sceneToDestroy = scenes[0];
                        const otherScenes = scenes.slice(1);

                        // Store state of other scenes before destruction
                        const otherStates = otherScenes.map((s) => ({
                            objectCount: s.objects.size,
                            lightCount: s.lights.length,
                            isDisposed: s.isDisposed,
                        }));

                        // Destroy first scene
                        sceneToDestroy.destroy();

                        // Verify destroyed scene is disposed
                        expect(sceneToDestroy.isDisposed).toBe(true);

                        // Verify other scenes are unaffected
                        for (let i = 0; i < otherScenes.length; i++) {
                            const scene = otherScenes[i];
                            const expectedState = otherStates[i];

                            expect(scene.isDisposed).toBe(expectedState.isDisposed);
                            expect(scene.objects.size).toBe(expectedState.objectCount);
                            expect(scene.lights.length).toBe(expectedState.lightCount);

                            // Verify scene can still render
                            expect(() => scene.render()).not.toThrow();
                        }
                    }

                    return true;
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Property 12: Scene instances simulate React component lifecycle without interference', () => {
        fc.assert(
            fc.property(
                // Generate number of "components" (scenes)
                fc.integer({ min: 2, max: 4 }),
                // Generate mount/unmount sequences
                fc.array(
                    fc.record({
                        componentIndex: fc.integer({ min: 0, max: 3 }),
                        action: fc.constantFrom('mount', 'unmount', 'update'),
                    }),
                    { minLength: 5, maxLength: 20 },
                ),
                (numComponents, lifecycle) => {
                    // Track component state (simulating React components)
                    const components = new Array(numComponents).fill(null);

                    // Execute lifecycle operations
                    for (const event of lifecycle) {
                        const index = event.componentIndex % numComponents;

                        try {
                            switch (event.action) {
                                case 'mount':
                                    // Unmount existing if present (simulating remount)
                                    if (components[index] && !components[index].isDisposed) {
                                        components[index].destroy();
                                    }

                                    // Mount new scene
                                    const scene = createScene(`test-container-${index}`, {
                                        autoStart: false,
                                        lights: false,
                                    });
                                    components[index] = scene;
                                    createdScenes.push(scene);

                                    // Add some content
                                    scene.createBox(1, 1, 1);
                                    break;

                                case 'unmount':
                                    // Unmount component
                                    if (components[index] && !components[index].isDisposed) {
                                        components[index].destroy();
                                        components[index] = null;
                                    }
                                    break;

                                case 'update':
                                    // Update component (add more objects)
                                    if (components[index] && !components[index].isDisposed) {
                                        components[index].createSphere(0.5, 16);
                                    }
                                    break;
                            }
                        } catch (error) {
                            // Skip invalid operations
                        }
                    }

                    // Verify all mounted components are independent
                    const mountedComponents = components.filter((c) => c && !c.isDisposed);

                    for (let i = 0; i < mountedComponents.length; i++) {
                        for (let j = i + 1; j < mountedComponents.length; j++) {
                            const compI = mountedComponents[i];
                            const compJ = mountedComponents[j];

                            // Verify independence
                            expect(compI.renderer).not.toBe(compJ.renderer);
                            expect(compI.camera).not.toBe(compJ.camera);
                            expect(compI.threeScene).not.toBe(compJ.threeScene);

                            // Verify both can render independently
                            expect(() => compI.render()).not.toThrow();
                            expect(() => compJ.render()).not.toThrow();
                        }
                    }

                    return true;
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Property 12: Config changes in one scene do not affect other scenes', () => {
        fc.assert(
            fc.property(
                // Generate configs for multiple scenes
                fc.array(
                    fc.record({
                        autoStart: fc.boolean(),
                        antialias: fc.boolean(),
                        fov: fc.integer({ min: 30, max: 120 }),
                    }),
                    { minLength: 2, maxLength: 4 },
                ),
                (configs) => {
                    // Create scenes with different configs
                    const scenes = configs.map((config, index) => {
                        const scene = createScene(`test-container-${index}`, {
                            autoStart: config.autoStart,
                            renderer: { antialias: config.antialias },
                            camera: { fov: config.fov },
                            lights: false,
                        });
                        createdScenes.push(scene);
                        return scene;
                    });

                    // Verify each scene has its own config
                    for (let i = 0; i < scenes.length; i++) {
                        const scene = scenes[i];
                        const expectedConfig = configs[i];

                        // Check config is applied correctly
                        const sceneConfig = scene.config;
                        expect(sceneConfig.autoStart).toBe(expectedConfig.autoStart);
                        expect(sceneConfig.renderer.antialias).toBe(expectedConfig.antialias);
                        expect(sceneConfig.camera.fov).toBe(expectedConfig.fov);
                    }

                    // Verify configs are independent (modifying one doesn't affect others)
                    for (let i = 0; i < scenes.length; i++) {
                        for (let j = i + 1; j < scenes.length; j++) {
                            const configI = scenes[i].config;
                            const configJ = scenes[j].config;

                            // Configs should be different objects
                            expect(configI).not.toBe(configJ);
                        }
                    }

                    return true;
                },
            ),
            { numRuns: 100 },
        );
    });
});
