/**
 * Property-based tests for scene cleanup completeness
 * **Feature: instance-based-api, Property 11: Scene Cleanup Completeness**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';
import { EventBus } from '../../core/EventBus.js';

describe('Scene Cleanup Completeness Property Tests', () => {
    let createdScenes = [];
    let eventListeners = [];

    beforeEach(() => {
        createdScenes = [];
        eventListeners = [];
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

        // Clean up event listeners
        for (const { event, handler } of eventListeners) {
            EventBus.unsubscribe(event, handler);
        }
        eventListeners = [];

        document.body.innerHTML = '';
    });

    /**
     * Property 11: Scene Cleanup Completeness
     * For any scene instance, calling scene.destroy() should dispose of the renderer,
     * remove the canvas from DOM, cancel render loops, and emit a 'scene:destroyed' event.
     */
    test('**Feature: instance-based-api, Property 11: Scene Cleanup Completeness**', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                fc.record({
                    autoStart: fc.boolean(),
                    addObjects: fc.boolean(),
                    addLights: fc.boolean(),
                    startRenderLoop: fc.boolean(),
                }),
                (containerId, options) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene
                    const scene = new SceneInstance(containerId, {
                        autoStart: options.autoStart,
                    });
                    createdScenes.push(scene);

                    // Add objects if specified
                    if (options.addObjects) {
                        scene.createBox(1, 1, 1);
                        scene.createSphere(0.5, 16);
                        scene.createPlane(2, 2);
                    }

                    // Add lights if specified
                    if (options.addLights) {
                        scene.addLight('ambient', { intensity: 0.5 });
                        scene.addLight('sun', { intensity: 1.0 });
                    }

                    // Start render loop if specified and not auto-started
                    if (options.startRenderLoop && !options.autoStart) {
                        scene.startRenderLoop();
                    }

                    // Track canvas element before destruction
                    const canvas = scene.renderer.canvas;
                    expect(canvas).toBeDefined();

                    // Verify canvas is in the DOM (might be in container or elsewhere)
                    const canvasInDOM = document.body.contains(canvas);
                    expect(canvasInDOM).toBe(true);

                    // Track render loop state before destruction
                    const wasRendering = scene.isRendering;

                    // Set up event listener for scene:destroyed event
                    let destroyedEventEmitted = false;
                    const destroyedHandler = (event) => {
                        destroyedEventEmitted = true;
                    };
                    EventBus.subscribe('scene:destroyed', destroyedHandler);
                    eventListeners.push({ event: 'scene:destroyed', handler: destroyedHandler });

                    // Destroy the scene
                    scene.destroy();

                    // Verify isDisposed flag is set
                    expect(scene.isDisposed).toBe(true);

                    // Verify canvas is removed from DOM
                    expect(canvas.parentNode).toBeNull();
                    expect(document.body.contains(canvas)).toBe(false);

                    // Verify render loop is cancelled
                    expect(scene.isRendering).toBe(false);

                    // Verify scene:destroyed event was emitted
                    expect(destroyedEventEmitted).toBe(true);

                    // Verify renderer is disposed
                    expect(scene.renderer).toBeNull();

                    // Verify camera is disposed
                    expect(scene.camera).toBeNull();

                    // Verify threeScene is cleared
                    expect(scene.threeScene).toBeNull();

                    // Verify objects are cleared
                    expect(scene.objects.size).toBe(0);

                    // Verify lights are cleared
                    expect(scene.lights.length).toBe(0);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Cleanup completeness with active render loop', () => {
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

                    // Create scene with autoStart
                    const scene = new SceneInstance(containerId, {
                        autoStart: true,
                    });
                    createdScenes.push(scene);

                    // Verify render loop is running
                    expect(scene.isRendering).toBe(true);

                    // Track canvas
                    const canvas = scene.renderer.canvas;

                    // Destroy scene
                    scene.destroy();

                    // Verify render loop is stopped
                    expect(scene.isRendering).toBe(false);

                    // Verify canvas is removed
                    expect(canvas.parentNode).toBeNull();

                    // Verify scene is disposed
                    expect(scene.isDisposed).toBe(true);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Cleanup completeness with many objects and lights', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                fc.integer({ min: 5, max: 20 }),
                fc.integer({ min: 2, max: 5 }),
                (containerId, numObjects, numLights) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene
                    const scene = new SceneInstance(containerId, {
                        autoStart: false,
                    });
                    createdScenes.push(scene);

                    // Add many objects
                    for (let i = 0; i < numObjects; i++) {
                        if (i % 3 === 0) {
                            scene.createBox(1, 1, 1);
                        } else if (i % 3 === 1) {
                            scene.createSphere(0.5, 16);
                        } else {
                            scene.createPlane(1, 1);
                        }
                    }

                    // Add many lights
                    for (let i = 0; i < numLights; i++) {
                        if (i % 2 === 0) {
                            scene.addLight('ambient', { intensity: 0.5 });
                        } else {
                            scene.addLight('point', { x: i, y: i, z: i, intensity: 1.0 });
                        }
                    }

                    // Verify objects and lights were added
                    expect(scene.objects.size).toBe(numObjects);
                    expect(scene.lights.length).toBeGreaterThanOrEqual(numLights);

                    // Track canvas
                    const canvas = scene.renderer.canvas;

                    // Destroy scene
                    scene.destroy();

                    // Verify all resources are cleaned up
                    expect(scene.objects.size).toBe(0);
                    expect(scene.lights.length).toBe(0);
                    expect(canvas.parentNode).toBeNull();
                    expect(scene.isDisposed).toBe(true);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Scene:destroyed event contains correct data', () => {
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

                    // Create scene
                    const scene = new SceneInstance(containerId, {
                        autoStart: false,
                    });
                    createdScenes.push(scene);

                    // Set up event listener
                    let eventData = null;
                    const handler = (event) => {
                        eventData = event.data;
                    };
                    EventBus.subscribe('scene:destroyed', handler);
                    eventListeners.push({ event: 'scene:destroyed', handler });

                    // Destroy scene
                    const beforeDestroy = Date.now();
                    scene.destroy();
                    const afterDestroy = Date.now();

                    // Verify event was emitted with correct data
                    expect(eventData).not.toBeNull();
                    expect(eventData).toHaveProperty('timestamp');
                    expect(eventData.timestamp).toBeGreaterThanOrEqual(beforeDestroy);
                    expect(eventData.timestamp).toBeLessThanOrEqual(afterDestroy);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Multiple destroy calls do not cause errors', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                fc.integer({ min: 2, max: 5 }),
                (containerId, numDestroyCalls) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene
                    const scene = new SceneInstance(containerId, {
                        autoStart: false,
                    });
                    createdScenes.push(scene);

                    // Track canvas
                    const canvas = scene.renderer.canvas;

                    // Call destroy multiple times
                    for (let i = 0; i < numDestroyCalls; i++) {
                        expect(() => {
                            scene.destroy();
                        }).not.toThrow();
                    }

                    // Verify cleanup happened only once
                    expect(scene.isDisposed).toBe(true);
                    expect(canvas.parentNode).toBeNull();
                },
            ),
            { numRuns: 50 },
        );
    });
});
