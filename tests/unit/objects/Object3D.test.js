/**
 * Unit tests for Object3D base class
 * Tests transform properties, metadata, and lifecycle methods
 */

import { Object3D } from '../../../engine/Object3D.js';
import { EventBus } from '../../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

describe('Object3D', () => {
    beforeEach(() => {
        // Clear EventBus before each test
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        EventBus.clear();
    });

    describe('Constructor', () => {
        test('creates object with valid geometry and material', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

            const object = new Object3D(geometry, material);

            expect(object).toBeInstanceOf(Object3D);
            expect(object.id).toBeDefined();
            expect(typeof object.id).toBe('string');
            expect(object.id.length).toBeGreaterThan(0);
            expect(object.threeMesh).toBeInstanceOf(THREE.Mesh);
            expect(object.threeMesh.geometry).toBe(geometry);
            expect(object.threeMesh.material).toBe(material);
        });

        test('throws error with invalid geometry', () => {
            const material = new THREE.MeshStandardMaterial();

            expect(() => {
                new Object3D(null, material);
            }).toThrow('Geometry must be a valid Three.js BufferGeometry');

            expect(() => {
                new Object3D('invalid', material);
            }).toThrow('Geometry must be a valid Three.js BufferGeometry');

            expect(() => {
                new Object3D({}, material);
            }).toThrow('Geometry must be a valid Three.js BufferGeometry');
        });

        test('throws error with invalid material', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);

            expect(() => {
                new Object3D(geometry, null);
            }).toThrow('Material must be a valid Three.js Material');

            expect(() => {
                new Object3D(geometry, 'invalid');
            }).toThrow('Material must be a valid Three.js Material');

            expect(() => {
                new Object3D(geometry, {});
            }).toThrow('Material must be a valid Three.js Material');
        });

        test('emits creation event', () => {
            const events = [];
            EventBus.subscribe('object:created', (event) => {
                events.push(event);
            });

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            const object = new Object3D(geometry, material);

            expect(events).toHaveLength(1);
            expect(events[0].data.id).toBe(object.id);
            expect(events[0].data.type).toBe('Object3D');
            expect(events[0].data.object).toBe(object);
        });

        test('sets default properties correctly', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            const object = new Object3D(geometry, material);

            // Default name should be set
            expect(object.name).toBeDefined();
            expect(typeof object.name).toBe('string');
            expect(object.name.length).toBeGreaterThan(0);

            // Default transform values
            expect(object.position.x).toBe(0);
            expect(object.position.y).toBe(0);
            expect(object.position.z).toBe(0);
            expect(object.rotation.x).toBe(0);
            expect(object.rotation.y).toBe(0);
            expect(object.rotation.z).toBe(0);
            expect(object.scale.x).toBe(1);
            expect(object.scale.y).toBe(1);
            expect(object.scale.z).toBe(1);

            // Default metadata
            expect(object.tags).toEqual([]);
            expect(object.userData).toEqual({});
            expect(object.visible).toBe(true);
            expect(object.locked).toBe(false);
        });
    });

    describe('Transform Properties', () => {
        let object;

        beforeEach(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            object = new Object3D(geometry, material);
        });

        afterEach(() => {
            object.dispose();
        });

        describe('Position', () => {
            test('sets position with Vector3', () => {
                const position = new THREE.Vector3(1, 2, 3);
                object.position = position;

                expect(object.position.x).toBeCloseTo(1);
                expect(object.position.y).toBeCloseTo(2);
                expect(object.position.z).toBeCloseTo(3);
                expect(object.threeMesh.position.x).toBeCloseTo(1);
                expect(object.threeMesh.position.y).toBeCloseTo(2);
                expect(object.threeMesh.position.z).toBeCloseTo(3);
            });

            test('sets position with object', () => {
                object.position = { x: 4, y: 5, z: 6 };

                expect(object.position.x).toBeCloseTo(4);
                expect(object.position.y).toBeCloseTo(5);
                expect(object.position.z).toBeCloseTo(6);
            });

            test('sets position with array', () => {
                object.position = [7, 8, 9];

                expect(object.position.x).toBeCloseTo(7);
                expect(object.position.y).toBeCloseTo(8);
                expect(object.position.z).toBeCloseTo(9);
            });

            test('emits position change event', () => {
                const events = [];
                EventBus.subscribe('object:positionChanged', (event) => {
                    events.push(event);
                });

                object.position = { x: 1, y: 2, z: 3 };

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.object).toBe(object);
                expect(events[0].data.newPosition.x).toBeCloseTo(1);
                expect(events[0].data.newPosition.y).toBeCloseTo(2);
                expect(events[0].data.newPosition.z).toBeCloseTo(3);
            });

            test('throws error with invalid position', () => {
                expect(() => {
                    object.position = 'invalid';
                }).toThrow('Position must be a Vector3, array [x,y,z], or object {x,y,z}');

                expect(() => {
                    object.position = null;
                }).toThrow('Position must be a Vector3, array [x,y,z], or object {x,y,z}');
            });
        });

        describe('Rotation', () => {
            test('sets rotation with Euler', () => {
                const rotation = new THREE.Euler(0.1, 0.2, 0.3);
                object.rotation = rotation;

                expect(object.rotation.x).toBeCloseTo(0.1);
                expect(object.rotation.y).toBeCloseTo(0.2);
                expect(object.rotation.z).toBeCloseTo(0.3);
            });

            test('sets rotation with object', () => {
                object.rotation = { x: 0.4, y: 0.5, z: 0.6 };

                expect(object.rotation.x).toBeCloseTo(0.4);
                expect(object.rotation.y).toBeCloseTo(0.5);
                expect(object.rotation.z).toBeCloseTo(0.6);
            });

            test('sets rotation with array', () => {
                object.rotation = [0.7, 0.8, 0.9];

                expect(object.rotation.x).toBeCloseTo(0.7);
                expect(object.rotation.y).toBeCloseTo(0.8);
                expect(object.rotation.z).toBeCloseTo(0.9);
            });

            test('emits rotation change event', () => {
                const events = [];
                EventBus.subscribe('object:rotationChanged', (event) => {
                    events.push(event);
                });

                object.rotation = { x: 0.1, y: 0.2, z: 0.3 };

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.object).toBe(object);
            });
        });

        describe('Scale', () => {
            test('sets scale with Vector3', () => {
                const scale = new THREE.Vector3(2, 3, 4);
                object.scale = scale;

                expect(object.scale.x).toBeCloseTo(2);
                expect(object.scale.y).toBeCloseTo(3);
                expect(object.scale.z).toBeCloseTo(4);
            });

            test('sets scale with object', () => {
                object.scale = { x: 1.5, y: 2.5, z: 3.5 };

                expect(object.scale.x).toBeCloseTo(1.5);
                expect(object.scale.y).toBeCloseTo(2.5);
                expect(object.scale.z).toBeCloseTo(3.5);
            });

            test('sets scale with array', () => {
                object.scale = [0.5, 1.5, 2.5];

                expect(object.scale.x).toBeCloseTo(0.5);
                expect(object.scale.y).toBeCloseTo(1.5);
                expect(object.scale.z).toBeCloseTo(2.5);
            });

            test('sets uniform scale with number', () => {
                object.scale = 2.5;

                expect(object.scale.x).toBeCloseTo(2.5);
                expect(object.scale.y).toBeCloseTo(2.5);
                expect(object.scale.z).toBeCloseTo(2.5);
            });

            test('emits scale change event', () => {
                const events = [];
                EventBus.subscribe('object:scaleChanged', (event) => {
                    events.push(event);
                });

                object.scale = 2;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.object).toBe(object);
            });
        });
    });

    describe('Metadata Properties', () => {
        let object;

        beforeEach(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            object = new Object3D(geometry, material);
        });

        afterEach(() => {
            object.dispose();
        });

        describe('Name', () => {
            test('sets and gets name', () => {
                object.name = 'test-object';
                expect(object.name).toBe('test-object');
            });

            test('emits name change event', () => {
                const events = [];
                EventBus.subscribe('object:nameChanged', (event) => {
                    events.push(event);
                });

                object.name = 'new-name';

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.newName).toBe('new-name');
            });

            test('throws error with invalid name', () => {
                expect(() => {
                    object.name = null;
                }).toThrow('Name must be a string');

                expect(() => {
                    object.name = 123;
                }).toThrow('Name must be a string');
            });
        });

        describe('Tags', () => {
            test('sets and gets tags', () => {
                const tags = ['tag1', 'tag2', 'tag3'];
                object.tags = tags;
                expect(object.tags).toEqual(tags);
            });

            test('returns copy of tags array', () => {
                const tags = ['tag1', 'tag2'];
                object.tags = tags;
                const retrievedTags = object.tags;
                retrievedTags.push('tag3');
                expect(object.tags).toEqual(['tag1', 'tag2']); // Original unchanged
            });

            test('emits tags change event', () => {
                const events = [];
                EventBus.subscribe('object:tagsChanged', (event) => {
                    events.push(event);
                });

                object.tags = ['new', 'tags'];

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.newTags).toEqual(['new', 'tags']);
            });

            test('throws error with invalid tags', () => {
                expect(() => {
                    object.tags = 'not-array';
                }).toThrow('Tags must be an array of strings');

                expect(() => {
                    object.tags = [1, 2, 3];
                }).toThrow('Tags must be an array of strings');

                expect(() => {
                    object.tags = ['valid', 123, 'invalid'];
                }).toThrow('Tags must be an array of strings');
            });
        });

        describe('UserData', () => {
            test('sets and gets userData', () => {
                const userData = { prop1: 'value1', prop2: 42, prop3: true };
                object.userData = userData;
                expect(object.userData).toEqual(userData);
            });

            test('returns copy of userData object', () => {
                const userData = { prop1: 'value1' };
                object.userData = userData;
                const retrievedData = object.userData;
                retrievedData.prop2 = 'new-value';
                expect(object.userData).toEqual({ prop1: 'value1' }); // Original unchanged
            });

            test('emits userData change event', () => {
                const events = [];
                EventBus.subscribe('object:userDataChanged', (event) => {
                    events.push(event);
                });

                const userData = { test: true };
                object.userData = userData;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.newUserData).toEqual(userData);
            });

            test('throws error with invalid userData', () => {
                expect(() => {
                    object.userData = null;
                }).toThrow('User data must be a plain object');

                expect(() => {
                    object.userData = 'not-object';
                }).toThrow('User data must be a plain object');

                expect(() => {
                    object.userData = [1, 2, 3];
                }).toThrow('User data must be a plain object');
            });
        });

        describe('Visibility', () => {
            test('sets and gets visibility', () => {
                object.visible = false;
                expect(object.visible).toBe(false);
                expect(object.threeMesh.visible).toBe(false);

                object.visible = true;
                expect(object.visible).toBe(true);
                expect(object.threeMesh.visible).toBe(true);
            });

            test('emits visibility change event', () => {
                const events = [];
                EventBus.subscribe('object:visibilityChanged', (event) => {
                    events.push(event);
                });

                object.visible = false;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.newVisible).toBe(false);
            });

            test('throws error with invalid visibility', () => {
                expect(() => {
                    object.visible = 'not-boolean';
                }).toThrow('Visible must be a boolean');

                expect(() => {
                    object.visible = 1;
                }).toThrow('Visible must be a boolean');
            });
        });

        describe('Locked', () => {
            test('sets and gets locked state', () => {
                object.locked = true;
                expect(object.locked).toBe(true);

                object.locked = false;
                expect(object.locked).toBe(false);
            });

            test('emits lock change event', () => {
                const events = [];
                EventBus.subscribe('object:lockChanged', (event) => {
                    events.push(event);
                });

                object.locked = true;

                expect(events).toHaveLength(1);
                expect(events[0].data.id).toBe(object.id);
                expect(events[0].data.newLocked).toBe(true);
            });

            test('throws error with invalid locked value', () => {
                expect(() => {
                    object.locked = 'not-boolean';
                }).toThrow('Locked must be a boolean');

                expect(() => {
                    object.locked = 0;
                }).toThrow('Locked must be a boolean');
            });
        });
    });

    describe('Tag Management', () => {
        let object;

        beforeEach(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            object = new Object3D(geometry, material);
        });

        afterEach(() => {
            object.dispose();
        });

        test('adds tag', () => {
            object.addTag('test-tag');
            expect(object.tags).toContain('test-tag');
        });

        test('does not add duplicate tag', () => {
            object.addTag('test-tag');
            object.addTag('test-tag');
            expect(object.tags.filter((tag) => tag === 'test-tag')).toHaveLength(1);
        });

        test('removes tag', () => {
            object.addTag('test-tag');
            const result = object.removeTag('test-tag');
            expect(result).toBe(true);
            expect(object.tags).not.toContain('test-tag');
        });

        test('returns false when removing non-existent tag', () => {
            const result = object.removeTag('non-existent');
            expect(result).toBe(false);
        });

        test('checks if has tag', () => {
            object.addTag('test-tag');
            expect(object.hasTag('test-tag')).toBe(true);
            expect(object.hasTag('non-existent')).toBe(false);
        });

        test('emits tag events', () => {
            const addEvents = [];
            const removeEvents = [];

            EventBus.subscribe('object:tagAdded', (event) => {
                addEvents.push(event);
            });

            EventBus.subscribe('object:tagRemoved', (event) => {
                removeEvents.push(event);
            });

            object.addTag('test-tag');
            object.removeTag('test-tag');

            expect(addEvents).toHaveLength(1);
            expect(addEvents[0].data.tag).toBe('test-tag');

            expect(removeEvents).toHaveLength(1);
            expect(removeEvents[0].data.tag).toBe('test-tag');
        });
    });

    describe('Cloning', () => {
        let object;

        beforeEach(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            object = new Object3D(geometry, material);
        });

        afterEach(() => {
            object.dispose();
        });

        test('clones object with all properties', () => {
            // Set up original object
            object.name = 'original';
            object.tags = ['tag1', 'tag2'];
            object.userData = { prop: 'value' };
            object.position = { x: 1, y: 2, z: 3 };
            object.rotation = { x: 0.1, y: 0.2, z: 0.3 };
            object.scale = { x: 2, y: 3, z: 4 };
            object.visible = false;
            object.locked = true;

            // Clone object
            const clone = object.clone();

            // Verify clone has different ID
            expect(clone.id).not.toBe(object.id);

            // Verify clone has copied name with suffix
            expect(clone.name).toBe('original_copy');

            // Verify all other properties are copied
            expect(clone.tags).toEqual(['tag1', 'tag2']);
            expect(clone.userData).toEqual({ prop: 'value' });
            expect(clone.visible).toBe(false);
            expect(clone.locked).toBe(true);

            // Verify transform properties are copied
            expect(clone.position.x).toBeCloseTo(1);
            expect(clone.position.y).toBeCloseTo(2);
            expect(clone.position.z).toBeCloseTo(3);
            expect(clone.rotation.x).toBeCloseTo(0.1);
            expect(clone.rotation.y).toBeCloseTo(0.2);
            expect(clone.rotation.z).toBeCloseTo(0.3);
            expect(clone.scale.x).toBeCloseTo(2);
            expect(clone.scale.y).toBeCloseTo(3);
            expect(clone.scale.z).toBeCloseTo(4);

            // Verify geometry and material are cloned (not shared)
            expect(clone.threeMesh.geometry).not.toBe(object.threeMesh.geometry);
            expect(clone.threeMesh.material).not.toBe(object.threeMesh.material);

            // Clean up
            clone.dispose();
        });
    });

    describe('Serialization', () => {
        let object;

        beforeEach(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            object = new Object3D(geometry, material);
        });

        afterEach(() => {
            object.dispose();
        });

        test('serializes object to JSON', () => {
            // Set up object
            object.name = 'test-object';
            object.tags = ['tag1', 'tag2'];
            object.userData = { prop: 'value', num: 42 };
            object.position = { x: 1, y: 2, z: 3 };
            object.visible = false;
            object.locked = true;

            const serialized = object.serialize();

            expect(serialized.id).toBe(object.id);
            expect(serialized.type).toBe('Object3D');
            expect(serialized.name).toBe('test-object');
            expect(serialized.tags).toEqual(['tag1', 'tag2']);
            expect(serialized.userData).toEqual({ prop: 'value', num: 42 });
            expect(serialized.visible).toBe(false);
            expect(serialized.locked).toBe(true);
            expect(serialized.transform).toBeDefined();
            expect(serialized.transform.position).toEqual([1, 2, 3]);
            expect(serialized.geometry).toBeDefined();
            expect(serialized.material).toBeDefined();
        });

        test('deserializes object from JSON', () => {
            const data = {
                id: 'test-id',
                type: 'Object3D',
                name: 'deserialized-object',
                tags: ['tag1', 'tag2'],
                userData: { prop: 'value' },
                visible: false,
                locked: true,
                transform: {
                    position: [1, 2, 3],
                    rotation: [0.1, 0.2, 0.3],
                    scale: [2, 3, 4],
                },
                geometry: {
                    type: 'BoxGeometry',
                    parameters: { width: 1, height: 1, depth: 1 },
                },
                material: {
                    type: 'MeshStandardMaterial',
                    color: 0xff0000,
                },
            };

            const deserialized = Object3D.deserialize(data);

            expect(deserialized).toBeInstanceOf(Object3D);
            expect(deserialized.name).toBe('deserialized-object');
            expect(deserialized.tags).toEqual(['tag1', 'tag2']);
            expect(deserialized.userData).toEqual({ prop: 'value' });
            expect(deserialized.visible).toBe(false);
            expect(deserialized.locked).toBe(true);

            // Verify transform
            expect(deserialized.position.x).toBeCloseTo(1);
            expect(deserialized.position.y).toBeCloseTo(2);
            expect(deserialized.position.z).toBeCloseTo(3);

            // Clean up
            deserialized.dispose();
        });

        test('throws error with invalid serialization data', () => {
            expect(() => {
                Object3D.deserialize(null);
            }).toThrow('Invalid serialization data');

            expect(() => {
                Object3D.deserialize({});
            }).toThrow('Missing required serialization data');

            expect(() => {
                Object3D.deserialize({ geometry: {}, material: {} });
            }).toThrow('Missing required serialization data');
        });
    });

    describe('Disposal', () => {
        let object;

        beforeEach(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            object = new Object3D(geometry, material);
        });

        test('disposes object and cleans up resources', () => {
            const disposalEvents = [];
            const disposedEvents = [];

            EventBus.subscribe('object:disposing', (event) => {
                disposalEvents.push(event);
            });

            EventBus.subscribe('object:disposed', (event) => {
                disposedEvents.push(event);
            });

            // Set some properties
            object.name = 'test-object';
            object.tags = ['tag1', 'tag2'];
            object.userData = { prop: 'value' };

            const objectId = object.id;

            // Dispose object
            object.dispose();

            // Verify cleanup
            expect(object.threeMesh).toBeNull();
            expect(object.tags).toEqual([]);
            expect(object.userData).toEqual({});

            // Verify events
            expect(disposalEvents).toHaveLength(1);
            expect(disposalEvents[0].data.id).toBe(objectId);

            expect(disposedEvents).toHaveLength(1);
            expect(disposedEvents[0].data.id).toBe(objectId);
        });

        test('handles multiple dispose calls gracefully', () => {
            object.dispose();

            // Should not throw error
            expect(() => {
                object.dispose();
            }).not.toThrow();
        });
    });
});
