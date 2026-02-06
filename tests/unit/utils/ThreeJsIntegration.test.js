/**
 * Unit tests for ThreeJsIntegration utility
 * Tests direct access, synchronization, and conflict handling
 */

import { ThreeJsIntegration } from '../../../utils/ThreeJsIntegration.js';
import { Object3D } from '../../../engine/Object3D.js';
import { Camera } from '../../../engine/Camera.js';
import { Light } from '../../../engine/Light.js';
import { Renderer } from '../../../engine/Renderer.js';
import { EventBus } from '../../../core/EventBus.js';

const THREE = global.THREE;

describe('ThreeJsIntegration', () => {
    beforeEach(() => {
        EventBus.clear();
        // Create container for renderer tests
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        EventBus.clear();
        // Clean up container
        const container = document.getElementById('test-container');
        if (container) {
            document.body.removeChild(container);
        }
    });

    describe('Direct Three.js Access', () => {
        test('Object3D provides access to underlying Three.js mesh', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const object = new Object3D(geometry, material);

            expect(object.threeMesh).toBeDefined();
            expect(object.threeMesh.isMesh).toBe(true);
            expect(object.threeObject).toBe(object.threeMesh);

            object.dispose();
        });

        test('Camera provides access to underlying Three.js camera', () => {
            const camera = new Camera('perspective', { fov: 75 });

            expect(camera.threeCamera).toBeDefined();
            expect(camera.threeCamera.isCamera).toBe(true);

            camera.dispose();
        });

        test('Light provides access to underlying Three.js light', () => {
            const light = Light.sun();

            expect(light.threeLight).toBeDefined();
            expect(light.threeLight.isLight).toBe(true);

            light.dispose();
        });

        test('Renderer provides access to underlying Three.js renderer', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            expect(renderer.threeRenderer).toBeDefined();

            renderer.dispose();
        });
    });

    describe('Synchronization', () => {
        test('Object3D syncFromThree returns current state', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const object = new Object3D(geometry, material);

            const syncResult = object.syncFromThree();

            expect(syncResult).toBeDefined();
            expect(syncResult.position).toBeDefined();
            expect(syncResult.rotation).toBeDefined();
            expect(syncResult.scale).toBeDefined();
            expect(syncResult.visible).toBeDefined();

            object.dispose();
        });

        test('Camera syncFromThree returns current state', () => {
            const camera = new Camera('perspective', { fov: 75 });

            const syncResult = camera.syncFromThree();

            expect(syncResult).toBeDefined();
            expect(syncResult.position).toBeDefined();
            expect(syncResult.rotation).toBeDefined();
            expect(syncResult.type).toBe('perspective');

            camera.dispose();
        });

        test('Light syncFromThree returns current state', () => {
            const light = Light.point(5, 10, 5);

            const syncResult = light.syncFromThree();

            expect(syncResult).toBeDefined();
            expect(syncResult.type).toBe('point');
            expect(syncResult.intensity).toBeDefined();
            expect(syncResult.color).toBeDefined();

            light.dispose();
        });

        test('Renderer syncFromThree returns current state', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            const syncResult = renderer.syncFromThree();

            expect(syncResult).toBeDefined();
            expect(syncResult.size).toBeDefined();
            expect(syncResult.pixelRatio).toBeDefined();

            renderer.dispose();
        });
    });

    describe('Wrapping and Tracking', () => {
        test('wrapThreeObject adds tracking metadata', () => {
            const threeMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial(),
            );

            expect(ThreeJsIntegration.isTracked(threeMesh)).toBe(false);

            ThreeJsIntegration.wrapThreeObject(threeMesh);

            expect(ThreeJsIntegration.isTracked(threeMesh)).toBe(true);
            expect(threeMesh.userData._kalythesainzTracked).toBe(true);
            expect(threeMesh.userData._kalythesainzTimestamp).toBeDefined();
        });

        test('wrapThreeObject stores wrapper reference', () => {
            const threeMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial(),
            );
            const wrapper = { id: 'test-wrapper' };

            ThreeJsIntegration.wrapThreeObject(threeMesh, wrapper);

            expect(ThreeJsIntegration.getWrapper(threeMesh)).toBe(wrapper);
        });

        test('getWrapper returns null for untracked objects', () => {
            const threeMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial(),
            );

            expect(ThreeJsIntegration.getWrapper(threeMesh)).toBeNull();
        });
    });

    describe('Conflict Detection', () => {
        test('detectConflicts returns no conflicts for synced object', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const object = new Object3D(geometry, material);

            const conflicts = ThreeJsIntegration.detectConflicts(object);

            expect(conflicts.hasConflicts).toBe(false);
            expect(conflicts.conflicts).toHaveLength(0);

            object.dispose();
        });

        test('detectConflicts identifies visibility mismatch', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const object = new Object3D(geometry, material);

            // Create mismatch
            object.visible = true;
            object.threeMesh.visible = false;

            const conflicts = ThreeJsIntegration.detectConflicts(object);

            expect(conflicts.hasConflicts).toBe(true);
            expect(conflicts.conflicts.length).toBeGreaterThan(0);
            expect(conflicts.conflicts.some((c) => c.type === 'visibilityMismatch')).toBe(true);

            object.dispose();
        });

        test('resolveConflicts syncs from Three.js', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const object = new Object3D(geometry, material);

            // Create mismatch
            object.visible = true;
            object.threeMesh.visible = false;

            const resolution = ThreeJsIntegration.resolveConflicts(object);

            expect(resolution.resolved).toBe(true);
            expect(object.visible).toBe(object.threeMesh.visible);

            object.dispose();
        });
    });

    describe('Batch Operations', () => {
        test('batchSync syncs multiple objects', () => {
            const objects = [];
            for (let i = 0; i < 3; i++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                objects.push(new Object3D(geometry, material));
            }

            const report = ThreeJsIntegration.batchSync(objects);

            expect(report.total).toBe(3);
            expect(report.synced).toBe(3);
            expect(report.failed).toBe(0);

            objects.forEach((obj) => obj.dispose());
        });

        test('batchSync handles objects without syncFromThree', () => {
            const objects = [
                { id: 'test1' }, // No syncFromThree method
                { id: 'test2', syncFromThree: () => {} }, // Has syncFromThree
            ];

            const report = ThreeJsIntegration.batchSync(objects);

            expect(report.total).toBe(2);
            expect(report.synced).toBe(1);
        });
    });

    describe('Integration Guide', () => {
        test('getIntegrationGuide returns comprehensive guide', () => {
            const guide = ThreeJsIntegration.getIntegrationGuide();

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
        });

        test('guide includes code examples', () => {
            const guide = ThreeJsIntegration.getIntegrationGuide();

            expect(guide.usagePatterns.directAccess.example).toBeDefined();
            expect(guide.usagePatterns.mixedUsage.example).toBeDefined();
            expect(guide.usagePatterns.conflictResolution.example).toBeDefined();
        });
    });

    describe('Auto-sync', () => {
        test('Object3D setAutoSync enables tracking', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const object = new Object3D(geometry, material);

            object.setAutoSync(true);

            expect(object.threeMesh.userData._kalythesainzAutoSync).toBe(true);
            expect(object.threeMesh.userData._kalythesainzWrapper).toBe(object);

            object.setAutoSync(false);

            expect(object.threeMesh.userData._kalythesainzAutoSync).toBeUndefined();

            object.dispose();
        });
    });

    describe('Error Handling', () => {
        test('wrapThreeObject throws on invalid input', () => {
            expect(() => {
                ThreeJsIntegration.wrapThreeObject(null);
            }).toThrow('Three.js object is required');
        });

        test('resolveConflicts throws on object without syncFromThree', () => {
            expect(() => {
                ThreeJsIntegration.resolveConflicts({ id: 'test' });
            }).toThrow('Framework object must have syncFromThree method');
        });

        test('batchSync throws on non-array input', () => {
            expect(() => {
                ThreeJsIntegration.batchSync('not-an-array');
            }).toThrow('frameworkObjects must be an array');
        });
    });
});
