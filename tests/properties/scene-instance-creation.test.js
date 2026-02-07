/**
 * Property-based tests for SceneInstance creation
 * **Feature: instance-based-api, Property 1: Scene Instance Creation Returns Valid Instance**
 * **Validates: Requirements 1.1, 1.4**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';

describe('SceneInstance Creation Property Tests', () => {
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
     * Property 1: Scene Instance Creation Returns Valid Instance
     * For any valid container ID and configuration object, calling createScene(containerId, config)
     * should return a SceneInstance object with renderer, camera, and threeScene initialized.
     */
    test('**Feature: instance-based-api, Property 1: Scene Instance Creation Returns Valid Instance**', () => {
        fc.assert(
            fc.property(
                // Generate random container IDs
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                // Generate random configs
                fc.record({
                    autoStart: fc.boolean(),
                    renderer: fc.option(
                        fc.record({
                            antialias: fc.boolean(),
                            alpha: fc.boolean(),
                        }),
                        { nil: undefined },
                    ),
                    camera: fc.option(
                        fc.record({
                            type: fc.constantFrom('perspective', 'orthographic'),
                            fov: fc.integer({ min: 30, max: 120 }),
                        }),
                        { nil: undefined },
                    ),
                    lights: fc.option(
                        fc.oneof(
                            fc.constant(false),
                            fc.record({
                                ambient: fc.record({
                                    intensity: fc.double({ min: 0, max: 2 }),
                                }),
                            }),
                        ),
                        { nil: undefined },
                    ),
                }),
                (containerId, config) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene instance
                    const scene = new SceneInstance(containerId, config);
                    createdScenes.push(scene);

                    // Verify scene has required properties initialized
                    expect(scene).toBeDefined();
                    expect(scene.threeScene).toBeDefined();
                    expect(scene.renderer).toBeDefined();
                    expect(scene.camera).toBeDefined();

                    // Verify threeScene is a Three.js Scene
                    expect(scene.threeScene).toHaveProperty('type');
                    expect(scene.threeScene.type).toBe('Scene');

                    // Verify renderer is initialized
                    expect(scene.renderer).toBeDefined();
                    expect(scene.renderer).toHaveProperty('canvas');
                    expect(scene.renderer).toHaveProperty('render');

                    // Verify camera is initialized
                    expect(scene.camera).toHaveProperty('threeCamera');
                    expect(scene.camera.threeCamera).toBeDefined();

                    // Verify scene is not disposed
                    expect(scene.isDisposed).toBe(false);

                    // Verify lights array exists
                    expect(Array.isArray(scene.lights)).toBe(true);

                    // Verify objects map exists
                    expect(scene.objects).toBeInstanceOf(Map);

                    // Verify render loop state matches autoStart config
                    if (config.autoStart === false) {
                        expect(scene.isRendering).toBe(false);
                    } else {
                        // Default is autoStart: true
                        expect(scene.isRendering).toBe(true);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('SceneInstance throws error for invalid container ID', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant(''),
                    fc.integer(),
                    fc.constant({}),
                    fc.constant([]),
                ),
                (invalidContainerId) => {
                    expect(() => {
                        new SceneInstance(invalidContainerId, {});
                    }).toThrow();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('SceneInstance handles missing DOM container gracefully', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }).map((s) => `nonexistent-${s}`),
                (containerId) => {
                    // Don't create the container in DOM
                    // The Renderer should handle this gracefully or throw a clear error
                    expect(() => {
                        const scene = new SceneInstance(containerId, {});
                        createdScenes.push(scene);
                    }).toThrow();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Multiple SceneInstance creations are independent', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 5 }), (numScenes) => {
                const scenes = [];

                // Create multiple scenes
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

                // Verify all scenes are independent
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].threeScene).toBeDefined();
                    expect(scenes[i].renderer).toBeDefined();
                    expect(scenes[i].camera).toBeDefined();

                    // Verify each scene has its own unique instances
                    for (let j = i + 1; j < scenes.length; j++) {
                        expect(scenes[i].threeScene).not.toBe(scenes[j].threeScene);
                        expect(scenes[i].renderer).not.toBe(scenes[j].renderer);
                        expect(scenes[i].camera).not.toBe(scenes[j].camera);
                    }
                }
            }),
            { numRuns: 20 },
        );
    });

    test('SceneInstance respects configuration options', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                fc.record({
                    autoStart: fc.boolean(),
                    lights: fc.constantFrom(false, undefined, {}),
                }),
                (containerId, config) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene with config
                    const scene = new SceneInstance(containerId, config);
                    createdScenes.push(scene);

                    // Verify autoStart is respected
                    if (config.autoStart === false) {
                        expect(scene.isRendering).toBe(false);
                    } else {
                        expect(scene.isRendering).toBe(true);
                    }

                    // Verify lights config is respected
                    if (config.lights === false) {
                        expect(scene.lights.length).toBe(0);
                    } else {
                        // Default lights should be added
                        expect(scene.lights.length).toBeGreaterThan(0);
                    }
                },
            ),
            { numRuns: 50 },
        );
    });
});
