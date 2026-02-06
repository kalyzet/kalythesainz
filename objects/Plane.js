/**
 * Plane primitive object for KALYTHESAINZ framework
 * Extends Object3D base class with plane-specific functionality
 */

import * as THREE from 'three';
import { Object3D } from '../engine/Object3D.js';

export class Plane extends Object3D {
    #width = 1;
    #height = 1;
    #widthSegments = 1;
    #heightSegments = 1;

    /**
     * Create a new Plane instance
     * @param {THREE.PlaneGeometry} geometry - Plane geometry
     * @param {THREE.Material} material - Plane material
     * @param {number} width - Plane width
     * @param {number} height - Plane height
     * @param {number} widthSegments - Number of width segments
     * @param {number} heightSegments - Number of height segments
     */
    constructor(geometry, material, width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        super(geometry, material);

        this.#width = width;
        this.#height = height;
        this.#widthSegments = widthSegments;
        this.#heightSegments = heightSegments;
    }

    /**
     * Create a new Plane with specified dimensions
     * @param {number} width - Plane width (default: 1)
     * @param {number} height - Plane height (default: 1)
     * @param {THREE.Material} material - Optional material (default: MeshStandardMaterial)
     * @returns {Plane} New Plane instance
     */
    static create(width = 1, height = 1, material = null) {
        // Validate parameters
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('Width must be a positive number');
        }
        if (typeof height !== 'number' || height <= 0) {
            throw new Error('Height must be a positive number');
        }

        // Create geometry with default segments
        const widthSegments = 1;
        const heightSegments = 1;
        const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

        // Create default material if none provided
        if (!material) {
            material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.1,
                roughness: 0.8,
                side: THREE.DoubleSide, // Make plane visible from both sides
            });
        }

        // Validate material
        if (!(material instanceof THREE.Material) && !material.isMaterial) {
            throw new Error('Material must be a valid Three.js Material');
        }

        return new Plane(geometry, material, width, height, widthSegments, heightSegments);
    }

    /**
     * Create a new Plane with specified dimensions and segments
     * @param {number} width - Plane width
     * @param {number} height - Plane height
     * @param {number} widthSegments - Number of width segments (default: 1)
     * @param {number} heightSegments - Number of height segments (default: 1)
     * @param {THREE.Material} material - Optional material
     * @returns {Plane} New Plane instance
     */
    static createSegmented(width, height, widthSegments = 1, heightSegments = 1, material = null) {
        // Validate parameters
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('Width must be a positive number');
        }
        if (typeof height !== 'number' || height <= 0) {
            throw new Error('Height must be a positive number');
        }
        if (typeof widthSegments !== 'number' || widthSegments < 1) {
            throw new Error('Width segments must be a number greater than or equal to 1');
        }
        if (typeof heightSegments !== 'number' || heightSegments < 1) {
            throw new Error('Height segments must be a number greater than or equal to 1');
        }

        // Create geometry
        const geometry = new THREE.PlaneGeometry(
            width,
            height,
            Math.floor(widthSegments),
            Math.floor(heightSegments),
        );

        // Create default material if none provided
        if (!material) {
            material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.1,
                roughness: 0.8,
                side: THREE.DoubleSide,
            });
        }

        // Validate material
        if (!(material instanceof THREE.Material) && !material.isMaterial) {
            throw new Error('Material must be a valid Three.js Material');
        }

        return new Plane(
            geometry,
            material,
            width,
            height,
            Math.floor(widthSegments),
            Math.floor(heightSegments),
        );
    }

    /**
     * Get plane width
     * @returns {number} Plane width
     */
    get width() {
        return this.#width;
    }

    /**
     * Set plane width
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
     * Get plane height
     * @returns {number} Plane height
     */
    get height() {
        return this.#height;
    }

    /**
     * Set plane height
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
     * Get plane width segments
     * @returns {number} Width segments
     */
    get widthSegments() {
        return this.#widthSegments;
    }

    /**
     * Set plane width segments
     * @param {number} value - New width segments
     */
    set widthSegments(value) {
        if (typeof value !== 'number' || value < 1) {
            throw new Error('Width segments must be a number greater than or equal to 1');
        }

        const oldWidthSegments = this.#widthSegments;
        this.#widthSegments = Math.floor(value);

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('widthSegments', oldWidthSegments, this.#widthSegments);
    }

    /**
     * Get plane height segments
     * @returns {number} Height segments
     */
    get heightSegments() {
        return this.#heightSegments;
    }

    /**
     * Set plane height segments
     * @param {number} value - New height segments
     */
    set heightSegments(value) {
        if (typeof value !== 'number' || value < 1) {
            throw new Error('Height segments must be a number greater than or equal to 1');
        }

        const oldHeightSegments = this.#heightSegments;
        this.#heightSegments = Math.floor(value);

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('heightSegments', oldHeightSegments, this.#heightSegments);
    }

    /**
     * Set all dimensions at once
     * @param {number} width - New width
     * @param {number} height - New height
     */
    setDimensions(width, height) {
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('Width must be a positive number');
        }
        if (typeof height !== 'number' || height <= 0) {
            throw new Error('Height must be a positive number');
        }

        const oldDimensions = {
            width: this.#width,
            height: this.#height,
        };

        this.#width = width;
        this.#height = height;

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('dimensions', oldDimensions, {
            width: this.#width,
            height: this.#height,
        });
    }

    /**
     * Set all parameters at once
     * @param {number} width - New width
     * @param {number} height - New height
     * @param {number} widthSegments - New width segments
     * @param {number} heightSegments - New height segments
     */
    setParameters(width, height, widthSegments, heightSegments) {
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('Width must be a positive number');
        }
        if (typeof height !== 'number' || height <= 0) {
            throw new Error('Height must be a positive number');
        }
        if (typeof widthSegments !== 'number' || widthSegments < 1) {
            throw new Error('Width segments must be a number greater than or equal to 1');
        }
        if (typeof heightSegments !== 'number' || heightSegments < 1) {
            throw new Error('Height segments must be a number greater than or equal to 1');
        }

        const oldParameters = {
            width: this.#width,
            height: this.#height,
            widthSegments: this.#widthSegments,
            heightSegments: this.#heightSegments,
        };

        this.#width = width;
        this.#height = height;
        this.#widthSegments = Math.floor(widthSegments);
        this.#heightSegments = Math.floor(heightSegments);

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitDimensionChange('parameters', oldParameters, {
            width: this.#width,
            height: this.#height,
            widthSegments: this.#widthSegments,
            heightSegments: this.#heightSegments,
        });
    }

    /**
     * Get all dimensions as an object
     * @returns {object} Object with width, height properties
     */
    getDimensions() {
        return {
            width: this.#width,
            height: this.#height,
        };
    }

    /**
     * Get all parameters as an object
     * @returns {object} Object with width, height, widthSegments, heightSegments properties
     */
    getParameters() {
        return {
            width: this.#width,
            height: this.#height,
            widthSegments: this.#widthSegments,
            heightSegments: this.#heightSegments,
        };
    }

    /**
     * Get plane area
     * @returns {number} Area
     */
    getArea() {
        return this.#width * this.#height;
    }

    /**
     * Clone the plane
     * @returns {Plane} Cloned plane
     */
    clone() {
        const clonedGeometry = this.threeMesh.geometry.clone();
        const clonedMaterial = this.threeMesh.material.clone();

        const clonedPlane = new Plane(
            clonedGeometry,
            clonedMaterial,
            this.#width,
            this.#height,
            this.#widthSegments,
            this.#heightSegments,
        );

        // Copy properties from parent
        clonedPlane.name = `${this.name}_copy`;
        clonedPlane.tags = [...this.tags];
        clonedPlane.userData = { ...this.userData };
        clonedPlane.visible = this.visible;
        clonedPlane.locked = this.locked;

        // Copy transform
        clonedPlane.position = this.threeMesh.position.clone();
        clonedPlane.rotation = this.threeMesh.rotation.clone();
        clonedPlane.scale = this.threeMesh.scale.clone();

        return clonedPlane;
    }

    /**
     * Serialize plane to JSON
     * @returns {object} Serialized plane data
     */
    serialize() {
        const baseData = super.serialize();

        return {
            ...baseData,
            type: 'Plane',
            geometry: {
                type: 'PlaneGeometry',
                parameters: {
                    width: this.#width,
                    height: this.#height,
                    widthSegments: this.#widthSegments,
                    heightSegments: this.#heightSegments,
                },
            },
        };
    }

    /**
     * Deserialize plane from JSON data
     * @param {object} data - Serialized plane data
     * @returns {Plane} Deserialized plane
     */
    static deserialize(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid serialization data');
        }

        const { geometry, material, transform, name, tags, userData, visible, locked } = data;

        if (!geometry || !geometry.parameters) {
            throw new Error('Missing geometry parameters in serialization data');
        }

        const {
            width = 1,
            height = 1,
            widthSegments = 1,
            heightSegments = 1,
        } = geometry.parameters;

        // Create plane
        const plane = Plane.createSegmented(width, height, widthSegments, heightSegments);

        // Restore properties
        if (name) plane.name = name;
        if (tags) plane.tags = tags;
        if (userData) plane.userData = userData;
        if (typeof visible === 'boolean') plane.visible = visible;
        if (typeof locked === 'boolean') plane.locked = locked;

        // Restore transform
        if (transform) {
            if (transform.position) plane.position = transform.position;
            if (transform.rotation) plane.rotation = transform.rotation;
            if (transform.scale) plane.scale = transform.scale;
        }

        // Restore material properties if provided
        if (material && plane.threeMesh.material) {
            const mat = plane.threeMesh.material;
            if (material.color !== undefined) mat.color.setHex(material.color);
            if (material.opacity !== undefined) mat.opacity = material.opacity;
            if (material.transparent !== undefined) mat.transparent = material.transparent;
            if (material.metalness !== undefined) mat.metalness = material.metalness;
            if (material.roughness !== undefined) mat.roughness = material.roughness;
            if (material.emissive !== undefined) mat.emissive.setHex(material.emissive);
            if (material.wireframe !== undefined) mat.wireframe = material.wireframe;
        }

        return plane;
    }

    /**
     * Update geometry with current parameters
     * @private
     */
    #updateGeometry() {
        // Dispose old geometry
        if (this.threeMesh.geometry) {
            this.threeMesh.geometry.dispose();
        }

        // Create new geometry with updated parameters
        const newGeometry = new THREE.PlaneGeometry(
            this.#width,
            this.#height,
            this.#widthSegments,
            this.#heightSegments,
        );
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

export default Plane;
