/**
 * Unit tests for Backward Compatibility
 * Tests object and light factories without scene parameter (singleton fallback)
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { Scene } from '../../../engine/Scene.js';
import { Box } from '../../../objects/Box.js';
import { Sphere } from '../../../objects/Sphere.js';
import { Plane } from '../../../objects/Plane.js';
import { Light } from '../../../engine/Light.js';

describe('Backward Compatibility - Object and Light Factories', () => {
    let container;
    let originalWarn;

    beforeEach(() => {
        // Suppress deprecation warnings for tests
        originalWarn = console.warn;
        console.warn = jest.fn();

        // Create a container element
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Reset Scene singleton state
        Scene.destroy();
    });

    afterEach(() => {
        Scene.destroy();
        console.warn = originalWarn;

        // Clean up
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    describe('Box.create() without scene parameter', () => {
        test('should create box and add to singleton scene when scene parameter omitted', async () => {
            // Initialize singleton scene
            const scene = Scene.init('test-container', { autoStart: false });

            // Create box without scene parameter
            const box = Box.create(2, 3, 4);

            // Wait for dynamic import to complete
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(box).toBeDefined();
            expect(box.width).toBe(2);
            expect(box.height).toBe(3);
            expect(box.depth).toBe(4);

            // Verify box was added to singleton scene
            expect(scene.objects.size).toBe(1);
            expect(scene.objects.has(box.id)).toBe(true);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[DEPRECATED] Box.create() called without scene parameter'),
            );
        });

        test('should create box without adding to scene if singleton not initialized', () => {
            // Don't initialize singleton
            const box = Box.create(1, 1, 1);

            expect(box).toBeDefined();
            expect(box.width).toBe(1);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[DEPRECATED] Box.create() called without scene parameter'),
            );
        });

        test('should work with default parameters', async () => {
            const scene = Scene.init('test-container', { autoStart: false });
            const box = Box.create();

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(box.width).toBe(1);
            expect(box.height).toBe(1);
            expect(box.depth).toBe(1);
            expect(scene.objects.size).toBe(1);
        });
    });

    describe('Sphere.create() without scene parameter', () => {
        test('should create sphere and add to singleton scene when scene parameter omitted', async () => {
            const scene = Scene.init('test-container', { autoStart: false });

            const sphere = Sphere.create(2.5, 16);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(sphere).toBeDefined();
            expect(sphere.radius).toBe(2.5);

            // Verify sphere was added to singleton scene
            expect(scene.objects.size).toBe(1);
            expect(scene.objects.has(sphere.id)).toBe(true);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Sphere.create() called without scene parameter',
                ),
            );
        });

        test('should create sphere without adding to scene if singleton not initialized', () => {
            const sphere = Sphere.create(1);

            expect(sphere).toBeDefined();
            expect(sphere.radius).toBe(1);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Sphere.create() called without scene parameter',
                ),
            );
        });

        test('should work with default parameters', async () => {
            const scene = Scene.init('test-container', { autoStart: false });
            const sphere = Sphere.create();

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(sphere.radius).toBe(1);
            expect(scene.objects.size).toBe(1);
        });
    });

    describe('Plane.create() without scene parameter', () => {
        test('should create plane and add to singleton scene when scene parameter omitted', async () => {
            const scene = Scene.init('test-container', { autoStart: false });

            const plane = Plane.create(5, 3);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(plane).toBeDefined();
            expect(plane.width).toBe(5);
            expect(plane.height).toBe(3);

            // Verify plane was added to singleton scene
            expect(scene.objects.size).toBe(1);
            expect(scene.objects.has(plane.id)).toBe(true);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Plane.create() called without scene parameter',
                ),
            );
        });

        test('should create plane without adding to scene if singleton not initialized', () => {
            const plane = Plane.create(2, 2);

            expect(plane).toBeDefined();
            expect(plane.width).toBe(2);
            expect(plane.height).toBe(2);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Plane.create() called without scene parameter',
                ),
            );
        });

        test('should work with default parameters', async () => {
            const scene = Scene.init('test-container', { autoStart: false });
            const plane = Plane.create();

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(plane.width).toBe(1);
            expect(plane.height).toBe(1);
            expect(scene.objects.size).toBe(1);
        });
    });

    describe('Light factories without scene parameter', () => {
        test('Light.sun() should log deprecation warning when scene parameter omitted', () => {
            const light = Light.sun({ intensity: 1.5 });

            expect(light).toBeDefined();
            expect(light.type).toBe('directional');

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[DEPRECATED] Light.sun() called without scene parameter'),
            );
        });

        test('Light.ambient() should log deprecation warning when scene parameter omitted', () => {
            const light = Light.ambient({ intensity: 0.5 });

            expect(light).toBeDefined();
            expect(light.type).toBe('ambient');

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Light.ambient() called without scene parameter',
                ),
            );
        });

        test('Light.point() should log deprecation warning when scene parameter omitted', () => {
            const light = Light.point(1, 2, 3, { intensity: 1 });

            expect(light).toBeDefined();
            expect(light.type).toBe('point');

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Light.point() called without scene parameter',
                ),
            );
        });

        test('Light.spot() should log deprecation warning when scene parameter omitted', () => {
            const light = Light.spot({ x: 0, y: 5, z: 0 });

            expect(light).toBeDefined();
            expect(light.type).toBe('spot');

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[DEPRECATED] Light.spot() called without scene parameter'),
            );
        });

        test('Light.hemisphere() should log deprecation warning when scene parameter omitted', () => {
            const light = Light.hemisphere({ intensity: 0.8 });

            expect(light).toBeDefined();
            expect(light.type).toBe('hemisphere');

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    '[DEPRECATED] Light.hemisphere() called without scene parameter',
                ),
            );
        });
    });

    describe('Integration: Multiple objects without scene parameter', () => {
        test('should add multiple objects to singleton scene', async () => {
            const scene = Scene.init('test-container', { autoStart: false });

            const box = Box.create(1, 1, 1);
            const sphere = Sphere.create(1);
            const plane = Plane.create(2, 2);

            // Wait for dynamic imports to complete
            await new Promise((resolve) => setTimeout(resolve, 20));

            // All objects should be in singleton scene
            expect(scene.objects.size).toBe(3);
            expect(scene.objects.has(box.id)).toBe(true);
            expect(scene.objects.has(sphere.id)).toBe(true);
            expect(scene.objects.has(plane.id)).toBe(true);
        });

        test('should handle mixed usage of with and without scene parameter', async () => {
            const scene = Scene.init('test-container', { autoStart: false });

            // Create with scene parameter
            const box1 = Box.create(1, 1, 1, null, scene);

            // Create without scene parameter
            const box2 = Box.create(2, 2, 2);

            await new Promise((resolve) => setTimeout(resolve, 10));

            // Both should be in the same scene
            expect(scene.objects.size).toBe(2);
            expect(scene.objects.has(box1.id)).toBe(true);
            expect(scene.objects.has(box2.id)).toBe(true);
        });
    });

    describe('Scene.destroy() and reinit', () => {
        test('should allow destroy and reinit cycle', async () => {
            // First initialization
            const scene1 = Scene.init('test-container', { autoStart: false });
            const box1 = Box.create(1, 1, 1);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(scene1.objects.size).toBe(1);

            // Destroy
            Scene.destroy();
            expect(Scene.getInstance()).toBe(null);
            expect(scene1.isDisposed).toBe(true);

            // Reinitialize
            const scene2 = Scene.init('test-container', { autoStart: false });
            expect(scene2).not.toBe(scene1);
            expect(scene2.objects.size).toBe(0);

            // Create new object
            const box2 = Box.create(2, 2, 2);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(scene2.objects.size).toBe(1);
            expect(scene2.objects.has(box2.id)).toBe(true);
        });

        test('should handle multiple destroy and reinit cycles', async () => {
            for (let i = 0; i < 3; i++) {
                const scene = Scene.init('test-container', { autoStart: false });
                const box = Box.create(i + 1, i + 1, i + 1);

                await new Promise((resolve) => setTimeout(resolve, 10));

                expect(scene.objects.size).toBe(1);
                expect(Scene.isInitialized()).toBe(true);

                Scene.destroy();
                expect(Scene.isInitialized()).toBe(false);
                expect(scene.isDisposed).toBe(true);
            }
        });

        test('should clean up objects when singleton is destroyed', async () => {
            const scene = Scene.init('test-container', { autoStart: false });

            Box.create(1, 1, 1);
            Sphere.create(1);
            Plane.create(2, 2);

            await new Promise((resolve) => setTimeout(resolve, 20));

            expect(scene.objects.size).toBe(3);

            // Destroy scene
            Scene.destroy();

            // Scene should be disposed
            expect(scene.isDisposed).toBe(true);
        });
    });

    describe('Backward compatibility with existing code patterns', () => {
        test('should support typical v1.x usage pattern', async () => {
            // Typical v1.x code pattern
            Scene.init('test-container', { autoStart: false });

            const box = Box.create(2, 2, 2);
            const sphere = Sphere.create(1.5);
            const plane = Plane.create(10, 10);

            await new Promise((resolve) => setTimeout(resolve, 20));

            const scene = Scene.getInstance();
            expect(scene.objects.size).toBe(3);

            Scene.destroy();
        });

        test('should work with Scene.getInstance() pattern', async () => {
            Scene.init('test-container', { autoStart: false });

            Box.create(1, 1, 1);

            await new Promise((resolve) => setTimeout(resolve, 10));

            const scene = Scene.getInstance();
            expect(scene).toBeDefined();
            expect(scene.objects.size).toBe(1);

            // Can use scene methods
            const sphere = scene.createSphere(1);
            expect(scene.objects.size).toBe(2);
        });
    });
});
