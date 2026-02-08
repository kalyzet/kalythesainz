/**
 * Property-based tests for singleton fallback behavior
 * **Feature: instance-based-api, Property 9: Singleton Fallback**
 * **Validates: Requirements 2.1.5**
 */

import fc from 'fast-check';
import { Scene } from '../../engine/Scene.js';
import { Box } from '../../objects/Box.js';
import { Sphere } from '../../objects/Sphere.js';
import { Plane } from '../../objects/Plane.js';

describe('Singleton Fallback Property Tests', () => {
    let singletonScene = null;

    beforeEach(() => {
        if (Scene.isInitialized()) {
            Scene.destroy();
        }

        document.body.innerHTML = '';
        const container = document.createElement('div');
        container.id = 'singleton-test-container';
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        singletonScene = Scene.init('singleton-test-container', {
            autoStart: false,
            lights: false,
        });
    });

    afterEach(() => {
        if (Scene.isInitialized()) {
            Scene.destroy();
        }
        singletonScene = null;
        document.body.innerHTML = '';
    });

    test('**Feature: instance-based-api, Property 9: Singleton Fallback** - Box.create without scene parameter adds to singleton', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                async (width, height, depth) => {
                    const initialCount = singletonScene.objects.size;
                    const box = Box.create(width, height, depth);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    expect(box).toBeDefined();
                    expect(box.constructor.name).toBe('Box');
                    expect(box.width).toBeCloseTo(width, 5);
                    expect(box.height).toBeCloseTo(height, 5);
                    expect(box.depth).toBeCloseTo(depth, 5);
                    expect(singletonScene.objects.size).toBe(initialCount + 1);
                    expect(singletonScene.find(box.id)).toBe(box);
                    expect(singletonScene.threeScene.children).toContain(box.threeMesh);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('**Feature: instance-based-api, Property 9: Singleton Fallback** - Sphere.create without scene parameter adds to singleton', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.integer({ min: 3, max: 64 }),
                async (radius, segments) => {
                    const initialCount = singletonScene.objects.size;
                    const sphere = Sphere.create(radius, segments);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    expect(sphere).toBeDefined();
                    expect(sphere.constructor.name).toBe('Sphere');
                    expect(sphere.radius).toBeCloseTo(radius, 5);
                    expect(singletonScene.objects.size).toBe(initialCount + 1);
                    expect(singletonScene.find(sphere.id)).toBe(sphere);
                    expect(singletonScene.threeScene.children).toContain(sphere.threeMesh);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('**Feature: instance-based-api, Property 9: Singleton Fallback** - Plane.create without scene parameter adds to singleton', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                fc.double({ min: 0.1, max: 10, noNaN: true }),
                async (width, height) => {
                    const initialCount = singletonScene.objects.size;
                    const plane = Plane.create(width, height);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    expect(plane).toBeDefined();
                    expect(plane.constructor.name).toBe('Plane');
                    expect(plane.width).toBeCloseTo(width, 5);
                    expect(plane.height).toBeCloseTo(height, 5);
                    expect(singletonScene.objects.size).toBe(initialCount + 1);
                    expect(singletonScene.find(plane.id)).toBe(plane);
                    expect(singletonScene.threeScene.children).toContain(plane.threeMesh);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Singleton fallback works for mixed object types', async () => {
        const initialCount = singletonScene.objects.size;
        const box = Box.create(1, 1, 1);
        const sphere = Sphere.create(1, 16);
        const plane = Plane.create(1, 1);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(singletonScene.objects.size).toBe(initialCount + 3);
        expect(singletonScene.find(box.id)).toBe(box);
        expect(singletonScene.find(sphere.id)).toBe(sphere);
        expect(singletonScene.find(plane.id)).toBe(plane);
        expect(singletonScene.threeScene.children).toContain(box.threeMesh);
        expect(singletonScene.threeScene.children).toContain(sphere.threeMesh);
        expect(singletonScene.threeScene.children).toContain(plane.threeMesh);
    });

    test('Objects created without scene parameter when no singleton exists do not throw error', () => {
        Scene.destroy();
        expect(() => {
            Box.create(1, 1, 1);
            Sphere.create(1, 16);
            Plane.create(1, 1);
        }).not.toThrow();
        singletonScene = Scene.init('singleton-test-container', {
            autoStart: false,
            lights: false,
        });
    });
});
