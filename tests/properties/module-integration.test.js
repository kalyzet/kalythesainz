/**
 * Property-based tests for module integration stability
 * **Feature: kalythesainz-framework, Property 7: Module integration stability**
 * **Validates: Requirements 6.4**
 */

import { PluginManager } from '../../core/PluginManager.js';
import { EventBus } from '../../core/EventBus.js';
import {
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
} from '../../core/PluginInterfaces.js';
import { Object3D } from '../../engine/Object3D.js';
import * as THREE from 'three';

// Simple property-based testing utilities
const fc = {
    assert: (property, options = {}) => {
        const numRuns = options.numRuns || 100;
        for (let i = 0; i < numRuns; i++) {
            try {
                property.run();
            } catch (error) {
                throw new Error(`Property failed on run ${i + 1}: ${error.message}`);
            }
        }
    },
    property: (...args) => {
        const generators = args.slice(0, -1);
        const testFn = args[args.length - 1];

        return {
            run: () => {
                const values = generators.map((gen) => gen.generate());
                testFn(...values);
            },
        };
    },
    array: (itemGen, options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 0;
            const maxLength = options.maxLength || 10;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            return Array.from({ length }, () => itemGen.generate());
        },
    }),
    string: (options = {}) => ({
        generate: () => {
            const minLength = options.minLength || 1;
            const maxLength = options.maxLength || 20;
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            return Array.from(
                { length },
                () => chars[Math.floor(Math.random() * chars.length)],
            ).join('');
        },
    }),
    integer: (options = {}) => ({
        generate: () => {
            const min = options.min || 0;
            const max = options.max || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    }),
    constantFrom: (...values) => ({
        generate: () => values[Math.floor(Math.random() * values.length)],
    }),
    record: (schema) => ({
        generate: () => {
            const result = {};
            for (const [key, generator] of Object.entries(schema)) {
                result[key] = generator.generate();
            }
            return result;
        },
    }),
    boolean: () => ({
        generate: () => Math.random() < 0.5,
    }),
};

describe('Module Integration Property Tests', () => {
    beforeEach(() => {
        // Clear plugin manager and event bus before each test
        PluginManager.clear();
        EventBus.clear();
    });

    afterEach(() => {
        // Clean up after each test
        PluginManager.clear();
        EventBus.clear();
    });

    /**
     * Property 7: Module integration stability
     * For any new module integration through defined interfaces, existing functionality
     * should remain unaffected and continue operating correctly
     */
    test('**Feature: kalythesainz-framework, Property 7: Module integration stability**', () => {
        fc.assert(
            fc.property(
                // Generate random plugin configurations
                fc.array(
                    fc.record({
                        name: fc.string({ minLength: 5, maxLength: 15 }),
                        version: fc.constantFrom('1.0.0', '1.1.0', '2.0.0'),
                        type: fc.constantFrom('object', 'tool', 'module'),
                        description: fc.string({ minLength: 10, maxLength: 50 }),
                    }),
                    { minLength: 1, maxLength: 5 },
                ),
                (pluginConfigs) => {
                    // Track initial state
                    const initialPluginCount = PluginManager.getAll().length;
                    const initialEventCount = EventBus.getEvents().length;

                    // Create and register plugins
                    const registeredPlugins = [];

                    for (const config of pluginConfigs) {
                        let plugin;

                        if (config.type === 'object') {
                            // Create object plugin
                            plugin = createObjectPlugin({
                                name: config.name,
                                version: config.version,
                                description: config.description,
                                create: (params = {}) => {
                                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                                    const material = new THREE.MeshStandardMaterial({
                                        color: 0xff0000,
                                    });
                                    return new Object3D(geometry, material);
                                },
                            });
                        } else if (config.type === 'tool') {
                            // Create tool plugin
                            plugin = createToolPlugin({
                                name: config.name,
                                version: config.version,
                                description: config.description,
                                init: (options = {}) => {
                                    return {
                                        name: config.name,
                                        initialized: true,
                                        options,
                                    };
                                },
                                destroy: (instance) => {
                                    instance.initialized = false;
                                },
                            });
                        } else {
                            // Create module plugin
                            plugin = createModulePlugin({
                                name: config.name,
                                version: config.version,
                                description: config.description,
                                init: (options = {}) => {
                                    return {
                                        name: config.name,
                                        initialized: true,
                                        options,
                                    };
                                },
                                destroy: (instance) => {
                                    instance.initialized = false;
                                },
                            });
                        }

                        // Register plugin
                        PluginManager.register(plugin);
                        registeredPlugins.push(plugin);

                        // Verify plugin was registered
                        expect(PluginManager.has(plugin.name)).toBe(true);
                        expect(PluginManager.get(plugin.name)).toBeTruthy();
                        expect(PluginManager.get(plugin.name).status).toBe('registered');
                    }

                    // Verify all plugins are registered
                    expect(PluginManager.getAll().length).toBe(
                        initialPluginCount + pluginConfigs.length,
                    );

                    // Verify existing functionality is unaffected
                    // EventBus should still work
                    const testEventData = { test: 'data' };
                    let eventReceived = false;
                    EventBus.subscribe('test:event', (event) => {
                        eventReceived = true;
                        expect(event.data).toEqual(testEventData);
                    });
                    EventBus.publish('test:event', testEventData);
                    expect(eventReceived).toBe(true);

                    // Activate plugins and verify they work
                    for (const plugin of registeredPlugins) {
                        if (plugin.type === 'object') {
                            // Object plugins don't need activation
                            const pluginData = PluginManager.get(plugin.name);
                            expect(pluginData).toBeTruthy();

                            // Test object creation
                            const obj = plugin.create();
                            expect(obj).toBeInstanceOf(Object3D);
                            expect(obj.threeMesh).toBeTruthy();
                        } else {
                            // Activate tool/module plugins
                            const instance = PluginManager.activate(plugin.name, {
                                testOption: 'value',
                            });
                            expect(instance).toBeTruthy();
                            expect(instance.initialized).toBe(true);
                            expect(instance.name).toBe(plugin.name);
                            expect(PluginManager.isActive(plugin.name)).toBe(true);

                            // Verify getInstance returns the same instance
                            const retrievedInstance = PluginManager.getInstance(plugin.name);
                            expect(retrievedInstance).toBe(instance);
                        }
                    }

                    // Verify existing functionality still works after activation
                    eventReceived = false;
                    EventBus.publish('test:event', testEventData);
                    expect(eventReceived).toBe(true);

                    // Deactivate plugins
                    for (const plugin of registeredPlugins) {
                        if (plugin.type !== 'object') {
                            PluginManager.deactivate(plugin.name);
                            expect(PluginManager.isActive(plugin.name)).toBe(false);
                            expect(PluginManager.getInstance(plugin.name)).toBeNull();
                        }
                    }

                    // Unregister plugins
                    for (const plugin of registeredPlugins) {
                        PluginManager.unregister(plugin.name);
                        expect(PluginManager.has(plugin.name)).toBe(false);
                    }

                    // Verify plugin count is back to initial
                    expect(PluginManager.getAll().length).toBe(initialPluginCount);

                    // Verify existing functionality still works after cleanup
                    eventReceived = false;
                    EventBus.publish('test:event', testEventData);
                    expect(eventReceived).toBe(true);
                },
            ),
            { numRuns: 100 },
        );
    });

    test('Plugin dependencies are respected and enforced', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 5, maxLength: 15 }),
                fc.string({ minLength: 5, maxLength: 15 }),
                (baseName, dependentName) => {
                    // Ensure unique names
                    const basePluginName = `base-${baseName}`;
                    const dependentPluginName = `dependent-${dependentName}`;

                    // Create base plugin
                    const basePlugin = createModulePlugin({
                        name: basePluginName,
                        version: '1.0.0',
                        description: 'Base plugin',
                        init: () => ({ initialized: true }),
                        destroy: (instance) => {
                            instance.initialized = false;
                        },
                    });

                    // Create dependent plugin
                    const dependentPlugin = createModulePlugin({
                        name: dependentPluginName,
                        version: '1.0.0',
                        description: 'Dependent plugin',
                        dependencies: [basePluginName],
                        init: () => ({ initialized: true }),
                        destroy: (instance) => {
                            instance.initialized = false;
                        },
                    });

                    // Try to register dependent without base - should fail
                    expect(() => {
                        PluginManager.register(dependentPlugin);
                    }).toThrow();

                    // Register base plugin first
                    PluginManager.register(basePlugin);
                    expect(PluginManager.has(basePluginName)).toBe(true);

                    // Now register dependent - should succeed
                    PluginManager.register(dependentPlugin);
                    expect(PluginManager.has(dependentPluginName)).toBe(true);

                    // Activate dependent - should auto-activate base
                    const dependentInstance = PluginManager.activate(dependentPluginName);
                    expect(dependentInstance.initialized).toBe(true);
                    expect(PluginManager.isActive(dependentPluginName)).toBe(true);
                    expect(PluginManager.isActive(basePluginName)).toBe(true);

                    // Try to deactivate base while dependent is active - should fail
                    expect(() => {
                        PluginManager.deactivate(basePluginName);
                    }).toThrow();

                    // Deactivate dependent first
                    PluginManager.deactivate(dependentPluginName);
                    expect(PluginManager.isActive(dependentPluginName)).toBe(false);

                    // Now deactivate base - should succeed
                    PluginManager.deactivate(basePluginName);
                    expect(PluginManager.isActive(basePluginName)).toBe(false);

                    // Try to unregister base while dependent is registered - should fail
                    expect(() => {
                        PluginManager.unregister(basePluginName);
                    }).toThrow();

                    // Unregister dependent first
                    PluginManager.unregister(dependentPluginName);
                    expect(PluginManager.has(dependentPluginName)).toBe(false);

                    // Now unregister base - should succeed
                    PluginManager.unregister(basePluginName);
                    expect(PluginManager.has(basePluginName)).toBe(false);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Plugin events are emitted correctly during lifecycle', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 5, maxLength: 15 }),
                fc.constantFrom('object', 'tool', 'module'),
                (pluginName, pluginType) => {
                    const events = [];

                    // Subscribe to all plugin events
                    EventBus.subscribe('plugin:registered', (event) => {
                        events.push({ type: 'registered', data: event.data });
                    });
                    EventBus.subscribe('plugin:activated', (event) => {
                        events.push({ type: 'activated', data: event.data });
                    });
                    EventBus.subscribe('plugin:deactivated', (event) => {
                        events.push({ type: 'deactivated', data: event.data });
                    });
                    EventBus.subscribe('plugin:unregistered', (event) => {
                        events.push({ type: 'unregistered', data: event.data });
                    });
                    EventBus.subscribe('plugin:error', (event) => {
                        events.push({ type: 'error', data: event.data });
                    });

                    // Create plugin
                    let plugin;
                    if (pluginType === 'object') {
                        plugin = createObjectPlugin({
                            name: pluginName,
                            version: '1.0.0',
                            description: 'Test plugin',
                            create: () => {
                                const geometry = new THREE.BoxGeometry(1, 1, 1);
                                const material = new THREE.MeshStandardMaterial({
                                    color: 0xff0000,
                                });
                                return new Object3D(geometry, material);
                            },
                        });
                    } else {
                        plugin = createModulePlugin({
                            name: pluginName,
                            version: '1.0.0',
                            description: 'Test plugin',
                            init: () => ({ initialized: true }),
                            destroy: (instance) => {
                                instance.initialized = false;
                            },
                        });
                    }

                    // Register plugin
                    PluginManager.register(plugin);
                    expect(events).toHaveLength(1);
                    expect(events[0].type).toBe('registered');
                    expect(events[0].data.plugin.name).toBe(pluginName);

                    // Activate plugin (if not object type)
                    if (pluginType !== 'object') {
                        PluginManager.activate(pluginName);
                        expect(events).toHaveLength(2);
                        expect(events[1].type).toBe('activated');
                        expect(events[1].data.name).toBe(pluginName);

                        // Deactivate plugin
                        PluginManager.deactivate(pluginName);
                        expect(events).toHaveLength(3);
                        expect(events[2].type).toBe('deactivated');
                        expect(events[2].data.name).toBe(pluginName);
                    }

                    // Unregister plugin
                    PluginManager.unregister(pluginName);
                    const expectedLength = pluginType === 'object' ? 2 : 4;
                    expect(events).toHaveLength(expectedLength);
                    expect(events[events.length - 1].type).toBe('unregistered');
                    expect(events[events.length - 1].data.name).toBe(pluginName);
                },
            ),
            { numRuns: 50 },
        );
    });

    test('Invalid plugins are rejected with clear error messages', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 5, maxLength: 15 }),
                fc.constantFrom(
                    'missing-version',
                    'missing-type',
                    'invalid-type',
                    'missing-create',
                    'missing-init',
                    'missing-destroy',
                ),
                (pluginName, errorType) => {
                    let plugin;

                    switch (errorType) {
                        case 'missing-version':
                            plugin = {
                                name: pluginName,
                                type: 'object',
                                create: () => {},
                            };
                            break;
                        case 'missing-type':
                            plugin = {
                                name: pluginName,
                                version: '1.0.0',
                                create: () => {},
                            };
                            break;
                        case 'invalid-type':
                            plugin = {
                                name: pluginName,
                                version: '1.0.0',
                                type: 'invalid',
                                create: () => {},
                            };
                            break;
                        case 'missing-create':
                            plugin = {
                                name: pluginName,
                                version: '1.0.0',
                                type: 'object',
                            };
                            break;
                        case 'missing-init':
                            plugin = {
                                name: pluginName,
                                version: '1.0.0',
                                type: 'module',
                                destroy: () => {},
                            };
                            break;
                        case 'missing-destroy':
                            plugin = {
                                name: pluginName,
                                version: '1.0.0',
                                type: 'module',
                                init: () => {},
                            };
                            break;
                    }

                    // Attempt to register invalid plugin - should throw
                    expect(() => {
                        PluginManager.register(plugin);
                    }).toThrow();

                    // Verify plugin was not registered
                    expect(PluginManager.has(pluginName)).toBe(false);
                },
            ),
            { numRuns: 50 },
        );
    });
});
