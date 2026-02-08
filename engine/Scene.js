/**
 * Scene class for KALYTHESAINZ framework
 * Backward compatibility layer for singleton-based API
 *
 * @deprecated Use createScene() for new code. This singleton API is maintained for backward compatibility.
 */

import { SceneInstance } from './SceneInstance.js';

export class Scene {
    static #singletonInstance = null;

    /**
     * Initialize the scene (singleton pattern)
     * @deprecated Use createScene() instead for instance-based API
     * @param {string|object} containerId - DOM container ID or configuration object
     * @param {object} config - Scene configuration (if first param is string)
     * @param {string} config.containerId - DOM container ID
     * @param {object} config.renderer - Renderer configuration
     * @param {object} config.camera - Camera configuration
     * @param {object} config.lights - Lighting configuration
     * @param {boolean} config.autoStart - Whether to start render loop automatically
     * @returns {SceneInstance} Scene instance
     */
    static init(containerId, config = {}) {
        // Auto-destroy previous singleton if it exists
        if (Scene.#singletonInstance) {
            console.warn(
                '[DEPRECATED] Scene.init() called multiple times. Previous instance destroyed. ' +
                    'Use createScene() for multiple scenes. ' +
                    'See migration guide: https://github.com/kalythesainz/kalythesainz#migration-guide',
            );
            Scene.#singletonInstance.destroy();
        }

        // Log deprecation warning
        console.warn(
            '[DEPRECATED] Scene.init() is deprecated. Use createScene() instead. ' +
                'See migration guide: https://github.com/kalythesainz/kalythesainz#migration-guide',
        );

        // Handle different parameter patterns
        let finalContainerId;
        let finalConfig;

        if (typeof containerId === 'string') {
            finalContainerId = containerId;
            finalConfig = config;
        } else if (typeof containerId === 'object') {
            finalContainerId = containerId.containerId;
            finalConfig = containerId;
        } else {
            throw new Error(
                'First parameter must be a container ID string or configuration object',
            );
        }

        // Create singleton SceneInstance
        Scene.#singletonInstance = new SceneInstance(finalContainerId, finalConfig);

        return Scene.#singletonInstance;
    }

    /**
     * Get the singleton Scene instance
     * @returns {SceneInstance|null} Scene instance or null if not initialized
     */
    static getInstance() {
        return Scene.#singletonInstance;
    }

    /**
     * Check if scene is initialized
     * @returns {boolean} True if initialized
     */
    static isInitialized() {
        return Scene.#singletonInstance !== null;
    }

    /**
     * Destroy the singleton scene and clean up all resources
     */
    static destroy() {
        if (!Scene.#singletonInstance) {
            return;
        }

        Scene.#singletonInstance.destroy();
        Scene.#singletonInstance = null;
    }
}

export default Scene;
