/**
 * Unit tests for EventBus class
 * Tests publish/subscribe pattern, error handling, and filtering functionality
 */

import { EventBus } from '../../../core/EventBus.js';

describe('EventBus', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    describe('Initialization', () => {
        test('should initialize singleton instance', () => {
            const instance1 = EventBus.init();
            const instance2 = EventBus.init();

            expect(instance1).toBe(instance2);
        });

        test('should start with no events', () => {
            EventBus.init();
            expect(EventBus.getEvents()).toHaveLength(0);
        });
    });

    describe('Subscribe/Unsubscribe', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should subscribe to events', () => {
            const callback = jest.fn();
            const unsubscribe = EventBus.subscribe('test-event', callback);

            expect(typeof unsubscribe).toBe('function');
            expect(EventBus.hasListeners('test-event')).toBe(true);
            expect(EventBus.getListenerCount('test-event')).toBe(1);
        });

        test('should unsubscribe from events', () => {
            const callback = jest.fn();
            const unsubscribe = EventBus.subscribe('test-event', callback);

            const result = unsubscribe();
            expect(result).toBe(true);
            expect(EventBus.hasListeners('test-event')).toBe(false);
        });

        test('should unsubscribe by callback function', () => {
            const callback = jest.fn();
            EventBus.subscribe('test-event', callback);

            const result = EventBus.unsubscribe('test-event', callback);
            expect(result).toBe(true);
            expect(EventBus.hasListeners('test-event')).toBe(false);
        });

        test('should handle multiple subscribers', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            EventBus.subscribe('test-event', callback1);
            EventBus.subscribe('test-event', callback2);

            expect(EventBus.getListenerCount('test-event')).toBe(2);
        });

        test('should throw error for invalid event name', () => {
            expect(() => EventBus.subscribe('', jest.fn())).toThrow(
                'Event name must be a non-empty string',
            );
            expect(() => EventBus.subscribe(null, jest.fn())).toThrow(
                'Event name must be a non-empty string',
            );
        });

        test('should throw error for invalid callback', () => {
            expect(() => EventBus.subscribe('test', 'not-function')).toThrow(
                'Callback must be a function',
            );
            expect(() => EventBus.subscribe('test', null)).toThrow('Callback must be a function');
        });
    });

    describe('Publishing Events', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should publish events to subscribers', () => {
            const callback = jest.fn();
            EventBus.subscribe('test-event', callback);

            const result = EventBus.publish('test-event', { message: 'hello' });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(result.executed).toBe(1);
            expect(result.errors).toHaveLength(0);
        });

        test('should pass correct event object to callbacks', () => {
            const callback = jest.fn();
            EventBus.subscribe('test-event', callback);

            const testData = { message: 'hello' };
            EventBus.publish('test-event', testData);

            const eventObj = callback.mock.calls[0][0];
            expect(eventObj.name).toBe('test-event');
            expect(eventObj.data).toEqual(testData);
            expect(eventObj).toHaveProperty('timestamp');
            expect(eventObj).toHaveProperty('id');
        });

        test('should handle events with no subscribers', () => {
            const result = EventBus.publish('no-subscribers', 'data');

            expect(result.executed).toBe(0);
            expect(result.errors).toHaveLength(0);
        });

        test('should throw error for invalid event name', () => {
            expect(() => EventBus.publish('', 'data')).toThrow(
                'Event name must be a non-empty string',
            );
            expect(() => EventBus.publish(null, 'data')).toThrow(
                'Event name must be a non-empty string',
            );
        });
    });

    describe('Event Filtering', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should filter events based on filter function', () => {
            const callback = jest.fn();

            EventBus.subscribe('test-event', callback, {
                filter: (event) => event.data && event.data.priority > 5,
            });

            EventBus.publish('test-event', { priority: 3 });
            EventBus.publish('test-event', { priority: 7 });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback.mock.calls[0][0].data.priority).toBe(7);
        });

        test('should throw error for invalid filter', () => {
            expect(() => {
                EventBus.subscribe('test', jest.fn(), { filter: 'not-function' });
            }).toThrow('Filter must be a function');
        });
    });

    describe('Once Subscription', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should execute once-only callbacks only once', () => {
            const callback = jest.fn();

            EventBus.subscribe('test-event', callback, { once: true });

            EventBus.publish('test-event', 'data1');
            EventBus.publish('test-event', 'data2');

            expect(callback).toHaveBeenCalledTimes(1);
            expect(EventBus.hasListeners('test-event')).toBe(false);
        });
    });

    describe('Priority Handling', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should execute callbacks in priority order', () => {
            const results = [];

            EventBus.subscribe('test-event', () => results.push('low'), { priority: 1 });
            EventBus.subscribe('test-event', () => results.push('high'), { priority: 10 });
            EventBus.subscribe('test-event', () => results.push('medium'), { priority: 5 });

            EventBus.publish('test-event', 'data');

            expect(results).toEqual(['high', 'medium', 'low']);
        });

        test('should throw error for invalid priority', () => {
            expect(() => {
                EventBus.subscribe('test', jest.fn(), { priority: 'not-number' });
            }).toThrow('Priority must be a number');
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should handle callback errors gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = jest.fn();

            EventBus.subscribe('test-event', errorCallback);
            EventBus.subscribe('test-event', normalCallback);

            const result = EventBus.publish('test-event', 'data');

            expect(result.executed).toBe(1); // Only normal callback executed
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toBe('Test error');
            expect(normalCallback).toHaveBeenCalledTimes(1);
        });

        test('should emit error events for callback failures', (done) => {
            EventBus.subscribe('error', (errorEvent) => {
                expect(errorEvent.data.type).toBe('callback_execution');
                expect(errorEvent.data.originalEvent).toBe('test-event');
                expect(errorEvent.data.error).toBe('Test error');
                done();
            });

            EventBus.subscribe('test-event', () => {
                throw new Error('Test error');
            });

            EventBus.publish('test-event', 'data');
        });
    });

    describe('Event History', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should maintain event history', () => {
            EventBus.publish('event1', 'data1');
            EventBus.publish('event2', 'data2');

            const history = EventBus.getHistory(10);
            expect(history).toHaveLength(2);
            expect(history[0].name).toBe('event1');
            expect(history[1].name).toBe('event2');
        });

        test('should limit history size', () => {
            const history = EventBus.getHistory(1);
            expect(history.length).toBeLessThanOrEqual(1);
        });
    });

    describe('Namespaced Events', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should create namespaced event bus', () => {
            const namespacedBus = EventBus.namespace('test');

            expect(namespacedBus).toHaveProperty('subscribe');
            expect(namespacedBus).toHaveProperty('publish');
            expect(namespacedBus).toHaveProperty('unsubscribe');
        });

        test('should handle namespaced events correctly', () => {
            const callback = jest.fn();
            const namespacedBus = EventBus.namespace('test');

            namespacedBus.subscribe('event', callback);
            namespacedBus.publish('event', 'data');

            expect(callback).toHaveBeenCalledTimes(1);
            expect(EventBus.hasListeners('test:event')).toBe(true);
        });

        test('should throw error for invalid namespace', () => {
            expect(() => EventBus.namespace('')).toThrow('Namespace must be a non-empty string');
            expect(() => EventBus.namespace(null)).toThrow('Namespace must be a non-empty string');
        });
    });

    describe('Utility Methods', () => {
        beforeEach(() => {
            EventBus.init();
        });

        test('should get all registered events', () => {
            EventBus.subscribe('event1', jest.fn());
            EventBus.subscribe('event2', jest.fn());

            const events = EventBus.getEvents();
            expect(events).toContain('event1');
            expect(events).toContain('event2');
        });

        test('should clear all events', () => {
            EventBus.subscribe('event1', jest.fn());
            EventBus.subscribe('event2', jest.fn());

            EventBus.clear();

            expect(EventBus.getEvents()).toHaveLength(0);
        });

        test('should clear specific events', () => {
            EventBus.subscribe('event1', jest.fn());
            EventBus.subscribe('event2', jest.fn());

            EventBus.clear('event1');

            expect(EventBus.hasListeners('event1')).toBe(false);
            expect(EventBus.hasListeners('event2')).toBe(true);
        });
    });
});
