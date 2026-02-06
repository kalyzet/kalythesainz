/**
 * Test setup for KALYTHESAINZ framework
 * Configures Jest environment for ESM and Three.js testing
 */

import {
    jest,
    expect,
    describe,
    test,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll,
} from '@jest/globals';
import mockThree from './setup-three-mock.js';

// Make Jest globals available
global.jest = jest;
global.expect = expect;
global.describe = describe;
global.test = test;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;

// Make Three.js available globally for tests
global.THREE = mockThree;

// Mock DOM elements
Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn((cb) => setTimeout(cb, 16)),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
    value: jest.fn(),
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
}));

// Setup console for better test output
const originalError = console.error;
console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('Warning: ReactDOM.render')) {
        return;
    }
    originalError.call(console, ...args);
};
