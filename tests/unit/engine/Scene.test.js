/**
 * Unit tests for Scene class
 */

import { Scene } from '../../../engine/Scene.js';
import { Config } from '../../../core/Config.js';
import { EventBus } from '../../../core/EventBus.js';

// Mock Three.js
global.THREE = {
    Scene: class {
        constructor() {
            this.children = [];
            this.background = null;
            this.isScene = true;
        }
        add(object) {
            if (!this.children.includes(object)) {
                this.children.push(object);
                object.parent = this;
            }
        }
        remove(object) {
            const index = this.children.indexOf(object);
            if (index !== -1) {
                this.children.splice(index, 1);
                object.parent = null;
            }
        }
    },
    Color: class {
        constructor(color) {
            this.color = color;
        }
    },
    Vector2: class {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    },
};

// Mock Renderer
jest.mock('../../../engine/Renderer.js', () => ({
    Renderer: class {
        constructor(config) {
            this.config = config;
            this.size = { width: 800, height: 600 };
            this.isDisposed = false;
        }
        render(scene, camera) {
            this.lastRender = { scene, camera };
        }
        dispose() {
            this.isDisposed = true;
        }
    },
}));

// Mock Camera
jest.mock('../../../engine/Camera.js', () => ({
    Camera: class {
        constructor(type, config) {
            this.type = type;
            this.config = config;
            this.threeCamera = { isCamera: true };
            this.position = { x: 0, y: 0, z: 0 };
            this.isDisposed = false;
        }
        setPosition(x, y, z) {
            this.position = { x, y, z };
        }
        lookAt(x, y, z) {
            this.lookAtTarget = { x, y, z };
        }
        setAspect(aspect) {
            this.aspect = aspect;
        }
        dispose() {
            this.isDisposed = true;
        }
    },
}));

// Mock Light
jest.mock('../../../engine/Light.js', () => ({
    Light: class {
        constructor(threeLight, type) {
            this.threeLight = threeLight;
            this.type = type;
            this.isDisposed = false;
        }
        static basicSetup(config) {
            return [
                new this({ intensity: 1, isDirectionalLight: true }, 'directional'),
                new this({ intensity: 0.4, isAmbientLight: true }, 'ambient'),
            ];
        }
        dispose() {
            this.isDisposed = true;
        }
    },
}));

// Mock DOM
global.document = {
    getElementById: (id) => {
        if (id === 'test-container') {
            return {
                clientWidth: 800,
                clientHeight: 600,
                appendChild: jest.fn(),
                removeChild: jest.fn(),
                contains: jest.fn(() => true),
                getBoundingClientRect: () => ({ width: 800, height: 600 }),
            };
        }
        return null;
    },
};

global.requestAnimationFrame = jest.fn((cb) => {
    setTimeout(cb, 16);
    return 1;
});

global.cancelAnimationFrame = jest.fn();

describe('Scene', () => {
    beforeEach(() => {
        // Reset Scene singleton state
        Scene.destroy();
        Config.reset();
        EventBus.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        Scene.destroy();
        EventBus.clear();
    });

    describe('init', () => {
        test('should initialize scene with container ID', () => {
            const scene = Scene.init('test-container');

            expect(scene).toBeDefined();
            expect(Scene.isInitialized()).toBe(true);
            expect(Scene.getInstance()).toBe(scene);
            expect(scene.threeScene).toBeDefined();
            expect(scene.renderer).toBeDefined();
            expect(scene.camera).toBeDefined();
        });

        test('should initialize scene with configuration object', () => {
            const config = {
                containerId: 'test-container',
                autoStart: false,
                lights: false,
            };

            const scene = Scene.init(config);

            expect(scene).toBeDefined();
            expect(scene.lights).toHaveLength(0);
            expect(scene.isRendering).toBe(false);
        });

        test('should throw error if already initialized', () => {
            Scene.init('test-container');

            expect(() => Scene.init('test-container')).toThrow(
                'Scene is already initialized. Call Scene.destroy() first to reinitialize.',
            );
        });

        test('should throw error with invalid parameters', () => {
            expect(() => Scene.init(123)).toThrow(
                'First parameter must be a container ID string or configuration object',
            );
        });
    });

    describe('getInstance', () => {
        test('should return null if not initialized', () => {
            expect(Scene.getInstance()).toBe(null);
        });

        test('should return scene instance if initialized', () => {
            const scene = Scene.init('test-container');
            expect(Scene.getInstance()).toBe(scene);
        });
    });

    describe('add', () => {
        test('should add framework object to scene', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true, uuid: 'test-uuid' },
            };

            const objectId = scene.add(mockObject);

            expect(objectId).toBe('test-obj');
            expect(scene.objects.has('test-obj')).toBe(true);
            expect(scene.threeScene.children).toContain(mockObject.threeObject);
        });

        test('should add Three.js object directly to scene', () => {
            const scene = Scene.init('test-container');
            const mockThreeObject = {
                isObject3D: true,
                uuid: 'three-uuid',
            };

            const objectId = scene.add(mockThreeObject);

            expect(objectId).toBe('three-uuid');
            expect(scene.objects.has('three-uuid')).toBe(true);
            expect(scene.threeScene.children).toContain(mockThreeObject);
        });

        test('should generate ID if not provided', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                threeObject: { isObject3D: true },
            };

            const objectId = scene.add(mockObject);

            expect(objectId).toBeDefined();
            expect(typeof objectId).toBe('string');
            expect(scene.objects.has(objectId)).toBe(true);
        });

        test('should throw error with duplicate ID', () => {
            const scene = Scene.init('test-container');
            const mockObject1 = {
                id: 'duplicate',
                threeObject: { isObject3D: true },
            };
            const mockObject2 = {
                id: 'duplicate',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject1);

            expect(() => scene.add(mockObject2)).toThrow(
                "Object with ID 'duplicate' already exists in scene",
            );
        });

        test('should throw error with invalid object', () => {
            const scene = Scene.init('test-container');

            expect(() => scene.add(null)).toThrow('Object is required');
            expect(() => scene.add({})).toThrow(
                'Object must have threeObject/threeMesh property or be a Three.js object',
            );
        });

        test('should throw error if scene is disposed', () => {
            const scene = Scene.init('test-container');
            scene.dispose();

            const mockObject = {
                threeObject: { isObject3D: true },
            };

            expect(() => scene.add(mockObject)).toThrow('Cannot add object to disposed scene');
        });
    });

    describe('remove', () => {
        test('should remove object by ID', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject);
            const removed = scene.remove('test-obj');

            expect(removed).toBe(true);
            expect(scene.objects.has('test-obj')).toBe(false);
            expect(scene.threeScene.children).not.toContain(mockObject.threeObject);
        });

        test('should remove object by reference', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject);
            const removed = scene.remove(mockObject);

            expect(removed).toBe(true);
            expect(scene.objects.has('test-obj')).toBe(false);
        });

        test('should return false if object not found', () => {
            const scene = Scene.init('test-container');

            const removed = scene.remove('non-existent');

            expect(removed).toBe(false);
        });

        test('should dispose object if it has dispose method', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true },
                dispose: jest.fn(),
            };

            scene.add(mockObject);
            scene.remove('test-obj');

            expect(mockObject.dispose).toHaveBeenCalled();
        });
    });

    describe('find', () => {
        test('should find object by ID', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject);
            const found = scene.find('test-obj');

            expect(found).toBe(mockObject);
        });

        test('should return null if object not found', () => {
            const scene = Scene.init('test-container');

            const found = scene.find('non-existent');

            expect(found).toBe(null);
        });
    });

    describe('findAll', () => {
        test('should find objects by predicate', () => {
            const scene = Scene.init('test-container');
            const mockObject1 = {
                id: 'obj1',
                type: 'Box',
                threeObject: { isObject3D: true },
            };
            const mockObject2 = {
                id: 'obj2',
                type: 'Sphere',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject1);
            scene.add(mockObject2);

            const boxes = scene.findAll((obj) => obj.type === 'Box');

            expect(boxes).toHaveLength(1);
            expect(boxes[0]).toBe(mockObject1);
        });
    });

    describe('clear', () => {
        test('should clear all objects from scene', () => {
            const scene = Scene.init('test-container');
            const mockObject1 = {
                id: 'obj1',
                threeObject: { isObject3D: true },
            };
            const mockObject2 = {
                id: 'obj2',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject1);
            scene.add(mockObject2);

            scene.clear();

            expect(scene.objects.size).toBe(0);
            expect(scene.threeScene.children.filter((child) => child.isObject3D)).toHaveLength(0);
        });

        test('should optionally dispose lights', () => {
            const scene = Scene.init('test-container');
            const initialLightCount = scene.lights.length;

            scene.clear(true);

            expect(scene.lights).toHaveLength(0);
        });
    });

    describe('addLight and removeLight', () => {
        test('should add light to scene', () => {
            const scene = Scene.init('test-container');
            const mockLight = {
                threeLight: { isDirectionalLight: true },
                type: 'directional',
                dispose: jest.fn(),
            };

            const addedLight = scene.addLight(mockLight);

            expect(addedLight).toBe(mockLight);
            expect(scene.lights).toContain(mockLight);
            expect(scene.threeScene.children).toContain(mockLight.threeLight);
        });

        test('should add light target if it exists', () => {
            const scene = Scene.init('test-container');
            const mockLight = {
                threeLight: {
                    isDirectionalLight: true,
                    target: { isObject3D: true },
                },
                type: 'directional',
                dispose: jest.fn(),
            };

            scene.addLight(mockLight);

            expect(scene.threeScene.children).toContain(mockLight.threeLight.target);
        });

        test('should remove light from scene', () => {
            const scene = Scene.init('test-container');
            const mockLight = {
                threeLight: { isDirectionalLight: true },
                type: 'directional',
                dispose: jest.fn(),
            };

            scene.addLight(mockLight);
            const removed = scene.removeLight(mockLight);

            expect(removed).toBe(true);
            expect(scene.lights).not.toContain(mockLight);
            expect(mockLight.dispose).toHaveBeenCalled();
        });

        test('should return false if light not found', () => {
            const scene = Scene.init('test-container');
            const mockLight = {
                threeLight: { isDirectionalLight: true },
                type: 'directional',
                dispose: jest.fn(),
            };

            const removed = scene.removeLight(mockLight);

            expect(removed).toBe(false);
        });
    });

    describe('render loop', () => {
        test('should start render loop', () => {
            const scene = Scene.init({ containerId: 'test-container', autoStart: false });

            scene.startRenderLoop();

            expect(scene.isRendering).toBe(true);
            expect(global.requestAnimationFrame).toHaveBeenCalled();
        });

        test('should stop render loop', () => {
            const scene = Scene.init('test-container');

            scene.stopRenderLoop();

            expect(scene.isRendering).toBe(false);
            expect(global.cancelAnimationFrame).toHaveBeenCalled();
        });

        test('should not start if already rendering', () => {
            const scene = Scene.init('test-container');
            const initialCallCount = global.requestAnimationFrame.mock.calls.length;

            scene.startRenderLoop(); // Should not start again

            expect(global.requestAnimationFrame.mock.calls.length).toBe(initialCallCount);
        });
    });

    describe('render', () => {
        test('should render single frame', () => {
            const scene = Scene.init('test-container');

            scene.render();

            expect(scene.renderer.lastRender.scene).toBe(scene.threeScene);
            expect(scene.renderer.lastRender.camera).toBe(scene.camera.threeCamera);
        });

        test('should throw error if renderer or camera missing', () => {
            const scene = Scene.init('test-container');
            scene.renderer.dispose();

            expect(() => scene.render()).toThrow('Renderer and camera are required for rendering');
        });

        test('should throw error if scene is disposed', () => {
            const scene = Scene.init('test-container');
            scene.dispose();

            expect(() => scene.render()).toThrow('Cannot render disposed scene');
        });
    });

    describe('serialize', () => {
        test('should serialize scene to JSON', () => {
            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true },
                constructor: { name: 'Box' },
            };

            scene.add(mockObject);
            const serialized = scene.serialize();

            expect(serialized).toHaveProperty('version');
            expect(serialized).toHaveProperty('metadata');
            expect(serialized).toHaveProperty('camera');
            expect(serialized).toHaveProperty('lights');
            expect(serialized).toHaveProperty('objects');
            expect(serialized.metadata.objectCount).toBe(1);
            expect(serialized.objects[0].id).toBe('test-obj');
        });

        test('should throw error if scene is disposed', () => {
            const scene = Scene.init('test-container');
            scene.dispose();

            expect(() => scene.serialize()).toThrow('Cannot serialize disposed scene');
        });
    });

    describe('deserialize', () => {
        test('should deserialize scene from JSON', () => {
            const scene = Scene.init('test-container');
            const data = {
                version: '1.0.0',
                metadata: { objectCount: 0 },
                camera: null,
                lights: [],
                objects: [],
            };

            expect(() => scene.deserialize(data)).not.toThrow();
        });

        test('should throw error with invalid data', () => {
            const scene = Scene.init('test-container');

            expect(() => scene.deserialize(null)).toThrow('Invalid scene data');
            expect(() => scene.deserialize('invalid')).toThrow('Invalid scene data');
        });
    });

    describe('dispose', () => {
        test('should dispose scene and clean up resources', () => {
            const scene = Scene.init('test-container');

            scene.dispose();

            expect(scene.isDisposed).toBe(true);
            expect(scene.renderer.isDisposed).toBe(true);
            expect(scene.camera.isDisposed).toBe(true);
        });

        test('should not throw error if disposed multiple times', () => {
            const scene = Scene.init('test-container');

            scene.dispose();
            expect(() => scene.dispose()).not.toThrow();
        });
    });

    describe('destroy', () => {
        test('should destroy singleton instance', () => {
            Scene.init('test-container');
            expect(Scene.isInitialized()).toBe(true);

            Scene.destroy();

            expect(Scene.isInitialized()).toBe(false);
            expect(Scene.getInstance()).toBe(null);
        });

        test('should not throw error if not initialized', () => {
            expect(() => Scene.destroy()).not.toThrow();
        });
    });

    describe('events', () => {
        test('should emit scene created event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('scene:created', eventSpy);

            const scene = Scene.init('test-container');

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        scene: scene,
                    }),
                }),
            );
        });

        test('should emit object added event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('scene:object-added', eventSpy);

            const scene = Scene.init('test-container');
            const mockObject = {
                id: 'test-obj',
                threeObject: { isObject3D: true },
            };

            scene.add(mockObject);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        scene: scene,
                        objectId: 'test-obj',
                        object: mockObject,
                    }),
                }),
            );
        });

        test('should emit render loop started event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('scene:render-loop-started', eventSpy);

            const scene = Scene.init({ containerId: 'test-container', autoStart: false });
            scene.startRenderLoop();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        scene: scene,
                    }),
                }),
            );
        });
    });
});
