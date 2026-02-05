/**
 * Simple test runner for scene serialization without fast-check
 */

import './setup-standalone.js';
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

// Initialize scene once for all tests
let scene;
let container;

try {
    // Create container element
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Clear EventBus
    EventBus.clear();

    // Initialize scene
    scene = Scene.init('test-container', { autoStart: false });
    console.log('✓ Scene initialized for testing\n');
} catch (error) {
    console.error('✗ Failed to initialize scene:', error.message);
    process.exit(1);
}

function runTest(testName, testFn) {
    testsTotal++;
    console.log(`Testing ${testName}...`);

    try {
        const result = testFn();
        // Handle async test functions
        if (result && typeof result.then === 'function') {
            return result
                .then(() => {
                    testsPassed++;
                    console.log(`✓ ${testName} passed`);
                    console.log('');
                })
                .catch((error) => {
                    console.error(`✗ ${testName} failed:`, error.message);
                    if (error.stack) {
                        console.error(error.stack);
                    }
                    console.log('');
                });
        } else {
            testsPassed++;
            console.log(`✓ ${testName} passed`);
            console.log('');
            return Promise.resolve();
        }
    } catch (error) {
        console.error(`✗ ${testName} failed:`, error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        console.log('');
        return Promise.resolve();
    }
}

// Run tests sequentially
async function runAllTests() {
    // Test 1: Basic scene serialization round-trip
    await runTest('Basic scene serialization round-trip', async () => {
        // Clear the scene first
        scene.clear(true);

        // Create test objects
        const box = Box.create(2, 3, 4);
        box.name = 'Test Box';
        box.position = [1, 2, 3];
        box.visible = true;
        box.tags = ['test', 'box'];
        box.userData = { prop1: 'value1', prop2: 42 };

        const sphere = Sphere.create(1.5, 16);
        sphere.name = 'Test Sphere';
        sphere.position = [-1, 0, 2];
        sphere.visible = false;
        sphere.tags = ['test', 'sphere'];

        const plane = Plane.create(5, 5);
        plane.name = 'Test Plane';
        plane.position = [0, -1, 0];

        // Add objects to scene
        const boxId = scene.add(box);
        const sphereId = scene.add(sphere);
        const planeId = scene.add(plane);

        // Add lights
        const sunLight = Light.sun({ intensity: 0.8, position: [5, 10, 5] });
        const ambientLight = Light.ambient({ intensity: 0.3 });
        scene.addLight(sunLight);
        scene.addLight(ambientLight);

        // Update camera
        scene.camera.setPosition(10, 5, 10);
        scene.camera.setFov(60);

        // Serialize the scene
        const serializedData = Serializer.serializeScene(scene);

        // Validate serialized data
        if (!Serializer.validateData(serializedData)) {
            throw new Error('Serialized data validation failed');
        }

        if (serializedData.objects.length !== 3) {
            throw new Error(`Expected 3 objects, got ${serializedData.objects.length}`);
        }

        if (serializedData.lights.length !== 2) {
            throw new Error(`Expected 2 lights, got ${serializedData.lights.length}`);
        }

        // Clear and deserialize into the same scene
        scene.clear(true);
        await Serializer.deserializeScene(serializedData, scene);

        // Verify object count matches
        if (scene.objects.size !== 3) {
            throw new Error(`Object count mismatch: expected 3, got ${scene.objects.size}`);
        }

        if (scene.lights.length !== 2) {
            throw new Error(`Light count mismatch: expected 2, got ${scene.lights.length}`);
        }

        // Verify box object
        const restoredBox = scene.find(boxId);
        if (!restoredBox) {
            throw new Error('Box object not found after deserialization');
        }

        if (restoredBox.name !== 'Test Box') {
            throw new Error(`Box name mismatch: expected 'Test Box', got '${restoredBox.name}'`);
        }

        if (
            Math.abs(restoredBox.width - 2) > 0.001 ||
            Math.abs(restoredBox.height - 3) > 0.001 ||
            Math.abs(restoredBox.depth - 4) > 0.001
        ) {
            throw new Error(`Box dimensions mismatch`);
        }

        if (
            Math.abs(restoredBox.position.x - 1) > 0.001 ||
            Math.abs(restoredBox.position.y - 2) > 0.001 ||
            Math.abs(restoredBox.position.z - 3) > 0.001
        ) {
            throw new Error(`Box position mismatch`);
        }

        if (restoredBox.visible !== true) {
            throw new Error(`Box visibility mismatch`);
        }

        if (!restoredBox.tags.includes('test') || !restoredBox.tags.includes('box')) {
            throw new Error(`Box tags mismatch`);
        }

        if (restoredBox.userData.prop1 !== 'value1' || restoredBox.userData.prop2 !== 42) {
            throw new Error(`Box userData mismatch`);
        }

        // Verify sphere object
        const restoredSphere = scene.find(sphereId);
        if (!restoredSphere) {
            throw new Error('Sphere object not found after deserialization');
        }

        if (restoredSphere.name !== 'Test Sphere') {
            throw new Error(`Sphere name mismatch`);
        }

        if (Math.abs(restoredSphere.radius - 1.5) > 0.001) {
            throw new Error(`Sphere radius mismatch`);
        }

        if (restoredSphere.visible !== false) {
            throw new Error(`Sphere visibility mismatch`);
        }

        // Verify plane object
        const restoredPlane = scene.find(planeId);
        if (!restoredPlane) {
            throw new Error('Plane object not found after deserialization');
        }

        if (restoredPlane.name !== 'Test Plane') {
            throw new Error(`Plane name mismatch`);
        }

        if (
            Math.abs(restoredPlane.width - 5) > 0.001 ||
            Math.abs(restoredPlane.height - 5) > 0.001
        ) {
            throw new Error(`Plane dimensions mismatch`);
        }

        // Verify camera
        if (
            Math.abs(scene.camera.position.x - 10) > 0.001 ||
            Math.abs(scene.camera.position.y - 5) > 0.001 ||
            Math.abs(scene.camera.position.z - 10) > 0.001
        ) {
            throw new Error(`Camera position mismatch`);
        }

        if (Math.abs(scene.camera.threeCamera.fov - 60) > 0.001) {
            throw new Error(`Camera FOV mismatch`);
        }

        // Verify lights
        if (scene.lights[0].type !== 'directional' || scene.lights[1].type !== 'ambient') {
            throw new Error(`Light types mismatch`);
        }
    });

    // Test 2: Empty scene serialization
    await runTest('Empty scene serialization round-trip', () => {
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

        // Deserialize into the same scene
        Serializer.deserializeScene(serializedData, scene);

        // Verify empty scene
        if (scene.objects.size !== 0) {
            throw new Error(`Expected 0 objects after deserialization, got ${scene.objects.size}`);
        }

        if (scene.lights.length !== 0) {
            throw new Error(`Expected 0 lights after deserialization, got ${scene.lights.length}`);
        }
    });

    // Test 3: Error handling
    await runTest('Serialization error handling', async () => {
        // Test invalid scene serialization
        try {
            Serializer.serializeScene(null);
            throw new Error('Should have thrown error for null scene');
        } catch (error) {
            if (!error.message.includes('Scene is required')) {
                throw new Error(`Unexpected error message: ${error.message}`);
            }
        }

        // Test invalid data deserialization using the existing scene
        try {
            await Serializer.deserializeScene(null, scene);
            throw new Error('Should have thrown error for null data');
        } catch (error) {
            // Check for either "Invalid scene data" or "Scene deserialization failed"
            if (
                !error.message.includes('Invalid scene data') &&
                !error.message.includes('Scene deserialization failed')
            ) {
                throw new Error(`Unexpected error message: ${error.message}`);
            }
        }

        try {
            await Serializer.deserializeScene({}, scene);
            throw new Error('Should have thrown error for invalid data');
        } catch (error) {
            // Check for either "Missing version" or "Scene deserialization failed"
            if (
                !error.message.includes('Missing version') &&
                !error.message.includes('Scene deserialization failed')
            ) {
                throw new Error(`Unexpected error message: ${error.message}`);
            }
        }
    });

    // Clean up after all tests
    try {
        if (scene && !scene.isDisposed) {
            Scene.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        EventBus.clear();
    } catch (error) {
        // Ignore cleanup errors
        console.log('(Cleanup completed with minor warnings)');
    }

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
}

// Run all tests
runAllTests().catch((error) => {
    console.error('Fatal error running tests:', error.message);
    process.exit(1);
});
