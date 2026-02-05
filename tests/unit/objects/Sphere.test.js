/**
 * Unit tests for Sphere primitive object
 * Tests sphere-specific functionality and parameter management
 */

import { Sphere } from '../../../objects/Sphere.js';
import { Object3D } from '../../../engine/Object3D.js';
import { EventBus } from '../../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

describe('Sphere', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    describe('Static create method', () => {
        test('creates sphere with default parameters', () => {
            const sphere = Sphere.create();

            expect(sphere).toBeInstanceOf(Sphere);
            expect(sphere).toBeInstanceOf(Object3D);
            expect(sphere.radius).toBe(1);
            expect(sphere.widthSegments).toBe(32);
            expect(sphere.heightSegments).toBe(16);

            sphere.dispose();
        });

        test('creates sphere with specified radius and segments', () => {
            const sphere = Sphere.create(2, 16);

            expect(sphere.radius).toBe(2);
            expect(sphere.widthSegments).toBe(16);
            expect(sphere.heightSegments).toBe(8); // Half of width segments

            sphere.dispose();
        });

        test('creates sphere with custom material', () => {
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const sphere = Sphere.create(1, 32, material);

            expect(sphere.threeMesh.material).toBe(material);

            sphere.dispose();
        });

        test('throws error with invalid radius', () => {
            expect(() => {
                Sphere.create(0);
            }).toThrow('Radius must be a positive number');

            expect(() => {
                Sphere.create(-1);
            }).toThrow('Radius must be a positive number');

            expect(() => {
                Sphere.create('invalid');
            }).toThrow('Radius must be a positive number');
        });

        test('throws error with invalid segments', () => {
            expect(() => {
                Sphere.create(1, 2);
            }).toThrow('Segments must be a number greater than or equal to 3');

            expect(() => {
                Sphere.create(1, 'invalid');
            }).toThrow('Segments must be a number greater than or equal to 3');
        });

        test('throws error with invalid material', () => {
            expect(() => {
                Sphere.create(1, 32, 'invalid');
            }).toThrow('Material must be a valid Three.js Material');
        });
    });

    describe('Parameter properties', () => {
        let sphere;

        beforeEach(() => {
            sphere = Sphere.create(2, 16);
        });

        afterEach(() => {
            sphere.dispose();
        });

        describe('Radius', () => {
            test('gets and sets radius', () => {
                expect(sphere.radius).toBe(2);

                sphere.radius = 3;
                expect(sphere.radius).toBe(3);
            });

            test('throws error with invalid radius', () => {
                expect(() => {
                    sphere.radius = 0;
                }).toThrow('Radius must be a positive number');

                expect(() => {
                    sphere.radius = -1;
                }).toThrow('Radius must be a positive number');

                expect(() => {
                    sphere.radius = 'invalid';
                }).toThrow('Radius must be a positive number');
            });

            test('emits parameter change event', () => {
                const events = [];
                EventBus.subscribe('object:parameterChanged', (event) => {
                    events.push(event);
                });

                sphere.radius = 4;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(sphere.id);
                expect(events[0].data.property).toBe('radius');
                expect(events[0].data.oldValue).toBe(2);
                expect(events[0].data.newValue).toBe(4);
            });
        });

        describe('Width Segments', () => {
            test('gets and sets width segments', () => {
                expect(sphere.widthSegments).toBe(16);

                sphere.widthSegments = 24;
                expect(sphere.widthSegments).toBe(24);
            });

            test('floors decimal values', () => {
                sphere.widthSegments = 15.7;
                expect(sphere.widthSegments).toBe(15);
            });

            test('throws error with invalid width segments', () => {
                expect(() => {
                    sphere.widthSegments = 2;
                }).toThrow('Width segments must be a number greater than or equal to 3');

                expect(() => {
                    sphere.widthSegments = 'invalid';
                }).toThrow('Width segments must be a number greater than or equal to 3');
            });
        });

        describe('Height Segments', () => {
            test('gets and sets height segments', () => {
                expect(sphere.heightSegments).toBe(8);

                sphere.heightSegments = 12;
                expect(sphere.heightSegments).toBe(12);
            });

            test('floors decimal values', () => {
                sphere.heightSegments = 11.9;
                expect(sphere.heightSegments).toBe(11);
            });

            test('throws error with invalid height segments', () => {
                expect(() => {
                    sphere.heightSegments = 1;
                }).toThrow('Height segments must be a number greater than or equal to 2');

                expect(() => {
                    sphere.heightSegments = 'invalid';
                }).toThrow('Height segments must be a number greater than or equal to 2');
            });
        });
    });

    describe('Parameter management', () => {
        let sphere;

        beforeEach(() => {
            sphere = Sphere.create(1, 8);
        });

        afterEach(() => {
            sphere.dispose();
        });

        test('sets all parameters at once', () => {
            sphere.setParameters(3, 16, 8);

            expect(sphere.radius).toBe(3);
            expect(sphere.widthSegments).toBe(16);
            expect(sphere.heightSegments).toBe(8);
        });

        test('gets all parameters as object', () => {
            const parameters = sphere.getParameters();

            expect(parameters).toEqual({
                radius: 1,
                widthSegments: 8,
                heightSegments: 4,
            });
        });

        test('throws error with invalid parameters in setParameters', () => {
            expect(() => {
                sphere.setParameters(0, 8, 4);
            }).toThrow('Radius must be a positive number');

            expect(() => {
                sphere.setParameters(1, 2, 4);
            }).toThrow('Width segments must be a number greater than or equal to 3');

            expect(() => {
                sphere.setParameters(1, 8, 1);
            }).toThrow('Height segments must be a number greater than or equal to 2');
        });

        test('emits parameter change event for setParameters', () => {
            const events = [];
            EventBus.subscribe('object:parameterChanged', (event) => {
                events.push(event);
            });

            sphere.setParameters(2, 12, 6);

            expect(events).toHaveLength(1);
            expect(events[0].data.property).toBe('parameters');
            expect(events[0].data.oldValue).toEqual({
                radius: 1,
                widthSegments: 8,
                heightSegments: 4,
            });
            expect(events[0].data.newValue).toEqual({
                radius: 2,
                widthSegments: 12,
                heightSegments: 6,
            });
        });
    });

    describe('Utility methods', () => {
        let sphere;

        beforeEach(() => {
            sphere = Sphere.create(2);
        });

        afterEach(() => {
            sphere.dispose();
        });

        test('calculates surface area', () => {
            const expectedArea = 4 * Math.PI * 2 * 2; // 4πr²
            expect(sphere.getSurfaceArea()).toBeCloseTo(expectedArea);
        });

        test('calculates volume', () => {
            const expectedVolume = (4 / 3) * Math.PI * Math.pow(2, 3); // (4/3)πr³
            expect(sphere.getVolume()).toBeCloseTo(expectedVolume);
        });

        test('updates calculations when radius changes', () => {
            sphere.radius = 3;

            const expectedArea = 4 * Math.PI * 3 * 3;
            const expectedVolume = (4 / 3) * Math.PI * Math.pow(3, 3);

            expect(sphere.getSurfaceArea()).toBeCloseTo(expectedArea);
            expect(sphere.getVolume()).toBeCloseTo(expectedVolume);
        });
    });

    describe('Cloning', () => {
        test('clones sphere with all properties', () => {
            const sphere = Sphere.create(2, 16);
            sphere.name = 'original-sphere';
            sphere.tags = ['test'];
            sphere.userData = { prop: 'value' };

            const clone = sphere.clone();

            expect(clone).toBeInstanceOf(Sphere);
            expect(clone.id).not.toBe(sphere.id);
            expect(clone.name).toBe('original-sphere_copy');
            expect(clone.radius).toBe(2);
            expect(clone.widthSegments).toBe(16);
            expect(clone.heightSegments).toBe(8);
            expect(clone.tags).toEqual(['test']);
            expect(clone.userData).toEqual({ prop: 'value' });

            // Verify geometry is cloned, not shared
            expect(clone.threeMesh.geometry).not.toBe(sphere.threeMesh.geometry);

            sphere.dispose();
            clone.dispose();
        });
    });

    describe('Serialization', () => {
        test('serializes sphere to JSON', () => {
            const sphere = Sphere.create(3, 24);
            sphere.name = 'test-sphere';

            const serialized = sphere.serialize();

            expect(serialized.type).toBe('Sphere');
            expect(serialized.name).toBe('test-sphere');
            expect(serialized.geometry.type).toBe('SphereGeometry');
            expect(serialized.geometry.parameters).toEqual({
                radius: 3,
                widthSegments: 24,
                heightSegments: 12,
            });

            sphere.dispose();
        });

        test('deserializes sphere from JSON', () => {
            const data = {
                type: 'Sphere',
                name: 'deserialized-sphere',
                tags: ['test'],
                userData: { prop: 'value' },
                visible: true,
                locked: false,
                transform: {
                    position: [1, 2, 3],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1],
                },
                geometry: {
                    type: 'SphereGeometry',
                    parameters: {
                        radius: 4,
                        widthSegments: 20,
                        heightSegments: 10,
                    },
                },
                material: {
                    type: 'MeshStandardMaterial',
                    color: 0x00ff00,
                },
            };

            const sphere = Sphere.deserialize(data);

            expect(sphere).toBeInstanceOf(Sphere);
            expect(sphere.name).toBe('deserialized-sphere');
            expect(sphere.radius).toBe(4);
            expect(sphere.widthSegments).toBe(20);
            expect(sphere.heightSegments).toBe(10);
            expect(sphere.tags).toEqual(['test']);
            expect(sphere.userData).toEqual({ prop: 'value' });

            sphere.dispose();
        });

        test('throws error with invalid serialization data', () => {
            expect(() => {
                Sphere.deserialize(null);
            }).toThrow('Invalid serialization data');

            expect(() => {
                Sphere.deserialize({});
            }).toThrow('Missing geometry parameters in serialization data');
        });
    });

    describe('Geometry updates', () => {
        test('updates geometry when parameters change', () => {
            const sphere = Sphere.create(1, 8);
            const originalGeometry = sphere.threeMesh.geometry;

            sphere.radius = 2;

            // Geometry should be replaced with new one
            expect(sphere.threeMesh.geometry).not.toBe(originalGeometry);
            expect(sphere.threeMesh.geometry.parameters.radius).toBe(2);

            sphere.dispose();
        });

        test('disposes old geometry when updating', () => {
            const sphere = Sphere.create(1, 8);
            const originalGeometry = sphere.threeMesh.geometry;

            // Mock dispose method to track calls
            let disposeCalled = false;
            originalGeometry.dispose = jest.fn(() => {
                disposeCalled = true;
            });

            sphere.radius = 2;

            expect(disposeCalled).toBe(true);

            sphere.dispose();
        });
    });
});
