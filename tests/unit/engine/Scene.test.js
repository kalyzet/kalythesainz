/**
 * Unit tests for Scene class (Backward Compatibility Layer)
 * Tests the singleton API that wraps SceneInstance
 */

import { Scene } from '../../../engine/Scene.js';
import { SceneInstance } from '../../../engine/SceneInstance.js';

describe('Scene (Backward Compatibility Layer)', () => {
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

    describe('Scene.init()', () => {
        test('should initialize scene with container ID and return SceneInstance', () => {
            const scene = Scene.init('test-container', { autoStart: false });

            expect(scene).toBeDefined();
            expect(scene).toBeInstanceOf(SceneInstance);
            expect(Scene.isInitialized()).toBe(true);
            expect(Scene.getInstance()).toBe(scene);

            // Verify deprecation warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[DEPRECATED] Scene.init() is deprecated'),
            );
        });

        test('should initialize scene with configuration object', () => {
            const config = {
                containerId: 'test-container',
                autoStart: false,
                lights: false,
            };

            const scene = Scene.init(config);

            expect(scene).toBeDefined();
            expect(scene).toBeInstanceOf(SceneInstance);
            expect(scene.lights).toHaveLength(0);
            expect(scene.isRendering).toBe(false);
        });

        test('should auto-destroy previous singleton if called multiple times', () => {
            const scene1 = Scene.init('test-container', { autoStart: false });
            const scene2 = Scene.init('test-container', { autoStart: false });

            expect(scene1).not.toBe(scene2);
            expect(scene1.isDisposed).toBe(true);
            expect(Scene.getInstance()).toBe(scene2);

            // Verify multiple init warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[DEPRECATED] Scene.init() called multiple times'),
            );
        });

        test('should throw error with invalid parameters', () => {
            expect(() => Scene.init(123)).toThrow(
                'First parameter must be a container ID string or configuration object',
            );
        });

        test('should handle config object with containerId property', () => {
            const config = {
                containerId: 'test-container',
                autoStart: false,
            };

            const scene = Scene.init(config);

            expect(scene).toBeDefined();
            expect(scene).toBeInstanceOf(SceneInstance);
        });
    });

    describe('Scene.getInstance()', () => {
        test('should return null if not initialized', () => {
            expect(Scene.getInstance()).toBe(null);
        });

        test('should return scene instance if initialized', () => {
            const scene = Scene.init('test-container', { autoStart: false });
            expect(Scene.getInstance()).toBe(scene);
        });

        test('should return same instance on multiple calls', () => {
            const scene = Scene.init('test-container', { autoStart: false });
            const instance1 = Scene.getInstance();
            const instance2 = Scene.getInstance();

            expect(instance1).toBe(scene);
            expect(instance2).toBe(scene);
            expect(instance1).toBe(instance2);
        });
    });

    describe('Scene.isInitialized()', () => {
        test('should return false if not initialized', () => {
            expect(Scene.isInitialized()).toBe(false);
        });

        test('should return true if initialized', () => {
            Scene.init('test-container', { autoStart: false });
            expect(Scene.isInitialized()).toBe(true);
        });

        test('should return false after destroy', () => {
            Scene.init('test-container', { autoStart: false });
            Scene.destroy();
            expect(Scene.isInitialized()).toBe(false);
        });
    });

    describe('Scene.destroy()', () => {
        test('should destroy singleton instance', () => {
            const scene = Scene.init('test-container', { autoStart: false });
            expect(Scene.isInitialized()).toBe(true);

            Scene.destroy();

            expect(Scene.isInitialized()).toBe(false);
            expect(Scene.getInstance()).toBe(null);
            expect(scene.isDisposed).toBe(true);
        });

        test('should not throw error if not initialized', () => {
            expect(() => Scene.destroy()).not.toThrow();
        });

        test('should allow reinitialization after destroy', () => {
            const scene1 = Scene.init('test-container', { autoStart: false });
            Scene.destroy();

            const scene2 = Scene.init('test-container', { autoStart: false });

            expect(scene1).not.toBe(scene2);
            expect(scene1.isDisposed).toBe(true);
            expect(Scene.getInstance()).toBe(scene2);
        });
    });

    describe('Backward Compatibility', () => {
        test('should work with existing singleton pattern code', () => {
            // Initialize singleton
            const scene = Scene.init('test-container', { autoStart: false });

            // Access via getInstance
            const instance = Scene.getInstance();
            expect(instance).toBe(scene);

            // Use scene methods
            const box = scene.createBox(1, 1, 1);
            expect(scene.objects.size).toBe(1);

            // Destroy singleton
            Scene.destroy();
            expect(Scene.getInstance()).toBe(null);
        });

        test('should return SceneInstance with all instance methods', () => {
            const scene = Scene.init('test-container', { autoStart: false });

            // Verify SceneInstance methods are available
            expect(typeof scene.createBox).toBe('function');
            expect(typeof scene.createSphere).toBe('function');
            expect(typeof scene.createPlane).toBe('function');
            expect(typeof scene.addLight).toBe('function');
            expect(typeof scene.add).toBe('function');
            expect(typeof scene.remove).toBe('function');
            expect(typeof scene.destroy).toBe('function');
        });

        test('should handle React Strict Mode double-mount scenario', () => {
            // First mount
            const scene1 = Scene.init('test-container', { autoStart: false });

            // Second mount (React Strict Mode)
            const scene2 = Scene.init('test-container', { autoStart: false });

            // First instance should be disposed
            expect(scene1.isDisposed).toBe(true);

            // Second instance should be active
            expect(scene2.isDisposed).toBe(false);
            expect(Scene.getInstance()).toBe(scene2);
        });
    });
});
