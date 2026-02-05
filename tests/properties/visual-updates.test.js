/**
 * Property-based tests for real-time visual updates
 * **Feature: kalythesainz-framework, Property 2: Real-time visual updates**
 * **Validates: Requirements 2.3, 4.3**
 */

import * as THREE from 'three';
import { Object3D } from '../../engine/Object3D.js';
import { Box } from '../../objects/Box.js';
import { Sphere } from '../../objects/Sphere.js';
import { Plane } from '../../objects/Plane.js';
import { EventBus } from '../../core/EventBus.js';

// Simple property-based testing utilities (since fast-check is not available)
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

// Object type generators
const objectTypeGenerator = fc.constantFrom('Box', 'Sphere', 'Plane');

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

// Property change generators
const propertyChangeGenerator = fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
    userData: fc.record({
        customProp: fc.string(),
        numericValue: fc.integer({ min: 0, max: 1000 }),
    }),
    visible: fc.boolean(),
    locked: fc.boolean(),
});

// Helper function to create objects based on type
function createObjectByType(type) {
    switch (type) {
        case 'Box':
            return Box.create(
                Math.random() * 5 + 0.5,
                Math.random() * 5 + 0.5,
                Math.random() * 5 + 0.5,
            );
        case 'Sphere':
            return Sphere.create(Math.random() * 3 + 0.5, Math.floor(Math.random() * 20) + 8);
        case 'Plane':
            return Plane.create(Math.random() * 5 + 0.5, Math.random() * 5 + 0.5);
        default:
            return new Object3D(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
    }
}

// Helper function to check if values are close
function isClose(a, b, tolerance = 1e-5) {
    return Math.abs(a - b) < tolerance;
}

describe('Visual Updates Property Tests', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    /**
     * Property 2: Real-time visual updates
     * For any object property modification, the visual representation should update
     * immediately and consistently across all visual interfaces (3D viewport, inspector, scene tree)
     */
    test('**Feature: kalythesainz-framework, Property 2: Real-time visual updates**', () => {
        fc.assert(
            fc.property(
                objectTypeGenerator,
                positionGenerator,
                rotationGenerator,
                scaleGenerator,
                propertyChangeGenerator,
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, max: 5 }),
                (objectType, position, rotation, scale, propertyChanges, eventTypes) => {
                    // Clear EventBus
                    EventBus.clear();

                    // Track all events for consistency verification
                    const allEvents = [];
                    const eventsByType = new Map();

                    // Subscribe to all relevant events
                    const relevantEvents = [
                        'object:created',
                        'object:nameChanged',
                        'object:tagsChanged',
                        'object:userDataChanged',
                        'object:visibilityChanged',
                        'object:lockChanged',
                        'object:positionChanged',
                        'object:rotationChanged',
                        'object:scaleChanged',
                        'object:dimensionChanged',
                        'object:parameterChanged',
                    ];

                    for (const eventType of relevantEvents) {
                        eventsByType.set(eventType, []);
                        EventBus.subscribe(eventType, (event) => {
                            allEvents.push({ type: eventType, event });
                            eventsByType.get(eventType).push(event);
                        });
                    }

                    // Create object
                    const object = createObjectByType(objectType);
                    const initialEventCount = allEvents.length;

                    // Verify creation event was emitted
                    if (initialEventCount === 0) {
                        throw new Error('No creation event emitted');
                    }

                    const creationEvents = eventsByType.get('object:created');
                    if (creationEvents.length !== 1) {
                        throw new Error('Expected exactly one creation event');
                    }

                    if (creationEvents[0].data.id !== object.id) {
                        throw new Error('Creation event ID mismatch');
                    }

                    // Test transform property updates and verify immediate visual sync
                    const beforeTransformEvents = allEvents.length;

                    // Update position
                    object.position = position;

                    // Verify position was updated immediately in Three.js mesh
                    if (!isClose(object.threeMesh.position.x, position.x)) {
                        throw new Error('Position.x not immediately synced to Three.js mesh');
                    }
                    if (!isClose(object.threeMesh.position.y, position.y)) {
                        throw new Error('Position.y not immediately synced to Three.js mesh');
                    }
                    if (!isClose(object.threeMesh.position.z, position.z)) {
                        throw new Error('Position.z not immediately synced to Three.js mesh');
                    }

                    // Update rotation
                    object.rotation = rotation;

                    // Verify rotation was updated immediately in Three.js mesh
                    if (!isClose(object.threeMesh.rotation.x, rotation.x)) {
                        throw new Error('Rotation.x not immediately synced to Three.js mesh');
                    }
                    if (!isClose(object.threeMesh.rotation.y, rotation.y)) {
                        throw new Error('Rotation.y not immediately synced to Three.js mesh');
                    }
                    if (!isClose(object.threeMesh.rotation.z, rotation.z)) {
                        throw new Error('Rotation.z not immediately synced to Three.js mesh');
                    }

                    // Update scale
                    object.scale = scale;

                    // Verify scale was updated immediately in Three.js mesh
                    if (typeof scale === 'number') {
                        if (!isClose(object.threeMesh.scale.x, scale)) {
                            throw new Error(
                                'Uniform scale.x not immediately synced to Three.js mesh',
                            );
                        }
                        if (!isClose(object.threeMesh.scale.y, scale)) {
                            throw new Error(
                                'Uniform scale.y not immediately synced to Three.js mesh',
                            );
                        }
                        if (!isClose(object.threeMesh.scale.z, scale)) {
                            throw new Error(
                                'Uniform scale.z not immediately synced to Three.js mesh',
                            );
                        }
                    } else {
                        if (!isClose(object.threeMesh.scale.x, scale.x)) {
                            throw new Error('Scale.x not immediately synced to Three.js mesh');
                        }
                        if (!isClose(object.threeMesh.scale.y, scale.y)) {
                            throw new Error('Scale.y not immediately synced to Three.js mesh');
                        }
                        if (!isClose(object.threeMesh.scale.z, scale.z)) {
                            throw new Error('Scale.z not immediately synced to Three.js mesh');
                        }
                    }

                    // Verify transform change events were emitted
                    const positionEvents = eventsByType.get('object:positionChanged');
                    const rotationEvents = eventsByType.get('object:rotationChanged');
                    const scaleEvents = eventsByType.get('object:scaleChanged');

                    if (positionEvents.length === 0) {
                        throw new Error('No position change event emitted');
                    }
                    if (rotationEvents.length === 0) {
                        throw new Error('No rotation change event emitted');
                    }
                    if (scaleEvents.length === 0) {
                        throw new Error('No scale change event emitted');
                    }

                    // Test metadata property updates
                    const beforeMetadataEvents = allEvents.length;

                    // Update name
                    object.name = propertyChanges.name;
                    if (object.name !== propertyChanges.name) {
                        throw new Error('Name not immediately updated');
                    }

                    // Update tags
                    object.tags = propertyChanges.tags;
                    if (JSON.stringify(object.tags) !== JSON.stringify(propertyChanges.tags)) {
                        throw new Error('Tags not immediately updated');
                    }

                    // Update userData
                    object.userData = propertyChanges.userData;
                    if (
                        JSON.stringify(object.userData) !== JSON.stringify(propertyChanges.userData)
                    ) {
                        throw new Error('UserData not immediately updated');
                    }

                    // Update visibility
                    object.visible = propertyChanges.visible;
                    if (object.visible !== propertyChanges.visible) {
                        throw new Error('Visible not immediately updated');
                    }
                    if (object.threeMesh.visible !== propertyChanges.visible) {
                        throw new Error('Three.js mesh visibility not immediately synced');
                    }

                    // Update locked state
                    object.locked = propertyChanges.locked;
                    if (object.locked !== propertyChanges.locked) {
                        throw new Error('Locked not immediately updated');
                    }

                    // Verify metadata change events were emitted
                    const nameEvents = eventsByType.get('object:nameChanged');
                    const tagsEvents = eventsByType.get('object:tagsChanged');
                    const userDataEvents = eventsByType.get('object:userDataChanged');
                    const visibilityEvents = eventsByType.get('object:visibilityChanged');
                    const lockEvents = eventsByType.get('object:lockChanged');

                    if (nameEvents.length === 0) {
                        throw new Error('No name change event emitted');
                    }
                    if (tagsEvents.length === 0) {
                        throw new Error('No tags change event emitted');
                    }
                    if (userDataEvents.length === 0) {
                        throw new Error('No userData change event emitted');
                    }
                    if (visibilityEvents.length === 0) {
                        throw new Error('No visibility change event emitted');
                    }
                    if (lockEvents.length === 0) {
                        throw new Error('No lock change event emitted');
                    }

                    // Verify event consistency - all events should reference the same object
                    for (const { event } of allEvents) {
                        if (event.data && event.data.id && event.data.id !== object.id) {
                            throw new Error('Event ID inconsistency detected');
                        }
                        if (event.data && event.data.object && event.data.object !== object) {
                            throw new Error('Event object reference inconsistency detected');
                        }
                    }

                    // Test object-specific property updates (if applicable)
                    if (objectType === 'Box' && object.setDimensions) {
                        const newWidth = Math.random() * 5 + 0.5;
                        const newHeight = Math.random() * 5 + 0.5;
                        const newDepth = Math.random() * 5 + 0.5;

                        object.setDimensions(newWidth, newHeight, newDepth);

                        if (!isClose(object.width, newWidth)) {
                            throw new Error('Box width not immediately updated');
                        }
                        if (!isClose(object.height, newHeight)) {
                            throw new Error('Box height not immediately updated');
                        }
                        if (!isClose(object.depth, newDepth)) {
                            throw new Error('Box depth not immediately updated');
                        }
                    }

                    if (objectType === 'Sphere' && object.radius !== undefined) {
                        const newRadius = Math.random() * 3 + 0.5;
                        object.radius = newRadius;

                        if (!isClose(object.radius, newRadius)) {
                            throw new Error('Sphere radius not immediately updated');
                        }
                    }

                    if (objectType === 'Plane' && object.setDimensions) {
                        const newWidth = Math.random() * 5 + 0.5;
                        const newHeight = Math.random() * 5 + 0.5;

                        object.setDimensions(newWidth, newHeight);

                        if (!isClose(object.width, newWidth)) {
                            throw new Error('Plane width not immediately updated');
                        }
                        if (!isClose(object.height, newHeight)) {
                            throw new Error('Plane height not immediately updated');
                        }
                    }

                    // Verify that all changes are reflected in serialization immediately
                    const serialized = object.serialize();
                    if (!serialized) {
                        throw new Error('Serialization failed after updates');
                    }

                    if (serialized.name !== propertyChanges.name) {
                        throw new Error('Serialized name not updated');
                    }
                    if (JSON.stringify(serialized.tags) !== JSON.stringify(propertyChanges.tags)) {
                        throw new Error('Serialized tags not updated');
                    }
                    if (
                        JSON.stringify(serialized.userData) !==
                        JSON.stringify(propertyChanges.userData)
                    ) {
                        throw new Error('Serialized userData not updated');
                    }
                    if (serialized.visible !== propertyChanges.visible) {
                        throw new Error('Serialized visible not updated');
                    }
                    if (serialized.locked !== propertyChanges.locked) {
                        throw new Error('Serialized locked not updated');
                    }

                    // Clean up
                    object.dispose();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Visual updates maintain consistency across multiple simultaneous changes', () => {
        fc.assert(
            fc.property(
                objectTypeGenerator,
                fc.array(
                    fc.record({
                        position: positionGenerator,
                        rotation: rotationGenerator,
                        scale: scaleGenerator,
                        name: fc.string({ minLength: 1, maxLength: 20 }),
                        visible: fc.boolean(),
                    }),
                    { minLength: 2, maxLength: 10 },
                ),
                (objectType, changes) => {
                    // Clear EventBus
                    EventBus.clear();

                    const events = [];
                    EventBus.subscribe('object:positionChanged', (event) => events.push(event));
                    EventBus.subscribe('object:rotationChanged', (event) => events.push(event));
                    EventBus.subscribe('object:scaleChanged', (event) => events.push(event));
                    EventBus.subscribe('object:nameChanged', (event) => events.push(event));
                    EventBus.subscribe('object:visibilityChanged', (event) => events.push(event));

                    // Create object
                    const object = createObjectByType(objectType);

                    // Apply all changes rapidly
                    for (const change of changes) {
                        object.position = change.position;
                        object.rotation = change.rotation;
                        object.scale = change.scale;
                        object.name = change.name;
                        object.visible = change.visible;

                        // Verify immediate consistency after each change
                        if (!isClose(object.threeMesh.position.x, change.position.x)) {
                            throw new Error('Position consistency lost during rapid changes');
                        }
                        if (!isClose(object.threeMesh.rotation.x, change.rotation.x)) {
                            throw new Error('Rotation consistency lost during rapid changes');
                        }
                        if (object.threeMesh.visible !== change.visible) {
                            throw new Error('Visibility consistency lost during rapid changes');
                        }
                        if (object.name !== change.name) {
                            throw new Error('Name consistency lost during rapid changes');
                        }
                    }

                    // Verify final state matches last change
                    const lastChange = changes[changes.length - 1];
                    if (!isClose(object.position.x, lastChange.position.x)) {
                        throw new Error('Final position state incorrect');
                    }
                    if (!isClose(object.rotation.x, lastChange.rotation.x)) {
                        throw new Error('Final rotation state incorrect');
                    }
                    if (object.visible !== lastChange.visible) {
                        throw new Error('Final visibility state incorrect');
                    }
                    if (object.name !== lastChange.name) {
                        throw new Error('Final name state incorrect');
                    }

                    // Verify events were emitted for all changes
                    if (events.length < changes.length * 4) {
                        // At least 4 events per change
                        throw new Error('Not all change events were emitted');
                    }

                    object.dispose();
                },
            ),
            { numRuns: 50 },
        );
    });
});
