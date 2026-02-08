/**
 * Property-based tests for event cleanup on scene destruction
 * **Feature: instance-based-api, Property 15: Event Cleanup on Destroy**
 * **Validates: Requirements 6.3**
 */

import { SceneInstance } from '../../engine/SceneInstance.js';
import { EventBus } from '../../core/EventBus.js';

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

describe('Event Cleanup Property Tests', () => {
    let containers = [];

    beforeEach(() => {
        containers = [];
        // Clear global EventBus
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up containers
        for (const container of containers) {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
        containers = [];
        // Clear global EventBus
        EventBus.clear();
    });

    /**
     * Property 15: Event Cleanup on Destroy
     * For any scene instance with registered event listeners, calling scene.destroy()
     * should automatically unsubscribe all instance-scoped listeners
     */
    test('**Feature: instance-based-api, Property 15: Event Cleanup on Destroy**', () => {
        fc.assert(
            fc.property(
                // Generate random event names
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 1,
                    maxLength: 5,
                }),
                // Generate number of listeners per event
                fc.integer({ min: 1, max: 5 }),
                // Generate random event data
                fc.record({
                    id: fc.string(),
                    value: fc.integer({ min: 0, max: 1000 }),
                }),
                (eventNames, listenersPerEvent, eventData) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const results = [];

                    // Subscribe multiple listeners to each event
                    for (const eventName of eventNames) {
                        for (let i = 0; i < listenersPerEvent; i++) {
                            scene.on(eventName, (event) => {
                                results.push({
                                    eventName: event.name,
                                    listenerId: i,
                                    data: event.data,
                                });
                            });
                        }
                    }

                    // Verify listeners work before destroy
                    for (const eventName of eventNames) {
                        scene.emit(eventName, eventData);
                    }

                    const expectedResultsBeforeDestroy = eventNames.length * listenersPerEvent;
                    expect(results).toHaveLength(expectedResultsBeforeDestroy);

                    // Clear results
                    results.length = 0;

                    // Destroy the scene
                    scene.destroy();

                    // Try to emit events after destroy - listeners should not be triggered
                    for (const eventName of eventNames) {
                        // Emitting on destroyed scene should not trigger listeners
                        // (the scene is disposed, so emit might throw or do nothing)
                        try {
                            scene.emit(eventName, eventData);
                        } catch (error) {
                            // Expected - scene is disposed
                        }
                    }

                    // Verify no listeners were triggered after destroy
                    expect(results).toHaveLength(0);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Global event listeners are unsubscribed on destroy', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 1,
                    maxLength: 5,
                }),
                fc.integer({ min: 1, max: 5 }),
                (eventNames, listenersPerEvent) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const results = [];

                    // Subscribe to global events through the scene
                    for (const eventName of eventNames) {
                        for (let i = 0; i < listenersPerEvent; i++) {
                            scene.onGlobal(eventName, (event) => {
                                results.push({
                                    eventName: event.name,
                                    listenerId: i,
                                });
                            });
                        }
                    }

                    // Verify listeners work before destroy
                    for (const eventName of eventNames) {
                        EventBus.publish(eventName, { test: 'data' });
                    }

                    const expectedResultsBeforeDestroy = eventNames.length * listenersPerEvent;
                    expect(results).toHaveLength(expectedResultsBeforeDestroy);

                    // Clear results
                    results.length = 0;

                    // Destroy the scene
                    scene.destroy();

                    // Emit global events after destroy - listeners should not be triggered
                    for (const eventName of eventNames) {
                        EventBus.publish(eventName, { test: 'data' });
                    }

                    // Verify no listeners were triggered after destroy
                    expect(results).toHaveLength(0);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Destroying one scene does not affect other scenes event listeners', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.record({
                    id: fc.string(),
                    value: fc.integer({ min: 0, max: 1000 }),
                }),
                (eventName, eventData) => {
                    const scenes = [];
                    const results = new Map();

                    // Create two scenes
                    for (let i = 0; i < 2; i++) {
                        const containerId = `test-container-${Date.now()}-${i}`;
                        const container = createMockContainer(containerId);
                        containers.push(container);

                        const scene = new SceneInstance(containerId, { autoStart: false });
                        scenes.push(scene);
                        results.set(scene, []);

                        // Subscribe to event
                        scene.on(eventName, (event) => {
                            results.get(scene).push(event.data);
                        });
                    }

                    // Destroy first scene
                    scenes[0].destroy();

                    // Emit event on second scene
                    scenes[1].emit(eventName, eventData);

                    // Verify first scene's listener was not triggered (scene is destroyed)
                    expect(results.get(scenes[0])).toHaveLength(0);

                    // Verify second scene's listener was triggered
                    expect(results.get(scenes[1])).toHaveLength(1);
                    expect(results.get(scenes[1])[0]).toEqual(eventData);

                    // Clean up remaining scene
                    scenes[1].destroy();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Manual unsubscribe still works before destroy', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.integer({ min: 2, max: 5 }), // Number of listeners
                (eventName, listenerCount) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const results = [];
                    const unsubscribers = [];

                    // Subscribe multiple listeners
                    for (let i = 0; i < listenerCount; i++) {
                        const unsubscribe = scene.on(eventName, (event) => {
                            results.push({ listenerId: i, data: event.data });
                        });
                        unsubscribers.push(unsubscribe);
                    }

                    // Manually unsubscribe half of the listeners
                    const halfCount = Math.floor(listenerCount / 2);
                    for (let i = 0; i < halfCount; i++) {
                        unsubscribers[i]();
                    }

                    // Emit event
                    scene.emit(eventName, { test: 'data' });

                    // Verify only remaining listeners were triggered
                    const expectedCount = listenerCount - halfCount;
                    expect(results).toHaveLength(expectedCount);

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Instance listeners map is cleared after destroy', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 1,
                    maxLength: 5,
                }),
                fc.integer({ min: 1, max: 5 }),
                (eventNames, listenersPerEvent) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });

                    // Subscribe listeners
                    for (const eventName of eventNames) {
                        for (let i = 0; i < listenersPerEvent; i++) {
                            scene.on(eventName, () => {});
                        }
                    }

                    // Destroy the scene
                    scene.destroy();

                    // Verify scene is disposed
                    expect(scene.isDisposed).toBe(true);

                    // Try to subscribe after destroy - should throw error
                    expect(() => {
                        scene.on('test-event', () => {});
                    }).toThrow('Cannot subscribe to events on disposed scene');
                },
            ),
            { numRuns: 100 },
        );
    });
});
