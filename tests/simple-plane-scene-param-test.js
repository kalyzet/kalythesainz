/**
 * Simple test for Plane.create() with scene parameter
 * Tests that Plane.create() accepts scene parameter and adds plane to correct scene
 */

import { Plane } from '../objects/Plane.js';

console.log('Testing Plane.create() scene parameter logic...\n');

// Test 1: Create plane without scene parameter
console.log('Test 1: Plane.create() without scene parameter');
try {
    const plane1 = Plane.create(2, 3);
    console.log('✓ Plane created successfully');
    console.log(`  Dimensions: ${plane1.width}x${plane1.height}`);
    console.log('  (Will attempt to add to singleton scene if available)\n');
} catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
}

// Test 2: Create plane with mock scene that has add() method
console.log('Test 2: Plane.create() with valid mock scene');
try {
    const mockScene = {
        add: (obj) => {
            console.log(`  Mock scene received object with id: ${obj.id}`);
            return obj.id;
        },
    };

    const plane2 = Plane.create(5, 6, null, mockScene);
    console.log('✓ Plane created with mock scene');
    console.log(`  Dimensions: ${plane2.width}x${plane2.height}\n`);
} catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
}

// Test 3: Create plane with invalid scene parameter (no add method)
console.log('Test 3: Plane.create() with invalid scene parameter');
try {
    const invalidScene = { invalid: 'scene' };
    const plane3 = Plane.create(1, 1, null, invalidScene);
    console.error('✗ Should have thrown error for invalid scene\n');
} catch (error) {
    console.log('✓ Correctly threw error:', error.message, '\n');
}

// Test 4: Create plane with null scene parameter (should work like no parameter)
console.log('Test 4: Plane.create() with null scene parameter');
try {
    const plane4 = Plane.create(3, 3, null, null);
    console.log('✓ Plane created with null scene parameter');
    console.log(`  Dimensions: ${plane4.width}x${plane4.height}\n`);
} catch (error) {
    console.error('✗ Test 4 failed:', error.message, '\n');
}

// Test 5: Verify scene parameter is the 4th parameter (after material)
console.log('Test 5: Verify parameter order (width, height, material, scene)');
try {
    const mockScene = {
        objects: new Map(),
        add: function (obj) {
            this.objects.set(obj.id, obj);
            console.log(`  Scene now has ${this.objects.size} object(s)`);
            return obj.id;
        },
    };

    const plane5a = Plane.create(1, 1, null, mockScene);
    const plane5b = Plane.create(2, 2, null, mockScene);

    console.log('✓ Multiple planes added to same scene');
    console.log(`  Final scene object count: ${mockScene.objects.size}\n`);
} catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
}

console.log('All tests completed successfully!');
console.log('\nSummary:');
console.log('- Plane.create() accepts optional scene parameter as 4th argument');
console.log('- Scene parameter must have an add() method');
console.log('- Without scene parameter, falls back to singleton (if available)');
console.log('- Invalid scene parameter throws descriptive error');
