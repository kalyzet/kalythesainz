/**
 * Plugin Interfaces for KALYTHESAINZ framework
 * Base classes and interfaces for creating custom plugins
 */

import { Object3D } from '../engine/Object3D.js';

/**
 * Base class for custom object plugins
 * Extend this class to create custom 3D objects
 */
export class CustomObjectPlugin {
    /**
     * Plugin metadata
     */
    static get metadata() {
        return {
            name: 'CustomObject',
            version: '1.0.0',
            type: 'object',
            description: 'Base class for custom objects',
            frameworkVersion: '1.0.0',
        };
    }

    /**
     * Create a custom object instance
     * Override this method to implement custom object creation
     * @param {object} params - Object parameters
     * @returns {Object3D} Object3D instance
     */
    static create(params = {}) {
        throw new Error('create() method must be implemented by subclass');
    }

    /**
     * Get plugin registration object
     * @returns {object} Plugin registration object
     */
    static getPluginDefinition() {
        const metadata = this.metadata;
        return {
            name: metadata.name,
            version: metadata.version,
            type: metadata.type,
            description: metadata.description,
            frameworkVersion: metadata.frameworkVersion,
            dependencies: metadata.dependencies || [],
            create: this.create.bind(this),
        };
    }
}

/**
 * Base class for custom tool plugins
 * Extend this class to create custom visual tools
 */
export class CustomToolPlugin {
    /**
     * Plugin metadata
     */
    static get metadata() {
        return {
            name: 'CustomTool',
            version: '1.0.0',
            type: 'tool',
            description: 'Base class for custom tools',
            frameworkVersion: '1.0.0',
        };
    }

    /**
     * Initialize the tool
     * Override this method to implement tool initialization
     * @param {object} options - Initialization options
     * @returns {*} Tool instance
     */
    static init(options = {}) {
        throw new Error('init() method must be implemented by subclass');
    }

    /**
     * Destroy the tool and clean up resources
     * Override this method to implement tool cleanup
     * @param {*} instance - Tool instance to destroy
     */
    static destroy(instance) {
        throw new Error('destroy() method must be implemented by subclass');
    }

    /**
     * Get plugin registration object
     * @returns {object} Plugin registration object
     */
    static getPluginDefinition() {
        const metadata = this.metadata;
        return {
            name: metadata.name,
            version: metadata.version,
            type: metadata.type,
            description: metadata.description,
            frameworkVersion: metadata.frameworkVersion,
            dependencies: metadata.dependencies || [],
            init: this.init.bind(this),
            destroy: this.destroy.bind(this),
        };
    }
}

/**
 * Base class for custom module plugins
 * Extend this class to create custom framework modules
 */
export class CustomModulePlugin {
    /**
     * Plugin metadata
     */
    static get metadata() {
        return {
            name: 'CustomModule',
            version: '1.0.0',
            type: 'module',
            description: 'Base class for custom modules',
            frameworkVersion: '1.0.0',
        };
    }

    /**
     * Initialize the module
     * Override this method to implement module initialization
     * @param {object} options - Initialization options
     * @returns {*} Module instance
     */
    static init(options = {}) {
        throw new Error('init() method must be implemented by subclass');
    }

    /**
     * Destroy the module and clean up resources
     * Override this method to implement module cleanup
     * @param {*} instance - Module instance to destroy
     */
    static destroy(instance) {
        throw new Error('destroy() method must be implemented by subclass');
    }

    /**
     * Get plugin registration object
     * @returns {object} Plugin registration object
     */
    static getPluginDefinition() {
        const metadata = this.metadata;
        return {
            name: metadata.name,
            version: metadata.version,
            type: metadata.type,
            description: metadata.description,
            frameworkVersion: metadata.frameworkVersion,
            dependencies: metadata.dependencies || [],
            init: this.init.bind(this),
            destroy: this.destroy.bind(this),
        };
    }
}

/**
 * Helper function to create a simple object plugin
 * @param {object} config - Plugin configuration
 * @param {string} config.name - Plugin name
 * @param {string} config.version - Plugin version
 * @param {string} config.description - Plugin description
 * @param {Function} config.create - Create function
 * @param {string[]} config.dependencies - Optional dependencies
 * @returns {object} Plugin definition
 */
export function createObjectPlugin(config) {
    if (!config.name || !config.version || !config.create) {
        throw new Error('Object plugin requires name, version, and create function');
    }

    return {
        name: config.name,
        version: config.version,
        type: 'object',
        description: config.description || '',
        frameworkVersion: config.frameworkVersion || '1.0.0',
        dependencies: config.dependencies || [],
        create: config.create,
    };
}

/**
 * Helper function to create a simple tool plugin
 * @param {object} config - Plugin configuration
 * @param {string} config.name - Plugin name
 * @param {string} config.version - Plugin version
 * @param {string} config.description - Plugin description
 * @param {Function} config.init - Init function
 * @param {Function} config.destroy - Destroy function
 * @param {string[]} config.dependencies - Optional dependencies
 * @returns {object} Plugin definition
 */
export function createToolPlugin(config) {
    if (!config.name || !config.version || !config.init || !config.destroy) {
        throw new Error('Tool plugin requires name, version, init, and destroy functions');
    }

    return {
        name: config.name,
        version: config.version,
        type: 'tool',
        description: config.description || '',
        frameworkVersion: config.frameworkVersion || '1.0.0',
        dependencies: config.dependencies || [],
        init: config.init,
        destroy: config.destroy,
    };
}

/**
 * Helper function to create a simple module plugin
 * @param {object} config - Plugin configuration
 * @param {string} config.name - Plugin name
 * @param {string} config.version - Plugin version
 * @param {string} config.description - Plugin description
 * @param {Function} config.init - Init function
 * @param {Function} config.destroy - Destroy function
 * @param {string[]} config.dependencies - Optional dependencies
 * @returns {object} Plugin definition
 */
export function createModulePlugin(config) {
    if (!config.name || !config.version || !config.init || !config.destroy) {
        throw new Error('Module plugin requires name, version, init, and destroy functions');
    }

    return {
        name: config.name,
        version: config.version,
        type: 'module',
        description: config.description || '',
        frameworkVersion: config.frameworkVersion || '1.0.0',
        dependencies: config.dependencies || [],
        init: config.init,
        destroy: config.destroy,
    };
}

export default {
    CustomObjectPlugin,
    CustomToolPlugin,
    CustomModulePlugin,
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
};
