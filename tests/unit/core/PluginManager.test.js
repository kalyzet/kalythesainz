/**
 * Unit tests for PluginManager class
 * Tests plugin registration, lifecycle management, and validation
 */

import { PluginManager } from '../../../core/PluginManager.js';
import { EventBus } from '../../../core/EventBus.js';
import {
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
} from '../../../core/PluginInterfaces.js';
import { Object3D } from '../../../engine/Object3D.js';
import * as THREE from 'three';

describe('PluginManager', () => {
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

    describe('Initialization', () => {
        test('should initialize singleton instance', () => {
            const instance1 = PluginManager.init();
            const instance2 = PluginManager.init();

            expect(instance1).toBe(instance2);
        });

        test('should start with no plugins', () => {
            PluginManager.init();
            expect(PluginManager.getAll()).toHaveLength(0);
        });
    });

    describe('Plugin Registration', () => {
        test('should register object plugin', () => {
            const plugin = createObjectPlugin({
                name: 'TestBox',
                version: '1.0.0',
                description: 'Test box object',
                create: (params = {}) => {
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    return new Object3D(geometry, material);
                },
            });

            const result = PluginManager.register(plugin);

            expect(result).toBe(true);
            expect(PluginManager.has('TestBox')).toBe(true);
            expect(PluginManager.get('TestBox')).toBeTruthy();
            expect(PluginManager.get('TestBox').status).toBe('registered');
        });

        test('should register tool plugin', () => {
            const plugin = createToolPlugin({
                name: 'TestTool',
                version: '1.0.0',
                description: 'Test tool',
                init: (options = {}) => ({ initialized: true, options }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            const result = PluginManager.register(plugin);

            expect(result).toBe(true);
            expect(PluginManager.has('TestTool')).toBe(true);
        });

        test('should register module plugin', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: (options = {}) => ({ initialized: true, options }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            const result = PluginManager.register(plugin);

            expect(result).toBe(true);
            expect(PluginManager.has('TestModule')).toBe(true);
        });

        test('should throw error for duplicate plugin names', () => {
            const plugin1 = createObjectPlugin({
                name: 'TestPlugin',
                version: '1.0.0',
                description: 'Test plugin',
                create: () => {},
            });

            const plugin2 = createObjectPlugin({
                name: 'TestPlugin',
                version: '2.0.0',
                description: 'Another test plugin',
                create: () => {},
            });

            PluginManager.register(plugin1);

            expect(() => {
                PluginManager.register(plugin2);
            }).toThrow("Plugin 'TestPlugin' is already registered");
        });

        test('should emit registration event', (done) => {
            EventBus.subscribe('plugin:registered', (event) => {
                expect(event.data.plugin.name).toBe('TestPlugin');
                expect(event.data.plugin.status).toBe('registered');
                done();
            });

            const plugin = createObjectPlugin({
                name: 'TestPlugin',
                version: '1.0.0',
                description: 'Test plugin',
                create: () => {},
            });

            PluginManager.register(plugin);
        });
    });

    describe('Plugin Validation', () => {
        test('should reject plugin without name', () => {
            const plugin = {
                version: '1.0.0',
                type: 'object',
                create: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow('Plugin must have a name (string)');
        });

        test('should reject plugin without version', () => {
            const plugin = {
                name: 'TestPlugin',
                type: 'object',
                create: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow('Plugin must have a version (string)');
        });

        test('should reject plugin without type', () => {
            const plugin = {
                name: 'TestPlugin',
                version: '1.0.0',
                create: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow('Plugin must have a type (string)');
        });

        test('should reject plugin with invalid type', () => {
            const plugin = {
                name: 'TestPlugin',
                version: '1.0.0',
                type: 'invalid',
                create: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow("Invalid plugin type 'invalid'");
        });

        test('should reject object plugin without create method', () => {
            const plugin = {
                name: 'TestPlugin',
                version: '1.0.0',
                type: 'object',
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow("Plugin of type 'object' must have property 'create'");
        });

        test('should reject tool plugin without init method', () => {
            const plugin = {
                name: 'TestPlugin',
                version: '1.0.0',
                type: 'tool',
                destroy: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow("Plugin of type 'tool' must have property 'init'");
        });

        test('should reject tool plugin without destroy method', () => {
            const plugin = {
                name: 'TestPlugin',
                version: '1.0.0',
                type: 'tool',
                init: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow("Plugin of type 'tool' must have property 'destroy'");
        });

        test('should reject plugin with invalid version format', () => {
            const plugin = {
                name: 'TestPlugin',
                version: 'invalid',
                type: 'object',
                create: () => {},
            };

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow("Plugin version 'invalid' is not valid semver format");
        });
    });

    describe('Plugin Dependencies', () => {
        test('should reject plugin with missing dependencies', () => {
            const plugin = createModulePlugin({
                name: 'DependentPlugin',
                version: '1.0.0',
                description: 'Plugin with dependencies',
                dependencies: ['MissingPlugin'],
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            expect(() => {
                PluginManager.register(plugin);
            }).toThrow(
                "Plugin 'DependentPlugin' depends on 'MissingPlugin' which is not registered",
            );
        });

        test('should register plugin with satisfied dependencies', () => {
            const basePlugin = createModulePlugin({
                name: 'BasePlugin',
                version: '1.0.0',
                description: 'Base plugin',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            const dependentPlugin = createModulePlugin({
                name: 'DependentPlugin',
                version: '1.0.0',
                description: 'Dependent plugin',
                dependencies: ['BasePlugin'],
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(basePlugin);
            const result = PluginManager.register(dependentPlugin);

            expect(result).toBe(true);
            expect(PluginManager.has('DependentPlugin')).toBe(true);
        });

        test('should prevent unregistering plugin with dependents', () => {
            const basePlugin = createModulePlugin({
                name: 'BasePlugin',
                version: '1.0.0',
                description: 'Base plugin',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            const dependentPlugin = createModulePlugin({
                name: 'DependentPlugin',
                version: '1.0.0',
                description: 'Dependent plugin',
                dependencies: ['BasePlugin'],
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(basePlugin);
            PluginManager.register(dependentPlugin);

            expect(() => {
                PluginManager.unregister('BasePlugin');
            }).toThrow(
                "Cannot unregister plugin 'BasePlugin' because it has dependents: DependentPlugin",
            );
        });
    });

    describe('Plugin Activation', () => {
        test('should activate tool plugin', () => {
            const plugin = createToolPlugin({
                name: 'TestTool',
                version: '1.0.0',
                description: 'Test tool',
                init: (options = {}) => ({ initialized: true, options }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            PluginManager.register(plugin);
            const instance = PluginManager.activate('TestTool', { testOption: 'value' });

            expect(instance).toBeTruthy();
            expect(instance.initialized).toBe(true);
            expect(instance.options.testOption).toBe('value');
            expect(PluginManager.isActive('TestTool')).toBe(true);
        });

        test('should activate module plugin', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: (options = {}) => ({ initialized: true, options }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            PluginManager.register(plugin);
            const instance = PluginManager.activate('TestModule');

            expect(instance).toBeTruthy();
            expect(instance.initialized).toBe(true);
            expect(PluginManager.isActive('TestModule')).toBe(true);
        });

        test('should auto-activate dependencies', () => {
            const basePlugin = createModulePlugin({
                name: 'BasePlugin',
                version: '1.0.0',
                description: 'Base plugin',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            const dependentPlugin = createModulePlugin({
                name: 'DependentPlugin',
                version: '1.0.0',
                description: 'Dependent plugin',
                dependencies: ['BasePlugin'],
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(basePlugin);
            PluginManager.register(dependentPlugin);

            PluginManager.activate('DependentPlugin');

            expect(PluginManager.isActive('BasePlugin')).toBe(true);
            expect(PluginManager.isActive('DependentPlugin')).toBe(true);
        });

        test('should return same instance on multiple activations', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(plugin);
            const instance1 = PluginManager.activate('TestModule');
            const instance2 = PluginManager.activate('TestModule');

            expect(instance1).toBe(instance2);
        });

        test('should emit activation event', (done) => {
            EventBus.subscribe('plugin:activated', (event) => {
                expect(event.data.name).toBe('TestModule');
                done();
            });

            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(plugin);
            PluginManager.activate('TestModule');
        });

        test('should throw error for non-existent plugin', () => {
            expect(() => {
                PluginManager.activate('NonExistent');
            }).toThrow("Plugin 'NonExistent' is not registered");
        });
    });

    describe('Plugin Deactivation', () => {
        test('should deactivate tool plugin', () => {
            const plugin = createToolPlugin({
                name: 'TestTool',
                version: '1.0.0',
                description: 'Test tool',
                init: () => ({ initialized: true }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            PluginManager.register(plugin);
            PluginManager.activate('TestTool');

            const result = PluginManager.deactivate('TestTool');

            expect(result).toBe(true);
            expect(PluginManager.isActive('TestTool')).toBe(false);
            expect(PluginManager.getInstance('TestTool')).toBeNull();
        });

        test('should prevent deactivating plugin with active dependents', () => {
            const basePlugin = createModulePlugin({
                name: 'BasePlugin',
                version: '1.0.0',
                description: 'Base plugin',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            const dependentPlugin = createModulePlugin({
                name: 'DependentPlugin',
                version: '1.0.0',
                description: 'Dependent plugin',
                dependencies: ['BasePlugin'],
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(basePlugin);
            PluginManager.register(dependentPlugin);
            PluginManager.activate('DependentPlugin');

            expect(() => {
                PluginManager.deactivate('BasePlugin');
            }).toThrow(
                "Cannot deactivate plugin 'BasePlugin' because it has active dependents: DependentPlugin",
            );
        });

        test('should emit deactivation event', (done) => {
            EventBus.subscribe('plugin:deactivated', (event) => {
                expect(event.data.name).toBe('TestModule');
                done();
            });

            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(plugin);
            PluginManager.activate('TestModule');
            PluginManager.deactivate('TestModule');
        });
    });

    describe('Plugin Unregistration', () => {
        test('should unregister inactive plugin', () => {
            const plugin = createObjectPlugin({
                name: 'TestPlugin',
                version: '1.0.0',
                description: 'Test plugin',
                create: () => {},
            });

            PluginManager.register(plugin);
            const result = PluginManager.unregister('TestPlugin');

            expect(result).toBe(true);
            expect(PluginManager.has('TestPlugin')).toBe(false);
        });

        test('should auto-deactivate before unregistering', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(plugin);
            PluginManager.activate('TestModule');

            const result = PluginManager.unregister('TestModule');

            expect(result).toBe(true);
            expect(PluginManager.has('TestModule')).toBe(false);
        });

        test('should emit unregistration event', (done) => {
            EventBus.subscribe('plugin:unregistered', (event) => {
                expect(event.data.name).toBe('TestPlugin');
                done();
            });

            const plugin = createObjectPlugin({
                name: 'TestPlugin',
                version: '1.0.0',
                description: 'Test plugin',
                create: () => {},
            });

            PluginManager.register(plugin);
            PluginManager.unregister('TestPlugin');
        });

        test('should throw error for non-existent plugin', () => {
            expect(() => {
                PluginManager.unregister('NonExistent');
            }).toThrow("Plugin 'NonExistent' is not registered");
        });
    });

    describe('Plugin Queries', () => {
        test('should get plugin by name', () => {
            const plugin = createObjectPlugin({
                name: 'TestPlugin',
                version: '1.0.0',
                description: 'Test plugin',
                create: () => {},
            });

            PluginManager.register(plugin);
            const retrieved = PluginManager.get('TestPlugin');

            expect(retrieved).toBeTruthy();
            expect(retrieved.name).toBe('TestPlugin');
        });

        test('should get all plugins', () => {
            const plugin1 = createObjectPlugin({
                name: 'Plugin1',
                version: '1.0.0',
                description: 'Plugin 1',
                create: () => {},
            });

            const plugin2 = createToolPlugin({
                name: 'Plugin2',
                version: '1.0.0',
                description: 'Plugin 2',
                init: () => ({}),
                destroy: () => {},
            });

            PluginManager.register(plugin1);
            PluginManager.register(plugin2);

            const all = PluginManager.getAll();
            expect(all).toHaveLength(2);
        });

        test('should get plugins by type', () => {
            const objectPlugin = createObjectPlugin({
                name: 'ObjectPlugin',
                version: '1.0.0',
                description: 'Object plugin',
                create: () => {},
            });

            const toolPlugin = createToolPlugin({
                name: 'ToolPlugin',
                version: '1.0.0',
                description: 'Tool plugin',
                init: () => ({}),
                destroy: () => {},
            });

            PluginManager.register(objectPlugin);
            PluginManager.register(toolPlugin);

            const objectPlugins = PluginManager.getAll('object');
            const toolPlugins = PluginManager.getAll('tool');

            expect(objectPlugins).toHaveLength(1);
            expect(objectPlugins[0].name).toBe('ObjectPlugin');
            expect(toolPlugins).toHaveLength(1);
            expect(toolPlugins[0].name).toBe('ToolPlugin');
        });

        test('should check if plugin exists', () => {
            const plugin = createObjectPlugin({
                name: 'TestPlugin',
                version: '1.0.0',
                description: 'Test plugin',
                create: () => {},
            });

            PluginManager.register(plugin);

            expect(PluginManager.has('TestPlugin')).toBe(true);
            expect(PluginManager.has('NonExistent')).toBe(false);
        });

        test('should check if plugin is active', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: () => ({ initialized: true }),
                destroy: () => {},
            });

            PluginManager.register(plugin);

            expect(PluginManager.isActive('TestModule')).toBe(false);

            PluginManager.activate('TestModule');

            expect(PluginManager.isActive('TestModule')).toBe(true);
        });

        test('should get plugin instance', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module',
                init: () => ({ initialized: true, value: 42 }),
                destroy: () => {},
            });

            PluginManager.register(plugin);
            PluginManager.activate('TestModule');

            const instance = PluginManager.getInstance('TestModule');

            expect(instance).toBeTruthy();
            expect(instance.value).toBe(42);
        });
    });

    describe('Clear Plugins', () => {
        test('should clear all plugins', () => {
            const plugin1 = createObjectPlugin({
                name: 'Plugin1',
                version: '1.0.0',
                description: 'Plugin 1',
                create: () => {},
            });

            const plugin2 = createModulePlugin({
                name: 'Plugin2',
                version: '1.0.0',
                description: 'Plugin 2',
                init: () => ({}),
                destroy: () => {},
            });

            PluginManager.register(plugin1);
            PluginManager.register(plugin2);
            PluginManager.activate('Plugin2');

            PluginManager.clear();

            expect(PluginManager.getAll()).toHaveLength(0);
            expect(PluginManager.has('Plugin1')).toBe(false);
            expect(PluginManager.has('Plugin2')).toBe(false);
        });

        test('should emit clear event', (done) => {
            EventBus.subscribe('plugin-manager:cleared', () => {
                done();
            });

            PluginManager.clear();
        });
    });
});
