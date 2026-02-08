/**
 * Property-based tests for instance-scoped light creation
 * **Feature: instance-based-api, Property 6: Instance Method Light Creation**
 * **Validates: Requirements 2.4**
 */

import fc from 'fast-check';
import { SceneInstance } from '../../engine/SceneInstance.js';
import { Light } from '../../engine/Light.js';
import * as THREE from 'three';

describe('Instance Light Creation Property Tests', () => {
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

        const scene = new SceneInstance(containerId, { autoStart: false, lights: false });
        createdScenes.push(scene);
        return scene;
    }

    /**
     * Property 6: Instance Method Light Creation
     * For any scene instance and valid light configuration,
     * calling scene.addLight should create a light that appears in that scene's lights array.
     */
    test('**Feature: instance-based-api, Property 6: Instance Method Light Creation**', () => {
        fc.assert(
            fc.property(
                // Generate random container ID
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .map((s) => `container-${s.replace(/[^a-zA-Z0-9-_]/g, '')}`),
                // Generate random light type
                fc.constantFrom('sun', 'ambient', 'point', 'spot', 'hemisphere'),
                // Generate random light configuration
                fc.record({
                    intensity: fc.double({ min: 0.1, max: 2, noNaN: true }),
                    color: fc.integer({ min: 0x000000, max: 0xffffff }),
                    // Point light position
                    x: fc.double({ min: -10, max: 10, noNaN: true }),
                    y: fc.double({ min: 0, max: 20, noNaN: true }),
                    z: fc.double({ min: -10, max: 10, noNaN: true }),
                }),
                (containerId, lightType, config) => {
                    // Create test scene
                    const scene = createTestScene(containerId);

                    // Get initial light count
                    const initialLightCount = scene.lights.length;

                    let createdLight;

                    // Create light based on type
                    if (lightType === 'sun') {
                        createdLight = scene.addLight('sun', {
                            intensity: config.intensity,
                            color: config.color,
                        });
                    } else if (lightType === 'ambient') {
                        createdLight = scene.addLight('ambient', {
                            intensity: config.intensity,
                            color: config.color,
                        });
                    } else if (lightType === 'point') {
                        createdLight = scene.addLight('point', {
                            x: config.x,
                            y: config.y,
                            z: config.z,
                            intensity: config.intensity,
                            color: config.color,
                        });
                    } else if (lightType === 'spot') {
                        createdLight = scene.addLight('spot', {
                            intensity: config.intensity,
                            color: config.color,
                        });
                    } else if (lightType === 'hemisphere') {
                        createdLight = scene.addLight('hemisphere', {
                            intensity: config.intensity,
                            skyColor: config.color,
                        });
                    }

                    // Verify light was created
                    expect(createdLight).toBeDefined();
                    expect(createdLight).not.toBeNull();

                    // Verify light has required properties
                    expect(createdLight).toHaveProperty('threeLight');
                    expect(createdLight).toHaveProperty('type');
                    expect(createdLight.threeLight).toBeDefined();

                    // Verify light was added to scene's lights array
                    expect(scene.lights.length).toBe(initialLightCount + 1);

                    // Verify light is in scene's lights array
                    expect(scene.lights).toContain(createdLight);

                    // Verify light is in Three.js scene
                    expect(scene.threeScene.children).toContain(createdLight.threeLight);

                    // Verify light type
                    expect(createdLight.type).toBeDefined();
                    expect(typeof createdLight.type).toBe('string');

                    // Verify return value is the created light
                    expect(createdLight).toBeInstanceOf(Light);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('addLight with sun type creates directional light', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, color) => {
                    const scene = createTestScene('test-sun-light');
                    const initialCount = scene.lights.length;

                    const light = scene.addLight('sun', { intensity, color });

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('directional');

                    // Verify light was added to scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);

                    // Verify light is in Three.js scene
                    expect(scene.threeScene.children).toContain(light.threeLight);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('addLight with ambient type creates ambient light', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, color) => {
                    const scene = createTestScene('test-ambient-light');
                    const initialCount = scene.lights.length;

                    const light = scene.addLight('ambient', { intensity, color });

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('ambient');

                    // Verify light was added to scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('addLight with point type creates point light', () => {
        fc.assert(
            fc.property(
                fc.double({ min: -10, max: 10, noNaN: true }),
                fc.double({ min: 0, max: 20, noNaN: true }),
                fc.double({ min: -10, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                (x, y, z, intensity) => {
                    const scene = createTestScene('test-point-light');
                    const initialCount = scene.lights.length;

                    const light = scene.addLight('point', { x, y, z, intensity });

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('point');

                    // Verify light was added to scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);

                    // Verify position was set
                    expect(light.threeLight.position.x).toBeCloseTo(x, 5);
                    expect(light.threeLight.position.y).toBeCloseTo(y, 5);
                    expect(light.threeLight.position.z).toBeCloseTo(z, 5);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('addLight with spot type creates spot light', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, color) => {
                    const scene = createTestScene('test-spot-light');
                    const initialCount = scene.lights.length;

                    const light = scene.addLight('spot', { intensity, color });

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('spot');

                    // Verify light was added to scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('addLight with hemisphere type creates hemisphere light', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.1, max: 2, noNaN: true }),
                fc.integer({ min: 0x000000, max: 0xffffff }),
                (intensity, skyColor) => {
                    const scene = createTestScene('test-hemisphere-light');
                    const initialCount = scene.lights.length;

                    const light = scene.addLight('hemisphere', { intensity, skyColor });

                    // Verify light was created and returned
                    expect(light).toBeDefined();
                    expect(light).toBeInstanceOf(Light);
                    expect(light.type).toBe('hemisphere');

                    // Verify light was added to scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(light);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Multiple lights can be added to same scene', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 10 }), (numLights) => {
                const scene = createTestScene('test-multiple-lights');
                const createdLights = [];

                // Create multiple lights
                for (let i = 0; i < numLights; i++) {
                    const lightType = ['sun', 'ambient', 'point', 'spot', 'hemisphere'][i % 5];
                    let light;

                    if (lightType === 'sun') {
                        light = scene.addLight('sun', { intensity: 1 });
                    } else if (lightType === 'ambient') {
                        light = scene.addLight('ambient', { intensity: 0.5 });
                    } else if (lightType === 'point') {
                        light = scene.addLight('point', { x: 0, y: 5, z: 0, intensity: 1 });
                    } else if (lightType === 'spot') {
                        light = scene.addLight('spot', { intensity: 1 });
                    } else {
                        light = scene.addLight('hemisphere', { intensity: 1 });
                    }

                    createdLights.push(light);
                }

                // Verify all lights were added
                expect(scene.lights.length).toBe(numLights);

                // Verify all lights are in scene
                for (const light of createdLights) {
                    expect(scene.lights).toContain(light);
                    expect(scene.threeScene.children).toContain(light.threeLight);
                }
            }),
            { numRuns: 30 },
        );
    });

    test('Lights are isolated between different scenes', () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 5 }), (numScenes) => {
                const scenes = [];

                // Create multiple scenes
                for (let i = 0; i < numScenes; i++) {
                    const scene = createTestScene(`test-light-isolation-${i}`);
                    scenes.push(scene);
                }

                // Add lights to each scene
                const lightsPerScene = [];
                for (let i = 0; i < scenes.length; i++) {
                    const light = scenes[i].addLight('sun', { intensity: 1 });
                    lightsPerScene.push(light);
                }

                // Verify each scene has exactly one light
                for (let i = 0; i < scenes.length; i++) {
                    expect(scenes[i].lights.length).toBe(1);

                    // Verify light is in correct scene
                    expect(scenes[i].lights).toContain(lightsPerScene[i]);

                    // Verify light is NOT in other scenes
                    for (let j = 0; j < scenes.length; j++) {
                        if (i !== j) {
                            expect(scenes[j].lights).not.toContain(lightsPerScene[i]);
                        }
                    }
                }
            }),
            { numRuns: 20 },
        );
    });

    test('addLight can accept Light instance directly', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('sun', 'ambient', 'point', 'spot', 'hemisphere'),
                (lightType) => {
                    const scene = createTestScene('test-light-instance');
                    const initialCount = scene.lights.length;

                    // Create light instance first
                    let lightInstance;
                    if (lightType === 'sun') {
                        lightInstance = Light.sun({ intensity: 1 });
                    } else if (lightType === 'ambient') {
                        lightInstance = Light.ambient({ intensity: 0.5 });
                    } else if (lightType === 'point') {
                        lightInstance = Light.point(0, 5, 0, { intensity: 1 });
                    } else if (lightType === 'spot') {
                        lightInstance = Light.spot({ intensity: 1 });
                    } else {
                        lightInstance = Light.hemisphere({ intensity: 1 });
                    }

                    // Add light instance to scene
                    const addedLight = scene.addLight(lightInstance);

                    // Verify same light instance was returned
                    expect(addedLight).toBe(lightInstance);

                    // Verify light was added to scene
                    expect(scene.lights.length).toBe(initialCount + 1);
                    expect(scene.lights).toContain(lightInstance);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('addLight throws error on disposed scene', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('sun', 'ambient', 'point', 'spot', 'hemisphere'),
                (lightType) => {
                    const scene = createTestScene('test-disposed-scene');

                    // Dispose the scene
                    scene.destroy();

                    // Verify scene is disposed
                    expect(scene.isDisposed).toBe(true);

                    // Try to add light to disposed scene
                    expect(() => {
                        scene.addLight(lightType, { intensity: 1 });
                    }).toThrow('Cannot add light to disposed scene');
                },
            ),
            { numRuns: 30 },
        );
    });

    test('addLight throws error for invalid light type', () => {
        fc.assert(
            fc.property(
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .filter(
                        (s) =>
                            ![
                                'sun',
                                'ambient',
                                'point',
                                'spot',
                                'hemisphere',
                                'directional',
                            ].includes(s.toLowerCase()),
                    ),
                (invalidType) => {
                    const scene = createTestScene('test-invalid-light-type');

                    // Try to add light with invalid type
                    expect(() => {
                        scene.addLight(invalidType, { intensity: 1 });
                    }).toThrow('Invalid light type');
                },
            ),
            { numRuns: 30 },
        );
    });

    test('addLight supports directional as alias for sun', () => {
        const scene = createTestScene('test-directional-alias');
        const initialCount = scene.lights.length;

        const light = scene.addLight('directional', { intensity: 1 });

        // Verify light was created
        expect(light).toBeDefined();
        expect(light.type).toBe('directional');
        expect(scene.lights.length).toBe(initialCount + 1);
    });
});
