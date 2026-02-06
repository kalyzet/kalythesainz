/**
 * Light class for KALYTHESAINZ framework
 * Provides preset lighting configurations and simplified light management
 */

import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

export class Light {
    #threeLight = null;
    #type = null;
    #isDisposed = false;
    #helper = null;

    /**
     * Create a new Light instance
     * @param {THREE.Light} threeLight - Three.js light instance
     * @param {string} type - Light type identifier
     * @private
     */
    constructor(threeLight, type) {
        this.#threeLight = threeLight;
        this.#type = type;
        this.#setupEventListeners();

        // Emit light created event
        EventBus.publish('light:created', {
            light: this,
            type,
            timestamp: Date.now(),
        });
    }

    /**
     * Get the underlying Three.js light
     * @returns {THREE.Light} Three.js light instance
     */
    get threeLight() {
        return this.#threeLight;
    }

    /**
     * Synchronize framework state with underlying Three.js light
     * Call this after directly manipulating the Three.js light
     * @returns {object} Current light state
     */
    syncFromThree() {
        if (this.#isDisposed) {
            throw new Error('Cannot sync from disposed light');
        }

        // Emit sync event
        EventBus.publish('light:synced', {
            light: this,
            intensity: this.#threeLight.intensity,
            color: this.#threeLight.color.getHex(),
            position: this.#threeLight.position ? this.#threeLight.position.toArray() : null,
            timestamp: Date.now(),
        });

        return {
            type: this.#type,
            intensity: this.#threeLight.intensity,
            color: this.#threeLight.color.getHex(),
            position: this.#threeLight.position ? this.#threeLight.position.toArray() : null,
        };
    }

    /**
     * Get light type
     * @returns {string} Light type identifier
     */
    get type() {
        return this.#type;
    }

    /**
     * Check if light is disposed
     * @returns {boolean} True if disposed
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Get light position (for positional lights)
     * @returns {THREE.Vector3} Position vector
     */
    get position() {
        return this.#threeLight.position;
    }

    /**
     * Set light position (for positional lights)
     * @param {number|THREE.Vector3|Array} x - X coordinate, Vector3, or [x, y, z] array
     * @param {number} y - Y coordinate (if x is number)
     * @param {number} z - Z coordinate (if x is number)
     */
    setPosition(x, y, z) {
        if (this.#isDisposed) {
            throw new Error('Cannot set position on disposed light');
        }

        if (!this.#threeLight.position) {
            throw new Error(`Light type '${this.#type}' does not support position`);
        }

        if (x instanceof THREE.Vector3) {
            this.#threeLight.position.copy(x);
        } else if (Array.isArray(x) && x.length >= 3) {
            this.#threeLight.position.set(x[0], x[1], x[2]);
        } else if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            this.#threeLight.position.set(x, y, z);
        } else {
            throw new Error(
                'Invalid position parameters. Use (x, y, z), Vector3, or [x, y, z] array',
            );
        }

        // Emit position change event
        EventBus.publish('light:position-changed', {
            light: this,
            position: this.#threeLight.position.clone(),
            timestamp: Date.now(),
        });
    }

    /**
     * Set light intensity
     * @param {number} intensity - Light intensity
     */
    setIntensity(intensity) {
        if (this.#isDisposed) {
            throw new Error('Cannot set intensity on disposed light');
        }

        if (typeof intensity !== 'number' || intensity < 0) {
            throw new Error('Intensity must be a non-negative number');
        }

        this.#threeLight.intensity = intensity;

        // Emit intensity change event
        EventBus.publish('light:intensity-changed', {
            light: this,
            intensity,
            timestamp: Date.now(),
        });
    }

    /**
     * Set light color
     * @param {number|string|THREE.Color} color - Color value
     */
    setColor(color) {
        if (this.#isDisposed) {
            throw new Error('Cannot set color on disposed light');
        }

        this.#threeLight.color.set(color);

        // Emit color change event
        EventBus.publish('light:color-changed', {
            light: this,
            color: this.#threeLight.color.clone(),
            timestamp: Date.now(),
        });
    }

    /**
     * Enable or disable shadows (for shadow-casting lights)
     * @param {boolean} enabled - Whether to enable shadows
     */
    setShadowsEnabled(enabled) {
        if (this.#isDisposed) {
            throw new Error('Cannot set shadows on disposed light');
        }

        if (!this.#threeLight.castShadow !== undefined) {
            this.#threeLight.castShadow = enabled;

            // Configure shadow properties for better quality
            if (enabled && this.#threeLight.shadow) {
                this.#threeLight.shadow.mapSize.width = 2048;
                this.#threeLight.shadow.mapSize.height = 2048;
                this.#threeLight.shadow.camera.near = 0.5;
                this.#threeLight.shadow.camera.far = 500;
            }

            // Emit shadows change event
            EventBus.publish('light:shadows-changed', {
                light: this,
                enabled,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Set light target (for directional and spot lights)
     * @param {THREE.Object3D|THREE.Vector3|Array} target - Target object or position
     */
    setTarget(target) {
        if (this.#isDisposed) {
            throw new Error('Cannot set target on disposed light');
        }

        if (!this.#threeLight.target) {
            throw new Error(`Light type '${this.#type}' does not support target`);
        }

        if (target instanceof THREE.Object3D) {
            this.#threeLight.target = target;
        } else if (target instanceof THREE.Vector3) {
            this.#threeLight.target.position.copy(target);
        } else if (Array.isArray(target) && target.length >= 3) {
            this.#threeLight.target.position.set(target[0], target[1], target[2]);
        } else {
            throw new Error('Invalid target. Use Object3D, Vector3, or [x, y, z] array');
        }

        // Emit target change event
        EventBus.publish('light:target-changed', {
            light: this,
            target: this.#threeLight.target.position.clone(),
            timestamp: Date.now(),
        });
    }

    /**
     * Show or hide light helper
     * @param {boolean} visible - Whether to show helper
     * @param {THREE.Scene} scene - Scene to add/remove helper from
     */
    setHelperVisible(visible, scene = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot set helper visibility on disposed light');
        }

        if (visible && !this.#helper) {
            // Create appropriate helper based on light type
            switch (this.#type) {
                case 'directional':
                    this.#helper = new THREE.DirectionalLightHelper(this.#threeLight, 1);
                    break;
                case 'point':
                    this.#helper = new THREE.PointLightHelper(this.#threeLight, 1);
                    break;
                case 'spot':
                    this.#helper = new THREE.SpotLightHelper(this.#threeLight);
                    break;
                default:
                    console.warn(`No helper available for light type '${this.#type}'`);
                    return;
            }

            if (scene && this.#helper) {
                scene.add(this.#helper);
            }
        } else if (!visible && this.#helper) {
            if (scene && this.#helper.parent) {
                scene.remove(this.#helper);
            }
            this.#helper = null;
        }

        // Emit helper visibility change event
        EventBus.publish('light:helper-visibility-changed', {
            light: this,
            visible,
            timestamp: Date.now(),
        });
    }

    /**
     * Create a sun light preset (directional light simulating sunlight)
     * @param {object} config - Configuration options
     * @param {number} config.intensity - Light intensity (default: 1)
     * @param {number|string} config.color - Light color (default: 0xffffff)
     * @param {Array} config.position - Light position (default: [10, 10, 5])
     * @param {Array} config.target - Light target position (default: [0, 0, 0])
     * @param {boolean} config.castShadow - Whether to cast shadows (default: true)
     * @returns {Light} Light instance configured as sun light
     */
    static sun(config = {}) {
        const {
            intensity = 1,
            color = 0xffffff,
            position = [10, 10, 5],
            target = [0, 0, 0],
            castShadow = true,
        } = config;

        const directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(position[0], position[1], position[2]);
        directionalLight.target.position.set(target[0], target[1], target[2]);
        directionalLight.castShadow = castShadow;

        // Configure shadow properties for sun light
        if (castShadow) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -10;
            directionalLight.shadow.camera.right = 10;
            directionalLight.shadow.camera.top = 10;
            directionalLight.shadow.camera.bottom = -10;
        }

        return new Light(directionalLight, 'directional');
    }

    /**
     * Create an ambient light preset
     * @param {object} config - Configuration options
     * @param {number} config.intensity - Light intensity (default: 0.4)
     * @param {number|string} config.color - Light color (default: 0xffffff)
     * @returns {Light} Light instance configured as ambient light
     */
    static ambient(config = {}) {
        const { intensity = 0.4, color = 0xffffff } = config;

        const ambientLight = new THREE.AmbientLight(color, intensity);
        return new Light(ambientLight, 'ambient');
    }

    /**
     * Create a point light preset
     * @param {object} config - Configuration options
     * @param {number} config.x - X position (default: 0)
     * @param {number} config.y - Y position (default: 5)
     * @param {number} config.z - Z position (default: 0)
     * @param {number} config.intensity - Light intensity (default: 1)
     * @param {number|string} config.color - Light color (default: 0xffffff)
     * @param {number} config.distance - Light distance (default: 0 - no limit)
     * @param {number} config.decay - Light decay (default: 2)
     * @param {boolean} config.castShadow - Whether to cast shadows (default: false)
     * @returns {Light} Light instance configured as point light
     */
    static point(x = 0, y = 5, z = 0, config = {}) {
        // Handle both old signature (x, y, z, intensity, color) and new config object
        let finalConfig;
        if (typeof config === 'number') {
            // Old signature: point(x, y, z, intensity, color)
            const intensity = config;
            const color = arguments[4] || 0xffffff;
            finalConfig = { intensity, color };
        } else {
            finalConfig = config;
        }

        const {
            intensity = 1,
            color = 0xffffff,
            distance = 0,
            decay = 2,
            castShadow = false,
        } = finalConfig;

        const pointLight = new THREE.PointLight(color, intensity, distance, decay);
        pointLight.position.set(x, y, z);
        pointLight.castShadow = castShadow;

        // Configure shadow properties
        if (castShadow) {
            pointLight.shadow.mapSize.width = 1024;
            pointLight.shadow.mapSize.height = 1024;
            pointLight.shadow.camera.near = 0.5;
            pointLight.shadow.camera.far = distance || 50;
        }

        return new Light(pointLight, 'point');
    }

    /**
     * Create a spot light preset
     * @param {object} config - Configuration options
     * @param {number} config.x - X position (default: 0)
     * @param {number} config.y - Y position (default: 10)
     * @param {number} config.z - Z position (default: 0)
     * @param {Array} config.target - Target position (default: [0, 0, 0])
     * @param {number} config.intensity - Light intensity (default: 1)
     * @param {number|string} config.color - Light color (default: 0xffffff)
     * @param {number} config.distance - Light distance (default: 0 - no limit)
     * @param {number} config.angle - Spotlight cone angle (default: Math.PI / 3)
     * @param {number} config.penumbra - Spotlight penumbra (default: 0)
     * @param {number} config.decay - Light decay (default: 2)
     * @param {boolean} config.castShadow - Whether to cast shadows (default: true)
     * @returns {Light} Light instance configured as spot light
     */
    static spot(config = {}) {
        const {
            x = 0,
            y = 10,
            z = 0,
            target = [0, 0, 0],
            intensity = 1,
            color = 0xffffff,
            distance = 0,
            angle = Math.PI / 3,
            penumbra = 0,
            decay = 2,
            castShadow = true,
        } = config;

        const spotLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        spotLight.position.set(x, y, z);
        spotLight.target.position.set(target[0], target[1], target[2]);
        spotLight.castShadow = castShadow;

        // Configure shadow properties
        if (castShadow) {
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            spotLight.shadow.camera.near = 0.5;
            spotLight.shadow.camera.far = distance || 50;
            spotLight.shadow.camera.fov = (angle * 180) / Math.PI;
        }

        return new Light(spotLight, 'spot');
    }

    /**
     * Create a hemisphere light preset (sky and ground lighting)
     * @param {object} config - Configuration options
     * @param {number|string} config.skyColor - Sky color (default: 0xffffbb)
     * @param {number|string} config.groundColor - Ground color (default: 0x080820)
     * @param {number} config.intensity - Light intensity (default: 1)
     * @returns {Light} Light instance configured as hemisphere light
     */
    static hemisphere(config = {}) {
        const { skyColor = 0xffffbb, groundColor = 0x080820, intensity = 1 } = config;

        const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        return new Light(hemisphereLight, 'hemisphere');
    }

    /**
     * Create a basic lighting setup with sun and ambient light
     * @param {object} config - Configuration options
     * @param {object} config.sun - Sun light configuration
     * @param {object} config.ambient - Ambient light configuration
     * @returns {Light[]} Array of Light instances
     */
    static basicSetup(config = {}) {
        const { sun: sunConfig = {}, ambient: ambientConfig = {} } = config;

        return [Light.sun(sunConfig), Light.ambient(ambientConfig)];
    }

    /**
     * Create a three-point lighting setup
     * @param {object} config - Configuration options
     * @param {object} config.key - Key light configuration
     * @param {object} config.fill - Fill light configuration
     * @param {object} config.rim - Rim light configuration
     * @returns {Light[]} Array of Light instances
     */
    static threePointSetup(config = {}) {
        const { key: keyConfig = {}, fill: fillConfig = {}, rim: rimConfig = {} } = config;

        return [
            // Key light (main light)
            Light.spot({
                x: 5,
                y: 10,
                z: 5,
                intensity: 1,
                castShadow: true,
                ...keyConfig,
            }),
            // Fill light (softer, opposite side)
            Light.point(-3, 5, 3, {
                intensity: 0.5,
                ...fillConfig,
            }),
            // Rim light (back light for edge definition)
            Light.point(0, 5, -5, {
                intensity: 0.3,
                ...rimConfig,
            }),
        ];
    }

    /**
     * Dispose of the light
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        // Emit disposing event
        EventBus.publish('light:disposing', {
            light: this,
            timestamp: Date.now(),
        });

        // Clean up helper
        if (this.#helper) {
            if (this.#helper.parent) {
                this.#helper.parent.remove(this.#helper);
            }
            this.#helper = null;
        }

        // Clear references
        this.#threeLight = null;
        this.#type = null;
        this.#isDisposed = true;

        // Emit disposed event
        EventBus.publish('light:disposed', {
            timestamp: Date.now(),
        });
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

export default Light;
