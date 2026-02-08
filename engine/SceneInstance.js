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
import { Box } from '../objects/Box.js';
import { Sphere } from '../objects/Sphere.js';
import { Plane } from '../objects/Plane.js';

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
    #instanceListeners = new Map(); // Instance-scoped event listeners
    #globalUnsubscribers = []; // Track global event subscriptions for cleanup

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
     * Subscribe to an instance-scoped event
     * Events are only emitted and received within this scene instance
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {object} options - Subscription options
     * @param {boolean} options.once - Execute callback only once
     * @param {number} options.priority - Priority for callback execution (higher = earlier)
     * @returns {Function} Unsubscribe function
     * @throws {Error} If event name or callback is invalid
     */
    on(event, callback, options = {}) {
        if (this.#isDisposed) {
            throw new Error('Cannot subscribe to events on disposed scene');
        }

        if (!event || typeof event !== 'string') {
            throw new Error('Event name must be a non-empty string');
        }

        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const { once = false, priority = 0 } = options;

        if (typeof priority !== 'number') {
            throw new Error('Priority must be a number');
        }

        // Create listener object
        const listener = {
            callback,
            once,
            priority,
            id: this.#generateEventId(),
        };

        // Add to instance listeners map
        if (!this.#instanceListeners.has(event)) {
            this.#instanceListeners.set(event, []);
        }

        const eventListeners = this.#instanceListeners.get(event);
        eventListeners.push(listener);

        // Sort by priority (higher priority first)
        eventListeners.sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => this.off(event, listener.id);
    }

    /**
     * Unsubscribe from an instance-scoped event
     * @param {string} event - Event name
     * @param {string|Function} callbackOrId - Callback function or listener ID
     * @returns {boolean} True if successfully unsubscribed
     */
    off(event, callbackOrId) {
        if (!this.#instanceListeners.has(event)) {
            return false;
        }

        const eventListeners = this.#instanceListeners.get(event);
        const initialLength = eventListeners.length;

        // Remove by ID or callback function
        const filteredListeners = eventListeners.filter((listener) => {
            if (typeof callbackOrId === 'string') {
                return listener.id !== callbackOrId;
            } else if (typeof callbackOrId === 'function') {
                return listener.callback !== callbackOrId;
            }
            return true;
        });

        this.#instanceListeners.set(event, filteredListeners);

        // Clean up empty event arrays
        if (filteredListeners.length === 0) {
            this.#instanceListeners.delete(event);
        }

        return filteredListeners.length < initialLength;
    }

    /**
     * Emit an instance-scoped event
     * Only listeners registered on this instance will be notified
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {object} Execution results
     * @throws {Error} If event name is invalid
     */
    emit(event, data = null) {
        if (!event || typeof event !== 'string') {
            throw new Error('Event name must be a non-empty string');
        }

        // Create event object
        const eventObj = {
            name: event,
            data,
            timestamp: Date.now(),
            scene: this,
        };

        // Get listeners for this event
        const listeners = this.#instanceListeners.get(event) || [];
        const results = {
            event: eventObj,
            executed: 0,
            errors: [],
        };

        if (listeners.length === 0) {
            return results;
        }

        // Execute callbacks
        for (const listener of listeners) {
            try {
                listener.callback(eventObj);
                results.executed++;

                // Remove one-time listeners
                if (listener.once) {
                    this.off(event, listener.id);
                }
            } catch (error) {
                results.errors.push({
                    listener: listener.id,
                    error: error.message,
                    stack: error.stack,
                });
            }
        }

        return results;
    }

    /**
     * Subscribe to a global event (EventBus)
     * Global events are shared across all scene instances
     * Automatically unsubscribed when scene is destroyed
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    onGlobal(event, callback, options = {}) {
        if (this.#isDisposed) {
            throw new Error('Cannot subscribe to global events on disposed scene');
        }

        // Subscribe to global EventBus
        const unsubscribe = EventBus.subscribe(event, callback, options);

        // Track for cleanup
        this.#globalUnsubscribers.push(unsubscribe);

        // Return unsubscribe function that also removes from tracking
        return () => {
            const index = this.#globalUnsubscribers.indexOf(unsubscribe);
            if (index !== -1) {
                this.#globalUnsubscribers.splice(index, 1);
            }
            unsubscribe();
        };
    }

    /**
     * Emit a global event (EventBus)
     * Global events are shared across all scene instances
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @param {object} options - Publishing options
     * @returns {object|Promise<object>} Execution results
     */
    emitGlobal(event, data = null, options = {}) {
        return EventBus.publish(event, data, options);
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
     * Create a box and add it to the scene
     * @param {number} width - Box width (default: 1)
     * @param {number} height - Box height (default: 1)
     * @param {number} depth - Box depth (default: 1)
     * @param {THREE.Material} material - Optional material
     * @returns {Box} Created box instance
     * @throws {Error} If scene is disposed
     */
    createBox(width = 1, height = 1, depth = 1, material = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot create box in disposed scene');
        }

        // Create box
        const box = Box.create(width, height, depth, material);

        // Add to scene
        this.add(box);

        return box;
    }

    /**
     * Create a sphere and add it to the scene
     * @param {number} radius - Sphere radius (default: 1)
     * @param {number} segments - Number of segments (default: 32)
     * @param {THREE.Material} material - Optional material
     * @returns {Sphere} Created sphere instance
     * @throws {Error} If scene is disposed
     */
    createSphere(radius = 1, segments = 32, material = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot create sphere in disposed scene');
        }

        // Create sphere
        const sphere = Sphere.create(radius, segments, material);

        // Add to scene
        this.add(sphere);

        return sphere;
    }

    /**
     * Create a plane and add it to the scene
     * @param {number} width - Plane width (default: 1)
     * @param {number} height - Plane height (default: 1)
     * @param {THREE.Material} material - Optional material
     * @returns {Plane} Created plane instance
     * @throws {Error} If scene is disposed
     */
    createPlane(width = 1, height = 1, material = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot create plane in disposed scene');
        }

        // Create plane
        const plane = Plane.create(width, height, material);

        // Add to scene
        this.add(plane);

        return plane;
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

        // Emit instance-scoped object:added event
        this.emit('object:added', {
            objectId,
            object,
        });

        // Emit global object added event
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
     * Add a light to the scene by type and config
     * @param {string|Light} typeOrLight - Light type ('sun', 'ambient', 'point', 'spot', 'hemisphere') or Light instance
     * @param {object} config - Light configuration (ignored if typeOrLight is a Light instance)
     * @returns {Light} The added light
     * @throws {Error} If scene is disposed or invalid light type
     */
    addLight(typeOrLight, config = {}) {
        if (this.#isDisposed) {
            throw new Error('Cannot add light to disposed scene');
        }

        let light;

        // Check if first parameter is already a Light instance
        if (typeOrLight && typeof typeOrLight === 'object' && typeOrLight.threeLight) {
            // It's a Light instance, use it directly
            light = typeOrLight;
        } else if (typeof typeOrLight === 'string') {
            // It's a light type string, create the light
            const type = typeOrLight.toLowerCase();

            switch (type) {
                case 'sun':
                case 'directional':
                    light = Light.sun(config);
                    break;
                case 'ambient':
                    light = Light.ambient(config);
                    break;
                case 'point':
                    // Handle point light with position parameters
                    const { x = 0, y = 5, z = 0, ...pointConfig } = config;
                    light = Light.point(x, y, z, pointConfig);
                    break;
                case 'spot':
                    light = Light.spot(config);
                    break;
                case 'hemisphere':
                    light = Light.hemisphere(config);
                    break;
                default:
                    throw new Error(
                        `Invalid light type '${type}'. Supported types: sun, ambient, point, spot, hemisphere`,
                    );
            }
        } else {
            throw new Error('First parameter must be a light type string or Light instance');
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

                // Emit instance-scoped frame:rendered event
                this.emit('frame:rendered', {
                    timestamp: currentTime,
                    fps: 1000 / (currentTime - lastTime),
                });

                // Emit global render frame event
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
     * Disposes renderer, camera, all objects, all lights
     * Removes canvas from DOM
     * Cancels active render loops
     * Emits 'scene:destroyed' event
     * Sets isDisposed flag
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

        // Stop render loop (cancel active render loops)
        this.stopRenderLoop();

        // Clear all objects and lights
        this.clear(true);

        // Auto-unsubscribe all instance-scoped event listeners
        this.#instanceListeners.clear();

        // Auto-unsubscribe all global event listeners
        for (const unsubscribe of this.#globalUnsubscribers) {
            unsubscribe();
        }
        this.#globalUnsubscribers = [];

        // Remove canvas from DOM
        if (this.#renderer && this.#renderer.canvas) {
            const canvas = this.#renderer.canvas;
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }

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

        // Emit instance-scoped scene:destroyed event BEFORE setting isDisposed flag
        this.emit('scene:destroyed', {
            timestamp: Date.now(),
        });

        // Set isDisposed flag
        this.#isDisposed = true;

        // Emit global scene:destroyed event (as per requirements)
        EventBus.publish('scene:destroyed', {
            timestamp: Date.now(),
        });

        // Also emit disposed event for backward compatibility
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

    /**
     * Generate unique event listener ID
     * @private
     */
    #generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
}

export default SceneInstance;
