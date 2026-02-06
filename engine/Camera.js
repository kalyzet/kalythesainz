/**
 * Camera wrapper class for KALYTHESAINZ framework
 * Wraps Three.js cameras with simplified interface and common presets
 */

import * as THREE from 'three';
import { Config } from '../core/Config.js';
import { EventBus } from '../core/EventBus.js';

export class Camera {
    #threeCamera = null;
    #type = null;
    #isDisposed = false;

    /**
     * Create a new Camera instance
     * @param {string} type - Camera type ('perspective' or 'orthographic')
     * @param {object} config - Camera configuration
     * @param {number} config.fov - Field of view (perspective only)
     * @param {number} config.aspect - Aspect ratio
     * @param {number} config.near - Near clipping plane
     * @param {number} config.far - Far clipping plane
     * @param {number} config.left - Left frustum plane (orthographic only)
     * @param {number} config.right - Right frustum plane (orthographic only)
     * @param {number} config.top - Top frustum plane (orthographic only)
     * @param {number} config.bottom - Bottom frustum plane (orthographic only)
     * @throws {Error} If invalid camera type or configuration
     */
    constructor(type = 'perspective', config = {}) {
        this.#validateConfig(type, config);
        this.#initializeCamera(type, config);
        this.#setupEventListeners();

        // Emit camera created event
        EventBus.publish('camera:created', {
            camera: this,
            type,
            config,
            timestamp: Date.now(),
        });
    }

    /**
     * Get the underlying Three.js camera
     * @returns {THREE.Camera} Three.js camera instance
     */
    get threeCamera() {
        return this.#threeCamera;
    }

    /**
     * Synchronize framework state with underlying Three.js camera
     * Call this after directly manipulating the Three.js camera
     * @returns {object} Current camera state
     */
    syncFromThree() {
        if (this.#isDisposed) {
            throw new Error('Cannot sync from disposed camera');
        }

        // Emit sync event
        EventBus.publish('camera:synced', {
            camera: this,
            position: this.#threeCamera.position.toArray(),
            rotation: [
                this.#threeCamera.rotation.x,
                this.#threeCamera.rotation.y,
                this.#threeCamera.rotation.z,
            ],
            timestamp: Date.now(),
        });

        return {
            position: this.#threeCamera.position.toArray(),
            rotation: [
                this.#threeCamera.rotation.x,
                this.#threeCamera.rotation.y,
                this.#threeCamera.rotation.z,
            ],
            type: this.#type,
        };
    }

    /**
     * Get camera type
     * @returns {string} Camera type ('perspective' or 'orthographic')
     */
    get type() {
        return this.#type;
    }

    /**
     * Check if camera is disposed
     * @returns {boolean} True if disposed
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Get camera position
     * @returns {THREE.Vector3} Position vector
     */
    get position() {
        return this.#threeCamera.position;
    }

    /**
     * Set camera position
     * @param {number|THREE.Vector3|Array} x - X coordinate, Vector3, or [x, y, z] array
     * @param {number} y - Y coordinate (if x is number)
     * @param {number} z - Z coordinate (if x is number)
     */
    setPosition(x, y, z) {
        if (this.#isDisposed) {
            throw new Error('Cannot set position on disposed camera');
        }

        if (x instanceof THREE.Vector3) {
            this.#threeCamera.position.copy(x);
        } else if (Array.isArray(x) && x.length >= 3) {
            this.#threeCamera.position.set(x[0], x[1], x[2]);
        } else if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            this.#threeCamera.position.set(x, y, z);
        } else {
            throw new Error(
                'Invalid position parameters. Use (x, y, z), Vector3, or [x, y, z] array',
            );
        }

        // Emit position change event
        EventBus.publish('camera:position-changed', {
            camera: this,
            position: this.#threeCamera.position.clone(),
            timestamp: Date.now(),
        });
    }

    /**
     * Make camera look at a target
     * @param {number|THREE.Vector3|Array} x - X coordinate, Vector3, or [x, y, z] array
     * @param {number} y - Y coordinate (if x is number)
     * @param {number} z - Z coordinate (if x is number)
     */
    lookAt(x, y, z) {
        if (this.#isDisposed) {
            throw new Error('Cannot look at target on disposed camera');
        }

        if (x instanceof THREE.Vector3) {
            this.#threeCamera.lookAt(x);
        } else if (Array.isArray(x) && x.length >= 3) {
            this.#threeCamera.lookAt(x[0], x[1], x[2]);
        } else if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            this.#threeCamera.lookAt(x, y, z);
        } else {
            throw new Error(
                'Invalid lookAt parameters. Use (x, y, z), Vector3, or [x, y, z] array',
            );
        }

        // Emit look at event
        EventBus.publish('camera:look-at-changed', {
            camera: this,
            target: new THREE.Vector3(
                x instanceof THREE.Vector3 ? x.x : Array.isArray(x) ? x[0] : x,
                x instanceof THREE.Vector3 ? x.y : Array.isArray(x) ? x[1] : y,
                x instanceof THREE.Vector3 ? x.z : Array.isArray(x) ? x[2] : z,
            ),
            timestamp: Date.now(),
        });
    }

    /**
     * Set field of view (perspective camera only)
     * @param {number} fov - Field of view in degrees
     * @throws {Error} If not a perspective camera or invalid FOV
     */
    setFov(fov) {
        if (this.#isDisposed) {
            throw new Error('Cannot set FOV on disposed camera');
        }

        if (this.#type !== 'perspective') {
            throw new Error('FOV can only be set on perspective cameras');
        }

        if (typeof fov !== 'number' || fov <= 0 || fov >= 180) {
            throw new Error('FOV must be a number between 0 and 180');
        }

        this.#threeCamera.fov = fov;
        this.#threeCamera.updateProjectionMatrix();

        // Emit FOV change event
        EventBus.publish('camera:fov-changed', {
            camera: this,
            fov,
            timestamp: Date.now(),
        });
    }

    /**
     * Set aspect ratio
     * @param {number} aspect - Aspect ratio (width / height)
     */
    setAspect(aspect) {
        if (this.#isDisposed) {
            throw new Error('Cannot set aspect on disposed camera');
        }

        if (typeof aspect !== 'number' || aspect <= 0) {
            throw new Error('Aspect ratio must be a positive number');
        }

        if (this.#type === 'perspective') {
            this.#threeCamera.aspect = aspect;
        } else {
            // For orthographic camera, adjust frustum
            const height = this.#threeCamera.top - this.#threeCamera.bottom;
            const width = height * aspect;
            this.#threeCamera.left = -width / 2;
            this.#threeCamera.right = width / 2;
        }

        this.#threeCamera.updateProjectionMatrix();

        // Emit aspect change event
        EventBus.publish('camera:aspect-changed', {
            camera: this,
            aspect,
            timestamp: Date.now(),
        });
    }

    /**
     * Set near and far clipping planes
     * @param {number} near - Near clipping plane
     * @param {number} far - Far clipping plane
     */
    setClippingPlanes(near, far) {
        if (this.#isDisposed) {
            throw new Error('Cannot set clipping planes on disposed camera');
        }

        if (typeof near !== 'number' || near <= 0) {
            throw new Error('Near clipping plane must be a positive number');
        }

        if (typeof far !== 'number' || far <= near) {
            throw new Error('Far clipping plane must be greater than near plane');
        }

        this.#threeCamera.near = near;
        this.#threeCamera.far = far;
        this.#threeCamera.updateProjectionMatrix();

        // Emit clipping planes change event
        EventBus.publish('camera:clipping-planes-changed', {
            camera: this,
            near,
            far,
            timestamp: Date.now(),
        });
    }

    /**
     * Create a top view camera preset
     * @param {object} config - Configuration options
     * @param {number} config.height - Height above the scene (default: 10)
     * @param {number} config.fov - Field of view (default: 75)
     * @returns {Camera} Camera instance configured for top view
     */
    static topView(config = {}) {
        const { height = 10, fov = 75 } = config;

        const camera = new Camera('perspective', {
            fov,
            ...Config.get('camera'),
            ...config,
        });

        camera.setPosition(0, height, 0);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    /**
     * Create a front view camera preset
     * @param {object} config - Configuration options
     * @param {number} config.distance - Distance from the scene (default: 10)
     * @param {number} config.fov - Field of view (default: 75)
     * @returns {Camera} Camera instance configured for front view
     */
    static frontView(config = {}) {
        const { distance = 10, fov = 75 } = config;

        const camera = new Camera('perspective', {
            fov,
            ...Config.get('camera'),
            ...config,
        });

        camera.setPosition(0, 0, distance);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    /**
     * Create an isometric view camera preset
     * @param {object} config - Configuration options
     * @param {number} config.distance - Distance from the scene (default: 10)
     * @param {number} config.fov - Field of view (default: 75)
     * @returns {Camera} Camera instance configured for isometric view
     */
    static isometric(config = {}) {
        const { distance = 10, fov = 75 } = config;

        const camera = new Camera('perspective', {
            fov,
            ...Config.get('camera'),
            ...config,
        });

        // Isometric view: 45° angles on X and Y axes
        const x = distance * Math.cos(Math.PI / 4) * Math.cos(Math.PI / 4);
        const y = distance * Math.sin(Math.PI / 4);
        const z = distance * Math.cos(Math.PI / 4) * Math.sin(Math.PI / 4);

        camera.setPosition(x, y, z);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    /**
     * Create an orthographic camera preset
     * @param {object} config - Configuration options
     * @param {number} config.size - Orthographic frustum size (default: 10)
     * @param {number} config.aspect - Aspect ratio (default: from Config)
     * @returns {Camera} Camera instance configured for orthographic view
     */
    static orthographic(config = {}) {
        const { size = 10, aspect = Config.get('camera.aspect') || 1 } = config;

        const camera = new Camera('orthographic', {
            left: (-size * aspect) / 2,
            right: (size * aspect) / 2,
            top: size / 2,
            bottom: -size / 2,
            ...Config.get('camera'),
            ...config,
        });

        camera.setPosition(0, 0, 10);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    /**
     * Dispose of the camera
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        // Emit disposing event
        EventBus.publish('camera:disposing', {
            camera: this,
            timestamp: Date.now(),
        });

        // Clear references
        this.#threeCamera = null;
        this.#type = null;
        this.#isDisposed = true;

        // Emit disposed event
        EventBus.publish('camera:disposed', {
            timestamp: Date.now(),
        });
    }

    /**
     * Validate configuration
     * @private
     */
    #validateConfig(type, config) {
        if (typeof type !== 'string' || !['perspective', 'orthographic'].includes(type)) {
            throw new Error('Camera type must be "perspective" or "orthographic"');
        }

        if (config && typeof config !== 'object') {
            throw new Error('Configuration must be an object');
        }

        // Validate perspective camera config
        if (type === 'perspective') {
            if (
                config.fov !== undefined &&
                (typeof config.fov !== 'number' || config.fov <= 0 || config.fov >= 180)
            ) {
                throw new Error('FOV must be a number between 0 and 180');
            }
        }

        // Validate orthographic camera config
        if (type === 'orthographic') {
            const requiredProps = ['left', 'right', 'top', 'bottom'];
            for (const prop of requiredProps) {
                if (config[prop] !== undefined && typeof config[prop] !== 'number') {
                    throw new Error(`${prop} must be a number`);
                }
            }
        }

        // Validate common properties
        if (
            config.aspect !== undefined &&
            (typeof config.aspect !== 'number' || config.aspect <= 0)
        ) {
            throw new Error('Aspect ratio must be a positive number');
        }

        if (config.near !== undefined && (typeof config.near !== 'number' || config.near <= 0)) {
            throw new Error('Near clipping plane must be a positive number');
        }

        if (config.far !== undefined && (typeof config.far !== 'number' || config.far <= 0)) {
            throw new Error('Far clipping plane must be a positive number');
        }

        if (config.near !== undefined && config.far !== undefined && config.far <= config.near) {
            throw new Error('Far clipping plane must be greater than near plane');
        }
    }

    /**
     * Initialize the Three.js camera
     * @private
     */
    #initializeCamera(type, config) {
        this.#type = type;

        // Get default camera configuration
        const defaultConfig = Config.get('camera');
        const mergedConfig = { ...defaultConfig, ...config };

        if (type === 'perspective') {
            this.#threeCamera = new THREE.PerspectiveCamera(
                mergedConfig.fov || 75,
                mergedConfig.aspect || 1,
                mergedConfig.near || 0.1,
                mergedConfig.far || 1000,
            );
        } else {
            this.#threeCamera = new THREE.OrthographicCamera(
                mergedConfig.left || -10,
                mergedConfig.right || 10,
                mergedConfig.top || 10,
                mergedConfig.bottom || -10,
                mergedConfig.near || 0.1,
                mergedConfig.far || 1000,
            );
        }
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Listen for app destruction
        EventBus.subscribe('app:destroying', () => {
            this.dispose();
        });
    }
}

export default Camera;
