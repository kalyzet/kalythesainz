/**
 * Manual test for Sphere.create() scene parameter
 * Tests that Sphere.create() correctly accepts scene parameter
 */

import { Sphere } from '../objects/Sphere.js';
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

console.log('Testing Sphere.create() with scene parameter...\n');

// Test 1: Create sphere with SceneInstance
console.log('Test 1: Sphere.create() with SceneInstance');
try {
    const scene1 = createScene('test-container-1');
    const sphere1 = Sphere.create(2, 16, null, scene1);

    console.log('✓ Sphere created with SceneInstance');
    console.log(
        `  Sphere radius: ${sphere1.radius}, segments: ${sphere1.widthSegments}x${sphere1.heightSegments}`,
    );
    console.log(`  Scene has ${scene1.objects.size} object(s)`);

    scene1.destroy();
    console.log('✓ Scene destroyed\n');
} catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
}

// Test 2: Create sphere without scene parameter (singleton fallback)
console.log('Test 2: Sphere.create() without scene parameter (singleton fallback)');
try {
    const sphere2 = Sphere.create(1.5, 32);

    console.log('✓ Sphere created without scene parameter');
    console.log(
        `  Sphere radius: ${sphere2.radius}, segments: ${sphere2.widthSegments}x${sphere2.heightSegments}`,
    );
    console.log('  (Should attempt to add to singleton scene if it exists)\n');
} catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
}

// Test 3: Create sphere with singleton Scene
console.log('Test 3: Sphere.create() with singleton Scene');
try {
    const singletonScene = Scene.init('test-container-singleton');
    const sphere3 = Sphere.create(3, 24, null, singletonScene);

    console.log('✓ Sphere created with singleton Scene');
    console.log(
        `  Sphere radius: ${sphere3.radius}, segments: ${sphere3.widthSegments}x${sphere3.heightSegments}`,
    );
    console.log(`  Scene has ${singletonScene.objects.size} object(s)`);

    Scene.destroy();
    console.log('✓ Singleton scene destroyed\n');
} catch (error) {
    console.error('✗ Test 3 failed:', error.message, '\n');
}

// Test 4: Invalid scene parameter
console.log('Test 4: Sphere.create() with invalid scene parameter');
try {
    Sphere.create(1, 16, null, { invalid: 'scene' });
    console.error('✗ Should have thrown error for invalid scene\n');
} catch (error) {
    console.log('✓ Correctly threw error:', error.message, '\n');
}

// Test 5: Multiple scenes with different spheres
console.log('Test 5: Multiple scenes with different spheres');
try {
    const sceneA = createScene('test-container-a');
    const sceneB = createScene('test-container-b');

    const sphereA = Sphere.create(1, 16, null, sceneA);
    const sphereB = Sphere.create(2, 32, null, sceneB);

    console.log('✓ Created spheres in different scenes');
    console.log(
        `  Scene A has ${sceneA.objects.size} object(s) (sphere radius: ${sphereA.radius})`,
    );
    console.log(
        `  Scene B has ${sceneB.objects.size} object(s) (sphere radius: ${sphereB.radius})`,
    );

    sceneA.destroy();
    sceneB.destroy();
    console.log('✓ Both scenes destroyed\n');
} catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
}

console.log('All tests completed!');
