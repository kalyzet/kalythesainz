/**
 * Property-based tests for object addition events
 * **Feature: instance-based-api, Property 16: Object Addition Event**
 * **Validates: Requirements 6.4**
 */

import { SceneInstance } from '../../engine/SceneInstance.js';

// Simple property-based testing utilities
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
            const minLength = options.minLength || 1;
            const maxLength = options.maxLength || 20;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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
            const gen = generators[Math.floor(Math.random() * generators.length)];
            return gen.generate();
        },
    }),
    constant: (value) => ({
        generate: () => value,
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
};

// Mock DOM container
function createMockContainer(id) {
    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
    return container;
}

describe('Object Addition Event Property Tests', () => {
    let containers = [];

    beforeEach(() => {
        containers = [];
    });

    afterEach(() => {
        // Clean up containers
        for (const container of containers) {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
        containers = [];
    });

    /**
     * Property 16: Object Addition Event
     * For any scene instance and object, calling scene.add(object) should emit
     * an 'object:added' event on that scene instance
     */
    test('**Feature: instance-based-api, Property 16: Object Addition Event**', () => {
        fc.assert(
            fc.property(
                // Generate random object creation parameters
                fc.array(
                    fc.record({
                        type: fc.oneof(
                            fc.constant('box'),
                            fc.constant('sphere'),
                            fc.constant('plane'),
                        ),
                        width: fc.float({ min: 0.1, max: 10 }),
                        height: fc.float({ min: 0.1, max: 10 }),
                        depth: fc.float({ min: 0.1, max: 10 }),
                        radius: fc.float({ min: 0.1, max: 10 }),
                        segments: fc.integer({ min: 8, max: 64 }),
                    }),
                    { minLength: 1, maxLength: 10 },
                ),
                (objectParams) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const events = [];

                    // Subscribe to object:added event
                    scene.on('object:added', (event) => {
                        events.push({
                            objectId: event.data.objectId,
                            object: event.data.object,
                            timestamp: event.timestamp,
                        });
                    });

                    // Create and add objects
                    const createdObjects = [];
                    for (const params of objectParams) {
                        let obj;
                        if (params.type === 'box') {
                            obj = scene.createBox(params.width, params.height, params.depth);
                        } else if (params.type === 'sphere') {
                            obj = scene.createSphere(params.radius, params.segments);
                        } else if (params.type === 'plane') {
                            obj = scene.createPlane(params.width, params.height);
                        }
                        createdObjects.push(obj);
                    }

                    // Verify event was emitted for each object
                    expect(events).toHaveLength(objectParams.length);

                    // Verify each event contains the correct object
                    for (let i = 0; i < objectParams.length; i++) {
                        expect(events[i].object).toBe(createdObjects[i]);
                        expect(events[i].objectId).toBeDefined();
                        expect(events[i].timestamp).toBeDefined();
                    }

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Object addition event is instance-scoped', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 5 }), // Number of scenes
                fc.integer({ min: 1, max: 5 }), // Objects per scene
                (sceneCount, objectsPerScene) => {
                    const scenes = [];
                    const eventCounts = new Map();

                    // Create multiple scenes
                    for (let i = 0; i < sceneCount; i++) {
                        const containerId = `test-container-${Date.now()}-${i}`;
                        const container = createMockContainer(containerId);
                        containers.push(container);

                        const scene = new SceneInstance(containerId, { autoStart: false });
                        scenes.push(scene);
                        eventCounts.set(scene, 0);

                        // Subscribe to object:added event
                        scene.on('object:added', () => {
                            eventCounts.set(scene, eventCounts.get(scene) + 1);
                        });
                    }

                    // Add objects to each scene
                    for (const scene of scenes) {
                        for (let i = 0; i < objectsPerScene; i++) {
                            scene.createBox(1, 1, 1);
                        }
                    }

                    // Verify each scene received exactly the right number of events
                    for (const scene of scenes) {
                        expect(eventCounts.get(scene)).toBe(objectsPerScene);
                    }

                    // Clean up
                    for (const scene of scenes) {
                        scene.destroy();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Object addition event contains correct data', () => {
        fc.assert(
            fc.property(
                fc.float({ min: 0.1, max: 10 }),
                fc.float({ min: 0.1, max: 10 }),
                fc.float({ min: 0.1, max: 10 }),
                (width, height, depth) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    let eventData = null;

                    // Subscribe to object:added event
                    scene.on('object:added', (event) => {
                        eventData = event.data;
                    });

                    // Create a box
                    const box = scene.createBox(width, height, depth);

                    // Verify event was emitted with correct data
                    expect(eventData).not.toBeNull();
                    expect(eventData.object).toBe(box);
                    expect(eventData.objectId).toBeDefined();
                    expect(typeof eventData.objectId).toBe('string');

                    // Verify the object is in the scene
                    const sceneObjects = scene.objects;
                    expect(sceneObjects.has(eventData.objectId)).toBe(true);

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Multiple listeners receive object addition events', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 10 }), // Number of listeners
                fc.integer({ min: 1, max: 5 }), // Number of objects
                (listenerCount, objectCount) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const listenerResults = [];

                    // Create multiple listeners
                    for (let i = 0; i < listenerCount; i++) {
                        listenerResults.push([]);
                        scene.on('object:added', (event) => {
                            listenerResults[i].push(event.data.objectId);
                        });
                    }

                    // Add objects
                    for (let i = 0; i < objectCount; i++) {
                        scene.createBox(1, 1, 1);
                    }

                    // Verify all listeners received all events
                    for (let i = 0; i < listenerCount; i++) {
                        expect(listenerResults[i]).toHaveLength(objectCount);
                    }

                    // Verify all listeners received the same object IDs
                    for (let i = 1; i < listenerCount; i++) {
                        expect(listenerResults[i]).toEqual(listenerResults[0]);
                    }

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 100 },
        );
    });
});
