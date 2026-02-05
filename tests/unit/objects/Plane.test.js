/**
 * Unit tests for Plane primitive object
 * Tests plane-specific functionality and dimension management
 */

import { Plane } from '../../../objects/Plane.js';
import { Object3D } from '../../../engine/Object3D.js';
import { EventBus } from '../../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

describe('Plane', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    describe('Static create method', () => {
        test('creates plane with default dimensions', () => {
            const plane = Plane.create();

            expect(plane).toBeInstanceOf(Plane);
            expect(plane).toBeInstanceOf(Object3D);
            expect(plane.width).toBe(1);
            expect(plane.height).toBe(1);
            expect(plane.widthSegments).toBe(1);
            expect(plane.heightSegments).toBe(1);

            plane.dispose();
        });

        test('creates plane with specified dimensions', () => {
            const plane = Plane.create(3, 4);

            expect(plane.width).toBe(3);
            expect(plane.height).toBe(4);
            expect(plane.widthSegments).toBe(1);
            expect(plane.heightSegments).toBe(1);

            plane.dispose();
        });

        test('creates plane with custom material', () => {
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const plane = Plane.create(1, 1, material);

            expect(plane.threeMesh.material).toBe(material);

            plane.dispose();
        });

        test('throws error with invalid dimensions', () => {
            expect(() => {
                Plane.create(0, 1);
            }).toThrow('Width must be a positive number');

            expect(() => {
                Plane.create(1, -1);
            }).toThrow('Height must be a positive number');

            expect(() => {
                Plane.create('invalid', 1);
            }).toThrow('Width must be a positive number');
        });

        test('throws error with invalid material', () => {
            expect(() => {
                Plane.create(1, 1, 'invalid');
            }).toThrow('Material must be a valid Three.js Material');
        });
    });

    describe('Static createSegmented method', () => {
        test('creates segmented plane with specified parameters', () => {
            const plane = Plane.createSegmented(2, 3, 4, 5);

            expect(plane.width).toBe(2);
            expect(plane.height).toBe(3);
            expect(plane.widthSegments).toBe(4);
            expect(plane.heightSegments).toBe(5);

            plane.dispose();
        });

        test('creates segmented plane with default segments', () => {
            const plane = Plane.createSegmented(2, 3);

            expect(plane.width).toBe(2);
            expect(plane.height).toBe(3);
            expect(plane.widthSegments).toBe(1);
            expect(plane.heightSegments).toBe(1);

            plane.dispose();
        });

        test('floors segment values', () => {
            const plane = Plane.createSegmented(1, 1, 3.7, 4.9);

            expect(plane.widthSegments).toBe(3);
            expect(plane.heightSegments).toBe(4);

            plane.dispose();
        });

        test('throws error with invalid segments', () => {
            expect(() => {
                Plane.createSegmented(1, 1, 0, 1);
            }).toThrow('Width segments must be a number greater than or equal to 1');

            expect(() => {
                Plane.createSegmented(1, 1, 1, 0);
            }).toThrow('Height segments must be a number greater than or equal to 1');
        });
    });

    describe('Dimension properties', () => {
        let plane;

        beforeEach(() => {
            plane = Plane.create(2, 3);
        });

        afterEach(() => {
            plane.dispose();
        });

        describe('Width', () => {
            test('gets and sets width', () => {
                expect(plane.width).toBe(2);

                plane.width = 5;
                expect(plane.width).toBe(5);
            });

            test('throws error with invalid width', () => {
                expect(() => {
                    plane.width = 0;
                }).toThrow('Width must be a positive number');

                expect(() => {
                    plane.width = -1;
                }).toThrow('Width must be a positive number');

                expect(() => {
                    plane.width = 'invalid';
                }).toThrow('Width must be a positive number');
            });

            test('emits dimension change event', () => {
                const events = [];
                EventBus.subscribe('object:dimensionChanged', (event) => {
                    events.push(event);
                });

                plane.width = 6;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(plane.id);
                expect(events[0].data.property).toBe('width');
                expect(events[0].data.oldValue).toBe(2);
                expect(events[0].data.newValue).toBe(6);
            });
        });

        describe('Height', () => {
            test('gets and sets height', () => {
                expect(plane.height).toBe(3);

                plane.height = 7;
                expect(plane.height).toBe(7);
            });

            test('throws error with invalid height', () => {
                expect(() => {
                    plane.height = 0;
                }).toThrow('Height must be a positive number');

                expect(() => {
                    plane.height = -1;
                }).toThrow('Height must be a positive number');
            });
        });

        describe('Width Segments', () => {
            test('gets and sets width segments', () => {
                expect(plane.widthSegments).toBe(1);

                plane.widthSegments = 3;
                expect(plane.widthSegments).toBe(3);
            });

            test('floors decimal values', () => {
                plane.widthSegments = 2.8;
                expect(plane.widthSegments).toBe(2);
            });

            test('throws error with invalid width segments', () => {
                expect(() => {
                    plane.widthSegments = 0;
                }).toThrow('Width segments must be a number greater than or equal to 1');

                expect(() => {
                    plane.widthSegments = 'invalid';
                }).toThrow('Width segments must be a number greater than or equal to 1');
            });
        });

        describe('Height Segments', () => {
            test('gets and sets height segments', () => {
                expect(plane.heightSegments).toBe(1);

                plane.heightSegments = 4;
                expect(plane.heightSegments).toBe(4);
            });

            test('floors decimal values', () => {
                plane.heightSegments = 3.9;
                expect(plane.heightSegments).toBe(3);
            });

            test('throws error with invalid height segments', () => {
                expect(() => {
                    plane.heightSegments = 0;
                }).toThrow('Height segments must be a number greater than or equal to 1');

                expect(() => {
                    plane.heightSegments = 'invalid';
                }).toThrow('Height segments must be a number greater than or equal to 1');
            });
        });
    });

    describe('Dimension management', () => {
        let plane;

        beforeEach(() => {
            plane = Plane.create(1, 2);
        });

        afterEach(() => {
            plane.dispose();
        });

        test('sets dimensions with setDimensions', () => {
            plane.setDimensions(4, 5);

            expect(plane.width).toBe(4);
            expect(plane.height).toBe(5);
        });

        test('sets all parameters with setParameters', () => {
            plane.setParameters(3, 4, 2, 3);

            expect(plane.width).toBe(3);
            expect(plane.height).toBe(4);
            expect(plane.widthSegments).toBe(2);
            expect(plane.heightSegments).toBe(3);
        });

        test('gets dimensions as object', () => {
            const dimensions = plane.getDimensions();

            expect(dimensions).toEqual({
                width: 1,
                height: 2,
            });
        });

        test('gets all parameters as object', () => {
            const parameters = plane.getParameters();

            expect(parameters).toEqual({
                width: 1,
                height: 2,
                widthSegments: 1,
                heightSegments: 1,
            });
        });

        test('throws error with invalid dimensions in setDimensions', () => {
            expect(() => {
                plane.setDimensions(0, 1);
            }).toThrow('Width must be a positive number');

            expect(() => {
                plane.setDimensions(1, -1);
            }).toThrow('Height must be a positive number');
        });

        test('throws error with invalid parameters in setParameters', () => {
            expect(() => {
                plane.setParameters(0, 1, 1, 1);
            }).toThrow('Width must be a positive number');

            expect(() => {
                plane.setParameters(1, -1, 1, 1);
            }).toThrow('Height must be a positive number');

            expect(() => {
                plane.setParameters(1, 1, 0, 1);
            }).toThrow('Width segments must be a number greater than or equal to 1');

            expect(() => {
                plane.setParameters(1, 1, 1, 0);
            }).toThrow('Height segments must be a number greater than or equal to 1');
        });

        test('emits dimension change event for setDimensions', () => {
            const events = [];
            EventBus.subscribe('object:dimensionChanged', (event) => {
                events.push(event);
            });

            plane.setDimensions(7, 8);

            expect(events).toHaveLength(1);
            expect(events[0].data.property).toBe('dimensions');
            expect(events[0].data.oldValue).toEqual({ width: 1, height: 2 });
            expect(events[0].data.newValue).toEqual({ width: 7, height: 8 });
        });

        test('emits dimension change event for setParameters', () => {
            const events = [];
            EventBus.subscribe('object:dimensionChanged', (event) => {
                events.push(event);
            });

            plane.setParameters(5, 6, 2, 3);

            expect(events).toHaveLength(1);
            expect(events[0].data.property).toBe('parameters');
            expect(events[0].data.oldValue).toEqual({
                width: 1,
                height: 2,
                widthSegments: 1,
                heightSegments: 1,
            });
            expect(events[0].data.newValue).toEqual({
                width: 5,
                height: 6,
                widthSegments: 2,
                heightSegments: 3,
            });
        });
    });

    describe('Utility methods', () => {
        let plane;

        beforeEach(() => {
            plane = Plane.create(3, 4);
        });

        afterEach(() => {
            plane.dispose();
        });

        test('calculates area', () => {
            expect(plane.getArea()).toBe(12); // 3 * 4
        });

        test('updates area calculation when dimensions change', () => {
            plane.width = 5;
            plane.height = 6;

            expect(plane.getArea()).toBe(30); // 5 * 6
        });
    });

    describe('Cloning', () => {
        test('clones plane with all properties', () => {
            const plane = Plane.createSegmented(2, 3, 2, 3);
            plane.name = 'original-plane';
            plane.tags = ['test'];
            plane.userData = { prop: 'value' };

            const clone = plane.clone();

            expect(clone).toBeInstanceOf(Plane);
            expect(clone.id).not.toBe(plane.id);
            expect(clone.name).toBe('original-plane_copy');
            expect(clone.width).toBe(2);
            expect(clone.height).toBe(3);
            expect(clone.widthSegments).toBe(2);
            expect(clone.heightSegments).toBe(3);
            expect(clone.tags).toEqual(['test']);
            expect(clone.userData).toEqual({ prop: 'value' });

            // Verify geometry is cloned, not shared
            expect(clone.threeMesh.geometry).not.toBe(plane.threeMesh.geometry);

            plane.dispose();
            clone.dispose();
        });
    });

    describe('Serialization', () => {
        test('serializes plane to JSON', () => {
            const plane = Plane.createSegmented(2, 3, 2, 3);
            plane.name = 'test-plane';

            const serialized = plane.serialize();

            expect(serialized.type).toBe('Plane');
            expect(serialized.name).toBe('test-plane');
            expect(serialized.geometry.type).toBe('PlaneGeometry');
            expect(serialized.geometry.parameters).toEqual({
                width: 2,
                height: 3,
                widthSegments: 2,
                heightSegments: 3,
            });

            plane.dispose();
        });

        test('deserializes plane from JSON', () => {
            const data = {
                type: 'Plane',
                name: 'deserialized-plane',
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
                    type: 'PlaneGeometry',
                    parameters: {
                        width: 4,
                        height: 5,
                        widthSegments: 3,
                        heightSegments: 4,
                    },
                },
                material: {
                    type: 'MeshStandardMaterial',
                    color: 0x0000ff,
                },
            };

            const plane = Plane.deserialize(data);

            expect(plane).toBeInstanceOf(Plane);
            expect(plane.name).toBe('deserialized-plane');
            expect(plane.width).toBe(4);
            expect(plane.height).toBe(5);
            expect(plane.widthSegments).toBe(3);
            expect(plane.heightSegments).toBe(4);
            expect(plane.tags).toEqual(['test']);
            expect(plane.userData).toEqual({ prop: 'value' });

            plane.dispose();
        });

        test('throws error with invalid serialization data', () => {
            expect(() => {
                Plane.deserialize(null);
            }).toThrow('Invalid serialization data');

            expect(() => {
                Plane.deserialize({});
            }).toThrow('Missing geometry parameters in serialization data');
        });
    });

    describe('Geometry updates', () => {
        test('updates geometry when dimensions change', () => {
            const plane = Plane.create(1, 1);
            const originalGeometry = plane.threeMesh.geometry;

            plane.width = 2;

            // Geometry should be replaced with new one
            expect(plane.threeMesh.geometry).not.toBe(originalGeometry);
            expect(plane.threeMesh.geometry.parameters.width).toBe(2);

            plane.dispose();
        });

        test('disposes old geometry when updating', () => {
            const plane = Plane.create(1, 1);
            const originalGeometry = plane.threeMesh.geometry;

            // Mock dispose method to track calls
            let disposeCalled = false;
            originalGeometry.dispose = jest.fn(() => {
                disposeCalled = true;
            });

            plane.width = 2;

            expect(disposeCalled).toBe(true);

            plane.dispose();
        });
    });
});
