/**
 * Property-based tests for config isolation between scene instances
 * **Feature: instance-based-api, Property 18: Config Isolation**
 * **Validates: Requirements 7.1, 7.2**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';

describe('Config Isolation Property Tests', () => {
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
     * Property 18: Config Isolation
     * For any two scene instances created with different configs, modifying one scene's config
     * should not affect the other scene's config.
     */
    test('**Feature: instance-based-api, Property 18: Config Isolation**', () => {
        fc.assert(
            fc.property(
                // Generate two different configs
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
                (config1, config2) => {
                    // Create two DOM containers
                    const container1 = document.createElement('div');
                    container1.id = 'container-1';
                    container1.style.width = '800px';
                    container1.style.height = '600px';
                    document.body.appendChild(container1);

                    const container2 = document.createElement('div');
                    container2.id = 'container-2';
                    container2.style.width = '800px';
                    container2.style.height = '600px';
                    document.body.appendChild(container2);

                    // Create two scene instances with different configs
                    const scene1 = new SceneInstance('container-1', config1);
                    const scene2 = new SceneInstance('container-2', config2);
                    createdScenes.push(scene1, scene2);

                    // Get initial configs (should be deep copies)
                    const scene1ConfigBefore = scene1.config;
                    const scene2ConfigBefore = scene2.config;

                    // Verify configs are independent objects
                    expect(scene1ConfigBefore).not.toBe(scene2ConfigBefore);

                    // Verify scene1's config matches config1
                    expect(scene1ConfigBefore.autoStart).toBe(config1.autoStart);
                    expect(scene1ConfigBefore.renderer.antialias).toBe(config1.renderer.antialias);
                    expect(scene1ConfigBefore.renderer.alpha).toBe(config1.renderer.alpha);
                    expect(scene1ConfigBefore.renderer.powerPreference).toBe(
                        config1.renderer.powerPreference,
                    );
                    expect(scene1ConfigBefore.camera.type).toBe(config1.camera.type);
                    expect(scene1ConfigBefore.camera.fov).toBe(config1.camera.fov);

                    // Verify scene2's config matches config2
                    expect(scene2ConfigBefore.autoStart).toBe(config2.autoStart);
                    expect(scene2ConfigBefore.renderer.antialias).toBe(config2.renderer.antialias);
                    expect(scene2ConfigBefore.renderer.alpha).toBe(config2.renderer.alpha);
                    expect(scene2ConfigBefore.renderer.powerPreference).toBe(
                        config2.renderer.powerPreference,
                    );
                    expect(scene2ConfigBefore.camera.type).toBe(config2.camera.type);
                    expect(scene2ConfigBefore.camera.fov).toBe(config2.camera.fov);

                    // Try to modify scene1's config (should not affect scene2)
                    // Get config and attempt modification
                    const scene1ConfigCopy = scene1.config;
                    scene1ConfigCopy.autoStart = !scene1ConfigCopy.autoStart;
                    scene1ConfigCopy.renderer.antialias = !scene1ConfigCopy.renderer.antialias;
                    scene1ConfigCopy.camera.fov = 999;

                    // Get scene2's config again
                    const scene2ConfigAfter = scene2.config;

                    // Verify scene2's config is unchanged
                    expect(scene2ConfigAfter.autoStart).toBe(config2.autoStart);
                    expect(scene2ConfigAfter.renderer.antialias).toBe(config2.renderer.antialias);
                    expect(scene2ConfigAfter.camera.fov).toBe(config2.camera.fov);

                    // Verify scene1's internal config is also unchanged (getter returns copy)
                    const scene1ConfigAfter = scene1.config;
                    expect(scene1ConfigAfter.autoStart).toBe(config1.autoStart);
                    expect(scene1ConfigAfter.renderer.antialias).toBe(config1.renderer.antialias);
                    expect(scene1ConfigAfter.camera.fov).toBe(config1.camera.fov);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Config getter returns a copy, not the original', () => {
        fc.assert(
            fc.property(
                fc.record({
                    autoStart: fc.boolean(),
                    renderer: fc.record({
                        antialias: fc.boolean(),
                    }),
                    camera: fc.record({
                        fov: fc.integer({ min: 30, max: 120 }),
                    }),
                }),
                (config) => {
                    // Create DOM container
                    const container = document.createElement('div');
                    container.id = 'test-container';
                    container.style.width = '800px';
                    container.style.height = '600px';
                    document.body.appendChild(container);

                    // Create scene
                    const scene = new SceneInstance('test-container', config);
                    createdScenes.push(scene);

                    // Get config twice
                    const config1 = scene.config;
                    const config2 = scene.config;

                    // Should be different objects (deep copies)
                    expect(config1).not.toBe(config2);
                    expect(config1.renderer).not.toBe(config2.renderer);
                    expect(config1.camera).not.toBe(config2.camera);

                    // But should have same values
                    expect(config1.autoStart).toBe(config2.autoStart);
                    expect(config1.renderer.antialias).toBe(config2.renderer.antialias);
                    expect(config1.camera.fov).toBe(config2.camera.fov);

                    // Modifying returned config should not affect subsequent calls
                    config1.autoStart = !config1.autoStart;
                    config1.renderer.antialias = !config1.renderer.antialias;

                    const config3 = scene.config;
                    expect(config3.autoStart).toBe(config.autoStart);
                    expect(config3.renderer.antialias).toBe(config.renderer.antialias);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Multiple scenes with same config values remain independent', () => {
        fc.assert(
            fc.property(
                fc.record({
                    autoStart: fc.boolean(),
                    renderer: fc.record({
                        antialias: fc.boolean(),
                        alpha: fc.boolean(),
                    }),
                    camera: fc.record({
                        type: fc.constantFrom('perspective', 'orthographic'),
                        fov: fc.integer({ min: 30, max: 120 }),
                    }),
                }),
                fc.integer({ min: 2, max: 4 }),
                (config, numScenes) => {
                    const scenes = [];

                    // Create multiple scenes with the same config
                    for (let i = 0; i < numScenes; i++) {
                        const container = document.createElement('div');
                        container.id = `container-${i}`;
                        container.style.width = '800px';
                        container.style.height = '600px';
                        document.body.appendChild(container);

                        const scene = new SceneInstance(`container-${i}`, config);
                        scenes.push(scene);
                        createdScenes.push(scene);
                    }

                    // Verify all scenes have the same config values
                    for (const scene of scenes) {
                        const sceneConfig = scene.config;
                        expect(sceneConfig.autoStart).toBe(config.autoStart);
                        expect(sceneConfig.renderer.antialias).toBe(config.renderer.antialias);
                        expect(sceneConfig.renderer.alpha).toBe(config.renderer.alpha);
                        expect(sceneConfig.camera.type).toBe(config.camera.type);
                        expect(sceneConfig.camera.fov).toBe(config.camera.fov);
                    }

                    // Verify each scene's config is a separate object
                    for (let i = 0; i < scenes.length; i++) {
                        for (let j = i + 1; j < scenes.length; j++) {
                            const config1 = scenes[i].config;
                            const config2 = scenes[j].config;

                            expect(config1).not.toBe(config2);
                            expect(config1.renderer).not.toBe(config2.renderer);
                            expect(config1.camera).not.toBe(config2.camera);
                        }
                    }
                },
            ),
            { numRuns: 30 },
        );
    });
});
