#!/usr/bin/env node

console.log('🧪 Starting Simple Resource Cleanup Test...\n');

// Mock Three.js for testing
global.THREE = {
    Vector3: class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
        clone() {
            return new global.THREE.Vector3(this.x, this.y, this.z);
        }
        setScalar(s) {
            this.x = s;
            this.y = s;
            this.z = s;
            return this;
        }
        toArray() {
            return [this.x, this.y, this.z];
        }
    },
    Euler: class Euler {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        copy(e) {
            this.x = e.x;
            this.y = e.y;
            this.z = e.z;
            return this;
        }
        clone() {
            return new global.THREE.Euler(this.x, this.y, this.z);
        }
        toArray() {
            return [this.x, this.y, this.z];
        }
    },
    Color: class Color {
        constructor(color = 0xffffff) {
            this.r = ((color >> 16) & 255) / 255;
            this.g = ((color >> 8) & 255) / 255;
            this.b = (color & 255) / 255;
        }
        setHex(hex) {
            this.r = ((hex >> 16) & 255) / 255;
            this.g = ((hex >> 8) & 255) / 255;
            this.b = (hex & 255) / 255;
            return this;
        }
        getHex() {
            return (
                (Math.round(this.r * 255) << 16) +
                (Math.round(this.g * 255) << 8) +
                Math.round(this.b * 255)
            );
        }
        clone() {
            return new global.THREE.Color(this.getHex());
        }
    },
    BufferGeometry: class BufferGeometry {
        constructor() {
            this.attributes = {};
            this.parameters = {};
            this.userData = {};
        }
        dispose() {
            this.userData.disposed = true;
        }
        clone() {
            const cloned = new this.constructor();
            cloned.parameters = { ...this.parameters };
            return cloned;
        }
    },
    BoxGeometry: class BoxGeometry extends global.THREE.BufferGeometry {
        constructor(width = 1, height = 1, depth = 1) {
            super();
            this.parameters = { width, height, depth };
        }
    },
    Material: class Material {
        constructor() {
            this.color = new global.THREE.Color();
            this.opacity = 1;
            this.transparent = false;
            this.visible = true;
            this.userData = {};
        }
        dispose() {
            this.userData.disposed = true;
        }
        clone() {
            const cloned = new this.constructor();
            cloned.color = this.color.clone();
            cloned.opacity = this.opacity;
            cloned.transparent = this.transparent;
            cloned.visible = this.visible;
            return cloned;
        }
    },
    MeshStandardMaterial: class MeshStandardMaterial extends global.THREE.Material {
        constructor(params = {}) {
            super();
            if (params.color !== undefined) this.color = new global.THREE.Color(params.color);
            this.metalness = params.metalness || 0;
            this.roughness = params.roughness || 1;
            this.emissive = new global.THREE.Color(0x000000);
        }
    },
    Mesh: class Mesh {
        constructor(geometry, material) {
            this.geometry = geometry;
            this.material = material;
            this.position = new global.THREE.Vector3();
            this.rotation = new global.THREE.Euler();
            this.scale = new global.THREE.Vector3(1, 1, 1);
            this.visible = true;
            this.userData = {};
        }
    },
};

console.log('✓ Three.js mock created');

import { Object3D } from '../engine/Object3D.js';
import { EventBus } from '../core/EventBus.js';

console.log('✓ Imports successful');

// Test basic resource cleanup
async function testResourceCleanup() {
    console.log('\n🧪 Testing basic resource cleanup...');

    // Clear EventBus
    EventBus.clear();

    // Track disposal events
    const disposalEvents = [];
    const disposedEvents = [];

    EventBus.subscribe('object:disposing', (event) => {
        disposalEvents.push(event);
        console.log(`  📤 Disposing event for object ${event.data.id}`);
    });

    EventBus.subscribe('object:disposed', (event) => {
        disposedEvents.push(event);
        console.log(`  ✅ Disposed event for object ${event.data.id}`);
    });

    // Create object
    console.log('  🔨 Creating object...');
    const geometry = new global.THREE.BoxGeometry(1, 1, 1);
    const material = new global.THREE.MeshStandardMaterial({ color: 0xff0000 });
    const object = new Object3D(geometry, material);

    console.log(`  ✓ Object created with ID: ${object.id}`);

    // Verify object is properly initialized
    if (!object.id) throw new Error('Object ID not set');
    if (!object.threeMesh) throw new Error('Object threeMesh not set');
    if (!object.threeMesh.geometry) throw new Error('Object geometry not set');
    if (!object.threeMesh.material) throw new Error('Object material not set');

    console.log('  ✓ Object properly initialized');

    // Set some properties
    object.name = 'test-object';
    object.tags = ['test', 'cleanup'];
    object.userData = { test: true, value: 42 };

    console.log('  ✓ Object properties set');

    // Dispose object
    console.log('  🗑️ Disposing object...');
    object.dispose();

    // Verify cleanup
    if (object.threeMesh !== null) {
        throw new Error('threeMesh reference not cleared after disposal');
    }

    if (object.tags.length !== 0) {
        throw new Error('Tags not cleared after disposal');
    }

    if (Object.keys(object.userData).length !== 0) {
        throw new Error('UserData not cleared after disposal');
    }

    console.log('  ✓ Object properly cleaned up');

    // Verify events
    if (disposalEvents.length !== 1) {
        throw new Error(`Expected 1 disposing event, got ${disposalEvents.length}`);
    }

    if (disposedEvents.length !== 1) {
        throw new Error(`Expected 1 disposed event, got ${disposedEvents.length}`);
    }

    console.log('  ✅ Disposal events properly emitted');

    // Test multiple dispose calls don't error
    try {
        object.dispose();
        console.log('  ✓ Multiple dispose calls handled gracefully');
    } catch (error) {
        throw new Error('Multiple dispose calls should not throw errors: ' + error.message);
    }

    console.log('\n✅ Basic resource cleanup test passed!');
}

testResourceCleanup().catch((error) => {
    console.error('\n❌ Resource cleanup test failed:', error.message);
    process.exit(1);
});
