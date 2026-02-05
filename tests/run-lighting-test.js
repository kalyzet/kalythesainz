/**
 * Manual runner for lighting preset property tests
 */

// Mock Three.js before importing Light
const mockThreeJS = () => {
    global.THREE = {
        DirectionalLight: class {
            constructor(color, intensity) {
                this.color = { set: () => {} };
                this.intensity = intensity;
                this.position = {
                    set: () => {},
                    copy: () => {},
                    clone: () => ({ x: 0, y: 0, z: 0 }),
                };
                this.target = {
                    position: {
                        set: () => {},
                        copy: () => {},
                        clone: () => ({ x: 0, y: 0, z: 0 }),
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
                this.color = { set: () => {} };
                this.intensity = intensity;
            }
        },
        PointLight: class {
            constructor(color, intensity, distance, decay) {
                this.color = { set: () => {} };
                this.intensity = intensity;
                this.distance = distance;
                this.decay = decay;
                this.position = {
                    set: () => {},
                    copy: () => {},
                    clone: () => ({ x: 0, y: 0, z: 0 }),
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
                this.color = { set: () => {} };
                this.intensity = intensity;
                this.distance = distance;
                this.angle = angle;
                this.penumbra = penumbra;
                this.decay = decay;
                this.position = {
                    set: () => {},
                    copy: () => {},
                    clone: () => ({ x: 0, y: 0, z: 0 }),
                };
                this.target = {
                    position: {
                        set: () => {},
                        copy: () => {},
                        clone: () => ({ x: 0, y: 0, z: 0 }),
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
                this.color = { set: () => {} };
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

// Initialize mocks before importing
mockThreeJS();

import { EventBus } from '../core/EventBus.js';
import { Light } from '../engine/Light.js';

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
    array: (itemGen, options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 0;
            const maxLength = options.maxLength || 10;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            return Array.from({ length }, () => itemGen.generate());
        },
    }),
    float: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 1;
            return Math.random() * (max - min) + min;
        },
    }),
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    }),
    oneof: (...generators) => ({
        generate: () => {
            const chosen = generators[Math.floor(Math.random() * generators.length)];
            return chosen.generate();
        },
    }),
    constant: (value) => ({
        generate: () => value,
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
    constantFrom: (...values) => ({
        generate: () => values[Math.floor(Math.random() * values.length)],
    }),
};

// Simple assertion functions
const expect = (actual) => ({
    toBeDefined: () => {
        if (actual === undefined || actual === null) {
            throw new Error(`Expected value to be defined, got ${actual}`);
        }
    },
    toBe: (expected) => {
        if (actual !== expected) {
            throw new Error(`Expected ${actual} to be ${expected}`);
        }
    },
    toHaveLength: (expected) => {
        if (!actual || actual.length !== expected) {
            throw new Error(
                `Expected length ${expected}, got ${actual ? actual.length : 'undefined'}`,
            );
        }
    },
    toBeGreaterThanOrEqual: (expected) => {
        if (actual < expected) {
            throw new Error(`Expected ${actual} to be >= ${expected}`);
        }
    },
    toHaveBeenCalledWith: (...args) => {
        // Mock implementation - just verify it's a function
        if (typeof actual !== 'function') {
            throw new Error(`Expected ${actual} to be a function`);
        }
    },
});

console.log('**Feature: kalythesainz-framework, Property 6: Lighting preset consistency**');
console.log('**Validates: Requirements 5.2, 5.3**\n');

console.log('Testing Property 6: Lighting preset consistency');

// Test 1: Sun light preset consistency
console.log('\n1. Testing sun light preset consistency...');
try {
    fc.assert(
        fc.property(
            fc.record({
                intensity: fc.float({ min: 0, max: 10 }),
                color: fc.oneof(
                    fc.integer({ min: 0x000000, max: 0xffffff }),
                    fc.constantFrom('#ffffff', '#ffff00', '#ff8800'),
                ),
                position: fc.array(fc.float({ min: -50, max: 50 }), { minLength: 3, maxLength: 3 }),
                target: fc.array(fc.float({ min: -10, max: 10 }), { minLength: 3, maxLength: 3 }),
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

                // Verify shadow configuration is consistent
                expect(sunLight.threeLight.castShadow).toBe(config.castShadow);
                if (config.castShadow) {
                    expect(sunLight.threeLight.shadow.mapSize.width).toBeGreaterThanOrEqual(1024);
                    expect(sunLight.threeLight.shadow.mapSize.height).toBeGreaterThanOrEqual(1024);
                }

                // Clean up
                sunLight.dispose();
            },
        ),
        { numRuns: 50 },
    );
    console.log('✓ Sun light preset test passed');
} catch (error) {
    console.error('❌ Sun light preset test failed:', error.message);
    process.exit(1);
}

// Test 2: Multiple lighting presets working together
console.log('\n2. Testing multiple lighting presets working together...');
try {
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
                expect(ambientLight.threeLight.intensity).toBe(configs.ambientConfig.intensity);
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
        { numRuns: 50 },
    );
    console.log('✓ Multiple lighting presets test passed');
} catch (error) {
    console.error('❌ Multiple lighting presets test failed:', error.message);
    process.exit(1);
}

// Test 3: Basic lighting setup consistency
console.log('\n3. Testing basic lighting setup consistency...');
try {
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
        { numRuns: 50 },
    );
    console.log('✓ Basic lighting setup test passed');
} catch (error) {
    console.error('❌ Basic lighting setup test failed:', error.message);
    process.exit(1);
}

console.log('\n✅ All lighting preset property tests passed successfully!');
console.log('Lighting preset consistency property verified.');
