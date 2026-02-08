/**
 * Property-based tests for config options support
 * **Feature: instance-based-api, Property 19: Config Options Support**
 * **Validates: Requirements 7.4**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';

describe('Config Options Support Property Tests', () => {
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
     * Property 19: Config Options Support
     * For any valid configuration object containing renderer, camera, lights, and autoStart options,
     * creating a scene with that config should apply all specified options to that instance.
     */
    test('**Feature: instance-based-api, Property 19: Config Options Support**', () => {
        fc.assert(
            fc.property(
                // Generate random valid configs with all options
                fc.record({
                    autoStart: fc.boolean(),
                    renderer: fc.record({
                        antialias: fc.boolean(),
                        alpha: fc.boolean(),
                        powerPreference: fc.constantFrom(
                            'default',
                            'high-performance',
                            'low-power',
                        ),
                    }),
                    camera: fc.record({
                        type: fc.constantFrom('perspective', 'orthographic'),
                        fov: fc.integer({ min: 30, max: 120 }),
                        near: fc.double({ min: 0.01, max: 1 }),
                        far: fc.integer({ min: 100, max: 2000 }),
                    }),
                    lights: fc.oneof(
                        fc.constant(false),
                        fc.record({
                            ambient: fc.record({
                                intensity: fc.double({ min: 0, max: 2 }),
                            }),
                        }),
                    ),
                }),
                (config) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = 'test-container';
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene with config
                    const scene = new SceneInstance('test-container', config);
                    createdScenes.push(scene);

                    // Verify all config options are applied
                    const appliedConfig = scene.config;

                    // Verify autoStart option
                    expect(appliedConfig.autoStart).toBe(config.autoStart);
                    if (config.autoStart === false) {
                        expect(scene.isRendering).toBe(false);
                    } else {
                        expect(scene.isRendering).toBe(true);
                    }

                    // Verify renderer options
                    expect(appliedConfig.renderer).toBeDefined();
                    expect(appliedConfig.renderer.antialias).toBe(config.renderer.antialias);
                    expect(appliedConfig.renderer.alpha).toBe(config.renderer.alpha);
                    expect(appliedConfig.renderer.powerPreference).toBe(
                        config.renderer.powerPreference,
                    );

                    // Verify camera options
                    expect(appliedConfig.camera).toBeDefined();
                    expect(appliedConfig.camera.type).toBe(config.camera.type);
                    expect(appliedConfig.camera.fov).toBe(config.camera.fov);
                    expect(appliedConfig.camera.near).toBe(config.camera.near);
                    expect(appliedConfig.camera.far).toBe(config.camera.far);

                    // Verify camera type is applied
                    expect(scene.camera).toBeDefined();
                    expect(scene.camera.type).toBe(config.camera.type);

                    // Verify lights option
                    if (config.lights === false) {
                        expect(scene.lights.length).toBe(0);
                    } else {
                        // Default lights should be added
                        expect(scene.lights.length).toBeGreaterThan(0);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Renderer config options are applied correctly', () => {
        fc.assert(
            fc.property(
                fc.record({
                    antialias: fc.boolean(),
                    alpha: fc.boolean(),
                    powerPreference: fc.constantFrom('default', 'high-performance', 'low-power'),
                }),
                (rendererConfig) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = 'test-container';
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene with renderer config
                    const scene = new SceneInstance('test-container', {
                        renderer: rendererConfig,
                        autoStart: false,
                    });
                    createdScenes.push(scene);

                    // Verify renderer config is applied
                    const config = scene.config;
                    expect(config.renderer.antialias).toBe(rendererConfig.antialias);
                    expect(config.renderer.alpha).toBe(rendererConfig.alpha);
                    expect(config.renderer.powerPreference).toBe(rendererConfig.powerPreference);

                    // Verify renderer exists
                    expect(scene.renderer).toBeDefined();
                    expect(scene.renderer.canvas).toBeDefined();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Camera config options are applied correctly', () => {
        fc.assert(
            fc.property(
                fc.record({
                    type: fc.constantFrom('perspective', 'orthographic'),
                    fov: fc.integer({ min: 30, max: 120 }),
                    near: fc.double({ min: 0.01, max: 1 }),
                    far: fc.integer({ min: 100, max: 2000 }),
                }),
                (cameraConfig) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = 'test-container';
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene with camera config
                    const scene = new SceneInstance('test-container', {
                        camera: cameraConfig,
                        autoStart: false,
                    });
                    createdScenes.push(scene);

                    // Verify camera config is applied
                    const config = scene.config;
                    expect(config.camera.type).toBe(cameraConfig.type);
                    expect(config.camera.fov).toBe(cameraConfig.fov);
                    expect(config.camera.near).toBe(cameraConfig.near);
                    expect(config.camera.far).toBe(cameraConfig.far);

                    // Verify camera exists and has correct type
                    expect(scene.camera).toBeDefined();
                    expect(scene.camera.type).toBe(cameraConfig.type);
                    expect(scene.camera.threeCamera).toBeDefined();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Lights config option controls default lighting', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(false),
                    fc.constant(undefined),
                    fc.record({
                        ambient: fc.record({
                            intensity: fc.double({ min: 0, max: 2 }),
                        }),
                    }),
                ),
                (lightsConfig) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = 'test-container';
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene with lights config
                    const scene = new SceneInstance('test-container', {
                        lights: lightsConfig,
                        autoStart: false,
                    });
                    createdScenes.push(scene);

                    // Verify lights config is applied
                    if (lightsConfig === false) {
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

    test('AutoStart config option controls render loop', () => {
        fc.assert(
            fc.property(fc.boolean(), (autoStart) => {
                // Create DOM container
                const container = document.createElement('div');
                container.id = 'test-container';
                container.style.width = '800px';
                container.style.height = '600px';
                document.body.appendChild(container);

                // Create scene with autoStart config
                const scene = new SceneInstance('test-container', {
                    autoStart: autoStart,
                });
                createdScenes.push(scene);

                // Verify autoStart config is applied
                const config = scene.config;
                expect(config.autoStart).toBe(autoStart);

                // Verify render loop state matches autoStart
                if (autoStart === false) {
                    expect(scene.isRendering).toBe(false);
                } else {
                    expect(scene.isRendering).toBe(true);
                }
            }),
            { numRuns: 50 },
        );
    });

    test('Default config values are applied when options are omitted', () => {
        // Create DOM container
        const container = document.createElement('div');
        container.id = 'test-container';
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        // Create scene with empty config
        const scene = new SceneInstance('test-container', {});
        createdScenes.push(scene);

        // Verify default config values
        const config = scene.config;

        // Default renderer options
        expect(config.renderer.antialias).toBe(true);
        expect(config.renderer.alpha).toBe(false);
        expect(config.renderer.powerPreference).toBe('high-performance');

        // Default camera options
        expect(config.camera.type).toBe('perspective');
        expect(config.camera.fov).toBe(75);
        expect(config.camera.near).toBe(0.1);
        expect(config.camera.far).toBe(1000);

        // Default autoStart
        expect(config.autoStart).toBe(true);
        expect(scene.isRendering).toBe(true);

        // Default lights (should be added)
        expect(scene.lights.length).toBeGreaterThan(0);
    });

    test('Partial config merges with defaults', () => {
        fc.assert(
            fc.property(
                fc.record(
                    {
                        autoStart: fc.option(fc.boolean(), { nil: undefined }),
                        renderer: fc.option(
                            fc.record({
                                antialias: fc.option(fc.boolean(), { nil: undefined }),
                            }),
                            { nil: undefined },
                        ),
                        camera: fc.option(
                            fc.record({
                                fov: fc.option(fc.integer({ min: 30, max: 120 }), {
                                    nil: undefined,
                                }),
                            }),
                            { nil: undefined },
                        ),
                    },
                    { requiredKeys: [] },
                ),
                (partialConfig) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = 'test-container';
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene with partial config
                    const scene = new SceneInstance('test-container', partialConfig);
                    createdScenes.push(scene);

                    // Verify config has both specified and default values
                    const config = scene.config;

                    // Check specified values are applied
                    if (partialConfig.autoStart !== undefined) {
                        expect(config.autoStart).toBe(partialConfig.autoStart);
                    } else {
                        expect(config.autoStart).toBe(true); // default
                    }

                    if (partialConfig.renderer?.antialias !== undefined) {
                        expect(config.renderer.antialias).toBe(partialConfig.renderer.antialias);
                    } else {
                        expect(config.renderer.antialias).toBe(true); // default
                    }

                    if (partialConfig.camera?.fov !== undefined) {
                        expect(config.camera.fov).toBe(partialConfig.camera.fov);
                    } else {
                        expect(config.camera.fov).toBe(75); // default
                    }

                    // Verify defaults are still present
                    expect(config.renderer.alpha).toBe(false);
                    expect(config.renderer.powerPreference).toBe('high-performance');
                    expect(config.camera.type).toBe('perspective');
                    expect(config.camera.near).toBe(0.1);
                    expect(config.camera.far).toBe(1000);
                },
            ),
            { numRuns: 50 },
        );
    });
});
