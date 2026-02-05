/**
 * Unit tests for Camera class
 */

import { Camera } from '../../../engine/Camera.js';
import { Config } from '../../../core/Config.js';
import { EventBus } from '../../../core/EventBus.js';

// Mock Three.js
global.THREE = {
    PerspectiveCamera: class {
        constructor(fov, aspect, near, far) {
            this.fov = fov;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.position = { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() };
            this.isCamera = true;
            this.isPerspectiveCamera = true;
        }
        lookAt(x, y, z) {
            this.lookAtTarget = { x, y, z };
        }
        updateProjectionMatrix() {
            this.projectionMatrixUpdated = true;
        }
    },
    OrthographicCamera: class {
        constructor(left, right, top, bottom, near, far) {
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
            this.near = near;
            this.far = far;
            this.position = { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() };
            this.isCamera = true;
            this.isOrthographicCamera = true;
        }
        lookAt(x, y, z) {
            this.lookAtTarget = { x, y, z };
        }
        updateProjectionMatrix() {
            this.projectionMatrixUpdated = true;
        }
    },
    Vector3: class {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        clone() {
            return new THREE.Vector3(this.x, this.y, this.z);
        }
    },
};

describe('Camera', () => {
    beforeEach(() => {
        // Reset Config and EventBus
        Config.reset();
        EventBus.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        EventBus.clear();
    });

    describe('constructor', () => {
        test('should create perspective camera with default configuration', () => {
            const camera = new Camera('perspective');

            expect(camera).toBeDefined();
            expect(camera.threeCamera).toBeDefined();
            expect(camera.type).toBe('perspective');
            expect(camera.isDisposed).toBe(false);
            expect(camera.threeCamera.isPerspectiveCamera).toBe(true);

            camera.dispose();
        });

        test('should create orthographic camera with custom configuration', () => {
            const config = {
                left: -5,
                right: 5,
                top: 5,
                bottom: -5,
                near: 0.1,
                far: 100,
            };

            const camera = new Camera('orthographic', config);

            expect(camera.type).toBe('orthographic');
            expect(camera.threeCamera.isOrthographicCamera).toBe(true);
            expect(camera.threeCamera.left).toBe(-5);
            expect(camera.threeCamera.right).toBe(5);

            camera.dispose();
        });

        test('should throw error with invalid camera type', () => {
            expect(() => {
                new Camera('invalid');
            }).toThrow('Camera type must be "perspective" or "orthographic"');
        });

        test('should throw error with invalid configuration', () => {
            expect(() => {
                new Camera('perspective', 'invalid');
            }).toThrow('Configuration must be an object');

            expect(() => {
                new Camera('perspective', { fov: 200 });
            }).toThrow('FOV must be a number between 0 and 180');
        });
    });

    describe('setPosition', () => {
        test('should set camera position with numbers', () => {
            const camera = new Camera('perspective');

            camera.setPosition(1, 2, 3);

            expect(camera.threeCamera.position.set).toHaveBeenCalledWith(1, 2, 3);

            camera.dispose();
        });

        test('should set camera position with Vector3', () => {
            const camera = new Camera('perspective');
            const position = new THREE.Vector3(4, 5, 6);

            camera.setPosition(position);

            expect(camera.threeCamera.position.copy).toHaveBeenCalledWith(position);

            camera.dispose();
        });

        test('should set camera position with array', () => {
            const camera = new Camera('perspective');

            camera.setPosition([7, 8, 9]);

            expect(camera.threeCamera.position.set).toHaveBeenCalledWith(7, 8, 9);

            camera.dispose();
        });

        test('should throw error with invalid parameters', () => {
            const camera = new Camera('perspective');

            expect(() => camera.setPosition('invalid')).toThrow(
                'Invalid position parameters. Use (x, y, z), Vector3, or [x, y, z] array',
            );

            camera.dispose();
        });

        test('should throw error if camera is disposed', () => {
            const camera = new Camera('perspective');
            camera.dispose();

            expect(() => camera.setPosition(1, 2, 3)).toThrow(
                'Cannot set position on disposed camera',
            );
        });
    });

    describe('lookAt', () => {
        test('should make camera look at target with numbers', () => {
            const camera = new Camera('perspective');

            camera.lookAt(1, 2, 3);

            expect(camera.threeCamera.lookAt).toHaveBeenCalledWith(1, 2, 3);

            camera.dispose();
        });

        test('should make camera look at target with Vector3', () => {
            const camera = new Camera('perspective');
            const target = new THREE.Vector3(4, 5, 6);

            camera.lookAt(target);

            expect(camera.threeCamera.lookAt).toHaveBeenCalledWith(target);

            camera.dispose();
        });

        test('should make camera look at target with array', () => {
            const camera = new Camera('perspective');

            camera.lookAt([7, 8, 9]);

            expect(camera.threeCamera.lookAt).toHaveBeenCalledWith(7, 8, 9);

            camera.dispose();
        });

        test('should throw error if camera is disposed', () => {
            const camera = new Camera('perspective');
            camera.dispose();

            expect(() => camera.lookAt(1, 2, 3)).toThrow(
                'Cannot look at target on disposed camera',
            );
        });
    });

    describe('setFov', () => {
        test('should set field of view for perspective camera', () => {
            const camera = new Camera('perspective');

            camera.setFov(90);

            expect(camera.threeCamera.fov).toBe(90);
            expect(camera.threeCamera.updateProjectionMatrix).toHaveBeenCalled();

            camera.dispose();
        });

        test('should throw error for orthographic camera', () => {
            const camera = new Camera('orthographic');

            expect(() => camera.setFov(90)).toThrow('FOV can only be set on perspective cameras');

            camera.dispose();
        });

        test('should throw error with invalid FOV', () => {
            const camera = new Camera('perspective');

            expect(() => camera.setFov(0)).toThrow('FOV must be a number between 0 and 180');
            expect(() => camera.setFov(180)).toThrow('FOV must be a number between 0 and 180');

            camera.dispose();
        });
    });

    describe('setAspect', () => {
        test('should set aspect ratio for perspective camera', () => {
            const camera = new Camera('perspective');

            camera.setAspect(1.5);

            expect(camera.threeCamera.aspect).toBe(1.5);
            expect(camera.threeCamera.updateProjectionMatrix).toHaveBeenCalled();

            camera.dispose();
        });

        test('should adjust frustum for orthographic camera', () => {
            const camera = new Camera('orthographic', {
                left: -5,
                right: 5,
                top: 5,
                bottom: -5,
            });

            camera.setAspect(2);

            expect(camera.threeCamera.left).toBe(-10);
            expect(camera.threeCamera.right).toBe(10);
            expect(camera.threeCamera.updateProjectionMatrix).toHaveBeenCalled();

            camera.dispose();
        });

        test('should throw error with invalid aspect ratio', () => {
            const camera = new Camera('perspective');

            expect(() => camera.setAspect(0)).toThrow('Aspect ratio must be a positive number');
            expect(() => camera.setAspect(-1)).toThrow('Aspect ratio must be a positive number');

            camera.dispose();
        });
    });

    describe('setClippingPlanes', () => {
        test('should set near and far clipping planes', () => {
            const camera = new Camera('perspective');

            camera.setClippingPlanes(0.5, 500);

            expect(camera.threeCamera.near).toBe(0.5);
            expect(camera.threeCamera.far).toBe(500);
            expect(camera.threeCamera.updateProjectionMatrix).toHaveBeenCalled();

            camera.dispose();
        });

        test('should throw error with invalid clipping planes', () => {
            const camera = new Camera('perspective');

            expect(() => camera.setClippingPlanes(0, 100)).toThrow(
                'Near clipping plane must be a positive number',
            );
            expect(() => camera.setClippingPlanes(100, 50)).toThrow(
                'Far clipping plane must be greater than near plane',
            );

            camera.dispose();
        });
    });

    describe('static presets', () => {
        test('should create top view camera', () => {
            const camera = Camera.topView({ height: 15 });

            expect(camera.type).toBe('perspective');
            expect(camera.threeCamera.position.set).toHaveBeenCalledWith(0, 15, 0);
            expect(camera.threeCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);

            camera.dispose();
        });

        test('should create front view camera', () => {
            const camera = Camera.frontView({ distance: 20 });

            expect(camera.type).toBe('perspective');
            expect(camera.threeCamera.position.set).toHaveBeenCalledWith(0, 0, 20);
            expect(camera.threeCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);

            camera.dispose();
        });

        test('should create isometric view camera', () => {
            const camera = Camera.isometric({ distance: 10 });

            expect(camera.type).toBe('perspective');
            expect(camera.threeCamera.position.set).toHaveBeenCalled();
            expect(camera.threeCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);

            camera.dispose();
        });

        test('should create orthographic camera', () => {
            const camera = Camera.orthographic({ size: 20 });

            expect(camera.type).toBe('orthographic');
            expect(camera.threeCamera.isOrthographicCamera).toBe(true);

            camera.dispose();
        });
    });

    describe('dispose', () => {
        test('should dispose camera and clean up resources', () => {
            const camera = new Camera('perspective');

            camera.dispose();

            expect(camera.isDisposed).toBe(true);
            expect(camera.threeCamera).toBe(null);
        });

        test('should not throw error if disposed multiple times', () => {
            const camera = new Camera('perspective');

            camera.dispose();
            expect(() => camera.dispose()).not.toThrow();
        });
    });

    describe('events', () => {
        test('should emit camera created event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('camera:created', eventSpy);

            const camera = new Camera('perspective');

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        camera: camera,
                        type: 'perspective',
                    }),
                }),
            );

            camera.dispose();
        });

        test('should emit position change event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('camera:position-changed', eventSpy);

            const camera = new Camera('perspective');
            camera.setPosition(1, 2, 3);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        camera: camera,
                    }),
                }),
            );

            camera.dispose();
        });

        test('should emit FOV change event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('camera:fov-changed', eventSpy);

            const camera = new Camera('perspective');
            camera.setFov(90);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        camera: camera,
                        fov: 90,
                    }),
                }),
            );

            camera.dispose();
        });
    });
});
