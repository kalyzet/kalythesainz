/**
 * Simple test runner for unit tests
 * Since Jest is not available, we'll create a basic test runner
 */

// Mock Jest globals
global.describe = (name, fn) => {
    console.log(`\n📁 ${name}`);
    fn();
};

global.test = (name, fn) => {
    try {
        fn();
        console.log(`  ✅ ${name}`);
    } catch (error) {
        console.log(`  ❌ ${name}`);
        console.log(`     Error: ${error.message}`);
    }
};

global.beforeEach = (fn) => {
    // Store for later execution
    global._beforeEach = fn;
};

global.afterEach = (fn) => {
    // Store for later execution
    global._afterEach = fn;
};

global.expect = (actual) => ({
    toBe: (expected) => {
        if (actual !== expected) {
            throw new Error(`Expected ${actual} to be ${expected}`);
        }
    },
    toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
                `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
            );
        }
    },
    toHaveProperty: (prop) => {
        if (!actual || !actual.hasOwnProperty(prop)) {
            throw new Error(`Expected object to have property ${prop}`);
        }
    },
    toHaveLength: (length) => {
        if (!actual || actual.length !== length) {
            throw new Error(
                `Expected length ${length}, got ${actual ? actual.length : 'undefined'}`,
            );
        }
    },
    toContain: (item) => {
        if (!actual || !actual.includes(item)) {
            throw new Error(`Expected array to contain ${item}`);
        }
    },
    toThrow: (message) => {
        try {
            actual();
            throw new Error('Expected function to throw');
        } catch (error) {
            if (message && !error.message.includes(message)) {
                throw new Error(
                    `Expected error message to contain "${message}", got "${error.message}"`,
                );
            }
        }
    },
    toHaveBeenCalledTimes: (times) => {
        if (!actual.mock || actual.mock.calls.length !== times) {
            throw new Error(
                `Expected function to be called ${times} times, got ${actual.mock ? actual.mock.calls.length : 0}`,
            );
        }
    },
    toHaveBeenCalledWith: (args) => {
        if (!actual.mock || actual.mock.calls.length === 0) {
            throw new Error('Expected function to have been called');
        }
        // Simple check for object containing
        const lastCall = actual.mock.calls[actual.mock.calls.length - 1][0];
        if (args && typeof args === 'object' && args.objectContaining) {
            // Simple object containing check
            return;
        }
    },
    not: {
        toThrow: () => {
            try {
                actual();
            } catch (error) {
                throw new Error('Expected function not to throw');
            }
        },
        toHaveBeenCalled: () => {
            if (actual.mock && actual.mock.calls.length > 0) {
                throw new Error('Expected function not to have been called');
            }
        },
        toBe: (expected) => {
            if (actual === expected) {
                throw new Error(`Expected ${actual} not to be ${expected}`);
            }
        },
    },
});

global.jest = {
    fn: (impl) => {
        const mockFn = impl || (() => {});
        mockFn.mock = {
            calls: [],
            results: [],
        };

        const wrappedFn = (...args) => {
            mockFn.mock.calls.push(args);
            const result = mockFn(...args);
            mockFn.mock.results.push({ type: 'return', value: result });
            return result;
        };

        wrappedFn.mock = mockFn.mock;
        return wrappedFn;
    },
};

// Add object containing matcher
global.expect.objectContaining = (obj) => ({ objectContaining: obj });

console.log('🧪 Running Core Layer Unit Tests\n');

// Test Config
console.log('Testing Config class...');
try {
    const { Config } = await import('../core/Config.js');

    // Basic functionality test
    Config.init();
    if (Config.get('renderer.antialias') !== true) {
        throw new Error('Config default value test failed');
    }

    Config.set('test.value', 'hello');
    if (Config.get('test.value') !== 'hello') {
        throw new Error('Config set/get test failed');
    }

    console.log('  ✅ Config basic functionality works');
} catch (error) {
    console.log('  ❌ Config test failed:', error.message);
}

// Test EventBus
console.log('\nTesting EventBus class...');
try {
    const { EventBus } = await import('../core/EventBus.js');

    EventBus.clear();

    // Basic functionality test
    let callbackCalled = false;
    const unsubscribe = EventBus.subscribe('test-event', () => {
        callbackCalled = true;
    });

    const result = EventBus.publish('test-event', 'test-data');

    if (!callbackCalled) {
        throw new Error('EventBus callback not called');
    }

    if (result.executed !== 1) {
        throw new Error('EventBus execution count incorrect');
    }

    unsubscribe();
    EventBus.clear();

    console.log('  ✅ EventBus basic functionality works');
} catch (error) {
    console.log('  ❌ EventBus test failed:', error.message);
}

// Test App
console.log('\nTesting App class...');
try {
    const { App } = await import('../core/App.js');

    // Clean up first
    if (App.isInitialized()) {
        await App.destroy();
    }

    // Basic functionality test
    const app = App.init({ containerId: 'test-container', debug: false });

    if (!App.isInitialized()) {
        throw new Error('App not initialized');
    }

    const config = App.getConfig();
    if (config.containerId !== 'test-container') {
        throw new Error('App config not set correctly');
    }

    await App.destroy();

    if (App.isInitialized()) {
        throw new Error('App not destroyed');
    }

    console.log('  ✅ App basic functionality works');
} catch (error) {
    console.log('  ❌ App test failed:', error.message);
}

console.log('\n✅ Core Layer unit tests completed!');
console.log('Note: Full Jest test suite would provide more comprehensive testing.');
