/**
 * Manual runner for property tests
 */

import { EventBus } from '../core/EventBus.js';

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
    string: (options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 0;
            const maxLength = options.maxLength || 20;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            if (length === 0) return 'a'; // Ensure non-empty for event names
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

console.log('**Feature: kalythesainz-framework, Property 8: Event system reliability**');
console.log('**Validates: Requirements 7.1, 7.2, 7.3**\n');

// Property 8: Event system reliability
console.log('Testing Property 8: Event system reliability');
try {
    fc.assert(
        fc.property(
            // Generate random event names
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
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
                // Clear EventBus before each test
                EventBus.clear();

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
                    if (!publishResult.hasOwnProperty('event'))
                        throw new Error('Missing event property');
                    if (!publishResult.hasOwnProperty('executed'))
                        throw new Error('Missing executed property');
                    if (!publishResult.hasOwnProperty('errors'))
                        throw new Error('Missing errors property');
                    if (!publishResult.hasOwnProperty('results'))
                        throw new Error('Missing results property');

                    // Verify event object structure
                    if (publishResult.event.name !== eventName)
                        throw new Error('Event name mismatch');
                    if (JSON.stringify(publishResult.event.data) !== JSON.stringify(eventData))
                        throw new Error('Event data mismatch');
                    if (!publishResult.event.hasOwnProperty('timestamp'))
                        throw new Error('Missing timestamp');
                    if (!publishResult.event.hasOwnProperty('id'))
                        throw new Error('Missing event id');

                    // Verify all handlers were executed
                    if (publishResult.executed !== subscriberCount)
                        throw new Error(
                            `Expected ${subscriberCount} executions, got ${publishResult.executed}`,
                        );
                    if (publishResult.errors.length !== 0)
                        throw new Error('Unexpected errors occurred');

                    // Verify handlers received correct event data
                    const handlerResults = results.get(eventName);
                    if (handlerResults.length !== subscriberCount)
                        throw new Error(
                            `Expected ${subscriberCount} handler results, got ${handlerResults.length}`,
                        );

                    for (const result of handlerResults) {
                        if (result.receivedEvent.name !== eventName)
                            throw new Error('Handler received wrong event name');
                        if (JSON.stringify(result.receivedEvent.data) !== JSON.stringify(eventData))
                            throw new Error('Handler received wrong event data');
                        if (result.receivedEvent.timestamp !== publishResult.event.timestamp)
                            throw new Error('Handler received wrong timestamp');
                        if (result.receivedEvent.id !== publishResult.event.id)
                            throw new Error('Handler received wrong event id');
                    }
                }

                // Clean up subscriptions
                for (const { unsubscribe } of subscriptions) {
                    unsubscribe();
                }

                EventBus.clear();
            },
        ),
        { numRuns: 100 },
    );
} catch (error) {
    console.error('❌ Property test failed:', error.message);
    process.exit(1);
}

console.log('\n✅ All property tests passed successfully!');
console.log('EventBus system reliability property verified.');
