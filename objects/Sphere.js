/**
 * Sphere primitive object for KALYTHESAINZ framework
 * Extends Object3D base class with sphere-specific functionality
 */

import * as THREE from 'three';
import { Object3D } from '../engine/Object3D.js';

export class Sphere extends Object3D {
    #radius = 1;
    #widthSegments = 32;
    #heightSegments = 16;

    /**
     * Create a new Sphere instance
     * @param {THREE.SphereGeometry} geometry - Sphere geometry
     * @param {THREE.Material} material - Sphere material
     * @param {number} radius - Sphere radius
     * @param {number} widthSegments - Number of width segments
     * @param {number} heightSegments - Number of height segments
     */
    constructor(geometry, material, radius = 1, widthSegments = 32, heightSegments = 16) {
        super(geometry, material);

        this.#radius = radius;
        this.#widthSegments = widthSegments;
        this.#heightSegments = heightSegments;
    }

    /**
     * Create a new Sphere with specified parameters
     * @param {number} radius - Sphere radius (default: 1)
     * @param {number} segments - Number of segments for both width and height (default: 32)
     * @param {THREE.Material} material - Optional material (default: MeshStandardMaterial)
     * @returns {Sphere} New Sphere instance
     */
    static create(radius = 1, segments = 32, material = null) {
        // Validate parameters
        if (typeof radius !== 'number' || radius <= 0) {
            throw new Error('Radius must be a positive number');
        }
        if (typeof segments !== 'number' || segments < 3) {
            throw new Error('Segments must be a number greater than or equal to 3');
        }

        // Calculate height segments (typically half of width segments for good proportions)
        const widthSegments = Math.max(3, Math.floor(segments));
        const heightSegments = Math.max(2, Math.floor(segments / 2));

        // Create geometry
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

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

        return new Sphere(geometry, material, radius, widthSegments, heightSegments);
    }

    /**
     * Get sphere radius
     * @returns {number} Sphere radius
     */
    get radius() {
        return this.#radius;
    }

    /**
     * Set sphere radius
     * @param {number} value - New radius
     */
    set radius(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Radius must be a positive number');
        }

        const oldRadius = this.#radius;
        this.#radius = value;

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitParameterChange('radius', oldRadius, value);
    }

    /**
     * Get sphere width segments
     * @returns {number} Width segments
     */
    get widthSegments() {
        return this.#widthSegments;
    }

    /**
     * Set sphere width segments
     * @param {number} value - New width segments
     */
    set widthSegments(value) {
        if (typeof value !== 'number' || value < 3) {
            throw new Error('Width segments must be a number greater than or equal to 3');
        }

        const oldWidthSegments = this.#widthSegments;
        this.#widthSegments = Math.floor(value);

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitParameterChange('widthSegments', oldWidthSegments, this.#widthSegments);
    }

    /**
     * Get sphere height segments
     * @returns {number} Height segments
     */
    get heightSegments() {
        return this.#heightSegments;
    }

    /**
     * Set sphere height segments
     * @param {number} value - New height segments
     */
    set heightSegments(value) {
        if (typeof value !== 'number' || value < 2) {
            throw new Error('Height segments must be a number greater than or equal to 2');
        }

        const oldHeightSegments = this.#heightSegments;
        this.#heightSegments = Math.floor(value);

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitParameterChange('heightSegments', oldHeightSegments, this.#heightSegments);
    }

    /**
     * Set all sphere parameters at once
     * @param {number} radius - New radius
     * @param {number} widthSegments - New width segments
     * @param {number} heightSegments - New height segments
     */
    setParameters(radius, widthSegments, heightSegments) {
        if (typeof radius !== 'number' || radius <= 0) {
            throw new Error('Radius must be a positive number');
        }
        if (typeof widthSegments !== 'number' || widthSegments < 3) {
            throw new Error('Width segments must be a number greater than or equal to 3');
        }
        if (typeof heightSegments !== 'number' || heightSegments < 2) {
            throw new Error('Height segments must be a number greater than or equal to 2');
        }

        const oldParameters = {
            radius: this.#radius,
            widthSegments: this.#widthSegments,
            heightSegments: this.#heightSegments,
        };

        this.#radius = radius;
        this.#widthSegments = Math.floor(widthSegments);
        this.#heightSegments = Math.floor(heightSegments);

        // Update geometry
        this.#updateGeometry();

        // Emit change event
        this.#emitParameterChange('parameters', oldParameters, {
            radius: this.#radius,
            widthSegments: this.#widthSegments,
            heightSegments: this.#heightSegments,
        });
    }

    /**
     * Get all sphere parameters as an object
     * @returns {object} Object with radius, widthSegments, heightSegments properties
     */
    getParameters() {
        return {
            radius: this.#radius,
            widthSegments: this.#widthSegments,
            heightSegments: this.#heightSegments,
        };
    }

    /**
     * Get sphere surface area
     * @returns {number} Surface area
     */
    getSurfaceArea() {
        return 4 * Math.PI * this.#radius * this.#radius;
    }

    /**
     * Get sphere volume
     * @returns {number} Volume
     */
    getVolume() {
        return (4 / 3) * Math.PI * Math.pow(this.#radius, 3);
    }

    /**
     * Clone the sphere
     * @returns {Sphere} Cloned sphere
     */
    clone() {
        const clonedGeometry = this.threeMesh.geometry.clone();
        const clonedMaterial = this.threeMesh.material.clone();

        const clonedSphere = new Sphere(
            clonedGeometry,
            clonedMaterial,
            this.#radius,
            this.#widthSegments,
            this.#heightSegments,
        );

        // Copy properties from parent
        clonedSphere.name = `${this.name}_copy`;
        clonedSphere.tags = [...this.tags];
        clonedSphere.userData = { ...this.userData };
        clonedSphere.visible = this.visible;
        clonedSphere.locked = this.locked;

        // Copy transform
        clonedSphere.position = this.threeMesh.position.clone();
        clonedSphere.rotation = this.threeMesh.rotation.clone();
        clonedSphere.scale = this.threeMesh.scale.clone();

        return clonedSphere;
    }

    /**
     * Serialize sphere to JSON
     * @returns {object} Serialized sphere data
     */
    serialize() {
        const baseData = super.serialize();

        return {
            ...baseData,
            type: 'Sphere',
            geometry: {
                type: 'SphereGeometry',
                parameters: {
                    radius: this.#radius,
                    widthSegments: this.#widthSegments,
                    heightSegments: this.#heightSegments,
                },
            },
        };
    }

    /**
     * Deserialize sphere from JSON data
     * @param {object} data - Serialized sphere data
     * @returns {Sphere} Deserialized sphere
     */
    static deserialize(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid serialization data');
        }

        const { geometry, material, transform, name, tags, userData, visible, locked } = data;

        if (!geometry || !geometry.parameters) {
            throw new Error('Missing geometry parameters in serialization data');
        }

        const { radius = 1, widthSegments = 32, heightSegments = 16 } = geometry.parameters;

        // Create sphere
        const sphere = new Sphere(
            new THREE.SphereGeometry(radius, widthSegments, heightSegments),
            new THREE.MeshStandardMaterial({ color: 0x888888 }),
            radius,
            widthSegments,
            heightSegments,
        );

        // Restore properties
        if (name) sphere.name = name;
        if (tags) sphere.tags = tags;
        if (userData) sphere.userData = userData;
        if (typeof visible === 'boolean') sphere.visible = visible;
        if (typeof locked === 'boolean') sphere.locked = locked;

        // Restore transform
        if (transform) {
            if (transform.position) sphere.position = transform.position;
            if (transform.rotation) sphere.rotation = transform.rotation;
            if (transform.scale) sphere.scale = transform.scale;
        }

        // Restore material properties if provided
        if (material && sphere.threeMesh.material) {
            const mat = sphere.threeMesh.material;
            if (material.color !== undefined) mat.color.setHex(material.color);
            if (material.opacity !== undefined) mat.opacity = material.opacity;
            if (material.transparent !== undefined) mat.transparent = material.transparent;
            if (material.metalness !== undefined) mat.metalness = material.metalness;
            if (material.roughness !== undefined) mat.roughness = material.roughness;
            if (material.emissive !== undefined) mat.emissive.setHex(material.emissive);
            if (material.wireframe !== undefined) mat.wireframe = material.wireframe;
        }

        return sphere;
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
        const newGeometry = new THREE.SphereGeometry(
            this.#radius,
            this.#widthSegments,
            this.#heightSegments,
        );
        this.threeMesh.geometry = newGeometry;
    }

    /**
     * Emit parameter change event
     * @private
     */
    #emitParameterChange(property, oldValue, newValue) {
        // Import EventBus dynamically to avoid circular imports
        import('../core/EventBus.js').then(({ EventBus }) => {
            EventBus.publish('object:parameterChanged', {
                id: this.id,
                object: this,
                property,
                oldValue,
                newValue,
                parameters: this.getParameters(),
            });
        });
    }
}

export default Sphere;
