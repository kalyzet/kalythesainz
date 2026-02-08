/**
 * Integration Test: React Strict Mode Compatibility
 * Validates: Requirements 4.1, 4.2, 4.3
 *
 * Tests that KALYTHESAINZ works correctly with React Strict Mode,
 * which intentionally double-invokes effects to detect side effects.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createScene } from '../../index.js';
import { Scene } from '../../engine/Scene.js';

describe('React Strict Mode Integration Tests', () => {
    let testContainers = [];

    beforeEach(() => {
        // Create test containers
        for (let i = 0; i < 5; i++) {
            const container = document.createElement('div');
            container.id = `react-test-container-${i}`;
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);
            testContainers.push(container);
        }
    });

    afterEach(() => {
        // Clean up test containers
        for (const container of testContainers) {
            if (container.parentNode) {
                document.body.removeChild(container);
            }
        }
        testContainers = [];

        // Clean up any singleton
        try {
            Scene.destroy();
        } catch (error) {
            // Ignore if no singleton exists
        }
    });

    /**
     * Requirement 4.1: WHEN a React component mounts twice in Strict Mode
     * THEN the system SHALL handle reinitialization gracefully without throwing errors
     */
    test('handles double-mount scenario without errors (instance-based API)', () => {
        const containerId = 'react-test-container-0';
        let scene1, scene2;

        // Simulate React Strict Mode double-mount
        // First mount
        expect(() => {
            scene1 = createScene(containerId, {
                autoStart: false,
                lights: false,
            });
        }).not.toThrow();

        expect(scene1).toBeDefined();
        expect(scene1.isDisposed).toBe(false);

        // Add some content
        scene1.createBox(1, 1, 1);
        expect(scene1.objects.size).toBe(1);

        // Simulate unmount (cleanup)
        expect(() => {
            scene1.destroy();
        }).not.toThrow();

        expect(scene1.isDisposed).toBe(true);

        // Second mount (React Strict Mode remount)
        expect(() => {
            scene2 = createScene(containerId, {
                autoStart: false,
                lights: false,
            });
        }).not.toThrow();

        expect(scene2).toBeDefined();
        expect(scene2.isDisposed).toBe(false);

        // Verify it's a fresh instance
        expect(scene2.objects.size).toBe(0);

        // Add content to second instance
        scene2.createSphere(1, 16);
        expect(scene2.objects.size).toBe(1);

        // Cleanup
        scene2.destroy();
    });

    /**
     * Requirement 4.1: Test singleton API with double-mount
     */
    test('handles double-mount scenario without errors (singleton API)', () => {
        const containerId = 'react-test-container-1';
        let scene1, scene2;

        // Suppress deprecation warnings for this test
        const originalWarn = console.warn;
        console.warn = jest.fn();

        try {
            // First mount
            expect(() => {
                scene1 = Scene.init(containerId, {
                    autoStart: false,
                    lights: false,
                });
            }).not.toThrow();

            expect(scene1).toBeDefined();
            expect(scene1.isDisposed).toBe(false);

            // Add some content
            scene1.createBox(1, 1, 1);
            expect(scene1.objects.size).toBe(1);

            // Simulate unmount (cleanup)
            expect(() => {
                Scene.destroy();
            }).not.toThrow();

            expect(scene1.isDisposed).toBe(true);

            // Second mount (React Strict Mode remount)
            expect(() => {
                scene2 = Scene.init(containerId, {
                    autoStart: false,
                    lights: false,
                });
            }).not.toThrow();

            expect(scene2).toBeDefined();
            expect(scene2.isDisposed).toBe(false);

            // Verify it's a fresh instance
            expect(scene2.objects.size).toBe(0);

            // Add content to second instance
            scene2.createSphere(1, 16);
            expect(scene2.objects.size).toBe(1);

            // Cleanup
            Scene.destroy();
        } finally {
            console.warn = originalWarn;
        }
    });

    /**
     * Requirement 4.2: WHEN a React component unmounts
     * THEN the system SHALL clean up the scene instance completely
     */
    test('cleans up scene instance completely on unmount', () => {
        const containerId = 'react-test-container-2';

        // Mount component
        const scene = createScene(containerId, {
            autoStart: true,
            lights: { preset: 'studio' },
        });

        // Add content
        scene.createBox(1, 1, 1);
        scene.createSphere(1, 16);
        scene.addLight('ambient', { intensity: 0.5 });

        // Subscribe to events
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        scene.on('object:added', listener1);
        scene.on('frame:rendered', listener2);

        // Verify scene is set up
        expect(scene.objects.size).toBe(2);
        expect(scene.lights.length).toBeGreaterThan(0);
        expect(scene.isRendering).toBe(true);

        // Count DOM elements before cleanup
        const canvasCountBefore = document.querySelectorAll('canvas').length;

        // Unmount (cleanup)
        scene.destroy();

        // Verify complete cleanup
        expect(scene.isDisposed).toBe(true);
        expect(scene.objects.size).toBe(0);
        expect(scene.lights.length).toBe(0);
        expect(scene.isRendering).toBe(false);

        // Verify canvas removed from DOM
        const container = document.getElementById(containerId);
        expect(container.querySelectorAll('canvas').length).toBe(0);

        // Verify canvas count decreased
        const canvasCountAfter = document.querySelectorAll('canvas').length;
        expect(canvasCountAfter).toBeLessThan(canvasCountBefore);

        // Verify events no longer fire
        scene.emit('object:added', { test: true });
        scene.emit('frame:rendered', { test: true });

        // Listeners should not have been called (or only called before destroy)
        // Since we're emitting after destroy, they shouldn't be called
        const callCountAfterDestroy = listener1.mock.calls.length + listener2.mock.calls.length;

        // Try to emit again
        scene.emit('object:added', { test: true });
        const callCountAfterSecondEmit = listener1.mock.calls.length + listener2.mock.calls.length;

        // Call count should not increase after destroy
        expect(callCountAfterSecondEmit).toBe(callCountAfterDestroy);
    });

    /**
     * Requirement 4.3: WHEN a React component remounts
     * THEN the system SHALL create a fresh scene instance without conflicts
     */
    test('creates fresh scene instance on remount without conflicts', () => {
        const containerId = 'react-test-container-3';

        // First mount
        const scene1 = createScene(containerId, {
            autoStart: false,
            lights: false,
        });

        scene1.createBox(2, 2, 2);
        scene1.addLight('sun', { intensity: 1.0 });

        const scene1ObjectCount = scene1.objects.size;
        const scene1LightCount = scene1.lights.length;
        const scene1Renderer = scene1.renderer;
        const scene1Camera = scene1.camera;

        // Unmount
        scene1.destroy();

        // Remount
        const scene2 = createScene(containerId, {
            autoStart: false,
            lights: false,
        });

        // Verify fresh instance
        expect(scene2).not.toBe(scene1);
        expect(scene2.objects.size).toBe(0);
        expect(scene2.lights.length).toBe(0);

        // Verify different renderer and camera instances
        expect(scene2.renderer).not.toBe(scene1Renderer);
        expect(scene2.camera).not.toBe(scene1Camera);

        // Verify scene2 is fully functional
        scene2.createSphere(1, 16);
        expect(scene2.objects.size).toBe(1);

        scene2.addLight('ambient', { intensity: 0.5 });
        expect(scene2.lights.length).toBe(1);

        // Verify no conflicts with destroyed scene
        expect(scene1.isDisposed).toBe(true);
        expect(scene2.isDisposed).toBe(false);

        // Cleanup
        scene2.destroy();
    });

    /**
     * Test multiple mount/unmount cycles (simulating React Strict Mode + hot reload)
     */
    test('handles multiple mount/unmount cycles without errors', () => {
        const containerId = 'react-test-container-4';
        const numCycles = 5;

        const initialCanvasCount = document.querySelectorAll('canvas').length;

        for (let cycle = 0; cycle < numCycles; cycle++) {
            // Mount
            const scene = createScene(containerId, {
                autoStart: false,
                lights: false,
            });

            // Add content
            scene.createBox(1, 1, 1);
            scene.createSphere(0.5, 16);
            scene.addLight('ambient', { intensity: 0.3 });

            // Verify scene is functional
            expect(scene.isDisposed).toBe(false);
            expect(scene.objects.size).toBe(2);
            expect(scene.lights.length).toBe(1);

            // Render a frame
            expect(() => scene.render()).not.toThrow();

            // Unmount
            scene.destroy();

            // Verify cleanup
            expect(scene.isDisposed).toBe(true);
            expect(scene.objects.size).toBe(0);
            expect(scene.lights.length).toBe(0);
        }

        // Verify no memory leaks (canvas count should be back to initial)
        const finalCanvasCount = document.querySelectorAll('canvas').length;
        expect(finalCanvasCount).toBe(initialCanvasCount);
    });

    /**
     * Test React Strict Mode with render loop active
     */
    test('handles double-mount with active render loop', () => {
        const containerId = 'react-test-container-0';

        // First mount with render loop
        const scene1 = createScene(containerId, {
            autoStart: true,
            lights: false,
        });

        expect(scene1.isRendering).toBe(true);

        // Add content
        scene1.createBox(1, 1, 1);

        // Unmount (should stop render loop)
        scene1.destroy();

        expect(scene1.isRendering).toBe(false);
        expect(scene1.isDisposed).toBe(true);

        // Second mount with render loop
        const scene2 = createScene(containerId, {
            autoStart: true,
            lights: false,
        });

        expect(scene2.isRendering).toBe(true);
        expect(scene2.isDisposed).toBe(false);

        // Verify independent render loop
        expect(() => scene2.render()).not.toThrow();

        // Cleanup
        scene2.destroy();
        expect(scene2.isRendering).toBe(false);
    });

    /**
     * Test React Strict Mode with event listeners
     */
    test('handles double-mount with event listeners', () => {
        const containerId = 'react-test-container-1';

        // First mount
        const scene1 = createScene(containerId, {
            autoStart: false,
            lights: false,
        });

        const listener1 = jest.fn();
        scene1.on('object:added', listener1);

        scene1.createBox(1, 1, 1);
        expect(listener1).toHaveBeenCalledTimes(1);

        // Unmount (should clean up listeners)
        scene1.destroy();

        // Second mount
        const scene2 = createScene(containerId, {
            autoStart: false,
            lights: false,
        });

        const listener2 = jest.fn();
        scene2.on('object:added', listener2);

        scene2.createSphere(1, 16);

        // Verify listener2 was called but listener1 was not
        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledTimes(1); // Still 1 from before

        // Cleanup
        scene2.destroy();
    });

    /**
     * Test singleton API handles reinitialization gracefully
     */
    test('singleton API auto-destroys previous instance on reinit', () => {
        const containerId = 'react-test-container-2';

        // Suppress deprecation warnings
        const originalWarn = console.warn;
        console.warn = jest.fn();

        try {
            // First init
            const scene1 = Scene.init(containerId, {
                autoStart: false,
                lights: false,
            });

            scene1.createBox(1, 1, 1);
            expect(scene1.objects.size).toBe(1);

            // Second init without explicit destroy (simulating React Strict Mode)
            const scene2 = Scene.init(containerId, {
                autoStart: false,
                lights: false,
            });

            // Verify first scene was auto-destroyed
            expect(scene1.isDisposed).toBe(true);

            // Verify second scene is fresh
            expect(scene2.isDisposed).toBe(false);
            expect(scene2.objects.size).toBe(0);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalled();

            // Cleanup
            Scene.destroy();
        } finally {
            console.warn = originalWarn;
        }
    });

    /**
     * Test error handling during cleanup
     */
    test('handles errors during cleanup gracefully', () => {
        const containerId = 'react-test-container-3';

        const scene = createScene(containerId, {
            autoStart: false,
            lights: false,
        });

        // Add content
        scene.createBox(1, 1, 1);

        // Destroy once
        expect(() => scene.destroy()).not.toThrow();
        expect(scene.isDisposed).toBe(true);

        // Try to destroy again (should not throw)
        expect(() => scene.destroy()).not.toThrow();

        // Try to use disposed scene (should throw or handle gracefully)
        expect(() => scene.createBox(1, 1, 1)).toThrow();
    });

    /**
     * Test DOM cleanup is complete
     */
    test('removes all DOM elements on unmount', () => {
        const containerId = 'react-test-container-4';
        const container = document.getElementById(containerId);

        // Count initial children
        const initialChildCount = container.children.length;

        // Mount
        const scene = createScene(containerId, {
            autoStart: false,
            lights: false,
        });

        // Verify canvas was added
        expect(container.children.length).toBeGreaterThan(initialChildCount);
        expect(container.querySelector('canvas')).not.toBeNull();

        // Unmount
        scene.destroy();

        // Verify all children removed
        expect(container.children.length).toBe(initialChildCount);
        expect(container.querySelector('canvas')).toBeNull();
    });
});
