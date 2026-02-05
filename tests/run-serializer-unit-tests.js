/**
 * Test runner for Serializer unit tests
 */

import './setup-standalone.js';
import { Serializer } from '../utils/Serializer.js';
import { Scene } from '../engine/Scene.js';
import { Box } from '../objects/Box.js';
import { Sphere } from '../objects/Sphere.js';
import { Plane } from '../objects/Plane.js';
import { Light } from '../engine/Light.js';
import { EventBus } from '../core/EventBus.js';

console.log('Running Serializer Unit Tests');
console.log('==============================\n');

let testsPassed = 0;
let testsTotal = 0;
let scene;
let container;

function runTest(testName, testFn) {
    testsTotal++;
    console.log(`Testing: ${testName}...`);

    try {
        const result = testFn();
        if (result && typeof result.then === 'function') {
            return result
                .then(() => {
                    testsPassed++;
                    console.log(`✓ ${testName} passed\n`);
                })
                .catch((error) => {
                    console.error(`✗ ${testName} failed:`, error.message);
                    console.log('');
                });
        } else {
            testsPassed++;
            console.log(`✓ ${testName} passed\n`);
            return Promise.resolve();
        }
    } catch (error) {
        console.error(`✗ ${testName} failed:`, error.message);
        console.log('');
        return Promise.resolve();
    }
}

async function runAllTests() {
    // Initialize scene once
    try {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        EventBus.clear();
        scene = Scene.init('test-container', { autoStart: false });
        console.log('✓ Test environment initialized\n');
    } catch (error) {
        console.error('✗ Failed to initialize test environment:', error.message);
        process.exit(1);
    }

    // Test: Serialize empty scene
    await runTest('Serialize empty scene correctly', () => {
        scene.clear(true);
        const serialized = Serializer.serializeScene(scene);

        if (!serialized) throw new Error('Serialized data is undefined');
        if (serialized.version !== '1.0.0') throw new Error('Version mismatch');
        if (!serialized.metadata) throw new Error('Metadata missing');
        if (serialized.metadata.objectCount !== 0) throw new Error('Object count should be 0');
        if (serialized.metadata.lightCount !== 0) throw new Error('Light count should be 0');
        if (serialized.objects.length !== 0) throw new Error('Objects array should be empty');
        if (serialized.lights.length !== 0) throw new Error('Lights array should be empty');
        if (!serialized.camera) throw new Error('Camera missing');
    });

    // Test: Serialize scene with single box
    await runTest('Serialize scene with single box object', () => {
        scene.clear(true);

        const box = Box.create(2, 3, 4);
        box.name = 'Test Box';
        box.position = [1, 2, 3];
        scene.add(box);

        const serialized = Serializer.serializeScene(scene);

        if (serialized.objects.length !== 1) throw new Error('Should have 1 object');
        if (serialized.objects[0].type !== 'Box') throw new Error('Object type should be Box');
        if (serialized.objects[0].name !== 'Test Box') throw new Error('Name mismatch');
        if (serialized.objects[0].geometry.parameters.width !== 2)
            throw new Error('Width mismatch');
        if (serialized.objects[0].geometry.parameters.height !== 3)
            throw new Error('Height mismatch');
        if (serialized.objects[0].geometry.parameters.depth !== 4)
            throw new Error('Depth mismatch');
    });

    // Test: Serialize scene with multiple object types
    await runTest('Serialize scene with multiple object types', () => {
        scene.clear(true);

        const box = Box.create(1, 1, 1);
        const sphere = Sphere.create(1.5, 16);
        const plane = Plane.create(5, 5);

        scene.add(box);
        scene.add(sphere);
        scene.add(plane);

        const serialized = Serializer.serializeScene(scene);

        if (serialized.objects.length !== 3) throw new Error('Should have 3 objects');
        if (serialized.objects[0].type !== 'Box') throw new Error('First object should be Box');
        if (serialized.objects[1].type !== 'Sphere')
            throw new Error('Second object should be Sphere');
        if (serialized.objects[2].type !== 'Plane') throw new Error('Third object should be Plane');
    });

    // Test: Serialize scene with lights
    await runTest('Serialize scene with lights', () => {
        scene.clear(true);

        const sunLight = Light.sun({ intensity: 0.8 });
        const ambientLight = Light.ambient({ intensity: 0.3 });

        scene.addLight(sunLight);
        scene.addLight(ambientLight);

        const serialized = Serializer.serializeScene(scene);

        if (serialized.lights.length !== 2) throw new Error('Should have 2 lights');
        if (serialized.lights[0].type !== 'directional')
            throw new Error('First light should be directional');
        if (Math.abs(serialized.lights[0].intensity - 0.8) > 0.001)
            throw new Error('First light intensity mismatch');
        if (serialized.lights[1].type !== 'ambient')
            throw new Error('Second light should be ambient');
        if (Math.abs(serialized.lights[1].intensity - 0.3) > 0.001)
            throw new Error('Second light intensity mismatch');
    });

    // Test: Preserve object metadata
    await runTest('Preserve object metadata during serialization', () => {
        scene.clear(true);

        const box = Box.create(1, 1, 1);
        box.name = 'Metadata Box';
        box.tags = ['test', 'metadata'];
        box.userData = { prop1: 'value1', prop2: 42, prop3: true };
        box.visible = false;

        scene.add(box);

        const serialized = Serializer.serializeScene(scene);

        if (serialized.objects[0].name !== 'Metadata Box') throw new Error('Name not preserved');
        if (
            !serialized.objects[0].tags.includes('test') ||
            !serialized.objects[0].tags.includes('metadata')
        )
            throw new Error('Tags not preserved');
        if (
            serialized.objects[0].userData.prop1 !== 'value1' ||
            serialized.objects[0].userData.prop2 !== 42 ||
            serialized.objects[0].userData.prop3 !== true
        )
            throw new Error('UserData not preserved');
        if (serialized.objects[0].visible !== false) throw new Error('Visibility not preserved');
    });

    // Test: Error handling - null scene
    await runTest('Throw error when scene is null', () => {
        try {
            Serializer.serializeScene(null);
            throw new Error('Should have thrown error');
        } catch (error) {
            if (!error.message.includes('Scene is required')) {
                throw new Error(`Wrong error message: ${error.message}`);
            }
        }
    });

    // Test: Deserialize empty scene
    await runTest('Deserialize empty scene correctly', async () => {
        const data = {
            version: '1.0.0',
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: 'test',
                objectCount: 0,
                lightCount: 0,
            },
            camera: {
                type: 'perspective',
                position: [0, 5, 10],
                fov: 75,
            },
            lights: [],
            objects: [],
        };

        scene.clear(true);
        await Serializer.deserializeScene(data, scene);

        if (scene.objects.size !== 0) throw new Error('Should have 0 objects');
        if (scene.lights.length !== 0) throw new Error('Should have 0 lights');
    });

    // Test: Deserialize scene with objects
    await runTest('Deserialize scene with objects', async () => {
        scene.clear(true);

        const box = Box.create(2, 3, 4);
        box.name = 'Test Box';
        const boxId = scene.add(box);

        const serialized = Serializer.serializeScene(scene);

        scene.clear(true);
        await Serializer.deserializeScene(serialized, scene);

        if (scene.objects.size !== 1) throw new Error('Should have 1 object');
        const restoredBox = scene.find(boxId);
        if (!restoredBox) throw new Error('Box not found');
        if (restoredBox.name !== 'Test Box') throw new Error('Name not restored');
        if (Math.abs(restoredBox.width - 2) > 0.001) throw new Error('Width not restored');
        if (Math.abs(restoredBox.height - 3) > 0.001) throw new Error('Height not restored');
        if (Math.abs(restoredBox.depth - 4) > 0.001) throw new Error('Depth not restored');
    });

    // Test: Error handling - null data
    await runTest('Throw error with null data', async () => {
        try {
            await Serializer.deserializeScene(null, scene);
            throw new Error('Should have thrown error');
        } catch (error) {
            if (
                !error.message.includes('Invalid scene data') &&
                !error.message.includes('Scene deserialization failed')
            ) {
                throw new Error(`Wrong error message: ${error.message}`);
            }
        }
    });

    // Test: Error handling - missing version
    await runTest('Throw error with missing version', async () => {
        const invalidData = {
            metadata: {},
            objects: [],
            lights: [],
        };

        try {
            await Serializer.deserializeScene(invalidData, scene);
            throw new Error('Should have thrown error');
        } catch (error) {
            if (
                !error.message.includes('Missing version') &&
                !error.message.includes('Scene deserialization failed')
            ) {
                throw new Error(`Wrong error message: ${error.message}`);
            }
        }
    });

    // Test: Validate correct data
    await runTest('Validate correct scene data', () => {
        const validData = {
            version: '1.0.0',
            metadata: {
                created: new Date().toISOString(),
            },
            objects: [],
            lights: [],
        };

        if (!Serializer.validateData(validData)) throw new Error('Should validate as true');
    });

    // Test: Reject null data
    await runTest('Reject null data in validation', () => {
        if (Serializer.validateData(null)) throw new Error('Should validate as false');
    });

    // Test: Reject data without version
    await runTest('Reject data without version', () => {
        const invalidData = {
            metadata: {},
            objects: [],
        };

        if (Serializer.validateData(invalidData)) throw new Error('Should validate as false');
    });

    // Test: Metadata preservation round-trip
    await runTest('Preserve all metadata during round-trip', async () => {
        scene.clear(true);

        const box = Box.create(2, 3, 4);
        box.name = 'Rich Metadata Box';
        box.tags = ['important', 'test', 'metadata'];
        box.userData = {
            stringProp: 'test string',
            numberProp: 123.45,
            booleanProp: true,
        };
        box.visible = false;
        box.position = [1, 2, 3];
        box.rotation = [0.1, 0.2, 0.3];
        box.scale = [1.5, 2.0, 2.5];

        const boxId = scene.add(box);

        const serialized = Serializer.serializeScene(scene);

        if (!serialized.metadata) throw new Error('Metadata missing');
        if (serialized.metadata.objectCount !== 1) throw new Error('Object count mismatch');

        scene.clear(true);
        await Serializer.deserializeScene(serialized, scene);

        const restored = scene.find(boxId);
        if (restored.name !== 'Rich Metadata Box') throw new Error('Name not preserved');
        if (
            !restored.tags.includes('important') ||
            !restored.tags.includes('test') ||
            !restored.tags.includes('metadata')
        )
            throw new Error('Tags not preserved');
        if (
            restored.userData.stringProp !== 'test string' ||
            Math.abs(restored.userData.numberProp - 123.45) > 0.001 ||
            restored.userData.booleanProp !== true
        )
            throw new Error('UserData not preserved');
        if (restored.visible !== false) throw new Error('Visibility not preserved');
        if (
            Math.abs(restored.position.x - 1) > 0.001 ||
            Math.abs(restored.position.y - 2) > 0.001 ||
            Math.abs(restored.position.z - 3) > 0.001
        )
            throw new Error('Position not preserved');
    });

    // Clean up
    try {
        if (scene && !scene.isDisposed) {
            Scene.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        EventBus.clear();
    } catch (error) {
        console.log('(Cleanup completed with minor warnings)');
    }

    // Summary
    console.log('\n=== Test Results ===');
    console.log(`Tests passed: ${testsPassed}/${testsTotal}`);

    if (testsPassed === testsTotal) {
        console.log('✅ All Serializer unit tests passed successfully!');
    } else {
        console.log('❌ Some tests failed.');
        process.exit(1);
    }
}

runAllTests().catch((error) => {
    console.error('Fatal error running tests:', error.message);
    process.exit(1);
});
