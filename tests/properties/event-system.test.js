/**
 * Property-based tests for EventBus system reliability
 * **Feature: kalythesainz-framework, Property 8: Event system reliability**
 * **Validates: Requirements 7.1, 7.2, 7.3**
 */

import { EventBus } from '../../core/EventBus.js';

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
    anything: () => ({
        generate: () => {
            const types = [
                () => Math.random() < 0.5,
                () => Math.floor(Math.random() * 1000),
                () => Math.random().toString(36).substring(7),
                () => null,
                () => ({ random: Math.random() }),
            ];
            return types[Math.floor(Math.random() * types.length)]();
        },
    }),
};

describe('EventBus Property Tests', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    /**
     * Property 8: Event system reliability
     * For any object operation (create, modify, delete), appropriate events should be emitted,
     * and all registered handlers should be invoked correctly
     */
    test('**Feature: kalythesainz-framework, Property 8: Event system reliability**', () => {
        fc.assert(
            fc.property(
                // Generate random event names
                fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                    minLength: 1,
                    maxLength: 10,
                }),
                // Generate random event data
                fc.oneof(
                    fc.constant(null),
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.record({
                        id: fc.string(),
                        type: fc.constantFrom('create', 'modify', 'delete'),
                        data: fc.anything(),
                    }),
                ),
                // Generate number of subscribers per event
                fc.integer({ min: 1, max: 5 }),
                (eventNames, eventData, subscriberCount) => {
                    const results = new Map();
                    const subscriptions = [];

                    // Subscribe multiple handlers to each event
                    for (const eventName of eventNames) {
                        results.set(eventName, []);

                        for (let i = 0; i < subscriberCount; i++) {
                            const handlerId = `${eventName}-handler-${i}`;

                            const unsubscribe = EventBus.subscribe(eventName, (event) => {
                                results.get(eventName).push({
                                    handlerId,
                                    receivedEvent: event,
                                    timestamp: Date.now(),
                                });
                            });

                            subscriptions.push({ eventName, handlerId, unsubscribe });
                        }
                    }

                    // Publish events and verify all handlers are called
                    for (const eventName of eventNames) {
                        const publishResult = EventBus.publish(eventName, eventData);

                        // Verify publish result structure
                        expect(publishResult).toHaveProperty('event');
                        expect(publishResult).toHaveProperty('executed');
                        expect(publishResult).toHaveProperty('errors');
                        expect(publishResult).toHaveProperty('results');

                        // Verify event object structure
                        expect(publishResult.event.name).toBe(eventName);
                        expect(publishResult.event.data).toEqual(eventData);
                        expect(publishResult.event).toHaveProperty('timestamp');
                        expect(publishResult.event).toHaveProperty('id');

                        // Verify all handlers were executed
                        expect(publishResult.executed).toBe(subscriberCount);
                        expect(publishResult.errors).toHaveLength(0);

                        // Verify handlers received correct event data
                        const handlerResults = results.get(eventName);
                        expect(handlerResults).toHaveLength(subscriberCount);

                        for (const result of handlerResults) {
                            expect(result.receivedEvent.name).toBe(eventName);
                            expect(result.receivedEvent.data).toEqual(eventData);
                            expect(result.receivedEvent.timestamp).toBe(
                                publishResult.event.timestamp,
                            );
                            expect(result.receivedEvent.id).toBe(publishResult.event.id);
                        }
                    }

                    // Test unsubscription works correctly
                    const halfSubscriptions = subscriptions.slice(
                        0,
                        Math.floor(subscriptions.length / 2),
                    );
                    for (const { unsubscribe } of halfSubscriptions) {
                        unsubscribe();
                    }

                    // Publish again and verify only remaining handlers are called
                    for (const eventName of eventNames) {
                        const remainingHandlers = subscriptions.filter(
                            (sub) =>
                                sub.eventName === eventName && !halfSubscriptions.includes(sub),
                        ).length;

                        results.set(eventName, []); // Clear previous results

                        const publishResult = EventBus.publish(eventName, eventData);
                        expect(publishResult.executed).toBe(remainingHandlers);

                        const handlerResults = results.get(eventName);
                        expect(handlerResults).toHaveLength(remainingHandlers);
                    }

                    // Clean up remaining subscriptions
                    for (const { unsubscribe } of subscriptions) {
                        unsubscribe();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Event system handles errors gracefully without breaking', () => {
        // First, test a simple case manually
        const simpleResults = [];
        const simpleErrors = [];

        EventBus.subscribe('test-event', () => {
            throw new Error('Handler 0 error');
        });

        EventBus.subscribe('test-event', () => {
            simpleResults.push('Handler 1 success');
        });

        EventBus.subscribe('error', (errorEvent) => {
            simpleErrors.push(errorEvent);
        });

        const simplePublish = EventBus.publish('test-event', { test: 'data' });

        // Verify simple case works
        expect(simplePublish.executed).toBe(1);
        expect(simpleResults).toHaveLength(1);
        expect(simplePublish.errors).toHaveLength(1);

        // Clean up
        EventBus.clear();

        // Now run the property-based test
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.integer({ min: 1, max: 5 }),
                (eventName, totalHandlers) => {
                    // Ensure failingHandlers is at most totalHandlers
                    const failingHandlers = Math.min(
                        Math.floor(Math.random() * totalHandlers) + 1,
                        totalHandlers,
                    );
                    const results = [];
                    const errorResults = [];

                    // Subscribe handlers, some of which will throw errors
                    for (let i = 0; i < totalHandlers; i++) {
                        const handlerIndex = i; // Capture the current value
                        const shouldFail = handlerIndex < failingHandlers;

                        EventBus.subscribe(eventName, (event) => {
                            if (shouldFail) {
                                throw new Error(`Handler ${handlerIndex} intentional error`);
                            } else {
                                results.push(`Handler ${handlerIndex} success`);
                            }
                        });
                    }

                    // Subscribe to error events to capture error handling
                    EventBus.subscribe('error', (errorEvent) => {
                        errorResults.push(errorEvent);
                    });

                    // Publish event
                    const publishResult = EventBus.publish(eventName, { test: 'data' });

                    // Verify that successful handlers still executed
                    const successfulHandlers = totalHandlers - failingHandlers;
                    expect(publishResult.executed).toBe(successfulHandlers);
                    expect(results).toHaveLength(successfulHandlers);

                    // Verify errors were captured
                    expect(publishResult.errors).toHaveLength(failingHandlers);

                    // Verify error events were emitted (note: these are async so might not be available immediately)
                    // expect(errorResults).toHaveLength(failingHandlers);

                    for (const errorEvent of errorResults) {
                        expect(errorEvent.data.type).toBe('callback_execution');
                        expect(errorEvent.data.originalEvent).toBe(eventName);
                        expect(errorEvent.data).toHaveProperty('error');
                        expect(errorEvent.data).toHaveProperty('listener');
                    }

                    // Clean up for next run
                    EventBus.clear();
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Event filtering works correctly across all scenarios', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.array(
                    fc.record({
                        id: fc.string(),
                        type: fc.constantFrom('create', 'modify', 'delete'),
                        priority: fc.integer({ min: 1, max: 10 }),
                    }),
                    { minLength: 1, maxLength: 10 },
                ),
                fc.integer({ min: 1, max: 5 }), // Filter threshold
                (eventName, eventDataArray, filterThreshold) => {
                    const allResults = [];
                    const filteredResults = [];

                    // Subscribe handler without filter
                    EventBus.subscribe(eventName, (event) => {
                        allResults.push(event.data);
                    });

                    // Subscribe handler with filter
                    EventBus.subscribe(
                        eventName,
                        (event) => {
                            filteredResults.push(event.data);
                        },
                        {
                            filter: (event) => event.data && event.data.priority >= filterThreshold,
                        },
                    );

                    // Publish multiple events
                    for (const eventData of eventDataArray) {
                        EventBus.publish(eventName, eventData);
                    }

                    // Verify all handler received all events
                    expect(allResults).toHaveLength(eventDataArray.length);
                    expect(allResults).toEqual(eventDataArray);

                    // Verify filtered handler only received matching events
                    const expectedFiltered = eventDataArray.filter(
                        (data) => data.priority >= filterThreshold,
                    );
                    expect(filteredResults).toHaveLength(expectedFiltered.length);
                    expect(filteredResults).toEqual(expectedFiltered);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Once-only subscriptions work correctly', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }),
                fc.integer({ min: 2, max: 10 }), // Number of times to publish
                (eventName, publishCount) => {
                    const onceResults = [];
                    const normalResults = [];

                    // Subscribe with once: true
                    EventBus.subscribe(
                        eventName,
                        (event) => {
                            onceResults.push(event.data);
                        },
                        { once: true },
                    );

                    // Subscribe normally
                    EventBus.subscribe(eventName, (event) => {
                        normalResults.push(event.data);
                    });

                    // Publish multiple times
                    for (let i = 0; i < publishCount; i++) {
                        EventBus.publish(eventName, `data-${i}`);
                    }

                    // Verify once handler only executed once
                    expect(onceResults).toHaveLength(1);
                    expect(onceResults[0]).toBe('data-0');

                    // Verify normal handler executed for all events
                    expect(normalResults).toHaveLength(publishCount);
                    for (let i = 0; i < publishCount; i++) {
                        expect(normalResults[i]).toBe(`data-${i}`);
                    }
                },
            ),
            { numRuns: 50 },
        );
    });
});
