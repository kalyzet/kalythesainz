/**
 * Property-based tests for memory safety
 * **Feature: instance-based-api, Property 13: Create-Destroy Memory Safety**
 * **Validates: Requirements 4.5, 10.4**
 */

import { createScene } from '../../index.js';
import { EventBus } from '../../core/EventBus.js';

// Simple property-based testing utilities
const fc = {
    assert: (property, options = {}) => {
        const numRuns = options.numRuns || 100;
        console.log(`Running property test with ${numRuns} iterations...`);

        for (let i = 0; i < numRuns; i++) {
            try {
                property.run();
            } catch (error) {
                throw new Error(`Property failed on run ${i + 1}: ${error.message}`);
            }
        }
        console.log(`✓ Property test passed all ${numRuns} iterations`);
    },
    property: (...args) => {
        const generators = args.slice(0, -1);
        const testFn = args[args.length - 1];

        return {
            run: () => {
                const values = generators.map((gen) => gen.generate());
                testFn(...values);
            },
        };
    },
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    }),
    boolean: () => ({
        generate: () => Math.random() < 0.5,
    }),
    record: (schema) => ({
        generate: () => {
            const result = {};
            for (const [key, generator] of Object.entries(schema)) {
                result[key] = generator.generate();
            }
            return result;
        },
    }),
};

describe('Memory Safety Property Tests', () => {
    let testContainer;

    beforeEach(() => {
        // Create test container
        testContainer = document.createElement('div');
        testContainer.id = 'test-container-memory';
        testContainer.style.width = '800px';
        testContainer.style.height = '600px';
        document.body.appendChild(testContainer);

        // Clear EventBus
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up test container
        if (testContainer && testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }
        testContainer = null;

        // Clear EventBus
        EventBus.clear();
    });

    /**
     * Property 13: Create-Destroy Memory Safety
     * For any sequence of scene creation and destruction operations,
     * the system should not leak memory or DOM elements
     */
    test('**Feature: instance-based-api, Property 13: Create-Destroy Memory Safety**', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 5, max: 20 }), // Number of create-destroy cycles
                fc.integer({ min: 0, max: 5 }), // Number of objects to add per scene
                fc.boolean(), // Whether to start render loop
                (numCycles, numObjects, startRenderLoop) => {
                    // Count initial DOM nodes
                    const initialCanvasCount = document.querySelectorAll('canvas').length;
                    const initialDivCount = document.querySelectorAll('div').length;

                    // Track created scenes for verification
                    const createdSceneIds = [];

                    // Perform multiple create-destroy cycles
                    for (let cycle = 0; cycle < numCycles; cycle++) {
                        // Create scene
                        const scene = createScene('test-container-memory', {
                            autoStart: startRenderLoop,
                        });

                        createdSceneIds.push(scene);

                        // Verify scene was created
                        if (!scene) {
                            throw new Error(`Scene not created in cycle ${cycle}`);
                        }

                        if (scene.isDisposed) {
                            throw new Error(`Scene already disposed in cycle ${cycle}`);
                        }

                        // Add objects to scene
                        for (let i = 0; i < numObjects; i++) {
                            const objectType = Math.floor(Math.random() * 3);
                            switch (objectType) {
                                case 0:
                                    scene.createBox(
                                        Math.random() * 2 + 0.5,
                                        Math.random() * 2 + 0.5,
                                        Math.random() * 2 + 0.5,
                                    );
                                    break;
                                case 1:
                                    scene.createSphere(Math.random() * 2 + 0.5, 16);
                                    break;
                                case 2:
                                    scene.createPlane(
                                        Math.random() * 2 + 0.5,
                                        Math.random() * 2 + 0.5,
                                    );
                                    break;
                            }
                        }

                        // Add lights
                        const numLights = Math.floor(Math.random() * 3);
                        for (let i = 0; i < numLights; i++) {
                            const lightType = Math.floor(Math.random() * 3);
                            switch (lightType) {
                                case 0:
                                    scene.addLight('sun', { intensity: 0.8 });
                                    break;
                                case 1:
                                    scene.addLight('ambient', { intensity: 0.3 });
                                    break;
                                case 2:
                                    scene.addLight('point', { x: 0, y: 5, z: 0, intensity: 0.5 });
                                    break;
                            }
                        }

                        // Subscribe to some events
                        const unsubscribers = [];
                        unsubscribers.push(scene.on('object:added', () => {}));
                        unsubscribers.push(scene.on('frame:rendered', () => {}));
                        unsubscribers.push(scene.onGlobal('test:event', () => {}));

                        // Verify scene is functional
                        if (scene.objects.size !== numObjects) {
                            throw new Error(
                                `Expected ${numObjects} objects, got ${scene.objects.size}`,
                            );
                        }

                        // Destroy scene
                        scene.destroy();

                        // Verify scene is disposed
                        if (!scene.isDisposed) {
                            throw new Error(`Scene not disposed after destroy() in cycle ${cycle}`);
                        }

                        // Verify canvas was removed from DOM
                        const canvasInContainer = testContainer.querySelectorAll('canvas');
                        if (canvasInContainer.length > 0) {
                            throw new Error(
                                `Canvas not removed from DOM after destroy() in cycle ${cycle}`,
                            );
                        }

                        // Verify render loop was stopped
                        if (scene.isRendering) {
                            throw new Error(
                                `Render loop still running after destroy() in cycle ${cycle}`,
                            );
                        }

                        // Verify objects were cleared
                        if (scene.objects.size !== 0) {
                            throw new Error(
                                `Objects not cleared after destroy() in cycle ${cycle}`,
                            );
                        }

                        // Verify lights were cleared
                        if (scene.lights.length !== 0) {
                            throw new Error(`Lights not cleared after destroy() in cycle ${cycle}`);
                        }
                    }

                    // After all cycles, verify DOM node count hasn't grown
                    const finalCanvasCount = document.querySelectorAll('canvas').length;
                    const finalDivCount = document.querySelectorAll('div').length;

                    // Canvas count should be back to initial (or very close)
                    if (finalCanvasCount > initialCanvasCount) {
                        throw new Error(
                            `Canvas leak detected: started with ${initialCanvasCount}, ended with ${finalCanvasCount}`,
                        );
                    }

                    // Div count should not have grown significantly
                    // Allow some tolerance for test infrastructure
                    const divGrowth = finalDivCount - initialDivCount;
                    if (divGrowth > 5) {
                        throw new Error(
                            `Potential div leak detected: started with ${initialDivCount}, ended with ${finalDivCount} (growth: ${divGrowth})`,
                        );
                    }

                    // Verify all scenes are disposed
                    for (let i = 0; i < createdSceneIds.length; i++) {
                        const scene = createdSceneIds[i];
                        if (!scene.isDisposed) {
                            throw new Error(`Scene ${i} not disposed after test`);
                        }
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Memory safety with event listeners', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 3, max: 10 }), // Number of cycles
                fc.integer({ min: 1, max: 10 }), // Number of event listeners per scene
                (numCycles, numListeners) => {
                    const initialCanvasCount = document.querySelectorAll('canvas').length;

                    for (let cycle = 0; cycle < numCycles; cycle++) {
                        const scene = createScene('test-container-memory', {
                            autoStart: false,
                        });

                        // Add multiple event listeners
                        const unsubscribers = [];
                        for (let i = 0; i < numListeners; i++) {
                            unsubscribers.push(
                                scene.on('object:added', () => {
                                    // Event handler
                                }),
                            );
                            unsubscribers.push(
                                scene.on('frame:rendered', () => {
                                    // Event handler
                                }),
                            );
                            unsubscribers.push(
                                scene.onGlobal('test:event', () => {
                                    // Event handler
                                }),
                            );
                        }

                        // Emit some events
                        scene.emit('object:added', { test: true });
                        scene.emit('frame:rendered', { test: true });

                        // Destroy scene (should auto-unsubscribe all listeners)
                        scene.destroy();

                        // Verify scene is disposed
                        if (!scene.isDisposed) {
                            throw new Error('Scene not disposed after destroy()');
                        }

                        // Try to emit events after destruction (should not crash)
                        try {
                            scene.emit('object:added', { test: true });
                        } catch (error) {
                            // Expected - may throw error for disposed scene
                        }
                    }

                    // Verify no canvas leak
                    const finalCanvasCount = document.querySelectorAll('canvas').length;
                    if (finalCanvasCount > initialCanvasCount) {
                        throw new Error(
                            `Canvas leak with event listeners: ${initialCanvasCount} -> ${finalCanvasCount}`,
                        );
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Memory safety with rapid create-destroy cycles', () => {
        fc.assert(
            fc.property(fc.integer({ min: 10, max: 50 }), (numRapidCycles) => {
                const initialCanvasCount = document.querySelectorAll('canvas').length;
                const scenes = [];

                // Rapidly create scenes
                for (let i = 0; i < numRapidCycles; i++) {
                    const scene = createScene('test-container-memory', {
                        autoStart: false,
                    });
                    scenes.push(scene);
                }

                // Verify all scenes were created
                if (scenes.length !== numRapidCycles) {
                    throw new Error(`Expected ${numRapidCycles} scenes, got ${scenes.length}`);
                }

                // Rapidly destroy scenes
                for (const scene of scenes) {
                    scene.destroy();
                }

                // Verify all scenes are disposed
                for (let i = 0; i < scenes.length; i++) {
                    if (!scenes[i].isDisposed) {
                        throw new Error(`Scene ${i} not disposed`);
                    }
                }

                // Verify no canvas leak
                const finalCanvasCount = document.querySelectorAll('canvas').length;
                if (finalCanvasCount > initialCanvasCount) {
                    throw new Error(
                        `Canvas leak in rapid cycles: ${initialCanvasCount} -> ${finalCanvasCount}`,
                    );
                }
            }),
            { numRuns: 20 },
        );
    });

    test('Memory safety with auto-sync enabled', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 3, max: 8 }), // Number of cycles
                fc.boolean(), // Whether to enable auto-sync
                (numCycles, enableAutoSync) => {
                    const initialCanvasCount = document.querySelectorAll('canvas').length;

                    for (let cycle = 0; cycle < numCycles; cycle++) {
                        const scene = createScene('test-container-memory', {
                            autoStart: false,
                        });

                        // Enable auto-sync if requested
                        if (enableAutoSync) {
                            scene.setAutoSync(true, 50);
                        }

                        // Add some objects
                        scene.createBox(1, 1, 1);
                        scene.createSphere(1, 16);

                        // Wait a bit if auto-sync is enabled
                        if (enableAutoSync) {
                            // Sync should be running
                        }

                        // Disable auto-sync before destroying
                        if (enableAutoSync) {
                            scene.setAutoSync(false);
                        }

                        // Destroy scene
                        scene.destroy();

                        // Verify scene is disposed
                        if (!scene.isDisposed) {
                            throw new Error('Scene not disposed after destroy()');
                        }
                    }

                    // Verify no canvas leak
                    const finalCanvasCount = document.querySelectorAll('canvas').length;
                    if (finalCanvasCount > initialCanvasCount) {
                        throw new Error(
                            `Canvas leak with auto-sync: ${initialCanvasCount} -> ${finalCanvasCount}`,
                        );
                    }
                },
            ),
            { numRuns: 30 },
        );
    });
});
