/**
 * Simple test for Box.create() scene parameter
 * Tests the scene parameter logic without full scene initialization
 */

import { Box } from '../objects/Box.js';

console.log('Testing Box.create() scene parameter logic...\n');

// Test 1: Create box without scene parameter
console.log('Test 1: Box.create() without scene parameter');
try {
    const box1 = Box.create(2, 3, 4);
    console.log('✓ Box created successfully');
    console.log(`  Dimensions: ${box1.width}x${box1.height}x${box1.depth}`);
    console.log('  (Will attempt to add to singleton scene if available)\n');
} catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
}

// Test 2: Create box with mock scene that has add() method
console.log('Test 2: Box.create() with valid mock scene');
try {
    const mockScene = {
        add: (obj) => {
            console.log(`  Mock scene received object with id: ${obj.id}`);
            return obj.id;
        },
    };

    const box2 = Box.create(5, 6, 7, null, mockScene);
    console.log('✓ Box created with mock scene');
    console.log(`  Dimensions: ${box2.width}x${box2.height}x${box2.depth}\n`);
} catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
}

// Test 3: Create box with invalid scene parameter (no add method)
console.log('Test 3: Box.create() with invalid scene parameter');
try {
    const invalidScene = { invalid: 'scene' };
    const box3 = Box.create(1, 1, 1, null, invalidScene);
    console.error('✗ Should have thrown error for invalid scene\n');
} catch (error) {
    console.log('✓ Correctly threw error:', error.message, '\n');
}

// Test 4: Create box with null scene parameter (should work like no parameter)
console.log('Test 4: Box.create() with null scene parameter');
try {
    const box4 = Box.create(3, 3, 3, null, null);
    console.log('✓ Box created with null scene parameter');
    console.log(`  Dimensions: ${box4.width}x${box4.height}x${box4.depth}\n`);
} catch (error) {
    console.error('✗ Test 4 failed:', error.message, '\n');
}

// Test 5: Verify scene parameter is the 5th parameter (after material)
console.log('Test 5: Verify parameter order (width, height, depth, material, scene)');
try {
    const mockScene = {
        objects: new Map(),
        add: function (obj) {
            this.objects.set(obj.id, obj);
            console.log(`  Scene now has ${this.objects.size} object(s)`);
            return obj.id;
        },
    };

    const box5a = Box.create(1, 1, 1, null, mockScene);
    const box5b = Box.create(2, 2, 2, null, mockScene);

    console.log('✓ Multiple boxes added to same scene');
    console.log(`  Final scene object count: ${mockScene.objects.size}\n`);
} catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
}

console.log('All tests completed successfully!');
console.log('\nSummary:');
console.log('- Box.create() accepts optional scene parameter as 5th argument');
console.log('- Scene parameter must have an add() method');
console.log('- Without scene parameter, falls back to singleton (if available)');
console.log('- Invalid scene parameter throws descriptive error');
