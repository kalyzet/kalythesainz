/**
 * Property-based tests for Object3D creation completeness
 * **Feature: kalythesainz-framework, Property 1: Object creation completeness**
 * **Validates: Requirements 2.1, 2.2**
 */

import { Object3D } from '../../engine/Object3D.js';
import { EventBus } from '../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

// Simple property-based testing utilities (since fast-check is not available)
const fc = {
    assert: (property, options = {}) => {
        const numRuns = options.numRuns || 100;
        for (let i = 0; i < numRuns; i++) {
            try {
                property.run();
            } catch (error) {
                throw new Error(`Property failed on run ${i + 1}: ${error.message}`);
            }
        }
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
    string: (options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 0;
            const maxLength = options.maxLength || 20;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
            return Array.from(
                { length },
                () => chars[Math.floor(Math.random() * chars.length)],
            ).join('');
        },
    }),
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    }),
    float: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.random() * (max - min) + min;
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

// Geometry generators
const geometryGenerator = fc.oneof(
    fc.constant(() => new THREE.BoxGeometry(1, 1, 1)),
    fc.constant(() => new THREE.SphereGeometry(1, 32, 16)),
    fc.constant(() => new THREE.PlaneGeometry(1, 1)),
    fc.constant(() => new THREE.CylinderGeometry(1, 1, 1, 32)),
    fc.constant(() => new THREE.ConeGeometry(1, 1, 32)),
);

// Material generators
const materialGenerator = fc.oneof(
    fc.constant(() => new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })),
    fc.constant(
        () =>
            new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff,
                metalness: Math.random(),
                roughness: Math.random(),
            }),
    ),
    fc.constant(() => new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })),
);

// Transform generators
const positionGenerator = fc.record({
    x: fc.float({ min: -100, max: 100 }),
    y: fc.float({ min: -100, max: 100 }),
    z: fc.float({ min: -100, max: 100 }),
});

const rotationGenerator = fc.record({
    x: fc.float({ min: 0, max: Math.PI * 2 }),
    y: fc.float({ min: 0, max: Math.PI * 2 }),
    z: fc.float({ min: 0, max: Math.PI * 2 }),
});

const scaleGenerator = fc.oneof(
    fc.float({ min: 0.1, max: 10 }), // Uniform scale
    fc.record({
        x: fc.float({ min: 0.1, max: 10 }),
        y: fc.float({ min: 0.1, max: 10 }),
        z: fc.float({ min: 0.1, max: 10 }),
    }),
);

describe('Object3D Creation Property Tests', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    /**
     * Property 1: Object creation completeness
     * For any valid object type and parameters, creating an object should result in a properly
     * configured object with all required transform properties (position, rotation, scale)
     * and metadata, added to the scene
     */
    test('**Feature: kalythesainz-framework, Property 1: Object creation completeness**', () => {
        fc.assert(
            fc.property(
                geometryGenerator,
                materialGenerator,
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 0,
                    maxLength: 5,
                }),
                fc.record({
                    customProp: fc.string(),
                    numericValue: fc.integer({ min: 0, max: 1000 }),
                    booleanFlag: fc.boolean(),
                }),
                positionGenerator,
                rotationGenerator,
                scaleGenerator,
                fc.boolean(),
                fc.boolean(),
                (
                    geometryFactory,
                    materialFactory,
                    name,
                    tags,
                    userData,
                    position,
                    rotation,
                    scale,
                    visible,
                    locked,
                ) => {
                    // Track events
                    const events = [];
                    EventBus.subscribe('object:created', (event) => {
                        events.push(event);
                    });

                    // Create geometry and material
                    const geometry = geometryFactory();
                    const material = materialFactory();

                    // Create object
                    const object = new Object3D(geometry, material);

                    // Verify basic object creation
                    expect(object).toBeInstanceOf(Object3D);
                    expect(object.id).toBeDefined();
                    expect(typeof object.id).toBe('string');
                    expect(object.id.length).toBeGreaterThan(0);

                    // Verify default name is set
                    expect(object.name).toBeDefined();
                    expect(typeof object.name).toBe('string');
                    expect(object.name.length).toBeGreaterThan(0);

                    // Verify transform properties exist and have correct types
                    expect(object.position).toBeInstanceOf(THREE.Vector3);
                    expect(object.rotation).toBeInstanceOf(THREE.Euler);
                    expect(object.scale).toBeInstanceOf(THREE.Vector3);

                    // Verify default transform values
                    expect(object.position.x).toBe(0);
                    expect(object.position.y).toBe(0);
                    expect(object.position.z).toBe(0);
                    expect(object.rotation.x).toBe(0);
                    expect(object.rotation.y).toBe(0);
                    expect(object.rotation.z).toBe(0);
                    expect(object.scale.x).toBe(1);
                    expect(object.scale.y).toBe(1);
                    expect(object.scale.z).toBe(1);

                    // Verify metadata properties
                    expect(Array.isArray(object.tags)).toBe(true);
                    expect(object.tags).toHaveLength(0);
                    expect(typeof object.userData).toBe('object');
                    expect(object.userData).not.toBeNull();
                    expect(typeof object.visible).toBe('boolean');
                    expect(object.visible).toBe(true);
                    expect(typeof object.locked).toBe('boolean');
                    expect(object.locked).toBe(false);

                    // Verify Three.js mesh access
                    expect(object.threeMesh).toBeInstanceOf(THREE.Mesh);
                    expect(object.threeMesh.geometry).toBe(geometry);
                    expect(object.threeMesh.material).toBe(material);

                    // Verify creation event was emitted
                    expect(events).toHaveLength(1);
                    expect(events[0].data.id).toBe(object.id);
                    expect(events[0].data.type).toBe('Object3D');
                    expect(events[0].data.object).toBe(object);

                    // Test property setters work correctly
                    object.name = name;
                    expect(object.name).toBe(name);

                    object.tags = tags;
                    expect(object.tags).toEqual(tags);

                    object.userData = userData;
                    expect(object.userData).toEqual(userData);

                    object.position = position;
                    expect(object.position.x).toBeCloseTo(position.x, 5);
                    expect(object.position.y).toBeCloseTo(position.y, 5);
                    expect(object.position.z).toBeCloseTo(position.z, 5);

                    object.rotation = rotation;
                    expect(object.rotation.x).toBeCloseTo(rotation.x, 5);
                    expect(object.rotation.y).toBeCloseTo(rotation.y, 5);
                    expect(object.rotation.z).toBeCloseTo(rotation.z, 5);

                    // Test scale (handle both uniform and non-uniform)
                    object.scale = scale;
                    if (typeof scale === 'number') {
                        expect(object.scale.x).toBeCloseTo(scale, 5);
                        expect(object.scale.y).toBeCloseTo(scale, 5);
                        expect(object.scale.z).toBeCloseTo(scale, 5);
                    } else {
                        expect(object.scale.x).toBeCloseTo(scale.x, 5);
                        expect(object.scale.y).toBeCloseTo(scale.y, 5);
                        expect(object.scale.z).toBeCloseTo(scale.z, 5);
                    }

                    object.visible = visible;
                    expect(object.visible).toBe(visible);
                    expect(object.threeMesh.visible).toBe(visible);

                    object.locked = locked;
                    expect(object.locked).toBe(locked);

                    // Verify serialization works
                    const serialized = object.serialize();
                    expect(serialized).toBeDefined();
                    expect(serialized.id).toBe(object.id);
                    expect(serialized.type).toBe('Object3D');
                    expect(serialized.name).toBe(name);
                    expect(serialized.tags).toEqual(tags);
                    expect(serialized.userData).toEqual(userData);
                    expect(serialized.visible).toBe(visible);
                    expect(serialized.locked).toBe(locked);
                    expect(serialized.transform).toBeDefined();
                    expect(serialized.geometry).toBeDefined();
                    expect(serialized.material).toBeDefined();

                    // Clean up
                    object.dispose();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Object creation with invalid parameters throws appropriate errors', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant('not-geometry'),
                    fc.constant({}),
                    fc.constant(42),
                ),
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant('not-material'),
                    fc.constant({}),
                    fc.constant(42),
                ),
                (invalidGeometry, invalidMaterial) => {
                    // Test invalid geometry
                    if (invalidGeometry !== null && invalidGeometry !== undefined) {
                        expect(() => {
                            new Object3D(invalidGeometry, new THREE.MeshBasicMaterial());
                        }).toThrow('Geometry must be a valid Three.js BufferGeometry');
                    }

                    // Test invalid material
                    if (invalidMaterial !== null && invalidMaterial !== undefined) {
                        expect(() => {
                            new Object3D(new THREE.BoxGeometry(), invalidMaterial);
                        }).toThrow('Material must be a valid Three.js Material');
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Object property setters validate input types correctly', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant(42),
                    fc.constant({}),
                    fc.constant([]),
                ),
                (invalidValue) => {
                    const object = new Object3D(
                        new THREE.BoxGeometry(),
                        new THREE.MeshBasicMaterial(),
                    );

                    // Test name validation
                    if (typeof invalidValue !== 'string') {
                        expect(() => {
                            object.name = invalidValue;
                        }).toThrow('Name must be a string');
                    }

                    // Test tags validation
                    if (
                        !Array.isArray(invalidValue) ||
                        (Array.isArray(invalidValue) &&
                            invalidValue.some((tag) => typeof tag !== 'string'))
                    ) {
                        expect(() => {
                            object.tags = invalidValue;
                        }).toThrow('Tags must be an array of strings');
                    }

                    // Test userData validation
                    if (
                        typeof invalidValue !== 'object' ||
                        invalidValue === null ||
                        Array.isArray(invalidValue)
                    ) {
                        expect(() => {
                            object.userData = invalidValue;
                        }).toThrow('User data must be a plain object');
                    }

                    // Test visible validation
                    if (typeof invalidValue !== 'boolean') {
                        expect(() => {
                            object.visible = invalidValue;
                        }).toThrow('Visible must be a boolean');
                    }

                    // Test locked validation
                    if (typeof invalidValue !== 'boolean') {
                        expect(() => {
                            object.locked = invalidValue;
                        }).toThrow('Locked must be a boolean');
                    }

                    object.dispose();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Object cloning preserves all properties correctly', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 0,
                    maxLength: 5,
                }),
                fc.record({
                    customProp: fc.string(),
                    numericValue: fc.integer({ min: 0, max: 1000 }),
                }),
                positionGenerator,
                rotationGenerator,
                scaleGenerator,
                fc.boolean(),
                fc.boolean(),
                (name, tags, userData, position, rotation, scale, visible, locked) => {
                    // Create original object
                    const original = new Object3D(
                        new THREE.BoxGeometry(1, 2, 3),
                        new THREE.MeshStandardMaterial({ color: 0xff0000 }),
                    );

                    // Set properties
                    original.name = name;
                    original.tags = tags;
                    original.userData = userData;
                    original.position = position;
                    original.rotation = rotation;
                    original.scale = scale;
                    original.visible = visible;
                    original.locked = locked;

                    // Clone object
                    const cloned = original.clone();

                    // Verify clone has different ID
                    expect(cloned.id).not.toBe(original.id);

                    // Verify clone has copied name with suffix
                    expect(cloned.name).toBe(`${name}_copy`);

                    // Verify all other properties are copied
                    expect(cloned.tags).toEqual(tags);
                    expect(cloned.userData).toEqual(userData);
                    expect(cloned.visible).toBe(visible);
                    expect(cloned.locked).toBe(locked);

                    // Verify transform properties are copied
                    expect(cloned.position.x).toBeCloseTo(original.position.x, 5);
                    expect(cloned.position.y).toBeCloseTo(original.position.y, 5);
                    expect(cloned.position.z).toBeCloseTo(original.position.z, 5);

                    expect(cloned.rotation.x).toBeCloseTo(original.rotation.x, 5);
                    expect(cloned.rotation.y).toBeCloseTo(original.rotation.y, 5);
                    expect(cloned.rotation.z).toBeCloseTo(original.rotation.z, 5);

                    expect(cloned.scale.x).toBeCloseTo(original.scale.x, 5);
                    expect(cloned.scale.y).toBeCloseTo(original.scale.y, 5);
                    expect(cloned.scale.z).toBeCloseTo(original.scale.z, 5);

                    // Verify geometry and material are cloned (not shared)
                    expect(cloned.threeMesh.geometry).not.toBe(original.threeMesh.geometry);
                    expect(cloned.threeMesh.material).not.toBe(original.threeMesh.material);

                    // Clean up
                    original.dispose();
                    cloned.dispose();
                },
            ),
            { numRuns: 50 },
        );
    });
});
