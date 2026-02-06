/**
 * Plugin Manager for KALYTHESAINZ framework
 * Manages plugin registration, lifecycle, and validation
 * Supports custom objects, tools, and modules
 */

import { EventBus } from './EventBus.js';
import { Config } from './Config.js';

export class PluginManager {
    static #instance = null;
    static #initialized = false;
    static #plugins = new Map();
    static #pluginTypes = new Map();

    // Plugin type constants
    static PLUGIN_TYPES = {
        OBJECT: 'object',
        TOOL: 'tool',
        MODULE: 'module',
    };

    // Required plugin interface properties
    static REQUIRED_PROPERTIES = {
        object: ['name', 'version', 'type', 'create'],
        tool: ['name', 'version', 'type', 'init', 'destroy'],
        module: ['name', 'version', 'type', 'init', 'destroy'],
    };

    /**
     * Initialize the PluginManager
     */
    static init() {
        if (!PluginManager.#initialized) {
            PluginManager.#plugins = new Map();
            PluginManager.#pluginTypes = new Map();
            PluginManager.#initialized = true;
            PluginManager.#instance = true;

            // Emit initialization event
            EventBus.publish('plugin-manager:initialized', {
                timestamp: Date.now(),
            });
        }
        return PluginManager;
    }

    /**
     * Register a plugin
     * @param {object} plugin - Plugin object
     * @param {string} plugin.name - Plugin name (unique identifier)
     * @param {string} plugin.version - Plugin version (semver format)
     * @param {string} plugin.type - Plugin type (object, tool, module)
     * @param {string} plugin.description - Plugin description
     * @param {string[]} plugin.dependencies - Optional array of dependency plugin names
     * @param {string} plugin.frameworkVersion - Compatible framework version
     * @returns {boolean} True if registration successful
     * @throws {Error} If plugin is invalid or already registered
     */
    static register(plugin) {
        PluginManager.init();

        // Validate plugin
        PluginManager.#validatePlugin(plugin);

        // Check if already registered
        if (PluginManager.#plugins.has(plugin.name)) {
            throw new Error(`Plugin '${plugin.name}' is already registered`);
        }

        // Check dependencies
        if (plugin.dependencies && plugin.dependencies.length > 0) {
            for (const dep of plugin.dependencies) {
                if (!PluginManager.#plugins.has(dep)) {
                    throw new Error(
                        `Plugin '${plugin.name}' depends on '${dep}' which is not registered`,
                    );
                }
            }
        }

        // Check framework version compatibility
        if (plugin.frameworkVersion) {
            const compatible = PluginManager.#checkVersionCompatibility(
                plugin.frameworkVersion,
                '1.0.0',
            );
            if (!compatible) {
                throw new Error(
                    `Plugin '${plugin.name}' requires framework version ${plugin.frameworkVersion}, but current version is 1.0.0`,
                );
            }
        }

        // Store plugin
        const pluginData = {
            ...plugin,
            registeredAt: Date.now(),
            status: 'registered',
            instance: null,
        };

        PluginManager.#plugins.set(plugin.name, pluginData);

        // Track by type
        if (!PluginManager.#pluginTypes.has(plugin.type)) {
            PluginManager.#pluginTypes.set(plugin.type, []);
        }
        PluginManager.#pluginTypes.get(plugin.type).push(plugin.name);

        // Emit registration event
        EventBus.publish('plugin:registered', {
            plugin: pluginData,
            timestamp: Date.now(),
        });

        return true;
    }

    /**
     * Unregister a plugin
     * @param {string} name - Plugin name
     * @returns {boolean} True if unregistration successful
     * @throws {Error} If plugin is not found or has dependents
     */
    static unregister(name) {
        PluginManager.init();

        if (!PluginManager.#plugins.has(name)) {
            throw new Error(`Plugin '${name}' is not registered`);
        }

        // Check if other plugins depend on this one
        const dependents = PluginManager.#findDependents(name);
        if (dependents.length > 0) {
            throw new Error(
                `Cannot unregister plugin '${name}' because it has dependents: ${dependents.join(', ')}`,
            );
        }

        const pluginData = PluginManager.#plugins.get(name);

        // Deactivate if active
        if (pluginData.status === 'active') {
            PluginManager.deactivate(name);
        }

        // Remove from type tracking
        const typePlugins = PluginManager.#pluginTypes.get(pluginData.type);
        if (typePlugins) {
            const index = typePlugins.indexOf(name);
            if (index !== -1) {
                typePlugins.splice(index, 1);
            }
        }

        // Remove plugin
        PluginManager.#plugins.delete(name);

        // Emit unregistration event
        EventBus.publish('plugin:unregistered', {
            name,
            timestamp: Date.now(),
        });

        return true;
    }

    /**
     * Activate a plugin
     * @param {string} name - Plugin name
     * @param {object} options - Activation options
     * @returns {*} Plugin instance or result
     * @throws {Error} If plugin is not found or activation fails
     */
    static activate(name, options = {}) {
        PluginManager.init();

        if (!PluginManager.#plugins.has(name)) {
            throw new Error(`Plugin '${name}' is not registered`);
        }

        const pluginData = PluginManager.#plugins.get(name);

        if (pluginData.status === 'active') {
            return pluginData.instance;
        }

        try {
            // Activate dependencies first
            if (pluginData.dependencies && pluginData.dependencies.length > 0) {
                for (const dep of pluginData.dependencies) {
                    if (PluginManager.#plugins.get(dep).status !== 'active') {
                        PluginManager.activate(dep);
                    }
                }
            }

            // Initialize plugin based on type
            let instance = null;

            if (pluginData.type === PluginManager.PLUGIN_TYPES.OBJECT) {
                // Object plugins don't need initialization, just make available
                instance = pluginData;
            } else if (
                pluginData.type === PluginManager.PLUGIN_TYPES.TOOL ||
                pluginData.type === PluginManager.PLUGIN_TYPES.MODULE
            ) {
                // Call init method for tools and modules
                if (typeof pluginData.init === 'function') {
                    instance = pluginData.init(options);
                } else {
                    throw new Error(`Plugin '${name}' does not have an init method`);
                }
            }

            // Update plugin status
            pluginData.status = 'active';
            pluginData.instance = instance;
            pluginData.activatedAt = Date.now();

            // Emit activation event
            EventBus.publish('plugin:activated', {
                name,
                plugin: pluginData,
                timestamp: Date.now(),
            });

            return instance;
        } catch (error) {
            pluginData.status = 'error';
            pluginData.error = error.message;

            // Emit error event
            EventBus.publish('plugin:error', {
                name,
                error: error.message,
                stack: error.stack,
                timestamp: Date.now(),
            });

            throw new Error(`Failed to activate plugin '${name}': ${error.message}`);
        }
    }

    /**
     * Deactivate a plugin
     * @param {string} name - Plugin name
     * @returns {boolean} True if deactivation successful
     * @throws {Error} If plugin is not found or has active dependents
     */
    static deactivate(name) {
        PluginManager.init();

        if (!PluginManager.#plugins.has(name)) {
            throw new Error(`Plugin '${name}' is not registered`);
        }

        const pluginData = PluginManager.#plugins.get(name);

        if (pluginData.status !== 'active') {
            return true;
        }

        // Check if other active plugins depend on this one
        const activeDependents = PluginManager.#findDependents(name).filter(
            (dep) => PluginManager.#plugins.get(dep).status === 'active',
        );

        if (activeDependents.length > 0) {
            throw new Error(
                `Cannot deactivate plugin '${name}' because it has active dependents: ${activeDependents.join(', ')}`,
            );
        }

        try {
            // Call destroy method for tools and modules
            if (
                (pluginData.type === PluginManager.PLUGIN_TYPES.TOOL ||
                    pluginData.type === PluginManager.PLUGIN_TYPES.MODULE) &&
                typeof pluginData.destroy === 'function'
            ) {
                pluginData.destroy(pluginData.instance);
            }

            // Update plugin status
            pluginData.status = 'registered';
            pluginData.instance = null;
            pluginData.deactivatedAt = Date.now();

            // Emit deactivation event
            EventBus.publish('plugin:deactivated', {
                name,
                timestamp: Date.now(),
            });

            return true;
        } catch (error) {
            pluginData.status = 'error';
            pluginData.error = error.message;

            // Emit error event
            EventBus.publish('plugin:error', {
                name,
                error: error.message,
                stack: error.stack,
                timestamp: Date.now(),
            });

            throw new Error(`Failed to deactivate plugin '${name}': ${error.message}`);
        }
    }

    /**
     * Get a plugin by name
     * @param {string} name - Plugin name
     * @returns {object|null} Plugin data or null if not found
     */
    static get(name) {
        PluginManager.init();
        return PluginManager.#plugins.get(name) || null;
    }

    /**
     * Get all plugins
     * @param {string} type - Optional filter by plugin type
     * @returns {object[]} Array of plugin data
     */
    static getAll(type = null) {
        PluginManager.init();

        if (type) {
            const pluginNames = PluginManager.#pluginTypes.get(type) || [];
            return pluginNames.map((name) => PluginManager.#plugins.get(name));
        }

        return Array.from(PluginManager.#plugins.values());
    }

    /**
     * Check if a plugin is registered
     * @param {string} name - Plugin name
     * @returns {boolean} True if registered
     */
    static has(name) {
        PluginManager.init();
        return PluginManager.#plugins.has(name);
    }

    /**
     * Check if a plugin is active
     * @param {string} name - Plugin name
     * @returns {boolean} True if active
     */
    static isActive(name) {
        PluginManager.init();
        const plugin = PluginManager.#plugins.get(name);
        return plugin ? plugin.status === 'active' : false;
    }

    /**
     * Get plugin instance
     * @param {string} name - Plugin name
     * @returns {*} Plugin instance or null
     */
    static getInstance(name) {
        PluginManager.init();
        const plugin = PluginManager.#plugins.get(name);
        return plugin && plugin.status === 'active' ? plugin.instance : null;
    }

    /**
     * Clear all plugins
     */
    static clear() {
        PluginManager.init();

        // Deactivate all active plugins
        for (const [name, plugin] of PluginManager.#plugins.entries()) {
            if (plugin.status === 'active') {
                try {
                    PluginManager.deactivate(name);
                } catch (error) {
                    console.error(`Error deactivating plugin '${name}':`, error);
                }
            }
        }

        // Clear all plugins
        PluginManager.#plugins.clear();
        PluginManager.#pluginTypes.clear();

        // Emit clear event
        EventBus.publish('plugin-manager:cleared', {
            timestamp: Date.now(),
        });
    }

    /**
     * Validate plugin object
     * @private
     */
    static #validatePlugin(plugin) {
        if (!plugin || typeof plugin !== 'object') {
            throw new Error('Plugin must be an object');
        }

        // Check required base properties
        if (!plugin.name || typeof plugin.name !== 'string') {
            throw new Error('Plugin must have a name (string)');
        }

        if (!plugin.version || typeof plugin.version !== 'string') {
            throw new Error('Plugin must have a version (string)');
        }

        if (!plugin.type || typeof plugin.type !== 'string') {
            throw new Error('Plugin must have a type (string)');
        }

        // Validate plugin type
        const validTypes = Object.values(PluginManager.PLUGIN_TYPES);
        if (!validTypes.includes(plugin.type)) {
            throw new Error(
                `Invalid plugin type '${plugin.type}'. Must be one of: ${validTypes.join(', ')}`,
            );
        }

        // Check type-specific required properties
        const requiredProps = PluginManager.REQUIRED_PROPERTIES[plugin.type];
        if (requiredProps) {
            for (const prop of requiredProps) {
                if (!(prop in plugin)) {
                    throw new Error(`Plugin of type '${plugin.type}' must have property '${prop}'`);
                }
            }
        }

        // Validate version format (basic semver check)
        if (!/^\d+\.\d+\.\d+/.test(plugin.version)) {
            throw new Error(
                `Plugin version '${plugin.version}' is not valid semver format (e.g., 1.0.0)`,
            );
        }

        // Validate dependencies
        if (plugin.dependencies) {
            if (!Array.isArray(plugin.dependencies)) {
                throw new Error('Plugin dependencies must be an array');
            }

            for (const dep of plugin.dependencies) {
                if (typeof dep !== 'string') {
                    throw new Error('Plugin dependency names must be strings');
                }
            }
        }

        // Validate create method for object plugins
        if (plugin.type === PluginManager.PLUGIN_TYPES.OBJECT) {
            if (typeof plugin.create !== 'function') {
                throw new Error('Object plugin must have a create method (function)');
            }
        }

        // Validate init/destroy methods for tool and module plugins
        if (
            plugin.type === PluginManager.PLUGIN_TYPES.TOOL ||
            plugin.type === PluginManager.PLUGIN_TYPES.MODULE
        ) {
            if (typeof plugin.init !== 'function') {
                throw new Error(`${plugin.type} plugin must have an init method (function)`);
            }

            if (typeof plugin.destroy !== 'function') {
                throw new Error(`${plugin.type} plugin must have a destroy method (function)`);
            }
        }
    }

    /**
     * Check version compatibility
     * @private
     */
    static #checkVersionCompatibility(required, current) {
        // Simple version comparison (major.minor.patch)
        const parseVersion = (v) => v.split('.').map(Number);
        const [reqMajor, reqMinor] = parseVersion(required);
        const [curMajor, curMinor] = parseVersion(current);

        // Major version must match, minor version must be >= required
        return curMajor === reqMajor && curMinor >= reqMinor;
    }

    /**
     * Find plugins that depend on the given plugin
     * @private
     */
    static #findDependents(name) {
        const dependents = [];

        for (const [pluginName, plugin] of PluginManager.#plugins.entries()) {
            if (plugin.dependencies && plugin.dependencies.includes(name)) {
                dependents.push(pluginName);
            }
        }

        return dependents;
    }
}

export default PluginManager;
