/**
 * Property-based tests for scene serialization round-trip
 * **Feature: kalythesainz-framework, Property 4: Scene serialization round-trip**
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */

import fc from 'fast-check';
import { Scene } from '../../engine/Scene.js';
import { Box } from '../../objects/Box.js';
import { Sphere } from '../../objects/Sphere.js';
import { Plane } from '../../objects/Plane.js';
import { Light } from '../../engine/Light.js';
import { Camera } from '../../engine/Camera.js';
import { Serializer } from '../../utils/Serializer.js';
import { EventBus } from '../../core/EventBus.js';

// Use the global THREE mock from test setup
const THREE = global.THREE;

describe('Scene Serialization Property Tests', () => {
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

    /**
     * **Feature: kalythesainz-framework, Property 4: Scene serialization round-trip**
     * **Validates: Requirements 3.1, 3.2, 3.3**
     *
     * For any valid scene configuration, serializing then deserializing should produce
     * an equivalent scene with identical object properties, transforms, and metadata
     */
    test('scene serialization round-trip preserves all data', () => {
        fc.assert(
            fc.property(
                // Generate scene configuration
                fc.record({
                    objects: fc.array(
                        fc.oneof(
                            // Box objects
                            fc.record({
                                type: fc.constant('Box'),
                                width: fc.float({ min: 0.1, max: 10 }),
                                height: fc.float({ min: 0.1, max: 10 }),
                                depth: fc.float({ min: 0.1, max: 10 }),
                                name: fc.string({ minLength: 1, maxLength: 50 }),
                                position: fc.array(fc.float({ min: -100, max: 100 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                rotation: fc.array(fc.float({ min: -Math.PI, max: Math.PI }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                scale: fc.array(fc.float({ min: 0.1, max: 5 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                visible: fc.boolean(),
                                tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                                    maxLength: 5,
                                }),
                                userData: fc.record(
                                    {
                                        prop1: fc.string(),
                                        prop2: fc.integer(),
                                        prop3: fc.boolean(),
                                    },
                                    { requiredKeys: [] },
                                ),
                            }),
                            // Sphere objects
                            fc.record({
                                type: fc.constant('Sphere'),
                                radius: fc.float({ min: 0.1, max: 10 }),
                                segments: fc.integer({ min: 8, max: 64 }),
                                name: fc.string({ minLength: 1, maxLength: 50 }),
                                position: fc.array(fc.float({ min: -100, max: 100 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                rotation: fc.array(fc.float({ min: -Math.PI, max: Math.PI }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                scale: fc.array(fc.float({ min: 0.1, max: 5 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                visible: fc.boolean(),
                                tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                                    maxLength: 5,
                                }),
                                userData: fc.record(
                                    {
                                        prop1: fc.string(),
                                        prop2: fc.integer(),
                                        prop3: fc.boolean(),
                                    },
                                    { requiredKeys: [] },
                                ),
                            }),
                            // Plane objects
                            fc.record({
                                type: fc.constant('Plane'),
                                width: fc.float({ min: 0.1, max: 10 }),
                                height: fc.float({ min: 0.1, max: 10 }),
                                name: fc.string({ minLength: 1, maxLength: 50 }),
                                position: fc.array(fc.float({ min: -100, max: 100 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                rotation: fc.array(fc.float({ min: -Math.PI, max: Math.PI }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                scale: fc.array(fc.float({ min: 0.1, max: 5 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                visible: fc.boolean(),
                                tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                                    maxLength: 5,
                                }),
                                userData: fc.record(
                                    {
                                        prop1: fc.string(),
                                        prop2: fc.integer(),
                                        prop3: fc.boolean(),
                                    },
                                    { requiredKeys: [] },
                                ),
                            }),
                        ),
                        { maxLength: 10 },
                    ),
                    lights: fc.array(
                        fc.oneof(
                            // Directional light
                            fc.record({
                                type: fc.constant('directional'),
                                intensity: fc.float({ min: 0, max: 2 }),
                                color: fc.integer({ min: 0x000000, max: 0xffffff }),
                                position: fc.array(fc.float({ min: -50, max: 50 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                target: fc.array(fc.float({ min: -10, max: 10 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                            }),
                            // Ambient light
                            fc.record({
                                type: fc.constant('ambient'),
                                intensity: fc.float({ min: 0, max: 1 }),
                                color: fc.integer({ min: 0x000000, max: 0xffffff }),
                            }),
                            // Point light
                            fc.record({
                                type: fc.constant('point'),
                                intensity: fc.float({ min: 0, max: 2 }),
                                color: fc.integer({ min: 0x000000, max: 0xffffff }),
                                position: fc.array(fc.float({ min: -50, max: 50 }), {
                                    minLength: 3,
                                    maxLength: 3,
                                }),
                                distance: fc.float({ min: 0, max: 100 }),
                                decay: fc.float({ min: 1, max: 3 }),
                            }),
                        ),
                        { maxLength: 5 },
                    ),
                    camera: fc.record({
                        position: fc.array(fc.float({ min: -100, max: 100 }), {
                            minLength: 3,
                            maxLength: 3,
                        }),
                        fov: fc.float({ min: 10, max: 170 }),
                    }),
                }),
                (sceneConfig) => {
                    try {
                        // Clear the scene first
                        scene.clear(true);

                        // Create and add objects to scene
                        const createdObjects = [];
                        for (const objConfig of sceneConfig.objects) {
                            let object;

                            switch (objConfig.type) {
                                case 'Box':
                                    object = Box.create(
                                        objConfig.width,
                                        objConfig.height,
                                        objConfig.depth,
                                    );
                                    break;
                                case 'Sphere':
                                    object = Sphere.create(objConfig.radius, objConfig.segments);
                                    break;
                                case 'Plane':
                                    object = Plane.create(objConfig.width, objConfig.height);
                                    break;
                                default:
                                    continue;
                            }

                            // Set object properties
                            object.name = objConfig.name;
                            object.position = objConfig.position;
                            object.rotation = objConfig.rotation;
                            object.scale = objConfig.scale;
                            object.visible = objConfig.visible;
                            object.tags = objConfig.tags;
                            object.userData = objConfig.userData;

                            const objectId = scene.add(object);
                            createdObjects.push({ object, id: objectId, config: objConfig });
                        }

                        // Add lights to scene
                        const createdLights = [];
                        for (const lightConfig of sceneConfig.lights) {
                            let light;

                            switch (lightConfig.type) {
                                case 'directional':
                                    light = Light.sun({
                                        intensity: lightConfig.intensity,
                                        color: lightConfig.color,
                                        position: lightConfig.position,
                                        target: lightConfig.target,
                                    });
                                    break;
                                case 'ambient':
                                    light = Light.ambient({
                                        intensity: lightConfig.intensity,
                                        color: lightConfig.color,
                                    });
                                    break;
                                case 'point':
                                    light = Light.point(
                                        lightConfig.position[0],
                                        lightConfig.position[1],
                                        lightConfig.position[2],
                                        {
                                            intensity: lightConfig.intensity,
                                            color: lightConfig.color,
                                            distance: lightConfig.distance,
                                            decay: lightConfig.decay,
                                        },
                                    );
                                    break;
                                default:
                                    continue;
                            }

                            scene.addLight(light);
                            createdLights.push({ light, config: lightConfig });
                        }

                        // Update camera
                        scene.camera.setPosition(
                            sceneConfig.camera.position[0],
                            sceneConfig.camera.position[1],
                            sceneConfig.camera.position[2],
                        );
                        scene.camera.setFov(sceneConfig.camera.fov);

                        // Serialize the scene
                        const serializedData = Serializer.serializeScene(scene);

                        // Validate serialized data
                        expect(Serializer.validateData(serializedData)).toBe(true);

                        // Create a new scene for deserialization
                        Scene.destroy();
                        const newScene = Scene.init('test-container', { autoStart: false });

                        // Deserialize into the new scene
                        Serializer.deserializeScene(serializedData, newScene);

                        // Verify object count matches
                        expect(newScene.objects.size).toBe(createdObjects.length);
                        expect(newScene.lights.length).toBe(createdLights.length);

                        // Verify each object was restored correctly
                        for (const { config, id } of createdObjects) {
                            const restoredObject = newScene.find(id);
                            expect(restoredObject).toBeDefined();

                            // Check object properties
                            expect(restoredObject.name).toBe(config.name);
                            expect(restoredObject.visible).toBe(config.visible);
                            expect(restoredObject.tags).toEqual(config.tags);
                            expect(restoredObject.userData).toEqual(config.userData);

                            // Check transform properties (with tolerance for floating point)
                            expect(restoredObject.position.x).toBeCloseTo(config.position[0], 5);
                            expect(restoredObject.position.y).toBeCloseTo(config.position[1], 5);
                            expect(restoredObject.position.z).toBeCloseTo(config.position[2], 5);

                            expect(restoredObject.rotation.x).toBeCloseTo(config.rotation[0], 5);
                            expect(restoredObject.rotation.y).toBeCloseTo(config.rotation[1], 5);
                            expect(restoredObject.rotation.z).toBeCloseTo(config.rotation[2], 5);

                            expect(restoredObject.scale.x).toBeCloseTo(config.scale[0], 5);
                            expect(restoredObject.scale.y).toBeCloseTo(config.scale[1], 5);
                            expect(restoredObject.scale.z).toBeCloseTo(config.scale[2], 5);

                            // Check type-specific properties
                            if (config.type === 'Box') {
                                expect(restoredObject.width).toBeCloseTo(config.width, 5);
                                expect(restoredObject.height).toBeCloseTo(config.height, 5);
                                expect(restoredObject.depth).toBeCloseTo(config.depth, 5);
                            } else if (config.type === 'Sphere') {
                                expect(restoredObject.radius).toBeCloseTo(config.radius, 5);
                                expect(restoredObject.segments).toBe(config.segments);
                            } else if (config.type === 'Plane') {
                                expect(restoredObject.width).toBeCloseTo(config.width, 5);
                                expect(restoredObject.height).toBeCloseTo(config.height, 5);
                            }
                        }

                        // Verify lights were restored correctly
                        for (let i = 0; i < createdLights.length; i++) {
                            const { config } = createdLights[i];
                            const restoredLight = newScene.lights[i];

                            expect(restoredLight.type).toBe(config.type);
                            expect(restoredLight.threeLight.intensity).toBeCloseTo(
                                config.intensity,
                                5,
                            );
                            expect(restoredLight.threeLight.color.getHex()).toBe(config.color);

                            if (config.position) {
                                expect(restoredLight.position.x).toBeCloseTo(config.position[0], 5);
                                expect(restoredLight.position.y).toBeCloseTo(config.position[1], 5);
                                expect(restoredLight.position.z).toBeCloseTo(config.position[2], 5);
                            }
                        }

                        // Verify camera was restored correctly
                        expect(newScene.camera.position.x).toBeCloseTo(
                            sceneConfig.camera.position[0],
                            5,
                        );
                        expect(newScene.camera.position.y).toBeCloseTo(
                            sceneConfig.camera.position[1],
                            5,
                        );
                        expect(newScene.camera.position.z).toBeCloseTo(
                            sceneConfig.camera.position[2],
                            5,
                        );
                        expect(newScene.camera.threeCamera.fov).toBeCloseTo(
                            sceneConfig.camera.fov,
                            5,
                        );

                        // Clean up the new scene
                        Scene.destroy();
                    } catch (error) {
                        // Clean up on error
                        if (Scene.isInitialized()) {
                            Scene.destroy();
                        }
                        throw error;
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    test('empty scene serialization round-trip', () => {
        fc.assert(
            fc.property(
                fc.record({
                    camera: fc.record({
                        position: fc.array(fc.float({ min: -100, max: 100 }), {
                            minLength: 3,
                            maxLength: 3,
                        }),
                        fov: fc.float({ min: 10, max: 170 }),
                    }),
                }),
                (sceneConfig) => {
                    try {
                        // Clear the scene
                        scene.clear(true);

                        // Update camera
                        scene.camera.setPosition(
                            sceneConfig.camera.position[0],
                            sceneConfig.camera.position[1],
                            sceneConfig.camera.position[2],
                        );
                        scene.camera.setFov(sceneConfig.camera.fov);

                        // Serialize the empty scene
                        const serializedData = Serializer.serializeScene(scene);

                        // Validate serialized data
                        expect(Serializer.validateData(serializedData)).toBe(true);
                        expect(serializedData.objects).toHaveLength(0);
                        expect(serializedData.lights).toHaveLength(0);

                        // Create a new scene for deserialization
                        Scene.destroy();
                        const newScene = Scene.init('test-container', { autoStart: false });

                        // Deserialize into the new scene
                        Serializer.deserializeScene(serializedData, newScene);

                        // Verify empty scene
                        expect(newScene.objects.size).toBe(0);
                        expect(newScene.lights.length).toBe(0);

                        // Verify camera was restored correctly
                        expect(newScene.camera.position.x).toBeCloseTo(
                            sceneConfig.camera.position[0],
                            5,
                        );
                        expect(newScene.camera.position.y).toBeCloseTo(
                            sceneConfig.camera.position[1],
                            5,
                        );
                        expect(newScene.camera.position.z).toBeCloseTo(
                            sceneConfig.camera.position[2],
                            5,
                        );
                        expect(newScene.camera.threeCamera.fov).toBeCloseTo(
                            sceneConfig.camera.fov,
                            5,
                        );

                        // Clean up
                        Scene.destroy();
                    } catch (error) {
                        if (Scene.isInitialized()) {
                            Scene.destroy();
                        }
                        throw error;
                    }
                },
            ),
            { numRuns: 50 },
        );
    });

    test('serialization preserves metadata integrity', () => {
        fc.assert(
            fc.property(
                fc.record({
                    objects: fc.array(
                        fc.record({
                            type: fc.constant('Box'),
                            width: fc.float({ min: 0.1, max: 5 }),
                            height: fc.float({ min: 0.1, max: 5 }),
                            depth: fc.float({ min: 0.1, max: 5 }),
                            name: fc.string({ minLength: 1, maxLength: 30 }),
                            tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), {
                                maxLength: 3,
                            }),
                            userData: fc.record({
                                stringProp: fc.string(),
                                numberProp: fc.integer(),
                                booleanProp: fc.boolean(),
                            }),
                        }),
                        { minLength: 1, maxLength: 5 },
                    ),
                }),
                (sceneConfig) => {
                    try {
                        // Clear the scene
                        scene.clear(true);

                        // Create objects
                        for (const objConfig of sceneConfig.objects) {
                            const object = Box.create(
                                objConfig.width,
                                objConfig.height,
                                objConfig.depth,
                            );
                            object.name = objConfig.name;
                            object.tags = objConfig.tags;
                            object.userData = objConfig.userData;
                            scene.add(object);
                        }

                        // Serialize and deserialize
                        const serializedData = Serializer.serializeScene(scene);

                        Scene.destroy();
                        const newScene = Scene.init('test-container', { autoStart: false });
                        Serializer.deserializeScene(serializedData, newScene);

                        // Verify metadata is preserved
                        expect(serializedData.metadata).toBeDefined();
                        expect(serializedData.metadata.objectCount).toBe(
                            sceneConfig.objects.length,
                        );
                        expect(serializedData.version).toBe('1.0.0');

                        // Verify all objects have correct metadata
                        const restoredObjects = Array.from(newScene.objects.values());
                        expect(restoredObjects).toHaveLength(sceneConfig.objects.length);

                        for (let i = 0; i < sceneConfig.objects.length; i++) {
                            const originalConfig = sceneConfig.objects[i];
                            const restoredObject = restoredObjects[i].object;

                            expect(restoredObject.name).toBe(originalConfig.name);
                            expect(restoredObject.tags).toEqual(originalConfig.tags);
                            expect(restoredObject.userData).toEqual(originalConfig.userData);
                        }

                        Scene.destroy();
                    } catch (error) {
                        if (Scene.isInitialized()) {
                            Scene.destroy();
                        }
                        throw error;
                    }
                },
            ),
            { numRuns: 50 },
        );
    });
});
