/**
 * Test setup for visual tools tests
 * Minimal setup without jest mocking
 */

// Setup console for better test output
const originalError = console.error;
console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('Warning:')) {
        return;
    }
    originalError.call(console, ...args);
};
