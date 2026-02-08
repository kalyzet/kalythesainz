/**
 * Unit tests for createScene() factory function
 * Tests the instance-based API entry point
 */

import { createScene, SceneInstance } from '../../../index.js';

describe('createScene() Factory Function', () => {
    let container;

    beforeEach(() => {
        // Create a container element
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
    });

    test('createScene returns a SceneInstance', () => {
        const scene = createScene('test-container', { autoStart: false });

        expect(scene).toBeInstanceOf(SceneInstance);
        expect(scene.renderer).toBeDefined();
        expect(scene.camera).toBeDefined();
        expect(scene.threeScene).toBeDefined();

        scene.dispose();
    });

    test('createScene accepts containerId and config', () => {
        const config = {
            autoStart: false,
            lights: false,
            camera: { fov: 60 },
        };

        const scene = createScene('test-container', config);

        expect(scene).toBeInstanceOf(SceneInstance);
        expect(scene.isRendering).toBe(false); // autoStart: false
        expect(scene.lights.length).toBe(0); // lights: false

        scene.dispose();
    });

    test('createScene with default config', () => {
        const scene = createScene('test-container');

        expect(scene).toBeInstanceOf(SceneInstance);
        expect(scene.renderer).toBeDefined();
        expect(scene.camera).toBeDefined();
        expect(scene.lights.length).toBeGreaterThan(0); // Default lights

        scene.dispose();
    });

    test('createScene throws error for invalid containerId', () => {
        expect(() => {
            createScene('');
        }).toThrow();

        expect(() => {
            createScene(null);
        }).toThrow();

        expect(() => {
            createScene(123);
        }).toThrow();
    });

    test('createScene allows multiple independent scenes', () => {
        const container2 = document.createElement('div');
        container2.id = 'test-container-2';
        document.body.appendChild(container2);

        const scene1 = createScene('test-container', { autoStart: false });
        const scene2 = createScene('test-container-2', { autoStart: false });

        expect(scene1).toBeInstanceOf(SceneInstance);
        expect(scene2).toBeInstanceOf(SceneInstance);
        expect(scene1).not.toBe(scene2);

        // Verify independence
        const box1 = scene1.createBox(1, 1, 1);
        expect(scene1.objects.size).toBe(1);
        expect(scene2.objects.size).toBe(0);

        scene1.dispose();
        scene2.dispose();
        document.body.removeChild(container2);
    });
});
