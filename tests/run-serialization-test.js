/**
 * Test runner for scene serialization property tests
 */

import './setup.js';
import fc from 'fast-check';
import { Scene } from '../engine/Scene.js';
import { Box } from '../objects/Box.js';
import { Sphere } from '../objects/Sphere.js';
import { Plane } from '../objects/Plane.js';
import { Light } from '../engine/Light.js';
import { Serializer } from '../utils/Serializer.js';
import { EventBus } from '../core/EventBus.js';

console.log('**Feature: kalythesainz-framework, Property 4: Scene serialization round-trip**');
console.log('**Validates: Requirements 3.1, 3.2, 3.3**');
console.log('');

let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFn) {
    testsTotal++;
    console.log(`Testing ${testName}...`);

    try {
        testFn();
        testsPassed++;
        console.log(`✓ ${testName} passed`);
    } catch (error) {
        console.error(`✗ ${testName} failed:`, error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
    console.log('');
}

// Test 1: Basic scene serialization round-trip
runTest('Property 4: Scene serialization round-trip', () => {
    let scene;
    let container;

    try {
        // Create container element
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Clear EventBus
        EventBus.clear();

        // Destroy any existing scene
        if (Scene.isInitialized()) {
            Scene.destroy();
        }

        // Initialize scene
        scene = Scene.init('test-container', { autoStart: false });

        fc.assert(
            fc.property(
                // Generate simple scene configuration
                fc.record({
                    objects: fc.array(
                        fc.record({
                            type: fc.constant('Box'),
                            width: fc.float({ min: 0.5, max: 5 }),
                            height: fc.float({ min: 0.5, max: 5 }),
                            depth: fc.float({ min: 0.5, max: 5 }),
                            name: fc.string({ minLength: 1, maxLength: 20 }),
                            position: fc.array(fc.float({ min: -10, max: 10 }), {
                                minLength: 3,
                                maxLength: 3,
                            }),
                            visible: fc.boolean(),
                            tags: fc.array(fc.string({ minLength: 1, maxLength: 10 }), {
                                maxLength: 3,
                            }),
                        }),
                        { maxLength: 3 },
                    ),
                    camera: fc.record({
                        position: fc.array(fc.float({ min: -20, max: 20 }), {
                            minLength: 3,
                            maxLength: 3,
                        }),
                        fov: fc.float({ min: 30, max: 120 }),
                    }),
                }),
                (sceneConfig) => {
                    try {
                        // Clear the scene first
                        scene.clear(true);

                        // Create and add objects to scene
                        const createdObjects = [];
                        for (const objConfig of sceneConfig.objects) {
                            const object = Box.create(
                                objConfig.width,
                                objConfig.height,
                                objConfig.depth,
                            );

                            // Set object properties
                            object.name = objConfig.name;
                            object.position = objConfig.position;
                            object.visible = objConfig.visible;
                            object.tags = objConfig.tags;

                            const objectId = scene.add(object);
                            createdObjects.push({ object, id: objectId, config: objConfig });
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
                        if (!Serializer.validateData(serializedData)) {
                            throw new Error('Serialized data validation failed');
                        }

                        // Create a new scene for deserialization
                        Scene.destroy();
                        const newScene = Scene.init('test-container', { autoStart: false });

                        // Deserialize into the new scene
                        Serializer.deserializeScene(serializedData, newScene);

                        // Verify object count matches
                        if (newScene.objects.size !== createdObjects.length) {
                            throw new Error(
                                `Object count mismatch: expected ${createdObjects.length}, got ${newScene.objects.size}`,
                            );
                        }

                        // Verify each object was restored correctly
                        for (const { config, id } of createdObjects) {
                            const restoredObject = newScene.find(id);
                            if (!restoredObject) {
                                throw new Error(
                                    `Object with ID ${id} not found after deserialization`,
                                );
                            }

                            // Check object properties
                            if (restoredObject.name !== config.name) {
                                throw new Error(
                                    `Name mismatch: expected ${config.name}, got ${restoredObject.name}`,
                                );
                            }

                            if (restoredObject.visible !== config.visible) {
                                throw new Error(
                                    `Visibility mismatch: expected ${config.visible}, got ${restoredObject.visible}`,
                                );
                            }

                            // Check transform properties (with tolerance for floating point)
                            const tolerance = 0.001;
                            if (
                                Math.abs(restoredObject.position.x - config.position[0]) >
                                    tolerance ||
                                Math.abs(restoredObject.position.y - config.position[1]) >
                                    tolerance ||
                                Math.abs(restoredObject.position.z - config.position[2]) > tolerance
                            ) {
                                throw new Error(
                                    `Position mismatch: expected [${config.position}], got [${restoredObject.position.x}, ${restoredObject.position.y}, ${restoredObject.position.z}]`,
                                );
                            }

                            // Check type-specific properties
                            if (
                                Math.abs(restoredObject.width - config.width) > tolerance ||
                                Math.abs(restoredObject.height - config.height) > tolerance ||
                                Math.abs(restoredObject.depth - config.depth) > tolerance
                            ) {
                                throw new Error(
                                    `Dimensions mismatch: expected [${config.width}, ${config.height}, ${config.depth}], got [${restoredObject.width}, ${restoredObject.height}, ${restoredObject.depth}]`,
                                );
                            }
                        }

                        // Verify camera was restored correctly
                        const tolerance = 0.001;
                        if (
                            Math.abs(newScene.camera.position.x - sceneConfig.camera.position[0]) >
                                tolerance ||
                            Math.abs(newScene.camera.position.y - sceneConfig.camera.position[1]) >
                                tolerance ||
                            Math.abs(newScene.camera.position.z - sceneConfig.camera.position[2]) >
                                tolerance
                        ) {
                            throw new Error(`Camera position mismatch`);
                        }

                        if (
                            Math.abs(newScene.camera.threeCamera.fov - sceneConfig.camera.fov) >
                            tolerance
                        ) {
                            throw new Error(`Camera FOV mismatch`);
                        }

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
            { numRuns: 50 },
        );
    } finally {
        // Clean up
        if (scene && !scene.isDisposed) {
            Scene.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        EventBus.clear();
    }
});

// Test 2: Empty scene serialization
runTest('Empty scene serialization round-trip', () => {
    let scene;
    let container;

    try {
        // Create container element
        container = document.createElement('div');
        container.id = 'test-container-2';
        document.body.appendChild(container);

        // Clear EventBus
        EventBus.clear();

        // Destroy any existing scene
        if (Scene.isInitialized()) {
            Scene.destroy();
        }

        // Initialize scene
        scene = Scene.init('test-container-2', { autoStart: false });

        // Clear the scene
        scene.clear(true);

        // Serialize the empty scene
        const serializedData = Serializer.serializeScene(scene);

        // Validate serialized data
        if (!Serializer.validateData(serializedData)) {
            throw new Error('Empty scene serialization validation failed');
        }

        if (serializedData.objects.length !== 0) {
            throw new Error(`Expected 0 objects, got ${serializedData.objects.length}`);
        }

        if (serializedData.lights.length !== 0) {
            throw new Error(`Expected 0 lights, got ${serializedData.lights.length}`);
        }

        // Create a new scene for deserialization
        Scene.destroy();
        const newScene = Scene.init('test-container-2', { autoStart: false });

        // Deserialize into the new scene
        Serializer.deserializeScene(serializedData, newScene);

        // Verify empty scene
        if (newScene.objects.size !== 0) {
            throw new Error(
                `Expected 0 objects after deserialization, got ${newScene.objects.size}`,
            );
        }

        if (newScene.lights.length !== 0) {
            throw new Error(
                `Expected 0 lights after deserialization, got ${newScene.lights.length}`,
            );
        }

        Scene.destroy();
    } finally {
        // Clean up
        if (scene && !scene.isDisposed) {
            Scene.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        EventBus.clear();
    }
});

// Summary
console.log(`\n=== Test Results ===`);
console.log(`Tests passed: ${testsPassed}/${testsTotal}`);

if (testsPassed === testsTotal) {
    console.log('✅ All serialization property tests passed successfully!');
    console.log('Scene serialization round-trip property verified.');
} else {
    console.log('❌ Some tests failed.');
    process.exit(1);
}
