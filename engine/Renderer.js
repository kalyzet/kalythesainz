/**
 * Renderer wrapper class for KALYTHESAINZ framework
 * Wraps Three.js WebGLRenderer with simplified interface and automatic setup
 */

import * as THREE from 'three';
import { Config } from '../core/Config.js';
import { EventBus } from '../core/EventBus.js';

export class Renderer {
    #threeRenderer = null;
    #canvas = null;
    #container = null;
    #isDisposed = false;
    #resizeObserver = null;

    /**
     * Create a new Renderer instance
     * @param {object} config - Renderer configuration
     * @param {string} config.containerId - DOM container ID for the canvas
     * @param {number} config.width - Canvas width (optional, defaults to container width)
     * @param {number} config.height - Canvas height (optional, defaults to container height)
     * @param {object} config.renderer - Three.js renderer options
     * @throws {Error} If container not found or WebGL not supported
     */
    constructor(config = {}) {
        this.#validateConfig(config);
        this.#initializeRenderer(config);
        this.#setupResizeHandling();
        this.#setupEventListeners();

        // Emit renderer created event
        EventBus.publish('renderer:created', {
            renderer: this,
            config,
            timestamp: Date.now(),
        });
    }

    /**
     * Get the underlying Three.js renderer
     * @returns {THREE.WebGLRenderer} Three.js renderer instance
     */
    get threeRenderer() {
        return this.#threeRenderer;
    }

    /**
     * Get the canvas element
     * @returns {HTMLCanvasElement} Canvas element
     */
    get canvas() {
        return this.#canvas;
    }

    /**
     * Get the container element
     * @returns {HTMLElement} Container element
     */
    get container() {
        return this.#container;
    }

    /**
     * Get renderer size
     * @returns {object} Size object with width and height
     */
    get size() {
        const size = new THREE.Vector2();
        this.#threeRenderer.getSize(size);
        return { width: size.x, height: size.y };
    }

    /**
     * Check if renderer is disposed
     * @returns {boolean} True if disposed
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Set renderer size
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {boolean} updateStyle - Whether to update canvas style (default: true)
     * @throws {Error} If renderer is disposed or invalid dimensions
     */
    setSize(width, height, updateStyle = true) {
        if (this.#isDisposed) {
            throw new Error('Cannot set size on disposed renderer');
        }

        if (typeof width !== 'number' || typeof height !== 'number') {
            throw new Error('Width and height must be numbers');
        }

        if (width <= 0 || height <= 0) {
            throw new Error('Width and height must be positive numbers');
        }

        this.#threeRenderer.setSize(width, height, updateStyle);

        // Emit resize event
        EventBus.publish('renderer:resized', {
            renderer: this,
            width,
            height,
            timestamp: Date.now(),
        });
    }

    /**
     * Render a scene with a camera
     * @param {THREE.Scene} scene - Three.js scene to render
     * @param {THREE.Camera} camera - Three.js camera to use
     * @throws {Error} If renderer is disposed or invalid parameters
     */
    render(scene, camera) {
        if (this.#isDisposed) {
            throw new Error('Cannot render with disposed renderer');
        }

        if (!scene || !scene.isScene) {
            throw new Error('First parameter must be a Three.js Scene');
        }

        if (!camera || !camera.isCamera) {
            throw new Error('Second parameter must be a Three.js Camera');
        }

        this.#threeRenderer.render(scene, camera);
    }

    /**
     * Set pixel ratio for high-DPI displays
     * @param {number} ratio - Pixel ratio (optional, defaults to device pixel ratio)
     */
    setPixelRatio(ratio = null) {
        if (this.#isDisposed) {
            throw new Error('Cannot set pixel ratio on disposed renderer');
        }

        const pixelRatio = ratio !== null ? ratio : Math.min(window.devicePixelRatio, 2);
        this.#threeRenderer.setPixelRatio(pixelRatio);

        // Emit pixel ratio change event
        EventBus.publish('renderer:pixel-ratio-changed', {
            renderer: this,
            pixelRatio,
            timestamp: Date.now(),
        });
    }

    /**
     * Enable or disable shadows
     * @param {boolean} enabled - Whether to enable shadows
     */
    setShadowsEnabled(enabled) {
        if (this.#isDisposed) {
            throw new Error('Cannot set shadows on disposed renderer');
        }

        this.#threeRenderer.shadowMap.enabled = enabled;
        this.#threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Emit shadows change event
        EventBus.publish('renderer:shadows-changed', {
            renderer: this,
            enabled,
            timestamp: Date.now(),
        });
    }

    /**
     * Set clear color
     * @param {number|string} color - Color value (hex number or CSS string)
     * @param {number} alpha - Alpha value (0-1)
     */
    setClearColor(color, alpha = 1) {
        if (this.#isDisposed) {
            throw new Error('Cannot set clear color on disposed renderer');
        }

        this.#threeRenderer.setClearColor(color, alpha);

        // Emit clear color change event
        EventBus.publish('renderer:clear-color-changed', {
            renderer: this,
            color,
            alpha,
            timestamp: Date.now(),
        });
    }

    /**
     * Resize renderer to fit container
     */
    resizeToContainer() {
        if (this.#isDisposed || !this.#container) {
            return;
        }

        const rect = this.#container.getBoundingClientRect();
        this.setSize(rect.width, rect.height);
    }

    /**
     * Dispose of the renderer and clean up resources
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        // Emit disposing event
        EventBus.publish('renderer:disposing', {
            renderer: this,
            timestamp: Date.now(),
        });

        // Clean up resize observer
        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect();
            this.#resizeObserver = null;
        }

        // Remove canvas from container
        if (this.#canvas && this.#container && this.#container.contains(this.#canvas)) {
            this.#container.removeChild(this.#canvas);
        }

        // Dispose Three.js renderer
        if (this.#threeRenderer) {
            this.#threeRenderer.dispose();
            this.#threeRenderer = null;
        }

        // Clear references
        this.#canvas = null;
        this.#container = null;
        this.#isDisposed = true;

        // Emit disposed event
        EventBus.publish('renderer:disposed', {
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

        if (config.containerId && typeof config.containerId !== 'string') {
            throw new Error('containerId must be a string');
        }

        if (config.width !== undefined && (typeof config.width !== 'number' || config.width <= 0)) {
            throw new Error('width must be a positive number');
        }

        if (
            config.height !== undefined &&
            (typeof config.height !== 'number' || config.height <= 0)
        ) {
            throw new Error('height must be a positive number');
        }
    }

    /**
     * Initialize the Three.js renderer
     * @private
     */
    #initializeRenderer(config) {
        // Get container element
        const containerId = config.containerId || 'kalythesainz-container';
        this.#container = document.getElementById(containerId);

        if (!this.#container) {
            throw new Error(`Container element with ID '${containerId}' not found`);
        }

        // Get renderer configuration
        const rendererConfig = {
            ...Config.get('renderer'),
            ...config.renderer,
        };

        // Create Three.js renderer
        try {
            this.#threeRenderer = new THREE.WebGLRenderer(rendererConfig);
        } catch (error) {
            throw new Error(`Failed to create WebGL renderer: ${error.message}`);
        }

        // Get canvas
        this.#canvas = this.#threeRenderer.domElement;

        // Set initial size
        const width = config.width || this.#container.clientWidth || 800;
        const height = config.height || this.#container.clientHeight || 600;
        this.setSize(width, height);

        // Set pixel ratio for high-DPI displays
        this.setPixelRatio();

        // Set default clear color
        const sceneConfig = Config.get('scene');
        if (sceneConfig && sceneConfig.background !== undefined) {
            this.setClearColor(sceneConfig.background);
        }

        // Add canvas to container
        this.#container.appendChild(this.#canvas);
    }

    /**
     * Set up automatic resize handling
     * @private
     */
    #setupResizeHandling() {
        if (!window.ResizeObserver) {
            // Fallback to window resize event
            const handleResize = () => this.resizeToContainer();
            window.addEventListener('resize', handleResize);
            return;
        }

        // Use ResizeObserver for more accurate container size changes
        this.#resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === this.#container) {
                    const { width, height } = entry.contentRect;
                    this.setSize(width, height);
                    break;
                }
            }
        });

        this.#resizeObserver.observe(this.#container);
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Listen for configuration changes
        EventBus.subscribe('config:changed', (event) => {
            const { key, value } = event.data;

            if (key === 'scene.background') {
                this.setClearColor(value);
            }
        });

        // Listen for app destruction
        EventBus.subscribe('app:destroying', () => {
            this.dispose();
        });
    }
}

export default Renderer;
