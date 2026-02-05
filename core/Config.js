/**
 * Configuration management for KALYTHESAINZ framework
 * Provides centralized configuration with defaults, validation, and merging
 */

export class Config {
    static #instance = null;
    static #config = {};

    /**
     * Default configuration values
     */
    static defaults = {
        renderer: {
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
        },
        camera: {
            fov: 75,
            near: 0.1,
            far: 1000,
            aspect: window.innerWidth / window.innerHeight,
        },
        scene: {
            background: 0x222222,
            fog: null,
        },
        controls: {
            enableDamping: true,
            dampingFactor: 0.05,
            enableZoom: true,
            enableRotate: true,
            enablePan: true,
        },
        performance: {
            maxObjects: 1000,
            targetFPS: 60,
            enableStats: false,
        },
    };

    /**
     * Initialize configuration with defaults
     */
    static init() {
        if (!Config.#instance) {
            Config.#config = Config.#deepClone(Config.defaults);
            Config.#instance = true;
        }
        return Config;
    }

    /**
     * Get configuration value by key path
     * @param {string} key - Dot-separated key path (e.g., 'renderer.antialias')
     * @returns {*} Configuration value
     */
    static get(key) {
        Config.init();

        if (!key) {
            return Config.#deepClone(Config.#config);
        }

        const keys = key.split('.');
        let value = Config.#config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Set configuration value by key path
     * @param {string} key - Dot-separated key path
     * @param {*} value - Value to set
     * @throws {Error} If key is invalid or value fails validation
     */
    static set(key, value) {
        Config.init();

        if (!key || typeof key !== 'string') {
            throw new Error('Config key must be a non-empty string');
        }

        const keys = key.split('.');
        let target = Config.#config;

        // Navigate to parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in target) || typeof target[k] !== 'object') {
                target[k] = {};
            }
            target = target[k];
        }

        const finalKey = keys[keys.length - 1];

        // Validate value if we have a default to compare against
        Config.#validateValue(key, value);

        target[finalKey] = value;
    }

    /**
     * Merge configuration object with current config
     * @param {object} config - Configuration object to merge
     * @throws {Error} If config is not an object
     */
    static merge(config) {
        Config.init();

        if (!config || typeof config !== 'object') {
            throw new Error('Config must be an object');
        }

        Config.#config = Config.#deepMerge(Config.#config, config);
    }

    /**
     * Reset configuration to defaults
     */
    static reset() {
        Config.#config = Config.#deepClone(Config.defaults);
    }

    /**
     * Get all configuration keys
     * @returns {string[]} Array of dot-separated key paths
     */
    static getKeys() {
        Config.init();
        return Config.#getAllKeys(Config.#config);
    }

    /**
     * Check if a configuration key exists
     * @param {string} key - Dot-separated key path
     * @returns {boolean} True if key exists
     */
    static has(key) {
        return Config.get(key) !== undefined;
    }

    /**
     * Deep clone an object
     * @private
     */
    static #deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => Config.#deepClone(item));
        }

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = Config.#deepClone(obj[key]);
            }
        }

        return cloned;
    }

    /**
     * Deep merge two objects
     * @private
     */
    static #deepMerge(target, source) {
        const result = Config.#deepClone(target);

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    result[key] &&
                    typeof result[key] === 'object' &&
                    typeof source[key] === 'object' &&
                    !Array.isArray(source[key])
                ) {
                    result[key] = Config.#deepMerge(result[key], source[key]);
                } else {
                    result[key] = Config.#deepClone(source[key]);
                }
            }
        }

        return result;
    }

    /**
     * Get all keys from nested object
     * @private
     */
    static #getAllKeys(obj, prefix = '') {
        const keys = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                keys.push(fullKey);

                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    keys.push(...Config.#getAllKeys(obj[key], fullKey));
                }
            }
        }

        return keys;
    }

    /**
     * Validate configuration value
     * @private
     */
    static #validateValue(key, value) {
        // Get default value for comparison
        const defaultValue = Config.#getDefaultValue(key);

        if (defaultValue !== undefined) {
            const defaultType = typeof defaultValue;
            const valueType = typeof value;

            // Type validation
            if (defaultType !== valueType) {
                throw new Error(
                    `Config validation failed for key '${key}': expected ${defaultType}, got ${valueType}`,
                );
            }

            // Specific validations
            if (key.includes('fov') && (value <= 0 || value >= 180)) {
                throw new Error(
                    `Config validation failed for key '${key}': FOV must be between 0 and 180`,
                );
            }

            if (key.includes('near') && value <= 0) {
                throw new Error(
                    `Config validation failed for key '${key}': near value must be positive`,
                );
            }

            if (key.includes('far') && value <= 0) {
                throw new Error(
                    `Config validation failed for key '${key}': far value must be positive`,
                );
            }

            if (key.includes('targetFPS') && (value <= 0 || value > 240)) {
                throw new Error(
                    `Config validation failed for key '${key}': targetFPS must be between 1 and 240`,
                );
            }
        }
    }

    /**
     * Get default value for a key path
     * @private
     */
    static #getDefaultValue(key) {
        const keys = key.split('.');
        let value = Config.defaults;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }

        return value;
    }
}

export default Config;
