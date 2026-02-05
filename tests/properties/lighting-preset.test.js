/**
 * Property-based tests for lighting preset consistency
 * **Feature: kalythesainz-framework, Property 6: Lighting preset consistency**
 * **Validates: Requirements 5.2, 5.3**
 */

import fc from 'fast-check';
import { Light } from '../../engine/Light.js';

// Mock Three.js for testing
const mockThreeJS = () => {
    global.THREE = {
        DirectionalLight: class {
            constructor(color, intensity) {
                this.color = { set: jest.fn() };
                this.intensity = intensity;
                this.position = {
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                };
                this.target = {
                    position: {
                        set: jest.fn(),
                        copy: jest.fn(),
                        clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                    },
                };
                this.castShadow = false;
                this.shadow = {
                    mapSize: { width: 512, height: 512 },
                    camera: { near: 0.5, far: 50, left: -10, right: 10, top: 10, bottom: -10 },
                };
            }
        },
        AmbientLight: class {
            constructor(color, intensity) {
                this.color = { set: jest.fn() };
                this.intensity = intensity;
            }
        },
        PointLight: class {
            constructor(color, intensity, distance, decay) {
                this.color = { set: jest.fn() };
                this.intensity = intensity;
                this.distance = distance;
                this.decay = decay;
                this.position = {
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                };
                this.castShadow = false;
                this.shadow = {
                    mapSize: { width: 512, height: 512 },
                    camera: { near: 0.5, far: 50 },
                };
            }
        },
        SpotLight: class {
            constructor(color, intensity, distance, angle, penumbra, decay) {
                this.color = { set: jest.fn() };
                this.intensity = intensity;
                this.distance = distance;
                this.angle = angle;
                this.penumbra = penumbra;
                this.decay = decay;
                this.position = {
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                };
                this.target = {
                    position: {
                        set: jest.fn(),
                        copy: jest.fn(),
                        clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                    },
                };
                this.castShadow = false;
                this.shadow = {
                    mapSize: { width: 512, height: 512 },
                    camera: { near: 0.5, far: 50, fov: 30 },
                };
            }
        },
        HemisphereLight: class {
            constructor(skyColor, groundColor, intensity) {
                this.skyColor = skyColor;
                this.groundColor = groundColor;
                this.intensity = intensity;
                this.color = { set: jest.fn() };
            }
        },
        Vector3: class {
            constructor(x = 0, y = 0, z = 0) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
            copy(v) {
                this.x = v.x;
                this.y = v.y;
                this.z = v.z;
                return this;
            }
            clone() {
                return new THREE.Vector3(this.x, this.y, this.z);
            }
            set(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
                return this;
            }
        },
        DirectionalLightHelper: class {
            constructor() {}
        },
        PointLightHelper: class {
            constructor() {}
        },
        SpotLightHelper: class {
            constructor() {}
        },
    };
};

describe('Lighting Preset Consistency Properties', () => {
    beforeAll(() => {
        mockThreeJS();
    });

    beforeEach(() => {
        // Reset any global state
        jest.clearAllMocks();
    });

    /**
     * Property 6: Lighting preset consistency
     * For any lighting preset application, lights should be positioned optimally
     * without conflicts, and multiple presets should work together harmoniously
     */
    describe('Property 6: Lighting preset consistency', () => {
        test('sun light preset should always create valid directional light with consistent properties', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        intensity: fc.float({ min: 0, max: 10 }),
                        color: fc.oneof(
                            fc.integer({ min: 0x000000, max: 0xffffff }),
                            fc.constantFrom('#ffffff', '#ffff00', '#ff8800'),
                        ),
                        position: fc.array(fc.float({ min: -50, max: 50 }), {
                            minLength: 3,
                            maxLength: 3,
                        }),
                        target: fc.array(fc.float({ min: -10, max: 10 }), {
                            minLength: 3,
                            maxLength: 3,
                        }),
                        castShadow: fc.boolean(),
                    }),
                    (config) => {
                        const sunLight = Light.sun(config);

                        // Verify light is created and has correct type
                        expect(sunLight).toBeDefined();
                        expect(sunLight.type).toBe('directional');
                        expect(sunLight.threeLight).toBeDefined();

                        // Verify intensity is set correctly
                        expect(sunLight.threeLight.intensity).toBe(config.intensity);

                        // Verify position is set correctly
                        expect(sunLight.threeLight.position.set).toHaveBeenCalledWith(
                            config.position[0],
                            config.position[1],
                            config.position[2],
                        );

                        // Verify target is set correctly
                        expect(sunLight.threeLight.target.position.set).toHaveBeenCalledWith(
                            config.target[0],
                            config.target[1],
                            config.target[2],
                        );

                        // Verify shadow configuration is consistent
                        expect(sunLight.threeLight.castShadow).toBe(config.castShadow);
                        if (config.castShadow) {
                            expect(sunLight.threeLight.shadow.mapSize.width).toBeGreaterThanOrEqual(
                                1024,
                            );
                            expect(
                                sunLight.threeLight.shadow.mapSize.height,
                            ).toBeGreaterThanOrEqual(1024);
                        }

                        // Clean up
                        sunLight.dispose();
                    },
                ),
                { numRuns: 100 },
            );
        });

        test('ambient light preset should always create valid ambient light with consistent properties', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        intensity: fc.float({ min: 0, max: 2 }),
                        color: fc.oneof(
                            fc.integer({ min: 0x000000, max: 0xffffff }),
                            fc.constantFrom('#ffffff', '#ccccff', '#ffffcc'),
                        ),
                    }),
                    (config) => {
                        const ambientLight = Light.ambient(config);

                        // Verify light is created and has correct type
                        expect(ambientLight).toBeDefined();
                        expect(ambientLight.type).toBe('ambient');
                        expect(ambientLight.threeLight).toBeDefined();

                        // Verify intensity is set correctly
                        expect(ambientLight.threeLight.intensity).toBe(config.intensity);

                        // Clean up
                        ambientLight.dispose();
                    },
                ),
                { numRuns: 100 },
            );
        });

        test('point light preset should always create valid point light with consistent properties', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: -20, max: 20 }), // x
                    fc.float({ min: 0, max: 20 }), // y
                    fc.float({ min: -20, max: 20 }), // z
                    fc.record({
                        intensity: fc.float({ min: 0, max: 5 }),
                        color: fc.integer({ min: 0x000000, max: 0xffffff }),
                        distance: fc.float({ min: 0, max: 100 }),
                        decay: fc.float({ min: 1, max: 3 }),
                        castShadow: fc.boolean(),
                    }),
                    (x, y, z, config) => {
                        const pointLight = Light.point(x, y, z, config);

                        // Verify light is created and has correct type
                        expect(pointLight).toBeDefined();
                        expect(pointLight.type).toBe('point');
                        expect(pointLight.threeLight).toBeDefined();

                        // Verify position is set correctly
                        expect(pointLight.threeLight.position.set).toHaveBeenCalledWith(x, y, z);

                        // Verify properties are set correctly
                        expect(pointLight.threeLight.intensity).toBe(config.intensity);
                        expect(pointLight.threeLight.distance).toBe(config.distance);
                        expect(pointLight.threeLight.decay).toBe(config.decay);
                        expect(pointLight.threeLight.castShadow).toBe(config.castShadow);

                        // Clean up
                        pointLight.dispose();
                    },
                ),
                { numRuns: 100 },
            );
        });

        test('spot light preset should always create valid spot light with consistent properties', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        x: fc.float({ min: -20, max: 20 }),
                        y: fc.float({ min: 0, max: 20 }),
                        z: fc.float({ min: -20, max: 20 }),
                        target: fc.array(fc.float({ min: -10, max: 10 }), {
                            minLength: 3,
                            maxLength: 3,
                        }),
                        intensity: fc.float({ min: 0, max: 5 }),
                        color: fc.integer({ min: 0x000000, max: 0xffffff }),
                        distance: fc.float({ min: 0, max: 100 }),
                        angle: fc.float({ min: 0.1, max: Math.PI / 2 }),
                        penumbra: fc.float({ min: 0, max: 1 }),
                        decay: fc.float({ min: 1, max: 3 }),
                        castShadow: fc.boolean(),
                    }),
                    (config) => {
                        const spotLight = Light.spot(config);

                        // Verify light is created and has correct type
                        expect(spotLight).toBeDefined();
                        expect(spotLight.type).toBe('spot');
                        expect(spotLight.threeLight).toBeDefined();

                        // Verify position is set correctly
                        expect(spotLight.threeLight.position.set).toHaveBeenCalledWith(
                            config.x,
                            config.y,
                            config.z,
                        );

                        // Verify target is set correctly
                        expect(spotLight.threeLight.target.position.set).toHaveBeenCalledWith(
                            config.target[0],
                            config.target[1],
                            config.target[2],
                        );

                        // Verify properties are set correctly
                        expect(spotLight.threeLight.intensity).toBe(config.intensity);
                        expect(spotLight.threeLight.distance).toBe(config.distance);
                        expect(spotLight.threeLight.angle).toBe(config.angle);
                        expect(spotLight.threeLight.penumbra).toBe(config.penumbra);
                        expect(spotLight.threeLight.decay).toBe(config.decay);
                        expect(spotLight.threeLight.castShadow).toBe(config.castShadow);

                        // Clean up
                        spotLight.dispose();
                    },
                ),
                { numRuns: 100 },
            );
        });

        test('multiple lighting presets should work together without conflicts', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        sunConfig: fc.record({
                            intensity: fc.float({ min: 0.5, max: 2 }),
                            position: fc.array(fc.float({ min: -10, max: 10 }), {
                                minLength: 3,
                                maxLength: 3,
                            }),
                        }),
                        ambientConfig: fc.record({
                            intensity: fc.float({ min: 0.1, max: 1 }),
                        }),
                        pointConfig: fc.record({
                            x: fc.float({ min: -5, max: 5 }),
                            y: fc.float({ min: 2, max: 10 }),
                            z: fc.float({ min: -5, max: 5 }),
                            intensity: fc.float({ min: 0.2, max: 1 }),
                        }),
                    }),
                    (configs) => {
                        // Create multiple lights
                        const sunLight = Light.sun(configs.sunConfig);
                        const ambientLight = Light.ambient(configs.ambientConfig);
                        const pointLight = Light.point(
                            configs.pointConfig.x,
                            configs.pointConfig.y,
                            configs.pointConfig.z,
                            { intensity: configs.pointConfig.intensity },
                        );

                        // Verify all lights are created successfully
                        expect(sunLight).toBeDefined();
                        expect(ambientLight).toBeDefined();
                        expect(pointLight).toBeDefined();

                        // Verify they have different types
                        expect(sunLight.type).toBe('directional');
                        expect(ambientLight.type).toBe('ambient');
                        expect(pointLight.type).toBe('point');

                        // Verify they all have valid Three.js light instances
                        expect(sunLight.threeLight).toBeDefined();
                        expect(ambientLight.threeLight).toBeDefined();
                        expect(pointLight.threeLight).toBeDefined();

                        // Verify intensities are preserved
                        expect(sunLight.threeLight.intensity).toBe(configs.sunConfig.intensity);
                        expect(ambientLight.threeLight.intensity).toBe(
                            configs.ambientConfig.intensity,
                        );
                        expect(pointLight.threeLight.intensity).toBe(configs.pointConfig.intensity);

                        // Clean up all lights
                        sunLight.dispose();
                        ambientLight.dispose();
                        pointLight.dispose();

                        // Verify disposal worked
                        expect(sunLight.isDisposed).toBe(true);
                        expect(ambientLight.isDisposed).toBe(true);
                        expect(pointLight.isDisposed).toBe(true);
                    },
                ),
                { numRuns: 100 },
            );
        });

        test('basic lighting setup should create consistent sun and ambient light combination', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        sun: fc.record({
                            intensity: fc.float({ min: 0.5, max: 2 }),
                            position: fc.array(fc.float({ min: -20, max: 20 }), {
                                minLength: 3,
                                maxLength: 3,
                            }),
                        }),
                        ambient: fc.record({
                            intensity: fc.float({ min: 0.1, max: 1 }),
                            color: fc.integer({ min: 0x000000, max: 0xffffff }),
                        }),
                    }),
                    (config) => {
                        const lights = Light.basicSetup(config);

                        // Verify we get exactly 2 lights
                        expect(lights).toHaveLength(2);

                        // Verify light types
                        expect(lights[0].type).toBe('directional'); // sun
                        expect(lights[1].type).toBe('ambient'); // ambient

                        // Verify both lights are properly configured
                        expect(lights[0].threeLight.intensity).toBe(config.sun.intensity);
                        expect(lights[1].threeLight.intensity).toBe(config.ambient.intensity);

                        // Clean up
                        lights.forEach((light) => light.dispose());

                        // Verify all disposed
                        lights.forEach((light) => expect(light.isDisposed).toBe(true));
                    },
                ),
                { numRuns: 100 },
            );
        });

        test('three-point lighting setup should create consistent key, fill, and rim lights', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        key: fc.record({
                            intensity: fc.float({ min: 0.5, max: 2 }),
                            x: fc.float({ min: 0, max: 10 }),
                            y: fc.float({ min: 5, max: 15 }),
                        }),
                        fill: fc.record({
                            intensity: fc.float({ min: 0.2, max: 1 }),
                        }),
                        rim: fc.record({
                            intensity: fc.float({ min: 0.1, max: 0.8 }),
                        }),
                    }),
                    (config) => {
                        const lights = Light.threePointSetup(config);

                        // Verify we get exactly 3 lights
                        expect(lights).toHaveLength(3);

                        // Verify light types (key=spot, fill=point, rim=point)
                        expect(lights[0].type).toBe('spot'); // key
                        expect(lights[1].type).toBe('point'); // fill
                        expect(lights[2].type).toBe('point'); // rim

                        // Verify all lights are properly configured
                        expect(lights[0].threeLight.intensity).toBe(config.key.intensity);
                        expect(lights[1].threeLight.intensity).toBe(config.fill.intensity);
                        expect(lights[2].threeLight.intensity).toBe(config.rim.intensity);

                        // Clean up
                        lights.forEach((light) => light.dispose());

                        // Verify all disposed
                        lights.forEach((light) => expect(light.isDisposed).toBe(true));
                    },
                ),
                { numRuns: 100 },
            );
        });
    });
});
