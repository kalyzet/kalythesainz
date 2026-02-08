/**
 * Manual test for Plane.create() with scene parameter
 * Tests that Plane.create() correctly accepts scene parameter
 */

import { Plane } from '../objects/Plane.js';
import { createScene } from '../index.js';
import { Scene } from '../engine/Scene.js';

// Mock DOM
global.document = {
    getElementById: () => ({
        appendChild: () => {},
        removeChild: () => {},
        style: {},
    }),
    createElement: () => ({
        style: {},
        getContext: () => ({
            getExtension: () => null,
        }),
    }),
};

console.log('Testing Plane.create() with scene parameter...\n');

// Test 1: Create plane with SceneInstance
console.log('Test 1: Plane.create() with SceneInstance');
try {
    const scene1 = createScene('test-container-1');
    const plane1 = Plane.create(2, 3, null, scene1);

    console.log('✓ Plane created with SceneInstance');
    console.log(`  Plane dimensions: ${plane1.width}x${plane1.height}`);
    console.log(`  Scene has ${scene1.objects.size} object(s)`);

    scene1.destroy();
    console.log('✓ Scene destroyed\n');
} catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
}

// Test 2: Create plane without scene parameter (singleton fallback)
console.log('Test 2: Plane.create() without scene parameter (singleton fallback)');
try {
    const plane2 = Plane.create(1, 1);

    console.log('✓ Plane created without scene parameter');
    console.log(`  Plane dimensions: ${plane2.width}x${plane2.height}`);
    console.log('  (Should attempt to add to singleton scene if it exists)\n');
} catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
}

// Test 3: Create plane with singleton Scene
console.log('Test 3: Plane.create() with singleton Scene');
try {
    const singletonScene = Scene.init('test-container-singleton');
    const plane3 = Plane.create(5, 5, null, singletonScene);

    console.log('✓ Plane created with singleton Scene');
    console.log(`  Plane dimensions: ${plane3.width}x${plane3.height}`);
    console.log(`  Scene has ${singletonScene.objects.size} object(s)`);

    Scene.destroy();
    console.log('✓ Singleton scene destroyed\n');
} catch (error) {
    console.error('✗ Test 3 failed:', error.message, '\n');
}

// Test 4: Invalid scene parameter
console.log('Test 4: Plane.create() with invalid scene parameter');
try {
    const plane4 = Plane.create(1, 1, null, { invalid: 'scene' });
    console.error('✗ Should have thrown error for invalid scene\n');
} catch (error) {
    console.log('✓ Correctly threw error:', error.message, '\n');
}

// Test 5: Multiple scenes with different planes
console.log('Test 5: Multiple scenes with different planes');
try {
    const sceneA = createScene('test-container-a');
    const sceneB = createScene('test-container-b');

    const planeA = Plane.create(1, 1, null, sceneA);
    const planeB = Plane.create(2, 2, null, sceneB);

    console.log('✓ Created planes in different scenes');
    console.log(`  Scene A has ${sceneA.objects.size} object(s)`);
    console.log(`  Scene B has ${sceneB.objects.size} object(s)`);

    sceneA.destroy();
    sceneB.destroy();
    console.log('✓ Both scenes destroyed\n');
} catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
}

console.log('All tests completed!');
