/**
 * Application lifecycle management for KALYTHESAINZ framework
 * Implements singleton pattern for centralized app control and event delegation
 */

import { Config } from './Config.js';
import { EventBus } from './EventBus.js';

export class App {
    static #instance = null;
    static #initialized = false;
    static #destroyed = false;
    static #startTime = null;
    static #config = null;

    /**
     * Initialize the KALYTHESAINZ application
     * @param {object} config - Application configuration
     * @param {string} config.containerId - DOM container ID for the application
     * @param {object} config.renderer - Renderer configuration
     * @param {object} config.camera - Camera configuration
     * @param {object} config.scene - Scene configuration
     * @param {boolean} config.autoStart - Whether to start the application immediately
     * @returns {App} App instance
     * @throws {Error} If already initialized or invalid configuration
     */
    static init(config = {}) {
        if (App.#initialized && !App.#destroyed) {
            throw new Error(
                'App is already initialized. Call App.destroy() first to reinitialize.',
            );
        }

        if (App.#destroyed) {
            // Reset destroyed state for reinitialization
            App.#destroyed = false;
            App.#instance = null;
        }

        // Validate configuration
        App.#validateConfig(config);

        // Initialize core systems
        Config.init();
        EventBus.init();

        // Merge user config with defaults
        if (Object.keys(config).length > 0) {
            Config.merge(config);
        }

        // Store app-specific config
        App.#config = {
            containerId: config.containerId || 'kalythesainz-container',
            autoStart: config.autoStart !== false, // Default to true
            debug: config.debug || false,
            version: '1.0.0',
        };

        // Mark as initialized
        App.#initialized = true;
        App.#startTime = Date.now();
        App.#instance = App;

        // Emit initialization event
        EventBus.publish('app:initialized', {
            config: App.#config,
            timestamp: App.#startTime,
        });

        // Set up error handling
        App.#setupErrorHandling();

        // Set up cleanup on page unload
        App.#setupCleanup();

        if (App.#config.debug) {
            console.log('KALYTHESAINZ App initialized:', App.#config);
        }

        return App;
    }

    /**
     * Get the singleton App instance
     * @returns {App|null} App instance or null if not initialized
     */
    static getInstance() {
        return App.#initialized && !App.#destroyed ? App : null;
    }

    /**
     * Check if the app is initialized
     * @returns {boolean} True if initialized and not destroyed
     */
    static isInitialized() {
        return App.#initialized && !App.#destroyed;
    }

    /**
     * Get app configuration
     * @returns {object} App configuration
     */
    static getConfig() {
        if (!App.#initialized) {
            throw new Error('App not initialized. Call App.init() first.');
        }
        return { ...App.#config };
    }

    /**
     * Get app runtime information
     * @returns {object} Runtime information
     */
    static getInfo() {
        if (!App.#initialized) {
            throw new Error('App not initialized. Call App.init() first.');
        }

        return {
            version: App.#config.version,
            initialized: App.#initialized,
            destroyed: App.#destroyed,
            startTime: App.#startTime,
            uptime: Date.now() - App.#startTime,
            config: App.#config,
        };
    }

    /**
     * Subscribe to app events
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    static on(event, callback, options = {}) {
        if (!App.#initialized) {
            throw new Error('App not initialized. Call App.init() first.');
        }
        return EventBus.subscribe(event, callback, options);
    }

    /**
     * Unsubscribe from app events
     * @param {string} event - Event name
     * @param {Function|string} callbackOrId - Callback function or listener ID
     * @returns {boolean} True if successfully unsubscribed
     */
    static off(event, callbackOrId) {
        if (!App.#initialized) {
            throw new Error('App not initialized. Call App.init() first.');
        }
        return EventBus.unsubscribe(event, callbackOrId);
    }

    /**
     * Emit app events
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @param {object} options - Publishing options
     * @returns {object} Publish results
     */
    static emit(event, data, options = {}) {
        if (!App.#initialized) {
            throw new Error('App not initialized. Call App.init() first.');
        }
        return EventBus.publish(event, data, options);
    }

    /**
     * Start the application
     * @returns {Promise<void>}
     */
    static async start() {
        if (!App.#initialized) {
            throw new Error('App not initialized. Call App.init() first.');
        }

        if (App.#destroyed) {
            throw new Error('App has been destroyed. Call App.init() to reinitialize.');
        }

        try {
            // Emit start event
            EventBus.publish('app:starting', {
                timestamp: Date.now(),
            });

            // Validate container exists
            const container = document.getElementById(App.#config.containerId);
            if (!container) {
                throw new Error(`Container element with ID '${App.#config.containerId}' not found`);
            }

            // Initialize core systems would go here
            // (Scene, Renderer, etc. - will be implemented in later tasks)

            // Emit started event
            EventBus.publish('app:started', {
                timestamp: Date.now(),
                container: App.#config.containerId,
            });

            if (App.#config.debug) {
                console.log('KALYTHESAINZ App started successfully');
            }
        } catch (error) {
            EventBus.publish('app:error', {
                type: 'start_error',
                error: error.message,
                stack: error.stack,
                timestamp: Date.now(),
            });
            throw error;
        }
    }

    /**
     * Stop the application
     * @returns {Promise<void>}
     */
    static async stop() {
        if (!App.#initialized) {
            return; // Already stopped
        }

        try {
            // Emit stopping event
            EventBus.publish('app:stopping', {
                timestamp: Date.now(),
            });

            // Stop core systems would go here
            // (Scene cleanup, renderer disposal, etc.)

            // Emit stopped event
            EventBus.publish('app:stopped', {
                timestamp: Date.now(),
            });

            if (App.#config.debug) {
                console.log('KALYTHESAINZ App stopped');
            }
        } catch (error) {
            EventBus.publish('app:error', {
                type: 'stop_error',
                error: error.message,
                stack: error.stack,
                timestamp: Date.now(),
            });
            throw error;
        }
    }

    /**
     * Destroy the application and clean up all resources
     * @returns {Promise<void>}
     */
    static async destroy() {
        if (App.#destroyed) {
            return; // Already destroyed
        }

        try {
            // Stop the app first
            await App.stop();

            // Emit destroying event
            EventBus.publish('app:destroying', {
                timestamp: Date.now(),
            });

            // Clean up all resources
            EventBus.clear();
            Config.reset();

            // Mark as destroyed
            App.#destroyed = true;
            App.#initialized = false;
            App.#instance = null;
            App.#config = null;
            App.#startTime = null;

            if (App.#config && App.#config.debug) {
                console.log('KALYTHESAINZ App destroyed');
            }
        } catch (error) {
            console.error('Error during app destruction:', error);
            throw error;
        }
    }

    /**
     * Restart the application
     * @param {object} newConfig - Optional new configuration
     * @returns {Promise<App>}
     */
    static async restart(newConfig = null) {
        await App.destroy();
        const config = newConfig || App.#config;
        return App.init(config);
    }

    /**
     * Validate configuration
     * @private
     */
    static #validateConfig(config) {
        if (config && typeof config !== 'object') {
            throw new Error('Configuration must be an object');
        }

        if (config.containerId && typeof config.containerId !== 'string') {
            throw new Error('containerId must be a string');
        }

        if (config.autoStart !== undefined && typeof config.autoStart !== 'boolean') {
            throw new Error('autoStart must be a boolean');
        }

        if (config.debug !== undefined && typeof config.debug !== 'boolean') {
            throw new Error('debug must be a boolean');
        }
    }

    /**
     * Set up global error handling
     * @private
     */
    static #setupErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            EventBus.publish('app:error', {
                type: 'uncaught_error',
                error: event.error?.message || event.message,
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: Date.now(),
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            EventBus.publish('app:error', {
                type: 'unhandled_rejection',
                error: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now(),
            });
        });

        // Subscribe to EventBus errors
        EventBus.subscribe('error', (event) => {
            if (App.#config && App.#config.debug) {
                console.error('KALYTHESAINZ Error:', event.data);
            }
        });
    }

    /**
     * Set up cleanup on page unload
     * @private
     */
    static #setupCleanup() {
        window.addEventListener('beforeunload', () => {
            if (App.#initialized && !App.#destroyed) {
                App.destroy().catch(console.error);
            }
        });
    }
}

export default App;
