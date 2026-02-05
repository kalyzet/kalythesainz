/**
 * Box primitive object for KALYTHESAINZ framework
 * Extends Object3D base class with box-specific functionality
 */

import * as THREE from 'three';
import { Object3D } from '../engine/Object3D.js';

export class Box extends Object3D {
    #width = 1;
    #height = 1;
    #depth = 1;

    /**
     * Create a new Box instance
     * @param {THREE.BoxGeometry} geometry - Box geometry
     * @param {THREE.Material} material - Box material
     * @param {number} width - Box width
     * @param {number} height - Box height
     * @param {number} depth - Box depth
     */
    constructor(geometry, material, width = 1, height = 1, depth = 1) {
        super(geometry, material);

        this.#width = width;
        this.#height = height;
        this.#depth = depth;
    }

    /**
     * Create a new Box with specified dimensions
     * @param {number} width - Box width (default: 1)
     * @param {number} height - Box height (default: 1)
     * @param {number} depth - Box depth (default: 1)
     * @param {THREE.Material} material - Optional material (default: MeshStandardMaterial)
     * @returns {Box} New Box instance
     */
    static create(width = 1, height = 1, depth = 1, material = null) {
        // Validate parameters
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('Width must be a positive number');
        }
        if (typeof height !== 'number' || height <= 0) {
            throw new Error('Height must be a positive number');
        }
        if (typeof depth !== 'number' || depth <= 0) {
            throw new Error('Depth must be a positive number');
        }

        // Create geometry
        const geometry = new THREE.BoxGeometry(width, height, depth);

        // Create default material if none provided
        if (!material) {
            material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.1,
                roughness: 0.8,
            });
        }

        // Validate material
        if (!(material instanceof THREE.Material)) {
            throw new Error('Material must be a valid Three.js Material');
        }

        return new Box(geometry, material, width, height, depth);
    }

    /**
     * Get box width
     * @returns {number} Box width
     */
    get width() {
        return this.#width;
    }

    /**
     * Set box width
     * @param {number} value - New width
     */
    set width(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Width must be a positive number');
        }

        const oldWidth = this.#width;
        this.#width = value;

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('width', oldWidth, value);
    }

    /**
     * Get box height
     * @returns {number} Box height
     */
    get height() {
        return this.#height;
    }

    /**
     * Set box height
     * @param {number} value - New height
     */
    set height(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Height must be a positive number');
        }

        const oldHeight = this.#height;
        this.#height = value;

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('height', oldHeight, value);
    }

    /**
     * Get box depth
     * @returns {number} Box depth
     */
    get depth() {
        return this.#depth;
    }

    /**
     * Set box depth
     * @param {number} value - New depth
     */
    set depth(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Depth must be a positive number');
        }

        const oldDepth = this.#depth;
        this.#depth = value;

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('depth', oldDepth, value);
    }

    /**
     * Set all dimensions at once
     * @param {number} width - New width
     * @param {number} height - New height
     * @param {number} depth - New depth
     */
    setDimensions(width, height, depth) {
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('Width must be a positive number');
        }
        if (typeof height !== 'number' || height <= 0) {
            throw new Error('Height must be a positive number');
        }
        if (typeof depth !== 'number' || depth <= 0) {
            throw new Error('Depth must be a positive number');
        }

        const oldDimensions = {
            width: this.#width,
            height: this.#height,
            depth: this.#depth,
        };

        this.#width = width;
        this.#height = height;
        this.#depth = depth;

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('dimensions', oldDimensions, {
            width: this.#width,
            height: this.#height,
            depth: this.#depth,
        });
    }

    /**
     * Get all dimensions as an object
     * @returns {object} Object with width, height, depth properties
     */
    getDimensions() {
        return {
            width: this.#width,
            height: this.#height,
            depth: this.#depth,
        };
    }

    /**
     * Clone the box
     * @returns {Box} Cloned box
     */
    clone() {
        const clonedGeometry = this.threeMesh.geometry.clone();
        const clonedMaterial = this.threeMesh.material.clone();

        const clonedBox = new Box(
            clonedGeometry,
            clonedMaterial,
            this.#width,
            this.#height,
            this.#depth,
        );

        // Copy properties from parent
        clonedBox.name = `${this.name}_copy`;
        clonedBox.tags = [...this.tags];
        clonedBox.userData = { ...this.userData };
        clonedBox.visible = this.visible;
        clonedBox.locked = this.locked;

        // Copy transform
        clonedBox.position = this.threeMesh.position.clone();
        clonedBox.rotation = this.threeMesh.rotation.clone();
        clonedBox.scale = this.threeMesh.scale.clone();

        return clonedBox;
    }

    /**
     * Serialize box to JSON
     * @returns {object} Serialized box data
     */
    serialize() {
        const baseData = super.serialize();

        return {
            ...baseData,
            type: 'Box',
            geometry: {
                type: 'BoxGeometry',
                parameters: {
                    width: this.#width,
                    height: this.#height,
                    depth: this.#depth,
                },
            },
        };
    }

    /**
     * Deserialize box from JSON data
     * @param {object} data - Serialized box data
     * @returns {Box} Deserialized box
     */
    static deserialize(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid serialization data');
        }

        const { geometry, material, transform, name, tags, userData, visible, locked } = data;

        if (!geometry || !geometry.parameters) {
            throw new Error('Missing geometry parameters in serialization data');
        }

        const { width = 1, height = 1, depth = 1 } = geometry.parameters;

        // Create box
        const box = Box.create(width, height, depth);

        // Restore properties
        if (name) box.name = name;
        if (tags) box.tags = tags;
        if (userData) box.userData = userData;
        if (typeof visible === 'boolean') box.visible = visible;
        if (typeof locked === 'boolean') box.locked = locked;

        // Restore transform
        if (transform) {
            if (transform.position) box.position = transform.position;
            if (transform.rotation) box.rotation = transform.rotation;
            if (transform.scale) box.scale = transform.scale;
        }

        // Restore material properties if provided
        if (material && box.threeMesh.material) {
            const mat = box.threeMesh.material;
            if (material.color !== undefined) mat.color.setHex(material.color);
            if (material.opacity !== undefined) mat.opacity = material.opacity;
            if (material.transparent !== undefined) mat.transparent = material.transparent;
            if (material.metalness !== undefined) mat.metalness = material.metalness;
            if (material.roughness !== undefined) mat.roughness = material.roughness;
            if (material.emissive !== undefined) mat.emissive.setHex(material.emissive);
            if (material.wireframe !== undefined) mat.wireframe = material.wireframe;
        }

        return box;
    }

    /**
     * Update geometry with current dimensions
     * @private
     */
    #updateGeometry() {
        // Dispose old geometry
        if (this.threeMesh.geometry) {
            this.threeMesh.geometry.dispose();
        }

        // Create new geometry with updated dimensions
        const newGeometry = new THREE.BoxGeometry(this.#width, this.#height, this.#depth);
        this.threeMesh.geometry = newGeometry;
    }

    /**
     * Emit dimension change event
     * @private
     */
    #emitDimensionChange(property, oldValue, newValue) {
        // Import EventBus dynamically to avoid circular imports
        import('../core/EventBus.js').then(({ EventBus }) => {
            EventBus.publish('object:dimensionChanged', {
                id: this.id,
                object: this,
                property,
                oldValue,
                newValue,
                dimensions: this.getDimensions(),
            });
        });
    }
}

export default Box;
