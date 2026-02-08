/**
 * Standalone runner for singleton fallback property tests
 * Tests Property 9: Singleton Fallback
 */

import './setup-standalone.js';
import { Scene } from '../engine/Scene.js';
import { Box } from '../objects/Box.js';
import { Sphere } from '../objects/Sphere.js';
import { Plane } from '../objects/Plane.js';
import { Light } from '../engine/Light.js';

console.log('**Feature: instance-based-api, Property 9: Singleton Fallback**');
console.log('**Validates: Requirements 2.1.5**\n');

let testsPassed = 0;
let testsFailed = 0;

function setupTest() {
    // Clean up any existing singleton
    if (Scene.isInitialized()) {
        Scene.destroy();
    }

    // Create mock DOM container for singleton scene
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.id = 'singleton-test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // Initialize singleton scene
    return Scene.init('singleton-test-container', {
        autoStart: false,
        lights: false,
    });
}

function cleanupTest() {
    // Clean up singleton scene
    if (Scene.isInitialized()) {
        Scene.destroy();
    }

    // Clean up DOM
    document.body.innerHTML = '';
}

async function testBoxSingletonFallback() {
    console.log('Testing Box.create without scene parameter...');

    const singletonScene = setupTest();
    const numRuns = 50;
    let passed = 0;

    for (let i = 0; i < numRuns; i++) {
        const width = Math.random() * 9.9 + 0.1;
        const height = Math.random() * 9.9 + 0.1;
        const depth = Math.random() * 9.9 + 0.1;

        const initialCount = singletonScene.objects.size;

        // Create box WITHOUT scene parameter (should fall back to singleton)
        const box = Box.create(width, height, depth);

        // Wait for async singleton scene lookup to complete
        await new Promise((resolve) => setTimeout(resolve, 10));

        try {
            // Verify box was created
            if (!box) throw new Error('Box not created');
            if (box.constructor.name !== 'Box') throw new Error('Wrong object type');

            // Verify box dimensions
            if (Math.abs(box.width - width) > 0.00001) throw new Error('Width mismatch');
            if (Math.abs(box.height - height) > 0.00001) throw new Error('Height mismatch');
            if (Math.abs(box.depth - depth) > 0.00001) throw new Error('Depth mismatch');

            // Verify box was added to singleton scene
            if (singletonScene.objects.size !== initialCount + 1) {
                throw new Error(
                    `Expected ${initialCount + 1} objects, got ${singletonScene.objects.size}`,
                );
            }
            if (singletonScene.find(box.id) !== box) {
                throw new Error('Box not found in singleton scene');
            }

            // Verify box is in Three.js scene
            if (!singletonScene.threeScene.children.includes(box.threeMesh)) {
                throw new Error('Box not in Three.js scene');
            }

            passed++;
        } catch (error) {
            console.error(`  ❌ Run ${i + 1} failed: ${error.message}`);
            testsFailed++;
            cleanupTest();
            return false;
        }
    }

    cleanupTest();
    console.log(`  ✓ Box singleton fallback passed ${passed}/${numRuns} runs`);
    testsPassed++;
    return true;
}

async function testSphereSingletonFallback() {
    console.log('Testing Sphere.create without scene parameter...');

    const singletonScene = setupTest();
    const numRuns = 50;
    let passed = 0;

    for (let i = 0; i < numRuns; i++) {
        const radius = Math.random() * 9.9 + 0.1;
        const segments = Math.floor(Math.random() * 61) + 3;

        const initialCount = singletonScene.objects.size;

        // Create sphere WITHOUT scene parameter (should fall back to singleton)
        const sphere = Sphere.create(radius, segments);

        // Wait for async singleton scene lookup to complete
        await new Promise((resolve) => setTimeout(resolve, 10));

        try {
            // Verify sphere was created
            if (!sphere) throw new Error('Sphere not created');
            if (sphere.constructor.name !== 'Sphere') throw new Error('Wrong object type');

            // Verify sphere radius
            if (Math.abs(sphere.radius - radius) > 0.00001) throw new Error('Radius mismatch');

            // Verify sphere was added to singleton scene
            if (singletonScene.objects.size !== initialCount + 1) {
                throw new Error(
                    `Expected ${initialCount + 1} objects, got ${singletonScene.objects.size}`,
                );
            }
            if (singletonScene.find(sphere.id) !== sphere) {
                throw new Error('Sphere not found in singleton scene');
            }

            // Verify sphere is in Three.js scene
            if (!singletonScene.threeScene.children.includes(sphere.threeMesh)) {
                throw new Error('Sphere not in Three.js scene');
            }

            passed++;
        } catch (error) {
            console.error(`  ❌ Run ${i + 1} failed: ${error.message}`);
            testsFailed++;
            cleanupTest();
            return false;
        }
    }

    cleanupTest();
    console.log(`  ✓ Sphere singleton fallback passed ${passed}/${numRuns} runs`);
    testsPassed++;
    return true;
}

async function testPlaneSingletonFallback() {
    console.log('Testing Plane.create without scene parameter...');

    const singletonScene = setupTest();
    const numRuns = 50;
    let passed = 0;

    for (let i = 0; i < numRuns; i++) {
        const width = Math.random() * 9.9 + 0.1;
        const height = Math.random() * 9.9 + 0.1;

        const initialCount = singletonScene.objects.size;

        // Create plane WITHOUT scene parameter (should fall back to singleton)
        const plane = Plane.create(width, height);

        // Wait for async singleton scene lookup to complete
        await new Promise((resolve) => setTimeout(resolve, 10));

        try {
            // Verify plane was created
            if (!plane) throw new Error('Plane not created');
            if (plane.constructor.name !== 'Plane') throw new Error('Wrong object type');

            // Verify plane dimensions
            if (Math.abs(plane.width - width) > 0.00001) throw new Error('Width mismatch');
            if (Math.abs(plane.height - height) > 0.00001) throw new Error('Height mismatch');

            // Verify plane was added to singleton scene
            if (singletonScene.objects.size !== initialCount + 1) {
                throw new Error(
                    `Expected ${initialCount + 1} objects, got ${singletonScene.objects.size}`,
                );
            }
            if (singletonScene.find(plane.id) !== plane) {
                throw new Error('Plane not found in singleton scene');
            }

            // Verify plane is in Three.js scene
            if (!singletonScene.threeScene.children.includes(plane.threeMesh)) {
                throw new Error('Plane not in Three.js scene');
            }

            passed++;
        } catch (error) {
            console.error(`  ❌ Run ${i + 1} failed: ${error.message}`);
            testsFailed++;
            cleanupTest();
            return false;
        }
    }

    cleanupTest();
    console.log(`  ✓ Plane singleton fallback passed ${passed}/${numRuns} runs`);
    testsPassed++;
    return true;
}

async function testMixedObjectTypes() {
    console.log('Testing mixed object types without scene parameter...');

    const singletonScene = setupTest();

    const initialCount = singletonScene.objects.size;

    // Create different object types without scene parameter
    const box = Box.create(1, 1, 1);
    const sphere = Sphere.create(1, 16);
    const plane = Plane.create(1, 1);

    // Wait for all async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
        // Verify all objects were added to singleton scene
        if (singletonScene.objects.size !== initialCount + 3) {
            throw new Error(
                `Expected ${initialCount + 3} objects, got ${singletonScene.objects.size}`,
            );
        }

        // Verify each object is in the singleton scene
        if (singletonScene.find(box.id) !== box) {
            throw new Error('Box not found in singleton scene');
        }
        if (singletonScene.find(sphere.id) !== sphere) {
            throw new Error('Sphere not found in singleton scene');
        }
        if (singletonScene.find(plane.id) !== plane) {
            throw new Error('Plane not found in singleton scene');
        }

        // Verify objects are in Three.js scene
        if (!singletonScene.threeScene.children.includes(box.threeMesh)) {
            throw new Error('Box not in Three.js scene');
        }
        if (!singletonScene.threeScene.children.includes(sphere.threeMesh)) {
            throw new Error('Sphere not in Three.js scene');
        }
        if (!singletonScene.threeScene.children.includes(plane.threeMesh)) {
            throw new Error('Plane not in Three.js scene');
        }

        console.log('  ✓ Mixed object types singleton fallback passed');
        testsPassed++;
        cleanupTest();
        return true;
    } catch (error) {
        console.error(`  ❌ Test failed: ${error.message}`);
        testsFailed++;
        cleanupTest();
        return false;
    }
}

async function testNoSingletonDoesNotThrow() {
    console.log('Testing objects created without singleton do not throw...');

    // Ensure no singleton exists
    if (Scene.isInitialized()) {
        Scene.destroy();
    }

    try {
        // Create objects without scene parameter (should not throw)
        Box.create(1, 1, 1);
        Sphere.create(1, 16);
        Plane.create(1, 1);

        console.log('  ✓ Objects created without singleton do not throw');
        testsPassed++;
        return true;
    } catch (error) {
        console.error(`  ❌ Test failed: ${error.message}`);
        testsFailed++;
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('Running singleton fallback property tests...\n');

    await testBoxSingletonFallback();
    await testSphereSingletonFallback();
    await testPlaneSingletonFallback();
    await testMixedObjectTypes();
    await testNoSingletonDoesNotThrow();

    console.log('\n' + '='.repeat(50));
    console.log(`Tests passed: ${testsPassed}`);
    console.log(`Tests failed: ${testsFailed}`);

    if (testsFailed === 0) {
        console.log('\n✅ All singleton fallback property tests passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Some tests failed');
        process.exit(1);
    }
}

runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
