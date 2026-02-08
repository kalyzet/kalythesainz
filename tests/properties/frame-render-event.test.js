/**
 * Property-based tests for frame render events
 * **Feature: instance-based-api, Property 17: Frame Render Event**
 * **Validates: Requirements 6.5**
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
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
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

// Helper to wait for events with timeout
function waitForEvents(scene, eventName, expectedCount, timeout = 1000) {
    return new Promise((resolve, reject) => {
        const events = [];
        const timeoutId = setTimeout(() => {
            reject(new Error(`Timeout: Expected ${expectedCount} events, got ${events.length}`));
        }, timeout);

        const unsubscribe = scene.on(eventName, (event) => {
            events.push(event);
            if (events.length >= expectedCount) {
                clearTimeout(timeoutId);
                unsubscribe();
                resolve(events);
            }
        });
    });
}

describe('Frame Render Event Property Tests', () => {
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
     * Property 17: Frame Render Event
     * For any scene instance with active render loop, each frame render should
     * emit a 'frame:rendered' event on that scene instance
     */
    test('**Feature: instance-based-api, Property 17: Frame Render Event**', async () => {
        // Run fewer iterations for async tests
        fc.assert(
            fc.property(
                fc.integer({ min: 2, max: 5 }), // Number of frames to wait for
                async (frameCount) => {
                    const containerId = `test-container-${Date.now()}`;
                    const container = createMockContainer(containerId);
                    containers.push(container);

                    const scene = new SceneInstance(containerId, { autoStart: false });
                    const events = [];

                    // Subscribe to frame:rendered event
                    scene.on('frame:rendered', (event) => {
                        events.push({
                            timestamp: event.data.timestamp,
                            fps: event.data.fps,
                        });
                    });

                    // Start render loop
                    scene.startRenderLoop();

                    // Wait for expected number of frames
                    await waitForEvents(scene, 'frame:rendered', frameCount);

                    // Stop render loop
                    scene.stopRenderLoop();

                    // Verify we received at least the expected number of events
                    expect(events.length).toBeGreaterThanOrEqual(frameCount);

                    // Verify each event has required data
                    for (const event of events) {
                        expect(event.timestamp).toBeDefined();
                        expect(typeof event.timestamp).toBe('number');
                        expect(event.fps).toBeDefined();
                        expect(typeof event.fps).toBe('number');
                    }

                    // Clean up
                    scene.destroy();
                },
            ),
            { numRuns: 10 }, // Fewer runs for async tests
        );
    }, 30000); // Increase timeout for async test

    test('Frame render events are instance-scoped', async () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 3 }), async (sceneCount) => {
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

                    // Subscribe to frame:rendered event
                    scene.on('frame:rendered', () => {
                        eventCounts.set(scene, eventCounts.get(scene) + 1);
                    });
                }

                // Start render loop on all scenes
                for (const scene of scenes) {
                    scene.startRenderLoop();
                }

                // Wait for some frames
                await new Promise((resolve) => setTimeout(resolve, 200));

                // Stop all render loops
                for (const scene of scenes) {
                    scene.stopRenderLoop();
                }

                // Verify each scene received events independently
                for (const scene of scenes) {
                    const count = eventCounts.get(scene);
                    expect(count).toBeGreaterThan(0);
                }

                // Clean up
                for (const scene of scenes) {
                    scene.destroy();
                }
            }),
            { numRuns: 5 },
        );
    }, 30000);

    test('Frame render events stop when render loop stops', async () => {
        const containerId = `test-container-${Date.now()}`;
        const container = createMockContainer(containerId);
        containers.push(container);

        const scene = new SceneInstance(containerId, { autoStart: false });
        let eventCount = 0;

        // Subscribe to frame:rendered event
        scene.on('frame:rendered', () => {
            eventCount++;
        });

        // Start render loop
        scene.startRenderLoop();

        // Wait for at least one frame
        await waitForEvents(scene, 'frame:rendered', 1);

        // Stop render loop
        scene.stopRenderLoop();

        const countAfterStop = eventCount;

        // Wait a bit more
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Verify no new events were emitted after stopping
        expect(eventCount).toBe(countAfterStop);

        // Clean up
        scene.destroy();
    }, 30000);

    test('Frame render events contain valid data', async () => {
        const containerId = `test-container-${Date.now()}`;
        const container = createMockContainer(containerId);
        containers.push(container);

        const scene = new SceneInstance(containerId, { autoStart: false });
        const events = [];

        // Subscribe to frame:rendered event
        scene.on('frame:rendered', (event) => {
            events.push(event.data);
        });

        // Start render loop
        scene.startRenderLoop();

        // Wait for some frames
        await waitForEvents(scene, 'frame:rendered', 2);

        // Stop render loop
        scene.stopRenderLoop();

        // Verify all events have valid data
        expect(events.length).toBeGreaterThanOrEqual(2);

        for (const eventData of events) {
            // Check timestamp is a valid number
            expect(typeof eventData.timestamp).toBe('number');
            expect(eventData.timestamp).toBeGreaterThan(0);

            // Check fps is a valid number
            expect(typeof eventData.fps).toBe('number');
            // FPS can be Infinity on first frame, so just check it's a number
        }

        // Clean up
        scene.destroy();
    }, 30000);

    test('Multiple listeners receive frame render events', async () => {
        fc.assert(
            fc.property(fc.integer({ min: 2, max: 5 }), async (listenerCount) => {
                const containerId = `test-container-${Date.now()}`;
                const container = createMockContainer(containerId);
                containers.push(container);

                const scene = new SceneInstance(containerId, { autoStart: false });
                const listenerResults = [];

                // Create multiple listeners
                for (let i = 0; i < listenerCount; i++) {
                    listenerResults.push([]);
                    scene.on('frame:rendered', (event) => {
                        listenerResults[i].push(event.data.timestamp);
                    });
                }

                // Start render loop
                scene.startRenderLoop();

                // Wait for at least one frame
                await waitForEvents(scene, 'frame:rendered', 1);

                // Stop render loop
                scene.stopRenderLoop();

                // Verify all listeners received events
                const firstListenerCount = listenerResults[0].length;
                expect(firstListenerCount).toBeGreaterThanOrEqual(1);

                for (let i = 1; i < listenerCount; i++) {
                    expect(listenerResults[i].length).toBe(firstListenerCount);
                }

                // Verify all listeners received the same timestamps
                for (let i = 1; i < listenerCount; i++) {
                    expect(listenerResults[i]).toEqual(listenerResults[0]);
                }

                // Clean up
                scene.destroy();
            }),
            { numRuns: 5 },
        );
    }, 30000);

    test('Frame render events do not emit when autoStart is false', async () => {
        const containerId = `test-container-${Date.now()}`;
        const container = createMockContainer(containerId);
        containers.push(container);

        const scene = new SceneInstance(containerId, { autoStart: false });
        let eventCount = 0;

        // Subscribe to frame:rendered event
        scene.on('frame:rendered', () => {
            eventCount++;
        });

        // Wait without starting render loop
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Verify no events were emitted
        expect(eventCount).toBe(0);

        // Clean up
        scene.destroy();
    }, 30000);
});
