/**
 * Object3D base class for KALYTHESAINZ framework
 * Provides common functionality for all 3D objects
 */

import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

export class Object3D {
    #threeMesh = null;
    #id = null;
    #name = 'Unnamed Object';
    #tags = [];
    #userData = {};
    #visible = true;
    #locked = false;

    /**
     * Create a new Object3D instance
     * @param {THREE.BufferGeometry} geometry - Three.js geometry
     * @param {THREE.Material} material - Three.js material
     */
    constructor(geometry, material) {
        // Validate geometry
        if (!geometry || !(geometry instanceof THREE.BufferGeometry)) {
            throw new Error('Geometry must be a valid Three.js BufferGeometry');
        }

        // Validate material
        if (!material || !(material instanceof THREE.Material)) {
            throw new Error('Material must be a valid Three.js Material');
        }

        // Create Three.js mesh
        this.#threeMesh = new THREE.Mesh(geometry, material);

        // Generate unique ID
        this.#id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Set default name
        this.#name = `${this.constructor.name}_${this.#id.substr(-8)}`;

        // Emit creation event
        EventBus.publish('object:created', {
            id: this.#id,
            type: this.constructor.name,
            object: this,
        });
    }

    /**
     * Get object ID
     * @returns {string} Object ID
     */
    get id() {
        return this.#id;
    }

    /**
     * Get object name
     * @returns {string} Object name
     */
    get name() {
        return this.#name;
    }

    /**
     * Set object name
     * @param {string} value - New name
     */
    set name(value) {
        if (typeof value !== 'string') {
            throw new Error('Name must be a string');
        }

        const oldName = this.#name;
        this.#name = value;

        EventBus.publish('object:nameChanged', {
            id: this.#id,
            object: this,
            oldName,
            newName: value,
        });
    }

    /**
     * Get object tags
     * @returns {string[]} Object tags
     */
    get tags() {
        return [...this.#tags];
    }

    /**
     * Set object tags
     * @param {string[]} value - New tags
     */
    set tags(value) {
        if (!Array.isArray(value)) {
            throw new Error('Tags must be an array');
        }

        const oldTags = this.#tags;
        this.#tags = [...value];

        EventBus.publish('object:tagsChanged', {
            id: this.#id,
            object: this,
            oldTags,
            newTags: this.#tags,
        });
    }

    /**
     * Get object user data
     * @returns {object} User data
     */
    get userData() {
        return { ...this.#userData };
    }

    /**
     * Set object user data
     * @param {object} value - New user data
     */
    set userData(value) {
        if (typeof value !== 'object' || value === null) {
            throw new Error('User data must be an object');
        }

        const oldUserData = this.#userData;
        this.#userData = { ...value };

        EventBus.publish('object:userDataChanged', {
            id: this.#id,
            object: this,
            oldUserData,
            newUserData: this.#userData,
        });
    }

    /**
     * Get object visibility
     * @returns {boolean} Visibility state
     */
    get visible() {
        return this.#visible;
    }

    /**
     * Set object visibility
     * @param {boolean} value - New visibility state
     */
    set visible(value) {
        if (typeof value !== 'boolean') {
            throw new Error('Visible must be a boolean');
        }

        const oldVisible = this.#visible;
        this.#visible = value;
        this.#threeMesh.visible = value;

        EventBus.publish('object:visibilityChanged', {
            id: this.#id,
            object: this,
            oldVisible,
            newVisible: value,
        });
    }

    /**
     * Get object locked state
     * @returns {boolean} Locked state
     */
    get locked() {
        return this.#locked;
    }

    /**
     * Set object locked state
     * @param {boolean} value - New locked state
     */
    set locked(value) {
        if (typeof value !== 'boolean') {
            throw new Error('Locked must be a boolean');
        }

        const oldLocked = this.#locked;
        this.#locked = value;

        EventBus.publish('object:lockedChanged', {
            id: this.#id,
            object: this,
            oldLocked,
            newLocked: value,
        });
    }

    /**
     * Get object position
     * @returns {THREE.Vector3} Position vector
     */
    get position() {
        return this.#threeMesh.position;
    }

    /**
     * Set object position
     * @param {THREE.Vector3|Array|object} value - New position
     */
    set position(value) {
        const oldPosition = this.#threeMesh.position.clone();

        if (Array.isArray(value)) {
            this.#threeMesh.position.set(value[0], value[1], value[2]);
        } else if (value instanceof THREE.Vector3) {
            this.#threeMesh.position.copy(value);
        } else if (typeof value === 'object' && value !== null) {
            this.#threeMesh.position.set(value.x || 0, value.y || 0, value.z || 0);
        } else {
            throw new Error('Position must be a Vector3, array, or object with x, y, z properties');
        }

        EventBus.publish('object:positionChanged', {
            id: this.#id,
            object: this,
            oldPosition: oldPosition.toArray(),
            newPosition: this.#threeMesh.position.toArray(),
        });
    }

    /**
     * Get object rotation
     * @returns {THREE.Euler} Rotation euler
     */
    get rotation() {
        return this.#threeMesh.rotation;
    }

    /**
     * Set object rotation
     * @param {THREE.Euler|Array|object} value - New rotation
     */
    set rotation(value) {
        const oldRotation = this.#threeMesh.rotation.clone();

        if (Array.isArray(value)) {
            this.#threeMesh.rotation.set(value[0], value[1], value[2]);
        } else if (value instanceof THREE.Euler) {
            this.#threeMesh.rotation.copy(value);
        } else if (typeof value === 'object' && value !== null) {
            this.#threeMesh.rotation.set(value.x || 0, value.y || 0, value.z || 0);
        } else {
            throw new Error('Rotation must be an Euler, array, or object with x, y, z properties');
        }

        EventBus.publish('object:rotationChanged', {
            id: this.#id,
            object: this,
            oldRotation: [oldRotation.x, oldRotation.y, oldRotation.z],
            newRotation: [
                this.#threeMesh.rotation.x,
                this.#threeMesh.rotation.y,
                this.#threeMesh.rotation.z,
            ],
        });
    }

    /**
     * Get object scale
     * @returns {THREE.Vector3} Scale vector
     */
    get scale() {
        return this.#threeMesh.scale;
    }

    /**
     * Set object scale
     * @param {THREE.Vector3|Array|object|number} value - New scale
     */
    set scale(value) {
        const oldScale = this.#threeMesh.scale.clone();

        if (typeof value === 'number') {
            this.#threeMesh.scale.set(value, value, value);
        } else if (Array.isArray(value)) {
            this.#threeMesh.scale.set(value[0], value[1], value[2]);
        } else if (value instanceof THREE.Vector3) {
            this.#threeMesh.scale.copy(value);
        } else if (typeof value === 'object' && value !== null) {
            this.#threeMesh.scale.set(value.x || 1, value.y || 1, value.z || 1);
        } else {
            throw new Error(
                'Scale must be a number, Vector3, array, or object with x, y, z properties',
            );
        }

        EventBus.publish('object:scaleChanged', {
            id: this.#id,
            object: this,
            oldScale: oldScale.toArray(),
            newScale: this.#threeMesh.scale.toArray(),
        });
    }

    /**
     * Get underlying Three.js mesh
     * @returns {THREE.Mesh} Three.js mesh
     */
    get threeMesh() {
        return this.#threeMesh;
    }

    /**
     * Get underlying Three.js object (alias for threeMesh)
     * @returns {THREE.Mesh} Three.js mesh
     */
    get threeObject() {
        return this.#threeMesh;
    }

    /**
     * Dispose object and clean up resources
     */
    dispose() {
        // Dispose geometry
        if (this.#threeMesh.geometry) {
            this.#threeMesh.geometry.dispose();
        }

        // Dispose material
        if (this.#threeMesh.material) {
            if (Array.isArray(this.#threeMesh.material)) {
                this.#threeMesh.material.forEach((mat) => mat.dispose());
            } else {
                this.#threeMesh.material.dispose();
            }
        }

        // Emit disposal event
        EventBus.publish('object:disposed', {
            id: this.#id,
            type: this.constructor.name,
        });

        // Clear references
        this.#threeMesh = null;
    }

    /**
     * Clone the object
     * @returns {Object3D} Cloned object
     */
    clone() {
        const clonedGeometry = this.#threeMesh.geometry.clone();
        const clonedMaterial = this.#threeMesh.material.clone();

        const clonedObject = new Object3D(clonedGeometry, clonedMaterial);

        // Copy properties
        clonedObject.name = `${this.#name}_copy`;
        clonedObject.tags = [...this.#tags];
        clonedObject.userData = { ...this.#userData };
        clonedObject.visible = this.#visible;
        clonedObject.locked = this.#locked;

        // Copy transform
        clonedObject.position = this.#threeMesh.position.clone();
        clonedObject.rotation = this.#threeMesh.rotation.clone();
        clonedObject.scale = this.#threeMesh.scale.clone();

        return clonedObject;
    }

    /**
     * Serialize object to JSON
     * @returns {object} Serialized object data
     */
    serialize() {
        return {
            id: this.#id,
            type: this.constructor.name,
            name: this.#name,
            tags: [...this.#tags],
            userData: { ...this.#userData },
            visible: this.#visible,
            locked: this.#locked,
            transform: {
                position: this.#threeMesh.position.toArray(),
                rotation: [
                    this.#threeMesh.rotation.x,
                    this.#threeMesh.rotation.y,
                    this.#threeMesh.rotation.z,
                ],
                scale: this.#threeMesh.scale.toArray(),
            },
            geometry: {
                type: this.#threeMesh.geometry.constructor.name,
            },
            material: {
                type: this.#threeMesh.material.constructor.name,
                color: this.#threeMesh.material.color
                    ? this.#threeMesh.material.color.getHex()
                    : 0xffffff,
                opacity: this.#threeMesh.material.opacity || 1,
                transparent: this.#threeMesh.material.transparent || false,
            },
        };
    }

    /**
     * Deserialize object from JSON data
     * @param {object} data - Serialized object data
     * @returns {Object3D} Deserialized object
     */
    static deserialize(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid serialization data');
        }

        if (!data.geometry || !data.material || !data.transform) {
            throw new Error('Missing required serialization data');
        }

        // Create basic geometry and material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: data.material.color || 0xffffff,
            opacity: data.material.opacity || 1,
            transparent: data.material.transparent || false,
        });

        // Create object
        const object = new Object3D(geometry, material);

        // Restore properties
        if (data.name) object.name = data.name;
        if (data.tags) object.tags = data.tags;
        if (data.userData) object.userData = data.userData;
        if (typeof data.visible === 'boolean') object.visible = data.visible;
        if (typeof data.locked === 'boolean') object.locked = data.locked;

        // Restore transform
        if (data.transform) {
            if (data.transform.position) object.position = data.transform.position;
            if (data.transform.rotation) object.rotation = data.transform.rotation;
            if (data.transform.scale) object.scale = data.transform.scale;
        }

        return object;
    }
}

export default Object3D;
