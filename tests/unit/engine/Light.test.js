/**
 * Unit tests for Light class
 */

import { Light } from '../../../engine/Light.js';
import { EventBus } from '../../../core/EventBus.js';

// Mock Three.js
global.THREE = {
    DirectionalLight: class {
        constructor(color, intensity) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
            };
            this.target = {
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                },
            };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 50, left: -10, right: 10, top: 10, bottom: -10 },
            };
            this.isDirectionalLight = true;
        }
    },
    AmbientLight: class {
        constructor(color, intensity) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.isAmbientLight = true;
        }
    },
    PointLight: class {
        constructor(color, intensity, distance, decay) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.distance = distance;
            this.decay = decay;
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
            };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 50 },
            };
            this.isPointLight = true;
        }
    },
    SpotLight: class {
        constructor(color, intensity, distance, angle, penumbra, decay) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.distance = distance;
            this.angle = angle;
            this.penumbra = penumbra;
            this.decay = decay;
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
            };
            this.target = {
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                },
            };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 50, fov: 30 },
            };
            this.isSpotLight = true;
        }
    },
    HemisphereLight: class {
        constructor(skyColor, groundColor, intensity) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.groundColor = { set: jest.fn() };
            this.intensity = intensity;
            this.isHemisphereLight = true;
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
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }
    },
    DirectionalLightHelper: class {
        constructor(light, size) {
            this.light = light;
            this.size = size;
            this.parent = null;
        }
    },
    PointLightHelper: class {
        constructor(light, size) {
            this.light = light;
            this.size = size;
            this.parent = null;
        }
    },
    SpotLightHelper: class {
        constructor(light) {
            this.light = light;
            this.parent = null;
        }
    },
};

describe('Light', () => {
    beforeEach(() => {
        EventBus.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        EventBus.clear();
    });

    describe('constructor', () => {
        test('should create light instance with Three.js light', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            expect(light).toBeDefined();
            expect(light.threeLight).toBe(threeLight);
            expect(light.type).toBe('directional');
            expect(light.isDisposed).toBe(false);

            light.dispose();
        });
    });

    describe('setPosition', () => {
        test('should set light position with numbers', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setPosition(1, 2, 3);

            expect(threeLight.position.set).toHaveBeenCalledWith(1, 2, 3);

            light.dispose();
        });

        test('should set light position with Vector3', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');
            const position = new THREE.Vector3(4, 5, 6);

            light.setPosition(position);

            expect(threeLight.position.copy).toHaveBeenCalledWith(position);

            light.dispose();
        });

        test('should set light position with array', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setPosition([7, 8, 9]);

            expect(threeLight.position.set).toHaveBeenCalledWith(7, 8, 9);

            light.dispose();
        });

        test('should throw error if light does not support position', () => {
            const threeLight = new THREE.AmbientLight(0xffffff, 1);
            delete threeLight.position; // Ambient lights don't have position
            const light = new Light(threeLight, 'ambient');

            expect(() => light.setPosition(1, 2, 3)).toThrow(
                "Light type 'ambient' does not support position",
            );

            light.dispose();
        });

        test('should throw error if light is disposed', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');
            light.dispose();

            expect(() => light.setPosition(1, 2, 3)).toThrow(
                'Cannot set position on disposed light',
            );
        });
    });

    describe('setIntensity', () => {
        test('should set light intensity', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setIntensity(0.5);

            expect(threeLight.intensity).toBe(0.5);

            light.dispose();
        });

        test('should throw error with negative intensity', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            expect(() => light.setIntensity(-1)).toThrow('Intensity must be a non-negative number');

            light.dispose();
        });
    });

    describe('setColor', () => {
        test('should set light color', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setColor(0xff0000);

            expect(threeLight.color.set).toHaveBeenCalledWith(0xff0000);

            light.dispose();
        });
    });

    describe('setShadowsEnabled', () => {
        test('should enable shadows for shadow-casting light', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setShadowsEnabled(true);

            expect(threeLight.castShadow).toBe(true);
            expect(threeLight.shadow.mapSize.width).toBe(2048);
            expect(threeLight.shadow.mapSize.height).toBe(2048);

            light.dispose();
        });

        test('should disable shadows', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setShadowsEnabled(false);

            expect(threeLight.castShadow).toBe(false);

            light.dispose();
        });
    });

    describe('setTarget', () => {
        test('should set light target with Vector3', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');
            const target = new THREE.Vector3(1, 2, 3);

            light.setTarget(target);

            expect(threeLight.target.position.copy).toHaveBeenCalledWith(target);

            light.dispose();
        });

        test('should set light target with array', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setTarget([4, 5, 6]);

            expect(threeLight.target.position.set).toHaveBeenCalledWith(4, 5, 6);

            light.dispose();
        });

        test('should throw error if light does not support target', () => {
            const threeLight = new THREE.PointLight(0xffffff, 1);
            delete threeLight.target; // Point lights don't have target
            const light = new Light(threeLight, 'point');

            expect(() => light.setTarget([1, 2, 3])).toThrow(
                "Light type 'point' does not support target",
            );

            light.dispose();
        });
    });

    describe('static presets', () => {
        test('should create sun light preset', () => {
            const light = Light.sun({
                intensity: 0.8,
                color: 0xffffaa,
                position: [5, 10, 2],
                target: [1, 0, 1],
            });

            expect(light.type).toBe('directional');
            expect(light.threeLight.isDirectionalLight).toBe(true);
            expect(light.threeLight.intensity).toBe(0.8);
            expect(light.threeLight.position.set).toHaveBeenCalledWith(5, 10, 2);
            expect(light.threeLight.target.position.set).toHaveBeenCalledWith(1, 0, 1);

            light.dispose();
        });

        test('should create ambient light preset', () => {
            const light = Light.ambient({
                intensity: 0.3,
                color: 0xaaaaff,
            });

            expect(light.type).toBe('ambient');
            expect(light.threeLight.isAmbientLight).toBe(true);
            expect(light.threeLight.intensity).toBe(0.3);

            light.dispose();
        });

        test('should create point light preset with old signature', () => {
            const light = Light.point(1, 2, 3, 0.7, 0xff0000);

            expect(light.type).toBe('point');
            expect(light.threeLight.isPointLight).toBe(true);
            expect(light.threeLight.position.set).toHaveBeenCalledWith(1, 2, 3);
            expect(light.threeLight.intensity).toBe(0.7);

            light.dispose();
        });

        test('should create point light preset with config object', () => {
            const light = Light.point(4, 5, 6, {
                intensity: 0.9,
                color: 0x00ff00,
                distance: 20,
                decay: 1,
            });

            expect(light.type).toBe('point');
            expect(light.threeLight.position.set).toHaveBeenCalledWith(4, 5, 6);
            expect(light.threeLight.intensity).toBe(0.9);
            expect(light.threeLight.distance).toBe(20);
            expect(light.threeLight.decay).toBe(1);

            light.dispose();
        });

        test('should create spot light preset', () => {
            const light = Light.spot({
                x: 2,
                y: 8,
                z: 4,
                target: [1, 0, 1],
                intensity: 1.2,
                angle: Math.PI / 4,
            });

            expect(light.type).toBe('spot');
            expect(light.threeLight.isSpotLight).toBe(true);
            expect(light.threeLight.position.set).toHaveBeenCalledWith(2, 8, 4);
            expect(light.threeLight.target.position.set).toHaveBeenCalledWith(1, 0, 1);
            expect(light.threeLight.intensity).toBe(1.2);
            expect(light.threeLight.angle).toBe(Math.PI / 4);

            light.dispose();
        });

        test('should create hemisphere light preset', () => {
            const light = Light.hemisphere({
                skyColor: 0xffffbb,
                groundColor: 0x080820,
                intensity: 0.6,
            });

            expect(light.type).toBe('hemisphere');
            expect(light.threeLight.isHemisphereLight).toBe(true);
            expect(light.threeLight.intensity).toBe(0.6);

            light.dispose();
        });

        test('should create basic lighting setup', () => {
            const lights = Light.basicSetup({
                sun: { intensity: 0.9 },
                ambient: { intensity: 0.3 },
            });

            expect(lights).toHaveLength(2);
            expect(lights[0].type).toBe('directional');
            expect(lights[1].type).toBe('ambient');
            expect(lights[0].threeLight.intensity).toBe(0.9);
            expect(lights[1].threeLight.intensity).toBe(0.3);

            lights.forEach((light) => light.dispose());
        });

        test('should create three-point lighting setup', () => {
            const lights = Light.threePointSetup({
                key: { intensity: 1.2 },
                fill: { intensity: 0.6 },
                rim: { intensity: 0.4 },
            });

            expect(lights).toHaveLength(3);
            expect(lights[0].type).toBe('spot'); // Key light
            expect(lights[1].type).toBe('point'); // Fill light
            expect(lights[2].type).toBe('point'); // Rim light

            lights.forEach((light) => light.dispose());
        });
    });

    describe('setHelperVisible', () => {
        test('should create and show directional light helper', () => {
            const mockScene = {
                add: jest.fn(),
                remove: jest.fn(),
            };

            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.setHelperVisible(true, mockScene);

            expect(mockScene.add).toHaveBeenCalled();

            light.dispose();
        });

        test('should hide light helper', () => {
            const mockScene = {
                add: jest.fn(),
                remove: jest.fn(),
            };

            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            // First show the helper
            light.setHelperVisible(true, mockScene);
            // Then hide it
            light.setHelperVisible(false, mockScene);

            expect(mockScene.remove).toHaveBeenCalled();

            light.dispose();
        });
    });

    describe('dispose', () => {
        test('should dispose light and clean up resources', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.dispose();

            expect(light.isDisposed).toBe(true);
            expect(light.threeLight).toBe(null);
        });

        test('should not throw error if disposed multiple times', () => {
            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            light.dispose();
            expect(() => light.dispose()).not.toThrow();
        });
    });

    describe('events', () => {
        test('should emit light created event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('light:created', eventSpy);

            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        light: light,
                        type: 'directional',
                    }),
                }),
            );

            light.dispose();
        });

        test('should emit position change event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('light:position-changed', eventSpy);

            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');
            light.setPosition(1, 2, 3);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        light: light,
                    }),
                }),
            );

            light.dispose();
        });

        test('should emit intensity change event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('light:intensity-changed', eventSpy);

            const threeLight = new THREE.DirectionalLight(0xffffff, 1);
            const light = new Light(threeLight, 'directional');
            light.setIntensity(0.5);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        light: light,
                        intensity: 0.5,
                    }),
                }),
            );

            light.dispose();
        });
    });
});
