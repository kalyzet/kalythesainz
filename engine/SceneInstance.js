/**
 * SceneInstance class for KALYTHESAINZ framework
 * Instance-based scene manager that handles initialization, object management, and render loop
 * Replaces singleton Scene pattern with multiple independent instances
 */

import * as THREE from 'three';
import { Config } from '../core/Config.js';
import { EventBus } from '../core/EventBus.js';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Light } from './Light.js';

export class SceneInstance {
    #threeScene = null;
    #renderer = null;
    #camera = null;
    #lights = [];
    #objects = new Map();
    #isDisposed = false;
    #renderLoop = null;
    #isRendering = false;
    #containerId = null;
    #config = null;

    /**
     * Create a new SceneInstance
     * @param {string} containerId - DOM container ID
     * @param {object} config - Scene configuration
     * @param {object} config.renderer - Renderer configuration
     * @param {object} config.camera - Camera configuration
     * @param {object} config.lights - Lighting configuration
     * @param {boolean} config.autoStart - Whether to start render loop automatically
     * @throws {Error} If invalid configuration
     */
    constructor(containerId, config = {}) {
        // Validate parameters
        if (!containerId || typeof containerId !== 'string') {
            throw new Error('containerId must be a non-empty string');
        }

        this.#containerId = containerId;
        this.#config = { ...config };

        this.#validateConfig(config);
        this.#initializeScene(config);
        this.#setupEventListeners();

        // Emit scene created event
        EventBus.publish('scene:created', {
            scene: this,
            config,
            timestamp: Date.now(),
        });
    }

    /**
     * Get the underlying Three.js scene
     * @returns {THREE.Scene} Three.js scene instance
     */
    get threeScene() {
        return this.#threeScene;
    }

    /**
     * Get the renderer
     * @returns {Renderer} Renderer instance
     */
    get renderer() {
        return this.#renderer;
    }

    /**
     * Get the camera
     * @returns {Camera} Camera instance
     */
    get camera() {
        return this.#camera;
    }

    /**
     * Get all lights
     * @returns {Light[]} Array of Light instances
     */
    get lights() {
        return [...this.#lights];
    }

    /**
     * Get all objects
     * @returns {Map} Map of object ID to object instance
     */
    get objects() {
        return new Map(this.#objects);
    }

    /**
     * Check if scene is disposed
     * @returns {boolean} True if disposed
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Check if render loop is running
     * @returns {boolean} True if rendering
     */
    get isRendering() {
        return this.#isRendering;
    }

    /**
     * Synchronize framework state with underlying Three.js scene
     * Call this after directly manipulating the Three.js scene
     * Detects objects added/removed directly to Three.js scene
     * @returns {object} Synchronization report
     */
    syncFromThree() {
        if (this.#isDisposed) {
            throw new Error('Cannot sync from disposed scene');
        }

        const report = {
            added: [],
            removed: [],
            unchanged: this.#objects.size,
        };

        // Find objects in Three.js scene that aren't tracked
        const trackedThreeObjects = new Set(
            Array.from(this.#objects.values()).map((data) => data.threeObject),
        );

        this.#threeScene.children.forEach((child) => {
            // Skip lights and cameras
            if (child.isLight || child.isCamera) {
                return;
            }

            // Check if this Three.js object is tracked
            if (!trackedThreeObjects.has(child)) {
                // Found untracked object - add it to our tracking
                const objectId = child.uuid;
                const wrapper = child.userData._kalythesainzWrapper || null;

                this.#objects.set(objectId, {
                    id: objectId,
                    object: wrapper || child,
                    threeObject: child,
                    addedAt: Date.now(),
                });

                report.added.push(objectId);
                report.unchanged--;
            }
        });

        // Find tracked objects that are no longer in Three.js scene
        for (const [objectId, objectData] of this.#objects.entries()) {
            if (!this.#threeScene.children.includes(objectData.threeObject)) {
                this.#objects.delete(objectId);
                report.removed.push(objectId);
                report.unchanged--;
            }
        }

        // Emit sync event if changes detected
        if (report.added.length > 0 || report.removed.length > 0) {
            EventBus.publish('scene:synced', {
                scene: this,
                report,
                timestamp: Date.now(),
            });
        }

        return report;
    }

    /**
     * Enable automatic synchronization with Three.js scene
     * Periodically checks for direct manipulations
     * @param {boolean} enabled - Whether to enable auto-sync
     * @param {number} interval - Sync interval in milliseconds (default: 100)
     */
    setAutoSync(enabled, interval = 100) {
        if (enabled) {
            if (!this._syncInterval) {
                this._syncInterval = setInterval(() => {
                    this.syncFromThree();
                }, interval);
            }
        } else {
            if (this._syncInterval) {
                clearInterval(this._syncInterval);
                this._syncInterval = null;
            }
        }
    }

    /**
     * Add an object to the scene
     * @param {object} object - Object to add (must have threeObject property)
     * @param {string} id - Optional custom ID for the object
     * @returns {string} Object ID
     * @throws {Error} If scene is disposed or invalid object
     */
    add(object, id = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot add object to disposed scene');
        }

        if (!object) {
            throw new Error('Object is required');
        }

        // Handle different object types
        let threeObject;
        let objectId = id;

        if (object.threeObject || object.threeMesh) {
            // Framework object (Object3D wrapper)
            threeObject = object.threeObject || object.threeMesh;
            objectId = objectId || object.id || this.#generateId();
        } else if (object.isObject3D || object.isMesh || object.isLight) {
            // Direct Three.js object
            threeObject = object;
            objectId = objectId || object.uuid || this.#generateId();
        } else {
            throw new Error(
                'Object must have threeObject/threeMesh property or be a Three.js object',
            );
        }

        // Check for duplicate IDs
        if (this.#objects.has(objectId)) {
            throw new Error(`Object with ID '${objectId}' already exists in scene`);
        }

        // Add to Three.js scene
        this.#threeScene.add(threeObject);

        // Store reference
        this.#objects.set(objectId, {
            id: objectId,
            object,
            threeObject,
            addedAt: Date.now(),
        });

        // Emit object added event
        EventBus.publish('scene:object-added', {
            scene: this,
            objectId,
            object,
            timestamp: Date.now(),
        });

        return objectId;
    }

    /**
     * Remove an object from the scene
     * @param {string|object} objectOrId - Object ID or object instance
     * @returns {boolean} True if object was removed
     * @throws {Error} If scene is disposed
     */
    remove(objectOrId) {
        if (this.#isDisposed) {
            throw new Error('Cannot remove object from disposed scene');
        }

        let objectId;
        let objectData;

        if (typeof objectOrId === 'string') {
            objectId = objectOrId;
            objectData = this.#objects.get(objectId);
        } else if (objectOrId && (objectOrId.id || objectOrId.uuid)) {
            objectId = objectOrId.id || objectOrId.uuid;
            objectData = this.#objects.get(objectId);
        } else {
            // Search by object reference
            for (const [id, data] of this.#objects.entries()) {
                if (data.object === objectOrId || data.threeObject === objectOrId) {
                    objectId = id;
                    objectData = data;
                    break;
                }
            }
        }

        if (!objectData) {
            return false;
        }

        // Remove from Three.js scene
        this.#threeScene.remove(objectData.threeObject);

        // Remove from our tracking
        this.#objects.delete(objectId);

        // Dispose if object has dispose method
        if (objectData.object && typeof objectData.object.dispose === 'function') {
            objectData.object.dispose();
        }

        // Emit object removed event
        EventBus.publish('scene:object-removed', {
            scene: this,
            objectId,
            object: objectData.object,
            timestamp: Date.now(),
        });

        return true;
    }

    /**
     * Find an object by ID
     * @param {string} id - Object ID
     * @returns {object|null} Object instance or null if not found
     */
    find(id) {
        const objectData = this.#objects.get(id);
        return objectData ? objectData.object : null;
    }

    /**
     * Find objects by criteria
     * @param {Function} predicate - Function to test each object
     * @returns {object[]} Array of matching objects
     */
    findAll(predicate) {
        const results = [];
        for (const objectData of this.#objects.values()) {
            if (predicate(objectData.object, objectData.id)) {
                results.push(objectData.object);
            }
        }
        return results;
    }

    /**
     * Clear all objects from the scene
     * @param {boolean} disposeLights - Whether to also remove lights (default: false)
     */
    clear(disposeLights = false) {
        if (this.#isDisposed) {
            throw new Error('Cannot clear disposed scene');
        }

        // Remove all objects
        const objectIds = Array.from(this.#objects.keys());
        for (const objectId of objectIds) {
            this.remove(objectId);
        }

        // Optionally remove lights
        if (disposeLights) {
            const lights = [...this.#lights];
            for (const light of lights) {
                this.removeLight(light);
            }
        }

        // Emit scene cleared event
        EventBus.publish('scene:cleared', {
            scene: this,
            disposedLights: disposeLights,
            timestamp: Date.now(),
        });
    }

    /**
     * Add a light to the scene
     * @param {Light} light - Light instance to add
     * @returns {Light} The added light
     */
    addLight(light) {
        if (this.#isDisposed) {
            throw new Error('Cannot add light to disposed scene');
        }

        if (!light || !light.threeLight) {
            throw new Error('Invalid light object');
        }

        // Add to Three.js scene
        this.#threeScene.add(light.threeLight);

        // Add target if it exists (for directional and spot lights)
        if (light.threeLight.target) {
            this.#threeScene.add(light.threeLight.target);
        }

        // Store reference
        this.#lights.push(light);

        // Emit light added event
        EventBus.publish('scene:light-added', {
            scene: this,
            light,
            timestamp: Date.now(),
        });

        return light;
    }

    /**
     * Remove a light from the scene
     * @param {Light} light - Light instance to remove
     * @returns {boolean} True if light was removed
     */
    removeLight(light) {
        if (this.#isDisposed) {
            throw new Error('Cannot remove light from disposed scene');
        }

        const index = this.#lights.indexOf(light);
        if (index === -1) {
            return false;
        }

        // Remove from Three.js scene
        this.#threeScene.remove(light.threeLight);

        // Remove target if it exists
        if (light.threeLight.target) {
            this.#threeScene.remove(light.threeLight.target);
        }

        // Remove from our tracking
        this.#lights.splice(index, 1);

        // Dispose light
        light.dispose();

        // Emit light removed event
        EventBus.publish('scene:light-removed', {
            scene: this,
            light,
            timestamp: Date.now(),
        });

        return true;
    }

    /**
     * Start the render loop
     * @param {number} targetFPS - Target frames per second (optional)
     */
    startRenderLoop(targetFPS = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot start render loop on disposed scene');
        }

        if (this.#isRendering) {
            return; // Already rendering
        }

        const fps = targetFPS || Config.get('performance.targetFPS') || 60;
        const frameTime = 1000 / fps;
        let lastTime = 0;

        const render = (currentTime) => {
            if (!this.#isRendering || this.#isDisposed) {
                return;
            }

            // Throttle to target FPS
            if (currentTime - lastTime >= frameTime) {
                this.render();
                lastTime = currentTime;

                // Emit render frame event
                EventBus.publish('scene:frame-rendered', {
                    scene: this,
                    timestamp: currentTime,
                    fps: 1000 / (currentTime - lastTime),
                });
            }

            this.#renderLoop = requestAnimationFrame(render);
        };

        this.#isRendering = true;
        this.#renderLoop = requestAnimationFrame(render);

        // Emit render loop started event
        EventBus.publish('scene:render-loop-started', {
            scene: this,
            targetFPS: fps,
            timestamp: Date.now(),
        });
    }

    /**
     * Stop the render loop
     */
    stopRenderLoop() {
        if (!this.#isRendering) {
            return;
        }

        if (this.#renderLoop) {
            cancelAnimationFrame(this.#renderLoop);
            this.#renderLoop = null;
        }

        this.#isRendering = false;

        // Emit render loop stopped event
        EventBus.publish('scene:render-loop-stopped', {
            scene: this,
            timestamp: Date.now(),
        });
    }

    /**
     * Render a single frame
     */
    render() {
        if (this.#isDisposed) {
            throw new Error('Cannot render disposed scene');
        }

        if (!this.#renderer || !this.#camera) {
            throw new Error('Renderer and camera are required for rendering');
        }

        this.#renderer.render(this.#threeScene, this.#camera.threeCamera);
    }

    /**
     * Serialize the scene to JSON
     * @returns {object} Serialized scene data
     */
    serialize() {
        if (this.#isDisposed) {
            throw new Error('Cannot serialize disposed scene');
        }

        const sceneData = {
            version: '1.0.0',
            metadata: {
                created: new Date().toISOString(),
                objectCount: this.#objects.size,
                lightCount: this.#lights.length,
            },
            camera: this.#camera
                ? {
                      type: this.#camera.type,
                      position: this.#camera.position.toArray(),
                      // Add more camera properties as needed
                  }
                : null,
            lights: this.#lights.map((light) => ({
                type: light.type,
                intensity: light.threeLight.intensity,
                position: light.threeLight.position ? light.threeLight.position.toArray() : null,
                // Add more light properties as needed
            })),
            objects: Array.from(this.#objects.values()).map((objectData) => ({
                id: objectData.id,
                type: objectData.object.constructor.name,
                // Add serialization for object properties
                addedAt: objectData.addedAt,
            })),
        };

        // Emit scene serialized event
        EventBus.publish('scene:serialized', {
            scene: this,
            data: sceneData,
            timestamp: Date.now(),
        });

        return sceneData;
    }

    /**
     * Deserialize scene from JSON data
     * @param {object} data - Serialized scene data
     * @throws {Error} If invalid data or scene is disposed
     */
    deserialize(data) {
        if (this.#isDisposed) {
            throw new Error('Cannot deserialize to disposed scene');
        }

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid scene data');
        }

        // Clear existing scene
        this.clear(true);

        // TODO: Implement full deserialization
        // This would require object factories and more complex serialization

        // Emit scene deserialized event
        EventBus.publish('scene:deserialized', {
            scene: this,
            data,
            timestamp: Date.now(),
        });
    }

    /**
     * Destroy the scene and clean up all resources
     */
    destroy() {
        this.dispose();
    }

    /**
     * Dispose of the scene and clean up resources
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        // Emit disposing event
        EventBus.publish('scene:disposing', {
            scene: this,
            timestamp: Date.now(),
        });

        // Stop render loop
        this.stopRenderLoop();

        // Clear all objects and lights
        this.clear(true);

        // Dispose renderer
        if (this.#renderer) {
            this.#renderer.dispose();
            this.#renderer = null;
        }

        // Dispose camera
        if (this.#camera) {
            this.#camera.dispose();
            this.#camera = null;
        }

        // Clear references
        this.#threeScene = null;
        this.#objects.clear();
        this.#lights = [];
        this.#isDisposed = true;

        // Emit disposed event
        EventBus.publish('scene:disposed', {
            timestamp: Date.now(),
        });
    }

    /**
     * Validate configuration
     * @private
     */
    #validateConfig(config) {
        if (config && typeof config !== 'object') {
            throw new Error('Configuration must be an object');
        }

        if (config.autoStart !== undefined && typeof config.autoStart !== 'boolean') {
            throw new Error('autoStart must be a boolean');
        }
    }

    /**
     * Initialize the scene
     * @private
     */
    #initializeScene(config) {
        // Create Three.js scene
        this.#threeScene = new THREE.Scene();

        // Set background color
        const sceneConfig = Config.get('scene');
        if (sceneConfig && sceneConfig.background !== undefined) {
            this.#threeScene.background = new THREE.Color(sceneConfig.background);
        }

        // Create renderer
        this.#renderer = new Renderer({
            containerId: this.#containerId,
            ...config.renderer,
        });

        // Create camera
        const cameraType = config.camera?.type || 'perspective';
        this.#camera = new Camera(cameraType, {
            aspect: this.#renderer.size.width / this.#renderer.size.height,
            ...config.camera,
        });

        // Set default camera position
        this.#camera.setPosition(0, 5, 10);
        this.#camera.lookAt(0, 0, 0);

        // Create default lighting if specified
        if (config.lights !== false) {
            const lightConfig = config.lights || {};
            const defaultLights = Light.basicSetup(lightConfig);
            for (const light of defaultLights) {
                this.addLight(light);
            }
        }

        // Auto-start render loop if specified
        if (config.autoStart !== false) {
            this.startRenderLoop();
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

        // Listen for renderer resize
        EventBus.subscribe('renderer:resized', (event) => {
            if (event.data.renderer === this.#renderer && this.#camera) {
                const { width, height } = event.data;
                this.#camera.setAspect(width / height);
            }
        });
    }

    /**
     * Generate unique ID
     * @private
     */
    #generateId() {
        return `obj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
}

export default SceneInstance;
