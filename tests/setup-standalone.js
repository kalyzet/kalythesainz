/**
 * Standalone test setup for KALYTHESAINZ framework (without Jest)
 * Configures environment for ESM and Three.js testing
 */

import { JSDOM } from 'jsdom';
import * as THREE from 'three';
import gl from 'gl';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

// Make Three.js available globally
global.THREE = THREE;

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Also add to window for Three.js
if (global.window) {
    global.window.requestAnimationFrame = global.requestAnimationFrame;
    global.window.cancelAnimationFrame = global.cancelAnimationFrame;
}

// Create headless WebGL context
const width = 800;
const height = 600;
const glContext = gl(width, height, { preserveDrawingBuffer: true });

// Mock canvas context with headless-gl
if (typeof HTMLCanvasElement !== 'undefined') {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (contextType, options) {
        if (
            contextType === 'webgl' ||
            contextType === 'webgl2' ||
            contextType === 'experimental-webgl'
        ) {
            // Return the headless-gl context
            return glContext;
        }
        // Fall back to original for 2d context
        if (originalGetContext) {
            return originalGetContext.call(this, contextType, options);
        }
        return null;
    };
}

console.log('✓ Test environment setup complete');
