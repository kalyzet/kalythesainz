/**
 * Property-Based Tests for Deprecation Warnings
 * **Feature: instance-based-api, Property 10: Deprecation Warnings**
 * **Validates: Requirements 3.4**
 *
 * Tests that deprecation warnings are logged when using the old singleton API
 */

import fc from 'fast-check';
import { Scene } from '../../engine/Scene.js';
import { Box } from '../../objects/Box.js';
import { Sphere } from '../../objects/Sphere.js';
import { Plane } from '../../objects/Plane.js';
import { Light } from '../../engine/Light.js';

describe('Property 10: Deprecation Warnings', () => {
    let consoleWarnSpy;
    let container;

    beforeEach(() => {
        // Spy on console.warn
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // Create a container element
        container = document.createElement('div');
        container.id = 'test-container';
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Restore console.warn
        consoleWarnSpy.mockRestore();

        // Clean up scene
        if (Scene.isInitialized()) {
            Scene.destroy();
        }

        // Clean up container
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    test('Scene.init() logs deprecation warning', () => {
        fc.assert(
            fc.property(fc.record({}), (config) => {
                // Clear previous warnings
                consoleWarnSpy.mockClear();

                // Call Scene.init()
                Scene.init('test-container', config);

                // Verify deprecation warning was logged
                const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                const hasDeprecationWarning = warnings.some(
                    (warning) =>
                        warning.includes('[DEPRECATED]') &&
                        warning.includes('Scene.init()') &&
                        warning.includes('createScene()'),
                );

                expect(hasDeprecationWarning).toBe(true);

                // Clean up
                Scene.destroy();

                return true;
            }),
            { numRuns: 10 },
        );
    });

    test('Box.create() without scene parameter logs deprecation warning', async () => {
        // Initialize singleton scene once
        Scene.init('test-container');

        const testCases = [
            [1, 1, 1],
            [2, 3, 4],
            [0.5, 0.5, 0.5],
        ];

        for (const [width, height, depth] of testCases) {
            // Clear previous warnings
            consoleWarnSpy.mockClear();

            // Call Box.create() without scene parameter
            Box.create(width, height, depth);

            // Wait for async import to complete
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Verify deprecation warning was logged
            const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
            const hasDeprecationWarning = warnings.some(
                (warning) =>
                    warning.includes('[DEPRECATED]') &&
                    warning.includes('Box.create()') &&
                    warning.includes('scene parameter'),
            );

            expect(hasDeprecationWarning).toBe(true);
        }

        // Clean up
        Scene.destroy();
    });

    test('Sphere.create() without scene parameter logs deprecation warning', async () => {
        // Initialize singleton scene once
        Scene.init('test-container');

        const testCases = [
            [1, 32],
            [2, 16],
            [0.5, 8],
        ];

        for (const [radius, segments] of testCases) {
            // Clear previous warnings
            consoleWarnSpy.mockClear();

            // Call Sphere.create() without scene parameter
            Sphere.create(radius, segments);

            // Wait for async import to complete
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Verify deprecation warning was logged
            const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
            const hasDeprecationWarning = warnings.some(
                (warning) =>
                    warning.includes('[DEPRECATED]') &&
                    warning.includes('Sphere.create()') &&
                    warning.includes('scene parameter'),
            );

            expect(hasDeprecationWarning).toBe(true);
        }

        // Clean up
        Scene.destroy();
    });

    test('Plane.create() without scene parameter logs deprecation warning', async () => {
        // Initialize singleton scene once
        Scene.init('test-container');

        const testCases = [
            [1, 1],
            [2, 3],
            [0.5, 0.5],
        ];

        for (const [width, height] of testCases) {
            // Clear previous warnings
            consoleWarnSpy.mockClear();

            // Call Plane.create() without scene parameter
            Plane.create(width, height);

            // Wait for async import to complete
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Verify deprecation warning was logged
            const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
            const hasDeprecationWarning = warnings.some(
                (warning) =>
                    warning.includes('[DEPRECATED]') &&
                    warning.includes('Plane.create()') &&
                    warning.includes('scene parameter'),
            );

            expect(hasDeprecationWarning).toBe(true);
        }

        // Clean up
        Scene.destroy();
    });

    test('Light.sun() without scene parameter logs deprecation warning', () => {
        fc.assert(
            fc.property(
                fc.record({
                    intensity: fc.float({ min: Math.fround(0), max: Math.fround(2) }),
                    color: fc.integer({ min: 0, max: 0xffffff }),
                }),
                (config) => {
                    // Clear previous warnings
                    consoleWarnSpy.mockClear();

                    // Call Light.sun() without scene parameter
                    Light.sun(config);

                    // Verify deprecation warning was logged
                    const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                    const hasDeprecationWarning = warnings.some(
                        (warning) =>
                            warning.includes('[DEPRECATED]') &&
                            warning.includes('Light.sun()') &&
                            warning.includes('scene parameter'),
                    );

                    expect(hasDeprecationWarning).toBe(true);

                    return true;
                },
            ),
            { numRuns: 10 },
        );
    });

    test('Light.ambient() without scene parameter logs deprecation warning', () => {
        fc.assert(
            fc.property(
                fc.record({
                    intensity: fc.float({ min: Math.fround(0), max: Math.fround(2) }),
                    color: fc.integer({ min: 0, max: 0xffffff }),
                }),
                (config) => {
                    // Clear previous warnings
                    consoleWarnSpy.mockClear();

                    // Call Light.ambient() without scene parameter
                    Light.ambient(config);

                    // Verify deprecation warning was logged
                    const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                    const hasDeprecationWarning = warnings.some(
                        (warning) =>
                            warning.includes('[DEPRECATED]') &&
                            warning.includes('Light.ambient()') &&
                            warning.includes('scene parameter'),
                    );

                    expect(hasDeprecationWarning).toBe(true);

                    return true;
                },
            ),
            { numRuns: 10 },
        );
    });

    test('Light.point() without scene parameter logs deprecation warning', () => {
        fc.assert(
            fc.property(
                fc.float({ min: Math.fround(-10), max: Math.fround(10) }),
                fc.float({ min: Math.fround(-10), max: Math.fround(10) }),
                fc.float({ min: Math.fround(-10), max: Math.fround(10) }),
                fc.record({
                    intensity: fc.float({ min: Math.fround(0), max: Math.fround(2) }),
                    color: fc.integer({ min: 0, max: 0xffffff }),
                }),
                (x, y, z, config) => {
                    // Clear previous warnings
                    consoleWarnSpy.mockClear();

                    // Call Light.point() without scene parameter
                    Light.point(x, y, z, config);

                    // Verify deprecation warning was logged
                    const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                    const hasDeprecationWarning = warnings.some(
                        (warning) =>
                            warning.includes('[DEPRECATED]') &&
                            warning.includes('Light.point()') &&
                            warning.includes('scene parameter'),
                    );

                    expect(hasDeprecationWarning).toBe(true);

                    return true;
                },
            ),
            { numRuns: 10 },
        );
    });

    test('Light.spot() without scene parameter logs deprecation warning', () => {
        fc.assert(
            fc.property(
                fc.record({
                    x: fc.float({ min: Math.fround(-10), max: Math.fround(10) }),
                    y: fc.float({ min: Math.fround(-10), max: Math.fround(10) }),
                    z: fc.float({ min: Math.fround(-10), max: Math.fround(10) }),
                    intensity: fc.float({ min: Math.fround(0), max: Math.fround(2) }),
                    color: fc.integer({ min: 0, max: 0xffffff }),
                }),
                (config) => {
                    // Clear previous warnings
                    consoleWarnSpy.mockClear();

                    // Call Light.spot() without scene parameter
                    Light.spot(config);

                    // Verify deprecation warning was logged
                    const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                    const hasDeprecationWarning = warnings.some(
                        (warning) =>
                            warning.includes('[DEPRECATED]') &&
                            warning.includes('Light.spot()') &&
                            warning.includes('scene parameter'),
                    );

                    expect(hasDeprecationWarning).toBe(true);

                    return true;
                },
            ),
            { numRuns: 10 },
        );
    });

    test('Light.hemisphere() without scene parameter logs deprecation warning', () => {
        fc.assert(
            fc.property(
                fc.record({
                    skyColor: fc.integer({ min: 0, max: 0xffffff }),
                    groundColor: fc.integer({ min: 0, max: 0xffffff }),
                    intensity: fc.float({ min: Math.fround(0), max: Math.fround(2) }),
                }),
                (config) => {
                    // Clear previous warnings
                    consoleWarnSpy.mockClear();

                    // Call Light.hemisphere() without scene parameter
                    Light.hemisphere(config);

                    // Verify deprecation warning was logged
                    const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                    const hasDeprecationWarning = warnings.some(
                        (warning) =>
                            warning.includes('[DEPRECATED]') &&
                            warning.includes('Light.hemisphere()') &&
                            warning.includes('scene parameter'),
                    );

                    expect(hasDeprecationWarning).toBe(true);

                    return true;
                },
            ),
            { numRuns: 10 },
        );
    });

    test('Deprecation warnings include migration guidance', () => {
        fc.assert(
            fc.property(fc.constant(null), () => {
                // Clear previous warnings
                consoleWarnSpy.mockClear();

                // Call various deprecated APIs
                Scene.init('test-container');
                Light.sun();
                Light.ambient();

                // Verify all warnings include migration guidance
                const warnings = consoleWarnSpy.mock.calls.map((call) => call[0]);
                const deprecationWarnings = warnings.filter((warning) =>
                    warning.includes('[DEPRECATED]'),
                );

                // All deprecation warnings should include migration guide link
                const allHaveMigrationGuide = deprecationWarnings.every(
                    (warning) =>
                        warning.includes('migration guide') ||
                        warning.includes('createScene()') ||
                        warning.includes('scene parameter'),
                );

                expect(allHaveMigrationGuide).toBe(true);
                expect(deprecationWarnings.length).toBeGreaterThan(0);

                // Clean up
                Scene.destroy();

                return true;
            }),
            { numRuns: 10 },
        );
    });
});
