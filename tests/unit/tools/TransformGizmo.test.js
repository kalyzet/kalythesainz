/**
 * Unit tests for TransformGizmo class
 * Tests interactive transform handles, mode switching, and manipulation
 * Requirements: 4.4
 */

import { TransformGizmo } from '../../../tools/TransformGizmo.js';
import { Scene } from '../../../engine/Scene.js';
import { Camera } from '../../../engine/Camera.js';
import { Renderer } from '../../../engine/Renderer.js';
import { Box } from '../../../objects/Box.js';
import { EventBus } from '../../../core/EventBus.js';

describe('TransformGizmo', () => {
    let scene;
    let camera;
    let renderer;
    let container;

    beforeEach(() => {
        // Clear EventBus
        EventBus.clear();

        // Create container element
        container = document.createElement('div');
        container.id = 'scene-container';
        document.body.appendChild(container);

        // Initialize scene
        scene = Scene.init('scene-container');
        camera = scene.camera;
        renderer = scene.renderer;
    });

    afterEach(() => {
        // Clean up
        if (scene) {
            Scene.destroy();
        }
        EventBus.clear();

        // Remove container
        const containers = document.querySelectorAll('#scene-container');
        containers.forEach((c) => c.remove());
    });

    describe('Initialization', () => {
        test('should create TransformGizmo with valid camera and renderer', () => {
            const gizmo = new TransformGizmo(camera, renderer);

            expect(gizmo).toBeDefined();
            expect(gizmo.mode).toBe('translate');
            expect(gizmo.isActive).toBe(false);
            expect(gizmo.isDisposed).toBe(false);
            expect(gizmo.gizmoGroup).toBeDefined();
        });

        test('should throw error for invalid camera', () => {
            expect(() => new TransformGizmo(null, renderer)).toThrow(
                'Valid camera instance is required',
            );
            expect(() => new TransformGizmo({}, renderer)).toThrow(
                'Valid camera instance is required',
            );
        });

        test('should throw error for invalid renderer', () => {
            expect(() => new TransformGizmo(camera, null)).toThrow(
                'Valid renderer instance is required',
            );
            expect(() => new TransformGizmo(camera, {})).toThrow(
                'Valid renderer instance is required',
            );
        });

        test('should initialize with gizmo hidden', () => {
            const gizmo = new TransformGizmo(camera, renderer);

            expect(gizmo.gizmoGroup.visible).toBe(false);
        });
    });

    describe('Attach and Detach', () => {
        let gizmo;

        beforeEach(() => {
            gizmo = new TransformGizmo(camera, renderer);
        });

        test('should attach to valid object', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);

            expect(gizmo.attachedObject).toBe(box);
            expect(gizmo.isActive).toBe(true);
            expect(gizmo.gizmoGroup.visible).toBe(true);
        });

        test('should throw error when attaching to invalid object', () => {
            expect(() => gizmo.attach(null)).toThrow('Object must have threeMesh property');
            expect(() => gizmo.attach({})).toThrow('Object must have threeMesh property');
        });

        test('should detach from object', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);
            expect(gizmo.attachedObject).toBe(box);

            gizmo.detach();

            expect(gizmo.attachedObject).toBeNull();
            expect(gizmo.isActive).toBe(false);
            expect(gizmo.gizmoGroup.visible).toBe(false);
        });

        test('should emit attached event', (done) => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            EventBus.subscribe('transformGizmo:attached', (event) => {
                expect(event.data.object).toBe(box);
                expect(event.data.mode).toBe('translate');
                done();
            });

            gizmo.attach(box);
        });

        test('should emit detached event', (done) => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);

            EventBus.subscribe('transformGizmo:detached', (event) => {
                expect(event.data.object).toBe(box);
                done();
            });

            gizmo.detach();
        });

        test('should throw error when attaching to disposed gizmo', () => {
            gizmo.dispose();
            const box = Box.create(1, 1, 1);

            expect(() => gizmo.attach(box)).toThrow('Cannot attach to disposed TransformGizmo');
        });

        test('should throw error when detaching disposed gizmo', () => {
            gizmo.dispose();

            expect(() => gizmo.detach()).toThrow('Cannot detach disposed TransformGizmo');
        });
    });

    describe('Mode Switching', () => {
        let gizmo;

        beforeEach(() => {
            gizmo = new TransformGizmo(camera, renderer);
        });

        test('should set translate mode', () => {
            gizmo.setMode('translate');

            expect(gizmo.mode).toBe('translate');
        });

        test('should set rotate mode', () => {
            gizmo.setMode('rotate');

            expect(gizmo.mode).toBe('rotate');
        });

        test('should set scale mode', () => {
            gizmo.setMode('scale');

            expect(gizmo.mode).toBe('scale');
        });

        test('should throw error for invalid mode', () => {
            expect(() => gizmo.setMode('invalid')).toThrow(
                'Invalid mode. Must be one of: translate, rotate, scale',
            );
        });

        test('should emit modeChanged event', (done) => {
            EventBus.subscribe('transformGizmo:modeChanged', (event) => {
                expect(event.data.mode).toBe('rotate');
                done();
            });

            gizmo.setMode('rotate');
        });

        test('should rebuild gizmo when mode changes', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);

            const initialChildren = gizmo.gizmoGroup.children.length;

            gizmo.setMode('rotate');

            // Gizmo should be rebuilt
            expect(gizmo.gizmoGroup.children.length).toBeGreaterThan(0);
        });

        test('should throw error when setting mode on disposed gizmo', () => {
            gizmo.dispose();

            expect(() => gizmo.setMode('rotate')).toThrow(
                'Cannot set mode on disposed TransformGizmo',
            );
        });
    });

    describe('Callbacks', () => {
        let gizmo;

        beforeEach(() => {
            gizmo = new TransformGizmo(camera, renderer);
        });

        test('should register onTransformStart callback', () => {
            const callback = jest.fn();

            expect(() => gizmo.onTransformStart(callback)).not.toThrow();
        });

        test('should register onTransformChange callback', () => {
            const callback = jest.fn();

            expect(() => gizmo.onTransformChange(callback)).not.toThrow();
        });

        test('should register onTransformEnd callback', () => {
            const callback = jest.fn();

            expect(() => gizmo.onTransformEnd(callback)).not.toThrow();
        });

        test('should throw error for invalid onTransformStart callback', () => {
            expect(() => gizmo.onTransformStart('not-function')).toThrow(
                'Callback must be a function',
            );
        });

        test('should throw error for invalid onTransformChange callback', () => {
            expect(() => gizmo.onTransformChange('not-function')).toThrow(
                'Callback must be a function',
            );
        });

        test('should throw error for invalid onTransformEnd callback', () => {
            expect(() => gizmo.onTransformEnd('not-function')).toThrow(
                'Callback must be a function',
            );
        });
    });

    describe('Update', () => {
        let gizmo;

        beforeEach(() => {
            gizmo = new TransformGizmo(camera, renderer);
        });

        test('should update gizmo position when attached', () => {
            const box = Box.create(1, 1, 1);
            box.position = [5, 10, 15];
            scene.add(box);

            gizmo.attach(box);
            gizmo.update();

            expect(gizmo.gizmoGroup.position.x).toBeCloseTo(5, 1);
            expect(gizmo.gizmoGroup.position.y).toBeCloseTo(10, 1);
            expect(gizmo.gizmoGroup.position.z).toBeCloseTo(15, 1);
        });

        test('should not throw when updating without attached object', () => {
            expect(() => gizmo.update()).not.toThrow();
        });

        test('should not throw when updating disposed gizmo', () => {
            gizmo.dispose();

            expect(() => gizmo.update()).not.toThrow();
        });
    });

    describe('Event Listeners', () => {
        let gizmo;

        beforeEach(() => {
            gizmo = new TransformGizmo(camera, renderer);
        });

        test('should attach when object selected in scene tree', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            EventBus.publish('sceneTree:objectSelected', {
                object: box,
            });

            expect(gizmo.attachedObject).toBe(box);
        });

        test('should detach when object removed from scene', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);
            expect(gizmo.attachedObject).toBe(box);

            EventBus.publish('scene:object-removed', {
                objectId: box.id,
            });

            expect(gizmo.attachedObject).toBeNull();
        });
    });

    describe('Disposal', () => {
        test('should dispose properly', () => {
            const gizmo = new TransformGizmo(camera, renderer);
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);
            gizmo.dispose();

            expect(gizmo.isDisposed).toBe(true);
            expect(gizmo.attachedObject).toBeNull();
        });

        test('should allow multiple dispose calls', () => {
            const gizmo = new TransformGizmo(camera, renderer);

            gizmo.dispose();
            expect(() => gizmo.dispose()).not.toThrow();
        });

        test('should detach before disposing', () => {
            const gizmo = new TransformGizmo(camera, renderer);
            const box = Box.create(1, 1, 1);
            scene.add(box);

            gizmo.attach(box);
            expect(gizmo.attachedObject).toBe(box);

            gizmo.dispose();

            expect(gizmo.attachedObject).toBeNull();
        });
    });
});
