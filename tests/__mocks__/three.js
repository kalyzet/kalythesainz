/**
 * Mock for Three.js module
 * This ensures ES module imports of 'three' use our mock instead of the real library
 */

// Re-export the global THREE mock that's set up in setup.js
export * from '../../tests/setup-three-mock.js';
export { default } from '../../tests/setup-three-mock.js';
