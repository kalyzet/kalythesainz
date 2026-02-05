/**
 * Unit tests for Box primitive object
 * Tests box-specific functionality and dimension management
 */

import { Box } from '../../../objects/Box.js';
import { Object3D } from '../../../engine/Object3D.js';
import { EventBus } from '../../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

describe('Box', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    describe('Static create method', () => {
        test('creates box with default dimensions', () => {
            const box = Box.create();

            expect(box).toBeInstanceOf(Box);
            expect(box).toBeInstanceOf(Object3D);
            expect(box.width).toBe(1);
            expect(box.height).toBe(1);
            expect(box.depth).toBe(1);
        });

        test('creates box with specified dimensions', () => {
            const box = Box.create(2, 3, 4);

            expect(box.width).toBe(2);
            expect(box.height).toBe(3);
            expect(box.depth).toBe(4);

            box.dispose();
        });

        test('creates box with custom material', () => {
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const box = Box.create(1, 1, 1, material);

            expect(box.threeMesh.material).toBe(material);

            box.dispose();
        });

        test('throws error with invalid dimensions', () => {
            expect(() => {
                Box.create(0, 1, 1);
            }).toThrow('Width must be a positive number');

            expect(() => {
                Box.create(1, -1, 1);
            }).toThrow('Height must be a positive number');

            expect(() => {
                Box.create(1, 1, 0);
            }).toThrow('Depth must be a positive number');

            expect(() => {
                Box.create('invalid', 1, 1);
            }).toThrow('Width must be a positive number');
        });

        test('throws error with invalid material', () => {
            expect(() => {
                Box.create(1, 1, 1, 'invalid');
            }).toThrow('Material must be a valid Three.js Material');

            expect(() => {
                Box.create(1, 1, 1, {});
            }).toThrow('Material must be a valid Three.js Material');
        });
    });

    describe('Dimension properties', () => {
        let box;

        beforeEach(() => {
            box = Box.create(2, 3, 4);
        });

        afterEach(() => {
            box.dispose();
        });

        describe('Width', () => {
            test('gets and sets width', () => {
                expect(box.width).toBe(2);

                box.width = 5;
                expect(box.width).toBe(5);
            });

            test('throws error with invalid width', () => {
                expect(() => {
                    box.width = 0;
                }).toThrow('Width must be a positive number');

                expect(() => {
                    box.width = -1;
                }).toThrow('Width must be a positive number');

                expect(() => {
                    box.width = 'invalid';
                }).toThrow('Width must be a positive number');
            });

            test('emits dimension change event', () => {
                const events = [];
                EventBus.subscribe('object:dimensionChanged', (event) => {
                    events.push(event);
                });

                box.width = 6;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(box.id);
                expect(events[0].data.property).toBe('width');
                expect(events[0].data.oldValue).toBe(2);
                expect(events[0].data.newValue).toBe(6);
            });
        });

        describe('Height', () => {
            test('gets and sets height', () => {
                expect(box.height).toBe(3);

                box.height = 7;
                expect(box.height).toBe(7);
            });

            test('throws error with invalid height', () => {
                expect(() => {
                    box.height = 0;
                }).toThrow('Height must be a positive number');

                expect(() => {
                    box.height = -1;
                }).toThrow('Height must be a positive number');
            });
        });

        describe('Depth', () => {
            test('gets and sets depth', () => {
                expect(box.depth).toBe(4);

                box.depth = 8;
                expect(box.depth).toBe(8);
            });

            test('throws error with invalid depth', () => {
                expect(() => {
                    box.depth = 0;
                }).toThrow('Depth must be a positive number');

                expect(() => {
                    box.depth = -1;
                }).toThrow('Depth must be a positive number');
            });
        });
    });

    describe('Dimension management', () => {
        let box;

        beforeEach(() => {
            box = Box.create(1, 2, 3);
        });

        afterEach(() => {
            box.dispose();
        });

        test('sets all dimensions at once', () => {
            box.setDimensions(4, 5, 6);

            expect(box.width).toBe(4);
            expect(box.height).toBe(5);
            expect(box.depth).toBe(6);
        });

        test('gets all dimensions as object', () => {
            const dimensions = box.getDimensions();

            expect(dimensions).toEqual({
                width: 1,
                height: 2,
                depth: 3,
            });
        });

        test('throws error with invalid dimensions in setDimensions', () => {
            expect(() => {
                box.setDimensions(0, 1, 1);
            }).toThrow('Width must be a positive number');

            expect(() => {
                box.setDimensions(1, -1, 1);
            }).toThrow('Height must be a positive number');

            expect(() => {
                box.setDimensions(1, 1, 0);
            }).toThrow('Depth must be a positive number');
        });

        test('emits dimension change event for setDimensions', () => {
            const events = [];
            EventBus.subscribe('object:dimensionChanged', (event) => {
                events.push(event);
            });

            box.setDimensions(7, 8, 9);

            expect(events).toHaveLength(1);
            expect(events[0].data.property).toBe('dimensions');
            expect(events[0].data.oldValue).toEqual({ width: 1, height: 2, depth: 3 });
            expect(events[0].data.newValue).toEqual({ width: 7, height: 8, depth: 9 });
        });
    });

    describe('Cloning', () => {
        test('clones box with all properties', () => {
            const box = Box.create(2, 3, 4);
            box.name = 'original-box';
            box.tags = ['test'];
            box.userData = { prop: 'value' };

            const clone = box.clone();

            expect(clone).toBeInstanceOf(Box);
            expect(clone.id).not.toBe(box.id);
            expect(clone.name).toBe('original-box_copy');
            expect(clone.width).toBe(2);
            expect(clone.height).toBe(3);
            expect(clone.depth).toBe(4);
            expect(clone.tags).toEqual(['test']);
            expect(clone.userData).toEqual({ prop: 'value' });

            // Verify geometry is cloned, not shared
            expect(clone.threeMesh.geometry).not.toBe(box.threeMesh.geometry);

            box.dispose();
            clone.dispose();
        });
    });

    describe('Serialization', () => {
        test('serializes box to JSON', () => {
            const box = Box.create(2, 3, 4);
            box.name = 'test-box';

            const serialized = box.serialize();

            expect(serialized.type).toBe('Box');
            expect(serialized.name).toBe('test-box');
            expect(serialized.geometry.type).toBe('BoxGeometry');
            expect(serialized.geometry.parameters).toEqual({
                width: 2,
                height: 3,
                depth: 4,
            });

            box.dispose();
        });

        test('deserializes box from JSON', () => {
            const data = {
                type: 'Box',
                name: 'deserialized-box',
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
                    type: 'BoxGeometry',
                    parameters: {
                        width: 5,
                        height: 6,
                        depth: 7,
                    },
                },
                material: {
                    type: 'MeshStandardMaterial',
                    color: 0xff0000,
                },
            };

            const box = Box.deserialize(data);

            expect(box).toBeInstanceOf(Box);
            expect(box.name).toBe('deserialized-box');
            expect(box.width).toBe(5);
            expect(box.height).toBe(6);
            expect(box.depth).toBe(7);
            expect(box.tags).toEqual(['test']);
            expect(box.userData).toEqual({ prop: 'value' });

            box.dispose();
        });

        test('throws error with invalid serialization data', () => {
            expect(() => {
                Box.deserialize(null);
            }).toThrow('Invalid serialization data');

            expect(() => {
                Box.deserialize({});
            }).toThrow('Missing geometry parameters in serialization data');

            expect(() => {
                Box.deserialize({ geometry: {} });
            }).toThrow('Missing geometry parameters in serialization data');
        });
    });

    describe('Geometry updates', () => {
        test('updates geometry when dimensions change', () => {
            const box = Box.create(1, 1, 1);
            const originalGeometry = box.threeMesh.geometry;

            box.width = 2;

            // Geometry should be replaced with new one
            expect(box.threeMesh.geometry).not.toBe(originalGeometry);
            expect(box.threeMesh.geometry.parameters.width).toBe(2);

            box.dispose();
        });

        test('disposes old geometry when updating', () => {
            const box = Box.create(1, 1, 1);
            const originalGeometry = box.threeMesh.geometry;

            // Mock dispose method to track calls
            let disposeCalled = false;
            originalGeometry.dispose = jest.fn(() => {
                disposeCalled = true;
            });

            box.width = 2;

            expect(disposeCalled).toBe(true);

            box.dispose();
        });
    });
});
