/**
 * Unit tests for Serializer utility class
 * Tests serialization with various scene configurations, error handling, and metadata preservation
 */

import { Serializer } from '../../../utils/Serializer.js';
import { Scene } from '../../../engine/Scene.js';
import { Box } from '../../../objects/Box.js';
import { Sphere } from '../../../objects/Sphere.js';
import { Plane } from '../../../objects/Plane.js';
import { Light } from '../../../engine/Light.js';
import { EventBus } from '../../../core/EventBus.js';

const THREE = global.THREE;

describe('Serializer', () => {
    let scene;
    let container;

    beforeEach(() => {
        // Clear EventBus
        EventBus.clear();

        // Create container element
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Destroy any existing scene
        if (Scene.isInitialized()) {
            Scene.destroy();
        }

        // Initialize scene
        scene = Scene.init('test-container', { autoStart: false });
    });

    afterEach(() => {
        // Clean up
        if (scene && !scene.isDisposed) {
            Scene.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        EventBus.clear();
    });

    describe('serializeScene', () => {
        test('serializes empty scene correctly', () => {
            scene.clear(true);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized).toBeDefined();
            expect(serialized.version).toBe('1.0.0');
            expect(serialized.metadata).toBeDefined();
            expect(serialized.metadata.objectCount).toBe(0);
            expect(serialized.metadata.lightCount).toBe(0);
            expect(serialized.objects).toEqual([]);
            expect(serialized.lights).toEqual([]);
            expect(serialized.camera).toBeDefined();
        });

        test('serializes scene with single box object', () => {
            scene.clear(true);

            const box = Box.create(2, 3, 4);
            box.name = 'Test Box';
            box.position = [1, 2, 3];
            scene.add(box);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized.objects).toHaveLength(1);
            expect(serialized.objects[0].type).toBe('Box');
            expect(serialized.objects[0].name).toBe('Test Box');
            expect(serialized.objects[0].geometry.parameters.width).toBe(2);
            expect(serialized.objects[0].geometry.parameters.height).toBe(3);
            expect(serialized.objects[0].geometry.parameters.depth).toBe(4);
            expect(serialized.objects[0].transform.position).toEqual([1, 2, 3]);
        });

        test('serializes scene with multiple object types', () => {
            scene.clear(true);

            const box = Box.create(1, 1, 1);
            const sphere = Sphere.create(1.5, 16);
            const plane = Plane.create(5, 5);

            scene.add(box);
            scene.add(sphere);
            scene.add(plane);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized.objects).toHaveLength(3);
            expect(serialized.objects[0].type).toBe('Box');
            expect(serialized.objects[1].type).toBe('Sphere');
            expect(serialized.objects[2].type).toBe('Plane');
        });

        test('serializes scene with lights', () => {
            scene.clear(true);

            const sunLight = Light.sun({ intensity: 0.8 });
            const ambientLight = Light.ambient({ intensity: 0.3 });

            scene.addLight(sunLight);
            scene.addLight(ambientLight);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized.lights).toHaveLength(2);
            expect(serialized.lights[0].type).toBe('directional');
            expect(serialized.lights[0].intensity).toBe(0.8);
            expect(serialized.lights[1].type).toBe('ambient');
            expect(serialized.lights[1].intensity).toBe(0.3);
        });

        test('serializes camera configuration', () => {
            scene.camera.setPosition(10, 5, 10);
            scene.camera.setFov(60);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized.camera).toBeDefined();
            expect(serialized.camera.position).toEqual([10, 5, 10]);
            expect(serialized.camera.fov).toBe(60);
        });

        test('preserves object metadata during serialization', () => {
            scene.clear(true);

            const box = Box.create(1, 1, 1);
            box.name = 'Metadata Box';
            box.tags = ['test', 'metadata'];
            box.userData = { prop1: 'value1', prop2: 42, prop3: true };
            box.visible = false;

            scene.add(box);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized.objects[0].name).toBe('Metadata Box');
            expect(serialized.objects[0].tags).toEqual(['test', 'metadata']);
            expect(serialized.objects[0].userData).toEqual({
                prop1: 'value1',
                prop2: 42,
                prop3: true,
            });
            expect(serialized.objects[0].visible).toBe(false);
        });

        test('throws error when scene is null', () => {
            expect(() => {
                Serializer.serializeScene(null);
            }).toThrow('Scene is required');
        });

        test('throws error when scene is undefined', () => {
            expect(() => {
                Serializer.serializeScene(undefined);
            }).toThrow('Scene is required');
        });
    });

    describe('deserializeScene', () => {
        test('deserializes empty scene correctly', async () => {
            const data = {
                version: '1.0.0',
                metadata: {
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    author: 'test',
                    objectCount: 0,
                    lightCount: 0,
                },
                camera: {
                    type: 'perspective',
                    position: [0, 5, 10],
                    fov: 75,
                },
                lights: [],
                objects: [],
            };

            scene.clear(true);
            await Serializer.deserializeScene(data, scene);

            expect(scene.objects.size).toBe(0);
            expect(scene.lights.length).toBe(0);
        });

        test('deserializes scene with objects', async () => {
            scene.clear(true);

            // Create and serialize a scene
            const box = Box.create(2, 3, 4);
            box.name = 'Test Box';
            const boxId = scene.add(box);

            const serialized = Serializer.serializeScene(scene);

            // Clear and deserialize
            scene.clear(true);
            await Serializer.deserializeScene(serialized, scene);

            expect(scene.objects.size).toBe(1);
            const restoredBox = scene.find(boxId);
            expect(restoredBox).toBeDefined();
            expect(restoredBox.name).toBe('Test Box');
            expect(restoredBox.width).toBe(2);
            expect(restoredBox.height).toBe(3);
            expect(restoredBox.depth).toBe(4);
        });

        test('deserializes scene with lights', async () => {
            scene.clear(true);

            // Create and serialize a scene with lights
            const sunLight = Light.sun({ intensity: 0.8 });
            scene.addLight(sunLight);

            const serialized = Serializer.serializeScene(scene);

            // Clear and deserialize
            scene.clear(true);
            await Serializer.deserializeScene(serialized, scene);

            expect(scene.lights.length).toBe(1);
            expect(scene.lights[0].type).toBe('directional');
            expect(scene.lights[0].threeLight.intensity).toBe(0.8);
        });

        test('throws error with null data', async () => {
            await expect(Serializer.deserializeScene(null, scene)).rejects.toThrow(
                'Invalid scene data',
            );
        });

        test('throws error with undefined data', async () => {
            await expect(Serializer.deserializeScene(undefined, scene)).rejects.toThrow(
                'Invalid scene data',
            );
        });

        test('throws error with invalid data type', async () => {
            await expect(Serializer.deserializeScene('invalid', scene)).rejects.toThrow(
                'Invalid scene data',
            );
        });

        test('throws error with missing version', async () => {
            const invalidData = {
                metadata: {},
                objects: [],
                lights: [],
            };

            await expect(Serializer.deserializeScene(invalidData, scene)).rejects.toThrow(
                'Missing version',
            );
        });

        test('throws error with invalid objects array', async () => {
            const invalidData = {
                version: '1.0.0',
                metadata: {},
                objects: 'not an array',
                lights: [],
            };

            await expect(Serializer.deserializeScene(invalidData, scene)).rejects.toThrow(
                'Objects must be an array',
            );
        });

        test('throws error with invalid lights array', async () => {
            const invalidData = {
                version: '1.0.0',
                metadata: {},
                objects: [],
                lights: 'not an array',
            };

            await expect(Serializer.deserializeScene(invalidData, scene)).rejects.toThrow(
                'Lights must be an array',
            );
        });

        test('throws error when target scene is null', async () => {
            const data = {
                version: '1.0.0',
                metadata: {},
                objects: [],
                lights: [],
            };

            await expect(Serializer.deserializeScene(data, null)).rejects.toThrow(
                'Target scene is required',
            );
        });
    });

    describe('metadata preservation', () => {
        test('preserves all metadata during round-trip', async () => {
            scene.clear(true);

            // Create objects with rich metadata
            const box = Box.create(2, 3, 4);
            box.name = 'Rich Metadata Box';
            box.tags = ['important', 'test', 'metadata'];
            box.userData = {
                stringProp: 'test string',
                numberProp: 123.45,
                booleanProp: true,
                nestedProp: { inner: 'value' },
            };
            box.visible = false;
            box.position = [1, 2, 3];
            box.rotation = [0.1, 0.2, 0.3];
            box.scale = [1.5, 2.0, 2.5];

            const boxId = scene.add(box);

            // Serialize
            const serialized = Serializer.serializeScene(scene);

            // Verify metadata in serialized data
            expect(serialized.metadata).toBeDefined();
            expect(serialized.metadata.objectCount).toBe(1);
            expect(serialized.metadata.created).toBeDefined();
            expect(serialized.metadata.modified).toBeDefined();

            // Deserialize
            scene.clear(true);
            await Serializer.deserializeScene(serialized, scene);

            // Verify all metadata is preserved
            const restored = scene.find(boxId);
            expect(restored.name).toBe('Rich Metadata Box');
            expect(restored.tags).toEqual(['important', 'test', 'metadata']);
            expect(restored.userData).toEqual({
                stringProp: 'test string',
                numberProp: 123.45,
                booleanProp: true,
                nestedProp: { inner: 'value' },
            });
            expect(restored.visible).toBe(false);
            expect(restored.position.x).toBeCloseTo(1, 5);
            expect(restored.position.y).toBeCloseTo(2, 5);
            expect(restored.position.z).toBeCloseTo(3, 5);
            expect(restored.rotation.x).toBeCloseTo(0.1, 5);
            expect(restored.rotation.y).toBeCloseTo(0.2, 5);
            expect(restored.rotation.z).toBeCloseTo(0.3, 5);
            expect(restored.scale.x).toBeCloseTo(1.5, 5);
            expect(restored.scale.y).toBeCloseTo(2.0, 5);
            expect(restored.scale.z).toBeCloseTo(2.5, 5);
        });

        test('preserves scene metadata structure', () => {
            scene.clear(true);

            const box = Box.create(1, 1, 1);
            scene.add(box);

            const sunLight = Light.sun({});
            scene.addLight(sunLight);

            const serialized = Serializer.serializeScene(scene);

            expect(serialized.metadata.objectCount).toBe(1);
            expect(serialized.metadata.lightCount).toBe(1);
            expect(serialized.metadata.author).toBe('kalythesainz-framework');
            expect(serialized.version).toBe('1.0.0');
        });
    });

    describe('validateData', () => {
        test('validates correct scene data', () => {
            const validData = {
                version: '1.0.0',
                metadata: {
                    created: new Date().toISOString(),
                },
                objects: [],
                lights: [],
            };

            expect(Serializer.validateData(validData)).toBe(true);
        });

        test('rejects null data', () => {
            expect(Serializer.validateData(null)).toBe(false);
        });

        test('rejects undefined data', () => {
            expect(Serializer.validateData(undefined)).toBe(false);
        });

        test('rejects data without version', () => {
            const invalidData = {
                metadata: {},
                objects: [],
            };

            expect(Serializer.validateData(invalidData)).toBe(false);
        });

        test('rejects data without metadata', () => {
            const invalidData = {
                version: '1.0.0',
                objects: [],
            };

            expect(Serializer.validateData(invalidData)).toBe(false);
        });

        test('rejects data with invalid objects type', () => {
            const invalidData = {
                version: '1.0.0',
                metadata: {},
                objects: 'not an array',
            };

            expect(Serializer.validateData(invalidData)).toBe(false);
        });

        test('rejects data with invalid lights type', () => {
            const invalidData = {
                version: '1.0.0',
                metadata: {},
                objects: [],
                lights: 'not an array',
            };

            expect(Serializer.validateData(invalidData)).toBe(false);
        });

        test('rejects objects without required fields', () => {
            const invalidData = {
                version: '1.0.0',
                metadata: {},
                objects: [{ name: 'Missing ID and type' }],
            };

            expect(Serializer.validateData(invalidData)).toBe(false);
        });
    });
});
