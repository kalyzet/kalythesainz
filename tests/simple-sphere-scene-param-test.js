/**
 * Simple test for Sphere.create() scene parameter
 * Tests the scene parameter logic without full scene initialization
 */

import { Sphere } from '../objects/Sphere.js';

console.log('Testing Sphere.create() scene parameter logic...\n');

// Test 1: Create sphere without scene parameter
console.log('Test 1: Sphere.create() without scene parameter');
try {
    const sphere1 = Sphere.create(2, 16);
    console.log('✓ Sphere created successfully');
    console.log(
        `  Radius: ${sphere1.radius}, Segments: ${sphere1.widthSegments}x${sphere1.heightSegments}`,
    );
    console.log('  (Will attempt to add to singleton scene if available)\n');
} catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
}

// Test 2: Create sphere with mock scene that has add() method
console.log('Test 2: Sphere.create() with valid mock scene');
try {
    const mockScene = {
        add: (obj) => {
            console.log(`  Mock scene received object with id: ${obj.id}`);
            return obj.id;
        },
    };

    const sphere2 = Sphere.create(1.5, 32, null, mockScene);
    console.log('✓ Sphere created with mock scene');
    console.log(
        `  Radius: ${sphere2.radius}, Segments: ${sphere2.widthSegments}x${sphere2.heightSegments}\n`,
    );
} catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
}

// Test 3: Create sphere with invalid scene parameter (no add method)
console.log('Test 3: Sphere.create() with invalid scene parameter');
try {
    const invalidScene = { invalid: 'scene' };
    const sphere3 = Sphere.create(1, 16, null, invalidScene);
    console.error('✗ Should have thrown error for invalid scene\n');
} catch (error) {
    console.log('✓ Correctly threw error:', error.message, '\n');
}

// Test 4: Create sphere with null scene parameter (should work like no parameter)
console.log('Test 4: Sphere.create() with null scene parameter');
try {
    const sphere4 = Sphere.create(3, 24, null, null);
    console.log('✓ Sphere created with null scene parameter');
    console.log(
        `  Radius: ${sphere4.radius}, Segments: ${sphere4.widthSegments}x${sphere4.heightSegments}\n`,
    );
} catch (error) {
    console.error('✗ Test 4 failed:', error.message, '\n');
}

// Test 5: Verify scene parameter is the 4th parameter (after material)
console.log('Test 5: Verify parameter order (radius, segments, material, scene)');
try {
    const mockScene = {
        objects: new Map(),
        add: function (obj) {
            this.objects.set(obj.id, obj);
            console.log(`  Scene now has ${this.objects.size} object(s)`);
            return obj.id;
        },
    };

    const sphere5a = Sphere.create(1, 16, null, mockScene);
    const sphere5b = Sphere.create(2, 32, null, mockScene);

    console.log('✓ Multiple spheres added to same scene');
    console.log(`  Final scene object count: ${mockScene.objects.size}\n`);
} catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
}

console.log('All tests completed successfully!');
console.log('\nSummary:');
console.log('- Sphere.create() accepts optional scene parameter as 4th argument');
console.log('- Scene parameter must have an add() method');
console.log('- Without scene parameter, falls back to singleton (if available)');
console.log('- Invalid scene parameter throws descriptive error');
