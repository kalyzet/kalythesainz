/**
 * Manual runner for object creation property tests
 */

import { Object3D } from '../engine/Object3D.js';
import { EventBus } from '../core/EventBus.js';

// Mock Three.js for testing environment (since npm dependencies are not available)
const THREE = {
    WebGLRenderer: function () {
        return {
            setSize: () => {},
            render: () => {},
            dispose: () => {},
            domElement: { tagName: 'CANVAS' },
        };
    },
    Scene: function () {
        return {
            add: () => {},
            remove: () => {},
            children: [],
        };
    },
    PerspectiveCamera: function () {
        return {
            position: { set: () => {} },
            lookAt: () => {},
        };
    },
    BoxGeometry: function (width = 1, height = 1, depth = 1) {
        return {
            dispose: () => {},
            clone: () => new THREE.BoxGeometry(width, height, depth),
            parameters: { width, height, depth },
        };
    },
    SphereGeometry: function (radius = 1, widthSegments = 32, heightSegments = 16) {
        return {
            dispose: () => {},
            clone: () => new THREE.SphereGeometry(radius, widthSegments, heightSegments),
            parameters: { radius, widthSegments, heightSegments },
        };
    },
    PlaneGeometry: function (width = 1, height = 1) {
        return {
            dispose: () => {},
            clone: () => new THREE.PlaneGeometry(width, height),
            parameters: { width, height },
        };
    },
    CylinderGeometry: function (radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32) {
        return {
            dispose: () => {},
            clone: () =>
                new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments),
            parameters: { radiusTop, radiusBottom, height, radialSegments },
        };
    },
    ConeGeometry: function (radius = 1, height = 1, radialSegments = 32) {
        return {
            dispose: () => {},
            clone: () => new THREE.ConeGeometry(radius, height, radialSegments),
            parameters: { radius, height, radialSegments },
        };
    },
    MeshStandardMaterial: function (params = {}) {
        return {
            dispose: () => {},
            clone: () => new THREE.MeshStandardMaterial(params),
            color: params.color || 0xffffff,
            metalness: params.metalness || 0,
            roughness: params.roughness || 1,
        };
    },
    MeshBasicMaterial: function (params = {}) {
        return {
            dispose: () => {},
            clone: () => new THREE.MeshBasicMaterial(params),
            color: params.color || 0xffffff,
        };
    },
    MeshPhongMaterial: function (params = {}) {
        return {
            dispose: () => {},
            clone: () => new THREE.MeshPhongMaterial(params),
            color: params.color || 0xffffff,
        };
    },
    Mesh: function (geometry, material) {
        return {
            position: { set: () => {}, x: 0, y: 0, z: 0 },
            rotation: { set: () => {}, x: 0, y: 0, z: 0 },
            scale: { set: () => {}, x: 1, y: 1, z: 1 },
            visible: true,
            dispose: () => {},
            clone: () =>
                new THREE.Mesh(geometry?.clone?.() || geometry, material?.clone?.() || material),
            geometry,
            material,
        };
    },
    Vector3: function (x = 0, y = 0, z = 0) {
        return {
            x,
            y,
            z,
            set: function (newX, newY, newZ) {
                this.x = newX;
                this.y = newY;
                this.z = newZ;
                return this;
            },
            copy: function (v) {
                this.x = v.x;
                this.y = v.y;
                this.z = v.z;
                return this;
            },
            clone: function () {
                return new THREE.Vector3(this.x, this.y, this.z);
            },
        };
    },
    Euler: function (x = 0, y = 0, z = 0) {
        return {
            x,
            y,
            z,
            set: function (newX, newY, newZ) {
                this.x = newX;
                this.y = newY;
                this.z = newZ;
                return this;
            },
            copy: function (e) {
                this.x = e.x;
                this.y = e.y;
                this.z = e.z;
                return this;
            },
            clone: function () {
                return new THREE.Euler(this.x, this.y, this.z);
            },
        };
    },
    Color: function () {
        return {
            setHex: () => {},
            clone: () => new THREE.Color(),
        };
    },
};

// Make THREE available globally for the Object3D class
global.THREE = THREE;

// Simple property-based testing utilities
const fc = {
    assert: (property, options = {}) => {
        const numRuns = options.numRuns || 100;
        console.log(`Running property test with ${numRuns} iterations...`);

        for (let i = 0; i < numRuns; i++) {
            try {
                property.run();
            } catch (error) {
                throw new Error(`Property failed on run ${i + 1}: ${error.message}`);
            }
        }
        console.log(`✓ Property test passed all ${numRuns} iterations`);
    },
    property: (...args) => {
        const generators = args.slice(0, -1);
        const testFn = args[args.length - 1];

        return {
            run: () => {
                const values = generators.map((gen) => gen.generate());
                testFn(...values);
            },
        };
    },
    array: (itemGen, options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 0;
            const maxLength = options.maxLength || 10;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            return Array.from({ length }, () => itemGen.generate());
        },
    }),
    string: (options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 0;
            const maxLength = options.maxLength || 20;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
            return Array.from(
                { length },
                () => chars[Math.floor(Math.random() * chars.length)],
            ).join('');
        },
    }),
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    }),
    float: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.random() * (max - min) + min;
        },
    }),
    oneof: (...generators) => ({
        generate: () => {
            const chosen = generators[Math.floor(Math.random() * generators.length)];
            return chosen.generate();
        },
    }),
    constant: (value) => ({
        generate: () => value,
    }),
    boolean: () => ({
        generate: () => Math.random() < 0.5,
    }),
    record: (schema) => ({
        generate: () => {
            const result = {};
            for (const [key, generator] of Object.entries(schema)) {
                result[key] = generator.generate();
            }
            return result;
        },
    }),
    constantFrom: (...values) => ({
        generate: () => values[Math.floor(Math.random() * values.length)],
    }),
};

// Geometry generators
const geometryGenerator = fc.oneof(
    fc.constant(() => new THREE.BoxGeometry(1, 1, 1)),
    fc.constant(() => new THREE.SphereGeometry(1, 32, 16)),
    fc.constant(() => new THREE.PlaneGeometry(1, 1)),
    fc.constant(() => new THREE.CylinderGeometry(1, 1, 1, 32)),
    fc.constant(() => new THREE.ConeGeometry(1, 1, 32)),
);

// Material generators
const materialGenerator = fc.oneof(
    fc.constant(() => new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })),
    fc.constant(
        () =>
            new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff,
                metalness: Math.random(),
                roughness: Math.random(),
            }),
    ),
    fc.constant(() => new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })),
);

// Transform generators
const positionGenerator = fc.record({
    x: fc.float({ min: -100, max: 100 }),
    y: fc.float({ min: -100, max: 100 }),
    z: fc.float({ min: -100, max: 100 }),
});

const rotationGenerator = fc.record({
    x: fc.float({ min: 0, max: Math.PI * 2 }),
    y: fc.float({ min: 0, max: Math.PI * 2 }),
    z: fc.float({ min: 0, max: Math.PI * 2 }),
});

const scaleGenerator = fc.oneof(
    fc.float({ min: 0.1, max: 10 }), // Uniform scale
    fc.record({
        x: fc.float({ min: 0.1, max: 10 }),
        y: fc.float({ min: 0.1, max: 10 }),
        z: fc.float({ min: 0.1, max: 10 }),
    }),
);

// Helper function to check if values are close
function isClose(a, b, tolerance = 1e-5) {
    return Math.abs(a - b) < tolerance;
}

console.log('**Feature: kalythesainz-framework, Property 1: Object creation completeness**');
console.log('**Validates: Requirements 2.1, 2.2**\n');

// Property 1: Object creation completeness
console.log('Testing Property 1: Object creation completeness');
try {
    fc.assert(
        fc.property(
            geometryGenerator,
            materialGenerator,
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
            fc.record({
                customProp: fc.string(),
                numericValue: fc.integer({ min: 0, max: 1000 }),
                booleanFlag: fc.boolean(),
            }),
            positionGenerator,
            rotationGenerator,
            scaleGenerator,
            fc.boolean(),
            fc.boolean(),
            (
                geometryFactory,
                materialFactory,
                name,
                tags,
                userData,
                position,
                rotation,
                scale,
                visible,
                locked,
            ) => {
                // Clear EventBus before each test
                EventBus.clear();

                // Track events
                const events = [];
                EventBus.subscribe('object:created', (event) => {
                    events.push(event);
                });

                // Create geometry and material
                const geometry = geometryFactory();
                const material = materialFactory();

                // Create object
                const object = new Object3D(geometry, material);

                // Verify basic object creation
                if (!(object instanceof Object3D))
                    throw new Error('Object is not instance of Object3D');
                if (!object.id) throw new Error('Object ID is not defined');
                if (typeof object.id !== 'string') throw new Error('Object ID is not a string');
                if (object.id.length === 0) throw new Error('Object ID is empty');

                // Verify default name is set
                if (!object.name) throw new Error('Object name is not defined');
                if (typeof object.name !== 'string') throw new Error('Object name is not a string');
                if (object.name.length === 0) throw new Error('Object name is empty');

                // Verify transform properties exist and have correct types
                if (!(object.position instanceof THREE.Vector3))
                    throw new Error('Position is not Vector3');
                if (!(object.rotation instanceof THREE.Euler))
                    throw new Error('Rotation is not Euler');
                if (!(object.scale instanceof THREE.Vector3))
                    throw new Error('Scale is not Vector3');

                // Verify default transform values
                if (object.position.x !== 0) throw new Error('Default position.x is not 0');
                if (object.position.y !== 0) throw new Error('Default position.y is not 0');
                if (object.position.z !== 0) throw new Error('Default position.z is not 0');
                if (object.rotation.x !== 0) throw new Error('Default rotation.x is not 0');
                if (object.rotation.y !== 0) throw new Error('Default rotation.y is not 0');
                if (object.rotation.z !== 0) throw new Error('Default rotation.z is not 0');
                if (object.scale.x !== 1) throw new Error('Default scale.x is not 1');
                if (object.scale.y !== 1) throw new Error('Default scale.y is not 1');
                if (object.scale.z !== 1) throw new Error('Default scale.z is not 1');

                // Verify metadata properties
                if (!Array.isArray(object.tags)) throw new Error('Tags is not an array');
                if (object.tags.length !== 0) throw new Error('Default tags array is not empty');
                if (typeof object.userData !== 'object')
                    throw new Error('UserData is not an object');
                if (object.userData === null) throw new Error('UserData is null');
                if (typeof object.visible !== 'boolean') throw new Error('Visible is not boolean');
                if (object.visible !== true) throw new Error('Default visible is not true');
                if (typeof object.locked !== 'boolean') throw new Error('Locked is not boolean');
                if (object.locked !== false) throw new Error('Default locked is not false');

                // Verify Three.js mesh access
                if (!(object.threeMesh instanceof THREE.Mesh))
                    throw new Error('threeMesh is not THREE.Mesh');
                if (object.threeMesh.geometry !== geometry)
                    throw new Error('Geometry not properly assigned');
                if (object.threeMesh.material !== material)
                    throw new Error('Material not properly assigned');

                // Verify creation event was emitted
                if (events.length !== 1) throw new Error('Creation event not emitted');
                if (events[0].data.id !== object.id) throw new Error('Event ID mismatch');
                if (events[0].data.type !== 'Object3D') throw new Error('Event type mismatch');
                if (events[0].data.object !== object) throw new Error('Event object mismatch');

                // Test property setters work correctly
                object.name = name;
                if (object.name !== name) throw new Error('Name setter failed');

                object.tags = tags;
                if (JSON.stringify(object.tags) !== JSON.stringify(tags))
                    throw new Error('Tags setter failed');

                object.userData = userData;
                if (JSON.stringify(object.userData) !== JSON.stringify(userData))
                    throw new Error('UserData setter failed');

                object.position = position;
                if (!isClose(object.position.x, position.x))
                    throw new Error('Position.x setter failed');
                if (!isClose(object.position.y, position.y))
                    throw new Error('Position.y setter failed');
                if (!isClose(object.position.z, position.z))
                    throw new Error('Position.z setter failed');

                object.rotation = rotation;
                if (!isClose(object.rotation.x, rotation.x))
                    throw new Error('Rotation.x setter failed');
                if (!isClose(object.rotation.y, rotation.y))
                    throw new Error('Rotation.y setter failed');
                if (!isClose(object.rotation.z, rotation.z))
                    throw new Error('Rotation.z setter failed');

                // Test scale (handle both uniform and non-uniform)
                object.scale = scale;
                if (typeof scale === 'number') {
                    if (!isClose(object.scale.x, scale))
                        throw new Error('Uniform scale.x setter failed');
                    if (!isClose(object.scale.y, scale))
                        throw new Error('Uniform scale.y setter failed');
                    if (!isClose(object.scale.z, scale))
                        throw new Error('Uniform scale.z setter failed');
                } else {
                    if (!isClose(object.scale.x, scale.x)) throw new Error('Scale.x setter failed');
                    if (!isClose(object.scale.y, scale.y)) throw new Error('Scale.y setter failed');
                    if (!isClose(object.scale.z, scale.z)) throw new Error('Scale.z setter failed');
                }

                object.visible = visible;
                if (object.visible !== visible) throw new Error('Visible setter failed');
                if (object.threeMesh.visible !== visible)
                    throw new Error('ThreeMesh visible not synced');

                object.locked = locked;
                if (object.locked !== locked) throw new Error('Locked setter failed');

                // Verify serialization works
                const serialized = object.serialize();
                if (!serialized) throw new Error('Serialization failed');
                if (serialized.id !== object.id) throw new Error('Serialized ID mismatch');
                if (serialized.type !== 'Object3D') throw new Error('Serialized type mismatch');
                if (serialized.name !== name) throw new Error('Serialized name mismatch');
                if (JSON.stringify(serialized.tags) !== JSON.stringify(tags))
                    throw new Error('Serialized tags mismatch');
                if (JSON.stringify(serialized.userData) !== JSON.stringify(userData))
                    throw new Error('Serialized userData mismatch');
                if (serialized.visible !== visible) throw new Error('Serialized visible mismatch');
                if (serialized.locked !== locked) throw new Error('Serialized locked mismatch');
                if (!serialized.transform) throw new Error('Serialized transform missing');
                if (!serialized.geometry) throw new Error('Serialized geometry missing');
                if (!serialized.material) throw new Error('Serialized material missing');

                // Clean up
                object.dispose();
            },
        ),
        { numRuns: 100 },
    );
} catch (error) {
    console.error('❌ Property test failed:', error.message);
    process.exit(1);
}

console.log('\n✅ Object creation completeness property test passed successfully!');
console.log('All objects are created with proper transform properties and metadata.');
