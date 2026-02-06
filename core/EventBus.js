/**
 * Event Bus for inter-module communication in KALYTHESAINZ framework
 * Implements publish/subscribe pattern with event filtering and error handling
 */

export class EventBus {
    static #instance = null;
    static #listeners = new Map();
    static #eventHistory = [];
    static #maxHistorySize = 100;

    /**
     * Initialize the EventBus singleton
     */
    static init() {
        if (!EventBus.#instance) {
            EventBus.#listeners = new Map();
            EventBus.#eventHistory = [];
            EventBus.#instance = true;
        }
        return EventBus;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {object} options - Subscription options
     * @param {boolean} options.once - Execute callback only once
     * @param {Function} options.filter - Filter function to determine if callback should execute
     * @param {number} options.priority - Priority for callback execution (higher = earlier)
     * @returns {Function} Unsubscribe function
     * @throws {Error} If event name or callback is invalid
     */
    static subscribe(event, callback, options = {}) {
        EventBus.init();

        if (!event || typeof event !== 'string') {
            throw new Error('Event name must be a non-empty string');
        }

        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const { once = false, filter = null, priority = 0 } = options;

        if (filter && typeof filter !== 'function') {
            throw new Error('Filter must be a function');
        }

        if (typeof priority !== 'number') {
            throw new Error('Priority must be a number');
        }

        // Create listener object
        const listener = {
            callback,
            once,
            filter,
            priority,
            id: EventBus.#generateId(),
        };

        // Add to listeners map
        if (!EventBus.#listeners.has(event)) {
            EventBus.#listeners.set(event, []);
        }

        const eventListeners = EventBus.#listeners.get(event);
        eventListeners.push(listener);

        // Sort by priority (higher priority first)
        eventListeners.sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => EventBus.unsubscribe(event, listener.id);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {string|Function} callbackOrId - Callback function or listener ID
     * @returns {boolean} True if successfully unsubscribed
     */
    static unsubscribe(event, callbackOrId) {
        EventBus.init();

        if (!EventBus.#listeners.has(event)) {
            return false;
        }

        const eventListeners = EventBus.#listeners.get(event);
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

        EventBus.#listeners.set(event, filteredListeners);

        // Clean up empty event arrays
        if (filteredListeners.length === 0) {
            EventBus.#listeners.delete(event);
        }

        return filteredListeners.length < initialLength;
    }

    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @param {object} options - Publishing options
     * @param {boolean} options.async - Execute callbacks asynchronously
     * @param {number} options.timeout - Timeout for async execution (ms)
     * @returns {object|Promise<object>} Execution results
     * @throws {Error} If event name is invalid
     */
    static publish(event, data = null, options = {}) {
        EventBus.init();

        if (!event || typeof event !== 'string') {
            throw new Error('Event name must be a non-empty string');
        }

        const { async = false, timeout = 5000 } = options;

        // Create event object
        const eventObj = {
            name: event,
            data,
            timestamp: Date.now(),
            id: EventBus.#generateId(),
        };

        // Add to history
        EventBus.#addToHistory(eventObj);

        // Get listeners for this event
        const listeners = EventBus.#listeners.get(event) || [];
        const results = {
            event: eventObj,
            executed: 0,
            errors: [],
            results: [],
        };

        if (listeners.length === 0) {
            return results;
        }

        // Execute callbacks
        const executeCallback = (listener) => {
            try {
                // Apply filter if present
                if (listener.filter && !listener.filter(eventObj)) {
                    return null;
                }

                const result = listener.callback(eventObj);
                results.executed++;
                results.results.push(result);

                // Remove one-time listeners
                if (listener.once) {
                    EventBus.unsubscribe(event, listener.id);
                }

                return result;
            } catch (error) {
                const errorInfo = {
                    listener: listener.id,
                    error: error.message,
                    stack: error.stack,
                };
                results.errors.push(errorInfo);

                // Emit error event (avoid infinite recursion)
                if (event !== 'error') {
                    setTimeout(() => {
                        EventBus.publish('error', {
                            type: 'callback_execution',
                            originalEvent: event,
                            ...errorInfo,
                        });
                    }, 0);
                }

                return null;
            }
        };

        if (async) {
            // Return promise for async execution
            return Promise.allSettled(
                listeners.map((listener) =>
                    EventBus.#executeWithTimeout(listener.callback, [eventObj], timeout),
                ),
            ).then((settledResults) => {
                settledResults.forEach((result, index) => {
                    const listener = listeners[index];
                    if (result.status === 'fulfilled') {
                        // Apply filter if present
                        if (!listener.filter || listener.filter(eventObj)) {
                            results.executed++;
                            results.results.push(result.value);

                            // Remove one-time listeners
                            if (listener.once) {
                                EventBus.unsubscribe(event, listener.id);
                            }
                        }
                    } else {
                        const errorInfo = {
                            listener: listener.id,
                            error: result.reason.message,
                            stack: result.reason.stack,
                        };
                        results.errors.push(errorInfo);

                        // Emit error event
                        if (event !== 'error') {
                            setTimeout(() => {
                                EventBus.publish('error', {
                                    type: 'callback_execution',
                                    originalEvent: event,
                                    ...errorInfo,
                                });
                            }, 0);
                        }
                    }
                });
                return results;
            });
        } else {
            // Execute callbacks synchronously
            for (const listener of listeners) {
                executeCallback(listener);
            }
            return results;
        }
    }

    /**
     * Clear all event listeners
     * @param {string} event - Optional specific event to clear
     */
    static clear(event = null) {
        EventBus.init();

        if (event) {
            EventBus.#listeners.delete(event);
        } else {
            EventBus.#listeners.clear();
            EventBus.#eventHistory = []; // Clear history when clearing all events
        }
    }

    /**
     * Get all registered events
     * @returns {string[]} Array of event names
     */
    static getEvents() {
        EventBus.init();
        return Array.from(EventBus.#listeners.keys());
    }

    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    static getListenerCount(event) {
        EventBus.init();
        const listeners = EventBus.#listeners.get(event);
        return listeners ? listeners.length : 0;
    }

    /**
     * Get event history
     * @param {number} limit - Maximum number of events to return
     * @returns {object[]} Array of event objects
     */
    static getHistory(limit = 10) {
        EventBus.init();
        return EventBus.#eventHistory.slice(-limit);
    }

    /**
     * Check if there are listeners for an event
     * @param {string} event - Event name
     * @returns {boolean} True if event has listeners
     */
    static hasListeners(event) {
        EventBus.init();
        return EventBus.#listeners.has(event) && EventBus.#listeners.get(event).length > 0;
    }

    /**
     * Create a namespaced event bus
     * @param {string} namespace - Namespace prefix
     * @returns {object} Namespaced event bus interface
     */
    static namespace(namespace) {
        if (!namespace || typeof namespace !== 'string') {
            throw new Error('Namespace must be a non-empty string');
        }

        return {
            subscribe: (event, callback, options) =>
                EventBus.subscribe(`${namespace}:${event}`, callback, options),
            unsubscribe: (event, callbackOrId) =>
                EventBus.unsubscribe(`${namespace}:${event}`, callbackOrId),
            publish: (event, data, options) =>
                EventBus.publish(`${namespace}:${event}`, data, options),
            clear: (event) => EventBus.clear(event ? `${namespace}:${event}` : null),
            getEvents: () => EventBus.getEvents().filter((e) => e.startsWith(`${namespace}:`)),
        };
    }

    /**
     * Generate unique ID
     * @private
     */
    static #generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add event to history
     * @private
     */
    static #addToHistory(eventObj) {
        EventBus.#eventHistory.push(eventObj);

        // Maintain history size limit
        if (EventBus.#eventHistory.length > EventBus.#maxHistorySize) {
            EventBus.#eventHistory.shift();
        }
    }

    /**
     * Execute function with timeout
     * @private
     */
    static #executeWithTimeout(fn, args, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Callback execution timed out after ${timeout}ms`));
            }, timeout);

            try {
                const result = fn(...args);
                clearTimeout(timer);

                // Handle promises
                if (result && typeof result.then === 'function') {
                    result.then(resolve).catch(reject);
                } else {
                    resolve(result);
                }
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }
}

export default EventBus;
