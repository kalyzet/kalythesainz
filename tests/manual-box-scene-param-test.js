/**
 * Manual test for Box.create() scene parameter
 * Tests that Box.create() correctly accepts scene parameter
 */

import { Box } from '../objects/Box.js';
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

console.log('Testing Box.create() with scene parameter...\n');

// Test 1: Create box with SceneInstance
console.log('Test 1: Box.create() with SceneInstance');
try {
    const scene1 = createScene('test-container-1');
    const box1 = Box.create(2, 3, 4, null, scene1);

    console.log('✓ Box created with SceneInstance');
    console.log(`  Box dimensions: ${box1.width}x${box1.height}x${box1.depth}`);
    console.log(`  Scene has ${scene1.objects.size} object(s)`);

    scene1.destroy();
    console.log('✓ Scene destroyed\n');
} catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
}

// Test 2: Create box without scene parameter (singleton fallback)
console.log('Test 2: Box.create() without scene parameter (singleton fallback)');
try {
    const box2 = Box.create(1, 1, 1);

    console.log('✓ Box created without scene parameter');
    console.log(`  Box dimensions: ${box2.width}x${box2.height}x${box2.depth}`);
    console.log('  (Should attempt to add to singleton scene if it exists)\n');
} catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
}

// Test 3: Create box with singleton Scene
console.log('Test 3: Box.create() with singleton Scene');
try {
    const singletonScene = Scene.init('test-container-singleton');
    const box3 = Box.create(5, 5, 5, null, singletonScene);

    console.log('✓ Box created with singleton Scene');
    console.log(`  Box dimensions: ${box3.width}x${box3.height}x${box3.depth}`);
    console.log(`  Scene has ${singletonScene.objects.size} object(s)`);

    Scene.destroy();
    console.log('✓ Singleton scene destroyed\n');
} catch (error) {
    console.error('✗ Test 3 failed:', error.message, '\n');
}

// Test 4: Invalid scene parameter
console.log('Test 4: Box.create() with invalid scene parameter');
try {
    const box4 = Box.create(1, 1, 1, null, { invalid: 'scene' });
    console.error('✗ Should have thrown error for invalid scene\n');
} catch (error) {
    console.log('✓ Correctly threw error:', error.message, '\n');
}

// Test 5: Multiple scenes with different boxes
console.log('Test 5: Multiple scenes with different boxes');
try {
    const sceneA = createScene('test-container-a');
    const sceneB = createScene('test-container-b');

    const boxA = Box.create(1, 1, 1, null, sceneA);
    const boxB = Box.create(2, 2, 2, null, sceneB);

    console.log('✓ Created boxes in different scenes');
    console.log(`  Scene A has ${sceneA.objects.size} object(s)`);
    console.log(`  Scene B has ${sceneB.objects.size} object(s)`);

    sceneA.destroy();
    sceneB.destroy();
    console.log('✓ Both scenes destroyed\n');
} catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
}

console.log('All tests completed!');
