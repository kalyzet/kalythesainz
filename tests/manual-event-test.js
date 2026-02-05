/**
 * Manual test for EventBus to verify basic functionality
 */

import { EventBus } from '../core/EventBus.js';

console.log('Testing EventBus functionality...');

// Test 1: Basic subscription and publishing
console.log('\n1. Testing basic subscription and publishing:');
let receivedEvents = [];

const unsubscribe1 = EventBus.subscribe('test-event', (event) => {
    receivedEvents.push(event);
    console.log(`Received event: ${event.name} with data:`, event.data);
});

EventBus.publish('test-event', { message: 'Hello World' });
console.log(`Events received: ${receivedEvents.length}`);

// Test 2: Multiple subscribers
console.log('\n2. Testing multiple subscribers:');
let subscriber2Called = false;
let subscriber3Called = false;

EventBus.subscribe('multi-test', () => {
    subscriber2Called = true;
});
EventBus.subscribe('multi-test', () => {
    subscriber3Called = true;
});

const result = EventBus.publish('multi-test', 'test data');
console.log(`Executed callbacks: ${result.executed}`);
console.log(`Subscriber 2 called: ${subscriber2Called}`);
console.log(`Subscriber 3 called: ${subscriber3Called}`);

// Test 3: Error handling
console.log('\n3. Testing error handling:');
let errorEventReceived = null;

EventBus.subscribe('error', (event) => {
    errorEventReceived = event;
    console.log('Error event received:', event.data.type);
});

EventBus.subscribe('error-test', () => {
    throw new Error('Test error');
});

const errorResult = EventBus.publish('error-test', 'data');
console.log(`Errors caught: ${errorResult.errors.length}`);
console.log(`Error event emitted: ${errorEventReceived !== null}`);

// Test 4: Once subscription
console.log('\n4. Testing once subscription:');
let onceCallCount = 0;

EventBus.subscribe(
    'once-test',
    () => {
        onceCallCount++;
    },
    { once: true },
);

EventBus.publish('once-test', 'first');
EventBus.publish('once-test', 'second');
console.log(`Once callback called ${onceCallCount} times (should be 1)`);

// Test 5: Filtering
console.log('\n5. Testing event filtering:');
let filteredCallCount = 0;

EventBus.subscribe(
    'filter-test',
    () => {
        filteredCallCount++;
    },
    {
        filter: (event) => event.data && event.data.priority > 5,
    },
);

EventBus.publish('filter-test', { priority: 3 }); // Should not trigger
EventBus.publish('filter-test', { priority: 7 }); // Should trigger
EventBus.publish('filter-test', { priority: 10 }); // Should trigger

console.log(`Filtered callback called ${filteredCallCount} times (should be 2)`);

// Test 6: Unsubscription
console.log('\n6. Testing unsubscription:');
let unsubTestCallCount = 0;

const unsubscribe6 = EventBus.subscribe('unsub-test', () => {
    unsubTestCallCount++;
});

EventBus.publish('unsub-test', 'before unsub');
unsubscribe6();
EventBus.publish('unsub-test', 'after unsub');

console.log(`Unsubscribe test callback called ${unsubTestCallCount} times (should be 1)`);

// Clean up
EventBus.clear();
console.log('\nAll tests completed. EventBus cleared.');

// Verify the property that all handlers should be called
console.log('\n7. Property verification: All registered handlers should be called');
const testResults = [];
const eventName = 'property-test';
const handlerCount = 3;

for (let i = 0; i < handlerCount; i++) {
    EventBus.subscribe(eventName, (event) => {
        testResults.push(`handler-${i}`);
    });
}

const propertyResult = EventBus.publish(eventName, 'test-data');
console.log(`Expected handlers: ${handlerCount}, Executed: ${propertyResult.executed}`);
console.log(`Results received: ${testResults.length}`);
console.log(
    `Property holds: ${propertyResult.executed === handlerCount && testResults.length === handlerCount}`,
);

console.log('\nEventBus manual test completed successfully!');
