/**
 * Property-based tests for instance-scoped event isolation
 * **Feature: instance-based-api, Property 14: Event Isolation**
 * **Validates: Requirements 6.1**
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

describe('Event Isolation Property Tests', () => {
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
     * Property 14: Event Isolation
     * For any two scene instances, emitting an event on scene A should only trigger
     * listeners registered on scene A, not listeners on scene B
     */
    test('**Feature: instance-based-api, Property 14: Event Isolation**', () => {
        fc.assert(
            fc.property(
                // Generate random event names
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 1,
                    maxLength: 5,
                }),
                // Generate random event data
                fc.record({
                    id: fc.string(),
                    value: fc.integer({ min: 0, max: 1000 }),
                }),
                // Generate number of scenes
                fc.integer({ min: 2, max: 5 }),
                (eventNames, eventData, sceneCount) => {
                    const scenes = [];
                    const listenerResults = new Map();

                    // Create multiple scene instances
                    for (let i = 0; i < sceneCount; i++) {
                        const containerId = `test-container-${Date.now()}-${i}`;
                        const container = createMockContainer(containerId);
                        containers.push(container);

                        const scene = new SceneInstance(containerId, { autoStart: false });
                        scenes.push(scene);
                        listenerResults.set(scene, []);
                    }

                    // Subscribe listeners to each scene for each event
                    for (const scene of scenes) {
                        for (const eventName of eventNames) {
                            scene.on(eventName, (event) => {
                                listenerResults.get(scene).push({
                                    eventName: event.name,
                                    data: event.data,
                                    timestamp: event.timestamp,
                                });
                            });
                        }
                    }

                    // Emit events on each scene and verify isolation
                    for (let i = 0; i < scenes.length; i++) {
                        const emittingScene = scenes[i];

                        for (const eventName of eventNames) {
                            // Clear all results before emitting
                            for (const scene of scenes) {
                                listenerResults.set(scene, []);
                            }

                            // Emit event on this scene
                            emittingScene.emit(eventName, eventData);

                            // Verify only the emitting scene's listeners were triggered
                            const emittingSceneResults = listenerResults.get(emittingScene);
                            expect(emittingSceneResults).toHaveLength(1);
                            expect(emittingSceneResults[0].eventName).toBe(eventName);
                            expect(emittingSceneResults[0].data).toEqual(eventData);

                            // Verify other scenes' listeners were NOT triggered
                            for (let j = 0; j < scenes.length; j++) {
                                if (j !== i) {
                                    const otherScene = scenes[j];
                                    const otherSceneResults = listenerResults.get(otherScene);
                                    expect(otherSceneResults).toHaveLength(0);
                                }
                            }
                        }
                    }

                    // Clean up scenes
                    for (const scene of scenes) {
                        scene.destroy();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Multiple listeners on same scene all receive events', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.integer({ min: 1, max: 10 }), // Number of listeners
                fc.record({
                    id: fc.string(),
                    value: fc.integer({ min: 0, max: 1000 }),
                }),
                (eventName, listenerCount, eventData) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const results = [];

                    // Subscribe multiple listeners to the same event
                    for (let i = 0; i < listenerCount; i++) {
                        scene.on(eventName, (event) => {
                            results.push({
                                listenerId: i,
                                eventName: event.name,
                                data: event.data,
                            });
                        });
                    }

                    // Emit event
                    scene.emit(eventName, eventData);

                    // Verify all listeners received the event
                    expect(results).toHaveLength(listenerCount);
                    for (let i = 0; i < listenerCount; i++) {
                        expect(results[i].listenerId).toBe(i);
                        expect(results[i].eventName).toBe(eventName);
                        expect(results[i].data).toEqual(eventData);
                    }

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Unsubscribing from one scene does not affect other scenes', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.record({
                    id: fc.string(),
                    value: fc.integer({ min: 0, max: 1000 }),
                }),
                (eventName, eventData) => {
                    const scenes = [];
                    const unsubscribers = [];
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
                        const unsubscribe = scene.on(eventName, (event) => {
                            results.get(scene).push(event.data);
                        });
                        unsubscribers.push(unsubscribe);
                    }

                    // Unsubscribe from first scene
                    unsubscribers[0]();

                    // Emit events on both scenes
                    for (const scene of scenes) {
                        scene.emit(eventName, eventData);
                    }

                    // Verify first scene's listener was not triggered
                    expect(results.get(scenes[0])).toHaveLength(0);

                    // Verify second scene's listener was triggered
                    expect(results.get(scenes[1])).toHaveLength(1);
                    expect(results.get(scenes[1])[0]).toEqual(eventData);

                    // Clean up
                    for (const scene of scenes) {
                        scene.destroy();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Once-only listeners work correctly per instance', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.integer({ min: 2, max: 5 }), // Number of times to emit
                (eventName, emitCount) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const onceResults = [];
                    const normalResults = [];

                    // Subscribe with once: true
                    scene.on(
                        eventName,
                        (event) => {
                            onceResults.push(event.data);
                        },
                        { once: true },
                    );

                    // Subscribe normally
                    scene.on(eventName, (event) => {
                        normalResults.push(event.data);
                    });

                    // Emit multiple times
                    for (let i = 0; i < emitCount; i++) {
                        scene.emit(eventName, `data-${i}`);
                    }

                    // Verify once listener only executed once
                    expect(onceResults).toHaveLength(1);
                    expect(onceResults[0]).toBe('data-0');

                    // Verify normal listener executed for all events
                    expect(normalResults).toHaveLength(emitCount);
                    for (let i = 0; i < emitCount; i++) {
                        expect(normalResults[i]).toBe(`data-${i}`);
                    }

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 100 },
        );
    });
});
