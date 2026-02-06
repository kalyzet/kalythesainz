/**
 * Property-based tests for Three.js integration consistency
 * **Feature: kalythesainz-framework, Property 9: Three.js integration consistency**
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
 */

import { Object3D } from '../../engine/Object3D.js';
import { Scene } from '../../engine/Scene.js';
import { Camera } from '../../engine/Camera.js';
import { Light } from '../../engine/Light.js';
import { Renderer } from '../../engine/Renderer.js';
import { ThreeJsIntegration } from '../../utils/ThreeJsIntegration.js';
import { EventBus } from '../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

// Simple property-based testing utilities
const fc = {
    assert: (property, options = {}) => {
        const numRuns = options.numRuns || 100;
        for (let i = 0; i < numRuns; i++) {
            try {
                property.run();
            } catch (error) {
                throw new Error(`Property failed on run ${i + 1}: ${error.message}`);
            }
        }
    },
    property: (...args) => {
        const generators = args.slice(0, -1);
        const testFn = args[args.length - 1];

        return {
            run: () => {
                const values = generators.map((gen) => gen.generate());
                testFn(...values);
            },
        };
    },
    float: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.random() * (max - min) + min;
        },
    }),
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    }),
    boolean: () => ({
        generate: () => Math.random() < 0.5,
    }),
    record: (schema) => ({
        generate: () => {
            const result = {};
            for (const [key, generator] of Object.entries(schema)) {
                result[key] = generator.generate();
            }
            return result;
        },
    }),
    constant: (value) => ({
        generate: () => value,
    }),
    oneof: (...generators) => ({
        generate: () => {
            const chosen = generators[Math.floor(Math.random() * generators.length)];
            return chosen.generate();
        },
    }),
};

// Transform generators
const positionGenerator = fc.record({
    x: fc.float({ min: -100, max: 100 }),
    y: fc.float({ min: -100, max: 100 }),
    z: fc.float({ min: -100, max: 100 }),
});

const rotationGenerator = fc.record({
    x: fc.float({ min: 0, max: Math.PI * 2 }),
    y: fc.float({ min: 0, max: Math.PI * 2 }),
    z: fc.float({ min: 0, max: Math.PI * 2 }),
});

const scaleGenerator = fc.record({
    x: fc.float({ min: 0.1, max: 10 }),
    y: fc.float({ min: 0.1, max: 10 }),
    z: fc.float({ min: 0.1, max: 10 }),
});

describe('Three.js Integration Property Tests', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    /**
     * Property 9: Three.js integration consistency
     * For any framework object, direct access to underlying Three.js objects should be available,
     * and direct manipulations should maintain framework state synchronization
     */
    test('**Feature: kalythesainz-framework, Property 9: Three.js integration consistency**', () => {
        fc.assert(
            fc.property(
                positionGenerator,
                rotationGenerator,
                scaleGenerator,
                fc.boolean(),
                fc.integer({ min: 0, max: 0xffffff }),
                (position, rotation, scale, visible, color) => {
                    // Create framework object
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    const object = new Object3D(geometry, material);

                    // Verify direct Three.js access is available
                    expect(object.threeMesh).toBeDefined();
                    expect(object.threeMesh.isMesh).toBe(true);
                    expect(object.threeObject).toBeDefined();
                    expect(object.threeObject).toBe(object.threeMesh);

                    // Directly manipulate Three.js object
                    object.threeMesh.position.set(position.x, position.y, position.z);
                    object.threeMesh.rotation.set(rotation.x, rotation.y, rotation.z);
                    object.threeMesh.scale.set(scale.x, scale.y, scale.z);
                    object.threeMesh.visible = visible;
                    object.threeMesh.material.color.setHex(color);

                    // Sync from Three.js
                    const syncResult = object.syncFromThree();

                    // Verify synchronization worked
                    expect(syncResult).toBeDefined();
                    expect(syncResult.position).toBeDefined();
                    expect(syncResult.rotation).toBeDefined();
                    expect(syncResult.scale).toBeDefined();
                    expect(syncResult.visible).toBe(visible);

                    // Verify framework state matches Three.js state
                    expect(object.position.x).toBeCloseTo(position.x, 5);
                    expect(object.position.y).toBeCloseTo(position.y, 5);
                    expect(object.position.z).toBeCloseTo(position.z, 5);

                    expect(object.rotation.x).toBeCloseTo(rotation.x, 5);
                    expect(object.rotation.y).toBeCloseTo(rotation.y, 5);
                    expect(object.rotation.z).toBeCloseTo(rotation.z, 5);

                    expect(object.scale.x).toBeCloseTo(scale.x, 5);
                    expect(object.scale.y).toBeCloseTo(scale.y, 5);
                    expect(object.scale.z).toBeCloseTo(scale.z, 5);

                    expect(object.visible).toBe(visible);

                    // Verify material color is accessible
                    expect(object.threeMesh.material.color.getHex()).toBe(color);

                    // Clean up
                    object.dispose();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Framework modifications are reflected in Three.js objects', () => {
        fc.assert(
            fc.property(
                positionGenerator,
                rotationGenerator,
                scaleGenerator,
                fc.boolean(),
                (position, rotation, scale, visible) => {
                    // Create framework object
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    const object = new Object3D(geometry, material);

                    // Modify through framework API
                    object.position = [position.x, position.y, position.z];
                    object.rotation = [rotation.x, rotation.y, rotation.z];
                    object.scale = [scale.x, scale.y, scale.z];
                    object.visible = visible;

                    // Verify Three.js object reflects changes
                    expect(object.threeMesh.position.x).toBeCloseTo(position.x, 5);
                    expect(object.threeMesh.position.y).toBeCloseTo(position.y, 5);
                    expect(object.threeMesh.position.z).toBeCloseTo(position.z, 5);

                    expect(object.threeMesh.rotation.x).toBeCloseTo(rotation.x, 5);
                    expect(object.threeMesh.rotation.y).toBeCloseTo(rotation.y, 5);
                    expect(object.threeMesh.rotation.z).toBeCloseTo(rotation.z, 5);

                    expect(object.threeMesh.scale.x).toBeCloseTo(scale.x, 5);
                    expect(object.threeMesh.scale.y).toBeCloseTo(scale.y, 5);
                    expect(object.threeMesh.scale.z).toBeCloseTo(scale.z, 5);

                    expect(object.threeMesh.visible).toBe(visible);

                    // Clean up
                    object.dispose();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Mixed usage patterns maintain consistency', () => {
        fc.assert(
            fc.property(
                positionGenerator,
                positionGenerator,
                fc.boolean(),
                fc.boolean(),
                (frameworkPosition, threePosition, frameworkVisible, threeVisible) => {
                    // Create framework object
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    const object = new Object3D(geometry, material);

                    // Mix framework and Three.js API calls
                    object.position = [
                        frameworkPosition.x,
                        frameworkPosition.y,
                        frameworkPosition.z,
                    ];
                    object.threeMesh.position.set(
                        threePosition.x,
                        threePosition.y,
                        threePosition.z,
                    );

                    object.visible = frameworkVisible;
                    object.threeMesh.visible = threeVisible;

                    // Sync to resolve conflicts
                    object.syncFromThree();

                    // Verify final state matches Three.js (Three.js wins in conflicts)
                    expect(object.position.x).toBeCloseTo(threePosition.x, 5);
                    expect(object.position.y).toBeCloseTo(threePosition.y, 5);
                    expect(object.position.z).toBeCloseTo(threePosition.z, 5);
                    expect(object.visible).toBe(threeVisible);

                    // Clean up
                    object.dispose();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('ThreeJsIntegration utility detects and resolves conflicts', () => {
        fc.assert(
            fc.property(fc.boolean(), fc.boolean(), (frameworkVisible, threeVisible) => {
                // Create framework object
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                const object = new Object3D(geometry, material);

                // Create conflict
                object.visible = frameworkVisible;
                object.threeMesh.visible = threeVisible;

                // Detect conflicts
                const conflicts = ThreeJsIntegration.detectConflicts(object);

                if (frameworkVisible !== threeVisible) {
                    // Should detect visibility mismatch
                    expect(conflicts.hasConflicts).toBe(true);
                    expect(conflicts.conflicts.length).toBeGreaterThan(0);
                    expect(conflicts.conflicts.some((c) => c.type === 'visibilityMismatch')).toBe(
                        true,
                    );
                }

                // Resolve conflicts
                const resolution = ThreeJsIntegration.resolveConflicts(object);

                if (frameworkVisible !== threeVisible) {
                    expect(resolution.resolved).toBe(true);
                    expect(resolution.conflictsResolved).toBeGreaterThan(0);
                }

                // Verify state is now consistent
                expect(object.visible).toBe(object.threeMesh.visible);

                // Clean up
                object.dispose();
            }),
            { numRuns: 100 },
        );
    });

    test('Camera Three.js access and synchronization', () => {
        fc.assert(
            fc.property(positionGenerator, fc.float({ min: 10, max: 120 }), (position, fov) => {
                // Create camera
                const camera = new Camera('perspective', { fov: 75 });

                // Verify Three.js access
                expect(camera.threeCamera).toBeDefined();
                expect(camera.threeCamera.isCamera).toBe(true);

                // Direct manipulation
                camera.threeCamera.position.set(position.x, position.y, position.z);
                camera.threeCamera.fov = fov;
                camera.threeCamera.updateProjectionMatrix();

                // Sync from Three.js
                const syncResult = camera.syncFromThree();

                // Verify sync result
                expect(syncResult).toBeDefined();
                expect(syncResult.position).toBeDefined();
                expect(syncResult.position[0]).toBeCloseTo(position.x, 5);
                expect(syncResult.position[1]).toBeCloseTo(position.y, 5);
                expect(syncResult.position[2]).toBeCloseTo(position.z, 5);

                // Verify framework state matches
                expect(camera.position.x).toBeCloseTo(position.x, 5);
                expect(camera.position.y).toBeCloseTo(position.y, 5);
                expect(camera.position.z).toBeCloseTo(position.z, 5);
                expect(camera.threeCamera.fov).toBeCloseTo(fov, 5);

                // Clean up
                camera.dispose();
            }),
            { numRuns: 100 },
        );
    });

    test('Light Three.js access and synchronization', () => {
        fc.assert(
            fc.property(
                positionGenerator,
                fc.float({ min: 0, max: 2 }),
                fc.integer({ min: 0, max: 0xffffff }),
                (position, intensity, color) => {
                    // Create light
                    const light = Light.point(0, 0, 0);

                    // Verify Three.js access
                    expect(light.threeLight).toBeDefined();
                    expect(light.threeLight.isLight).toBe(true);

                    // Direct manipulation
                    light.threeLight.position.set(position.x, position.y, position.z);
                    light.threeLight.intensity = intensity;
                    light.threeLight.color.setHex(color);

                    // Sync from Three.js
                    const syncResult = light.syncFromThree();

                    // Verify sync result
                    expect(syncResult).toBeDefined();
                    expect(syncResult.intensity).toBeCloseTo(intensity, 5);
                    expect(syncResult.color).toBe(color);
                    expect(syncResult.position).toBeDefined();
                    expect(syncResult.position[0]).toBeCloseTo(position.x, 5);
                    expect(syncResult.position[1]).toBeCloseTo(position.y, 5);
                    expect(syncResult.position[2]).toBeCloseTo(position.z, 5);

                    // Verify framework state matches
                    expect(light.position.x).toBeCloseTo(position.x, 5);
                    expect(light.position.y).toBeCloseTo(position.y, 5);
                    expect(light.position.z).toBeCloseTo(position.z, 5);
                    expect(light.threeLight.intensity).toBeCloseTo(intensity, 5);
                    expect(light.threeLight.color.getHex()).toBe(color);

                    // Clean up
                    light.dispose();
                },
            ),
            { numRuns: 100 },
        );
    });

    test('ThreeJsIntegration wrapping and tracking', () => {
        fc.assert(
            fc.property(fc.constant(null), (wrapper) => {
                // Create raw Three.js object
                const threeMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial(),
                );

                // Verify not tracked initially
                expect(ThreeJsIntegration.isTracked(threeMesh)).toBe(false);
                expect(ThreeJsIntegration.getWrapper(threeMesh)).toBeNull();

                // Wrap it
                ThreeJsIntegration.wrapThreeObject(threeMesh, wrapper);

                // Verify now tracked
                expect(ThreeJsIntegration.isTracked(threeMesh)).toBe(true);
                expect(threeMesh.userData._kalythesainzTracked).toBe(true);
                expect(threeMesh.userData._kalythesainzTimestamp).toBeDefined();

                // Clean up
                threeMesh.geometry.dispose();
                threeMesh.material.dispose();
            }),
            { numRuns: 50 },
        );
    });

    test('Auto-sync enables continuous synchronization', () => {
        fc.assert(
            fc.property(positionGenerator, (position) => {
                // Create framework object
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                const object = new Object3D(geometry, material);

                // Enable auto-sync
                object.setAutoSync(true);

                // Verify auto-sync metadata is set
                expect(object.threeMesh.userData._kalythesainzAutoSync).toBe(true);
                expect(object.threeMesh.userData._kalythesainzWrapper).toBe(object);

                // Disable auto-sync
                object.setAutoSync(false);

                // Verify auto-sync metadata is removed
                expect(object.threeMesh.userData._kalythesainzAutoSync).toBeUndefined();
                expect(object.threeMesh.userData._kalythesainzWrapper).toBeUndefined();

                // Clean up
                object.dispose();
            }),
            { numRuns: 50 },
        );
    });

    test('Batch sync handles multiple objects', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 10 }), (numObjects) => {
                // Create multiple objects
                const objects = [];
                for (let i = 0; i < numObjects; i++) {
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    const object = new Object3D(geometry, material);

                    // Modify through Three.js
                    object.threeMesh.position.set(i, i * 2, i * 3);

                    objects.push(object);
                }

                // Batch sync
                const report = ThreeJsIntegration.batchSync(objects);

                // Verify report
                expect(report.total).toBe(numObjects);
                expect(report.synced).toBe(numObjects);
                expect(report.failed).toBe(0);
                expect(report.errors).toHaveLength(0);

                // Verify all objects are synced
                objects.forEach((object, i) => {
                    expect(object.position.x).toBeCloseTo(i, 5);
                    expect(object.position.y).toBeCloseTo(i * 2, 5);
                    expect(object.position.z).toBeCloseTo(i * 3, 5);
                });

                // Clean up
                objects.forEach((object) => object.dispose());
            }),
            { numRuns: 50 },
        );
    });

    test('Integration guide provides useful information', () => {
        const guide = ThreeJsIntegration.getIntegrationGuide();

        // Verify guide structure
        expect(guide).toBeDefined();
        expect(guide.bestPractices).toBeDefined();
        expect(Array.isArray(guide.bestPractices)).toBe(true);
        expect(guide.bestPractices.length).toBeGreaterThan(0);

        expect(guide.usagePatterns).toBeDefined();
        expect(guide.usagePatterns.directAccess).toBeDefined();
        expect(guide.usagePatterns.mixedUsage).toBeDefined();
        expect(guide.usagePatterns.conflictResolution).toBeDefined();

        expect(guide.commonPitfalls).toBeDefined();
        expect(Array.isArray(guide.commonPitfalls)).toBe(true);
        expect(guide.commonPitfalls.length).toBeGreaterThan(0);
    });
});
