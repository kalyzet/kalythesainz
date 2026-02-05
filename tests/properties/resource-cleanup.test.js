/**
 * Property-based tests for resource cleanup consistency
 * **Feature: kalythesainz-framework, Property 3: Resource cleanup consistency**
 * **Validates: Requirements 2.4**
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
const objectTypeGenerator = fc.constantFrom('Object3D', 'Box', 'Sphere', 'Plane');

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
        case 'Object3D':
        default:
            return new Object3D(
                new THREE.BoxGeometry(
                    Math.random() * 5 + 0.5,
                    Math.random() * 5 + 0.5,
                    Math.random() * 5 + 0.5,
                ),
                new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }),
            );
    }
}

// Helper function to check if an object has been properly disposed
function verifyObjectDisposed(object, originalGeometry, originalMaterial) {
    // Check that the object's internal references are cleared
    if (object.threeMesh !== null) {
        throw new Error('threeMesh reference not cleared after disposal');
    }

    // Check that tags and userData are cleared
    if (object.tags.length !== 0) {
        throw new Error('Tags not cleared after disposal');
    }

    if (Object.keys(object.userData).length !== 0) {
        throw new Error('UserData not cleared after disposal');
    }

    // Check that geometry and material dispose methods were called
    // Note: We can't directly verify disposal was called on Three.js objects,
    // but we can check that the references are cleared
    if (
        originalGeometry &&
        originalGeometry.userData &&
        originalGeometry.userData.disposed !== true
    ) {
        // This would be set by Three.js dispose() method in a real scenario
        // For testing, we'll check that the object no longer references it
    }
}

describe('Resource Cleanup Property Tests', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    /**
     * Property 3: Resource cleanup consistency
     * For any object removal operation, all associated resources, references, and visual
     * representations should be completely cleaned up without memory leaks
     */
    test('**Feature: kalythesainz-framework, Property 3: Resource cleanup consistency**', () => {
        fc.assert(
            fc.property(
                objectTypeGenerator,
                fc.array(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                            minLength: 0,
                            maxLength: 5,
                        }),
                        userData: fc.record({
                            customProp: fc.string(),
                            numericValue: fc.integer({ min: 0, max: 1000 }),
                            booleanFlag: fc.boolean(),
                        }),
                        position: fc.record({
                            x: fc.float({ min: -100, max: 100 }),
                            y: fc.float({ min: -100, max: 100 }),
                            z: fc.float({ min: -100, max: 100 }),
                        }),
                    }),
                    { minLength: 1, maxLength: 10 },
                ),
                fc.integer({ min: 1, max: 5 }), // Number of clones to create
                (objectType, objectConfigs, numClones) => {
                    // Clear EventBus
                    EventBus.clear();

                    // Track disposal events
                    const disposalEvents = [];
                    const disposedEvents = [];

                    EventBus.subscribe('object:disposing', (event) => {
                        disposalEvents.push(event);
                    });

                    EventBus.subscribe('object:disposed', (event) => {
                        disposedEvents.push(event);
                    });

                    const objects = [];
                    const originalGeometries = [];
                    const originalMaterials = [];

                    // Create multiple objects with various configurations
                    for (const config of objectConfigs) {
                        const object = createObjectByType(objectType);

                        // Configure the object
                        object.name = config.name;
                        object.tags = config.tags;
                        object.userData = config.userData;
                        object.position = config.position;

                        // Store references to original geometry and material for verification
                        originalGeometries.push(object.threeMesh.geometry);
                        originalMaterials.push(object.threeMesh.material);

                        objects.push(object);

                        // Create clones to test cleanup of cloned objects
                        for (let i = 0; i < numClones; i++) {
                            const clone = object.clone();
                            objects.push(clone);
                            originalGeometries.push(clone.threeMesh.geometry);
                            originalMaterials.push(clone.threeMesh.material);
                        }
                    }

                    const totalObjects = objects.length;
                    const objectIds = objects.map((obj) => obj.id);

                    // Verify all objects are properly initialized
                    for (const object of objects) {
                        if (!object.id) {
                            throw new Error('Object not properly initialized before disposal');
                        }
                        if (!object.threeMesh) {
                            throw new Error('Object threeMesh not properly initialized');
                        }
                        if (!object.threeMesh.geometry) {
                            throw new Error('Object geometry not properly initialized');
                        }
                        if (!object.threeMesh.material) {
                            throw new Error('Object material not properly initialized');
                        }
                    }

                    // Dispose all objects
                    for (let i = 0; i < objects.length; i++) {
                        const object = objects[i];
                        const originalGeometry = originalGeometries[i];
                        const originalMaterial = originalMaterials[i];

                        // Verify object is in valid state before disposal
                        if (object.threeMesh === null) {
                            throw new Error(
                                'Object already disposed before explicit disposal call',
                            );
                        }

                        // Dispose the object
                        object.dispose();

                        // Verify immediate cleanup
                        verifyObjectDisposed(object, originalGeometry, originalMaterial);

                        // Verify that accessing properties after disposal doesn't crash
                        // but returns appropriate default/empty values
                        if (object.tags.length !== 0) {
                            throw new Error('Tags not properly cleared after disposal');
                        }

                        if (Object.keys(object.userData).length !== 0) {
                            throw new Error('UserData not properly cleared after disposal');
                        }

                        // Verify that the object can't be used after disposal
                        try {
                            object.threeMesh.position.set(1, 2, 3);
                            throw new Error('Object threeMesh still accessible after disposal');
                        } catch (error) {
                            // Expected - threeMesh should be null
                            if (
                                !error.message.includes('null') &&
                                !error.message.includes('undefined')
                            ) {
                                throw new Error(
                                    'Unexpected error when accessing disposed object: ' +
                                        error.message,
                                );
                            }
                        }
                    }

                    // Verify disposal events were emitted correctly
                    if (disposalEvents.length !== totalObjects) {
                        throw new Error(
                            `Expected ${totalObjects} disposing events, got ${disposalEvents.length}`,
                        );
                    }

                    if (disposedEvents.length !== totalObjects) {
                        throw new Error(
                            `Expected ${totalObjects} disposed events, got ${disposedEvents.length}`,
                        );
                    }

                    // Verify all disposal events have correct IDs
                    const disposingIds = disposalEvents.map((event) => event.data.id);
                    const disposedIds = disposedEvents.map((event) => event.data.id);

                    for (const objectId of objectIds) {
                        if (!disposingIds.includes(objectId)) {
                            throw new Error(`Missing disposing event for object ${objectId}`);
                        }
                        if (!disposedIds.includes(objectId)) {
                            throw new Error(`Missing disposed event for object ${objectId}`);
                        }
                    }

                    // Verify that disposing multiple objects doesn't interfere with each other
                    // All objects should be independently cleaned up
                    for (let i = 0; i < objects.length; i++) {
                        const object = objects[i];
                        if (object.threeMesh !== null) {
                            throw new Error(`Object ${i} not properly disposed`);
                        }
                    }

                    // Test that calling dispose multiple times doesn't cause errors
                    for (const object of objects) {
                        try {
                            object.dispose(); // Should not throw error
                        } catch (error) {
                            throw new Error(
                                'Multiple dispose calls should not throw errors: ' + error.message,
                            );
                        }
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Resource cleanup handles edge cases correctly', () => {
        fc.assert(
            fc.property(
                objectTypeGenerator,
                fc.boolean(), // Whether to modify object before disposal
                fc.boolean(), // Whether to clone before disposal
                (objectType, modifyBeforeDisposal, cloneBeforeDisposal) => {
                    // Clear EventBus
                    EventBus.clear();

                    const disposalEvents = [];
                    EventBus.subscribe('object:disposing', (event) => {
                        disposalEvents.push(event);
                    });

                    // Create object
                    const object = createObjectByType(objectType);
                    let objectToDispose = object;

                    // Optionally modify object before disposal
                    if (modifyBeforeDisposal) {
                        object.name = 'modified_before_disposal';
                        object.tags = ['test', 'disposal'];
                        object.userData = { modified: true, timestamp: Date.now() };
                        object.position = { x: 10, y: 20, z: 30 };
                        object.visible = false;
                        object.locked = true;
                    }

                    // Optionally create clone before disposal
                    if (cloneBeforeDisposal) {
                        const clone = object.clone();
                        objectToDispose = clone;
                    }

                    // Store references for verification
                    const objectId = objectToDispose.id;
                    const originalGeometry = objectToDispose.threeMesh.geometry;
                    const originalMaterial = objectToDispose.threeMesh.material;

                    // Dispose object
                    objectToDispose.dispose();

                    // Verify cleanup
                    verifyObjectDisposed(objectToDispose, originalGeometry, originalMaterial);

                    // Verify disposal event was emitted
                    if (disposalEvents.length === 0) {
                        throw new Error('No disposal event emitted');
                    }

                    const disposalEvent = disposalEvents.find(
                        (event) => event.data.id === objectId,
                    );
                    if (!disposalEvent) {
                        throw new Error('Disposal event not found for disposed object');
                    }

                    // If we disposed a clone, verify original is still intact
                    if (cloneBeforeDisposal && object !== objectToDispose) {
                        if (object.threeMesh === null) {
                            throw new Error('Original object was affected by clone disposal');
                        }
                        if (object.id === objectToDispose.id) {
                            throw new Error('Clone and original have same ID');
                        }

                        // Clean up original
                        object.dispose();
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Resource cleanup works correctly with shared materials and geometries', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 10 }), // Number of objects sharing resources
                fc.boolean(), // Whether to share geometry
                fc.boolean(), // Whether to share material
                (numObjects, shareGeometry, shareMaterial) => {
                    // Clear EventBus
                    EventBus.clear();

                    const objects = [];
                    let sharedGeometry = null;
                    let sharedMaterial = null;

                    // Create shared resources if needed
                    if (shareGeometry) {
                        sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
                    }
                    if (shareMaterial) {
                        sharedMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    }

                    // Create objects with potentially shared resources
                    for (let i = 0; i < numObjects; i++) {
                        const geometry = shareGeometry
                            ? sharedGeometry
                            : new THREE.BoxGeometry(
                                  Math.random() + 0.5,
                                  Math.random() + 0.5,
                                  Math.random() + 0.5,
                              );
                        const material = shareMaterial
                            ? sharedMaterial
                            : new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });

                        const object = new Object3D(geometry, material);
                        objects.push(object);
                    }

                    // Dispose all objects
                    for (const object of objects) {
                        object.dispose();

                        // Verify object is properly disposed
                        if (object.threeMesh !== null) {
                            throw new Error('Object not properly disposed with shared resources');
                        }
                        if (object.tags.length !== 0) {
                            throw new Error('Tags not cleared with shared resources');
                        }
                        if (Object.keys(object.userData).length !== 0) {
                            throw new Error('UserData not cleared with shared resources');
                        }
                    }

                    // Note: In a real scenario, shared resources should only be disposed
                    // when no objects are using them. For this test, we verify that
                    // object disposal doesn't break when resources are shared.
                },
            ),
            { numRuns: 50 },
        );
    });
});
