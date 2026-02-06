/**
 * Unit tests for Plugin Interfaces
 * Tests custom plugin creation helpers and base classes
 */

import {
    CustomObjectPlugin,
    CustomToolPlugin,
    CustomModulePlugin,
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
} from '../../../core/PluginInterfaces.js';

describe('Plugin Interfaces', () => {
    describe('createObjectPlugin', () => {
        test('should create valid object plugin', () => {
            const plugin = createObjectPlugin({
                name: 'TestObject',
                version: '1.0.0',
                description: 'Test object plugin',
                create: (params) => ({ type: 'object', params }),
            });

            expect(plugin.name).toBe('TestObject');
            expect(plugin.version).toBe('1.0.0');
            expect(plugin.type).toBe('object');
            expect(plugin.description).toBe('Test object plugin');
            expect(typeof plugin.create).toBe('function');
        });

        test('should use default framework version', () => {
            const plugin = createObjectPlugin({
                name: 'TestObject',
                version: '1.0.0',
                create: () => {},
            });

            expect(plugin.frameworkVersion).toBe('1.0.0');
        });

        test('should accept custom framework version', () => {
            const plugin = createObjectPlugin({
                name: 'TestObject',
                version: '1.0.0',
                frameworkVersion: '2.0.0',
                create: () => {},
            });

            expect(plugin.frameworkVersion).toBe('2.0.0');
        });

        test('should accept dependencies', () => {
            const plugin = createObjectPlugin({
                name: 'TestObject',
                version: '1.0.0',
                dependencies: ['BasePlugin'],
                create: () => {},
            });

            expect(plugin.dependencies).toEqual(['BasePlugin']);
        });

        test('should throw error for missing name', () => {
            expect(() => {
                createObjectPlugin({
                    version: '1.0.0',
                    create: () => {},
                });
            }).toThrow('Object plugin requires name, version, and create function');
        });

        test('should throw error for missing version', () => {
            expect(() => {
                createObjectPlugin({
                    name: 'TestObject',
                    create: () => {},
                });
            }).toThrow('Object plugin requires name, version, and create function');
        });

        test('should throw error for missing create function', () => {
            expect(() => {
                createObjectPlugin({
                    name: 'TestObject',
                    version: '1.0.0',
                });
            }).toThrow('Object plugin requires name, version, and create function');
        });
    });

    describe('createToolPlugin', () => {
        test('should create valid tool plugin', () => {
            const plugin = createToolPlugin({
                name: 'TestTool',
                version: '1.0.0',
                description: 'Test tool plugin',
                init: (options) => ({ initialized: true, options }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            expect(plugin.name).toBe('TestTool');
            expect(plugin.version).toBe('1.0.0');
            expect(plugin.type).toBe('tool');
            expect(plugin.description).toBe('Test tool plugin');
            expect(typeof plugin.init).toBe('function');
            expect(typeof plugin.destroy).toBe('function');
        });

        test('should use default framework version', () => {
            const plugin = createToolPlugin({
                name: 'TestTool',
                version: '1.0.0',
                init: () => {},
                destroy: () => {},
            });

            expect(plugin.frameworkVersion).toBe('1.0.0');
        });

        test('should accept dependencies', () => {
            const plugin = createToolPlugin({
                name: 'TestTool',
                version: '1.0.0',
                dependencies: ['BaseTool'],
                init: () => {},
                destroy: () => {},
            });

            expect(plugin.dependencies).toEqual(['BaseTool']);
        });

        test('should throw error for missing name', () => {
            expect(() => {
                createToolPlugin({
                    version: '1.0.0',
                    init: () => {},
                    destroy: () => {},
                });
            }).toThrow('Tool plugin requires name, version, init, and destroy functions');
        });

        test('should throw error for missing init function', () => {
            expect(() => {
                createToolPlugin({
                    name: 'TestTool',
                    version: '1.0.0',
                    destroy: () => {},
                });
            }).toThrow('Tool plugin requires name, version, init, and destroy functions');
        });

        test('should throw error for missing destroy function', () => {
            expect(() => {
                createToolPlugin({
                    name: 'TestTool',
                    version: '1.0.0',
                    init: () => {},
                });
            }).toThrow('Tool plugin requires name, version, init, and destroy functions');
        });
    });

    describe('createModulePlugin', () => {
        test('should create valid module plugin', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                description: 'Test module plugin',
                init: (options) => ({ initialized: true, options }),
                destroy: (instance) => {
                    instance.initialized = false;
                },
            });

            expect(plugin.name).toBe('TestModule');
            expect(plugin.version).toBe('1.0.0');
            expect(plugin.type).toBe('module');
            expect(plugin.description).toBe('Test module plugin');
            expect(typeof plugin.init).toBe('function');
            expect(typeof plugin.destroy).toBe('function');
        });

        test('should use default framework version', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                init: () => {},
                destroy: () => {},
            });

            expect(plugin.frameworkVersion).toBe('1.0.0');
        });

        test('should accept dependencies', () => {
            const plugin = createModulePlugin({
                name: 'TestModule',
                version: '1.0.0',
                dependencies: ['BaseModule'],
                init: () => {},
                destroy: () => {},
            });

            expect(plugin.dependencies).toEqual(['BaseModule']);
        });

        test('should throw error for missing name', () => {
            expect(() => {
                createModulePlugin({
                    version: '1.0.0',
                    init: () => {},
                    destroy: () => {},
                });
            }).toThrow('Module plugin requires name, version, init, and destroy functions');
        });

        test('should throw error for missing init function', () => {
            expect(() => {
                createModulePlugin({
                    name: 'TestModule',
                    version: '1.0.0',
                    destroy: () => {},
                });
            }).toThrow('Module plugin requires name, version, init, and destroy functions');
        });

        test('should throw error for missing destroy function', () => {
            expect(() => {
                createModulePlugin({
                    name: 'TestModule',
                    version: '1.0.0',
                    init: () => {},
                });
            }).toThrow('Module plugin requires name, version, init, and destroy functions');
        });
    });

    describe('CustomObjectPlugin', () => {
        test('should have correct metadata', () => {
            const metadata = CustomObjectPlugin.metadata;

            expect(metadata.name).toBe('CustomObject');
            expect(metadata.version).toBe('1.0.0');
            expect(metadata.type).toBe('object');
            expect(metadata.frameworkVersion).toBe('1.0.0');
        });

        test('should throw error when create is not implemented', () => {
            expect(() => {
                CustomObjectPlugin.create();
            }).toThrow('create() method must be implemented by subclass');
        });

        test('should allow subclassing', () => {
            class MyCustomObject extends CustomObjectPlugin {
                static get metadata() {
                    return {
                        name: 'MyCustomObject',
                        version: '1.0.0',
                        type: 'object',
                        description: 'My custom object',
                        frameworkVersion: '1.0.0',
                    };
                }

                static create(params = {}) {
                    return { type: 'custom', params };
                }
            }

            const plugin = MyCustomObject.getPluginDefinition();

            expect(plugin.name).toBe('MyCustomObject');
            expect(plugin.type).toBe('object');
            expect(typeof plugin.create).toBe('function');

            const obj = plugin.create({ size: 10 });
            expect(obj.type).toBe('custom');
            expect(obj.params.size).toBe(10);
        });
    });

    describe('CustomToolPlugin', () => {
        test('should have correct metadata', () => {
            const metadata = CustomToolPlugin.metadata;

            expect(metadata.name).toBe('CustomTool');
            expect(metadata.version).toBe('1.0.0');
            expect(metadata.type).toBe('tool');
            expect(metadata.frameworkVersion).toBe('1.0.0');
        });

        test('should throw error when init is not implemented', () => {
            expect(() => {
                CustomToolPlugin.init();
            }).toThrow('init() method must be implemented by subclass');
        });

        test('should throw error when destroy is not implemented', () => {
            expect(() => {
                CustomToolPlugin.destroy();
            }).toThrow('destroy() method must be implemented by subclass');
        });

        test('should allow subclassing', () => {
            class MyCustomTool extends CustomToolPlugin {
                static get metadata() {
                    return {
                        name: 'MyCustomTool',
                        version: '1.0.0',
                        type: 'tool',
                        description: 'My custom tool',
                        frameworkVersion: '1.0.0',
                    };
                }

                static init(options = {}) {
                    return { initialized: true, options };
                }

                static destroy(instance) {
                    instance.initialized = false;
                }
            }

            const plugin = MyCustomTool.getPluginDefinition();

            expect(plugin.name).toBe('MyCustomTool');
            expect(plugin.type).toBe('tool');
            expect(typeof plugin.init).toBe('function');
            expect(typeof plugin.destroy).toBe('function');

            const instance = plugin.init({ testOption: 'value' });
            expect(instance.initialized).toBe(true);
            expect(instance.options.testOption).toBe('value');

            plugin.destroy(instance);
            expect(instance.initialized).toBe(false);
        });
    });

    describe('CustomModulePlugin', () => {
        test('should have correct metadata', () => {
            const metadata = CustomModulePlugin.metadata;

            expect(metadata.name).toBe('CustomModule');
            expect(metadata.version).toBe('1.0.0');
            expect(metadata.type).toBe('module');
            expect(metadata.frameworkVersion).toBe('1.0.0');
        });

        test('should throw error when init is not implemented', () => {
            expect(() => {
                CustomModulePlugin.init();
            }).toThrow('init() method must be implemented by subclass');
        });

        test('should throw error when destroy is not implemented', () => {
            expect(() => {
                CustomModulePlugin.destroy();
            }).toThrow('destroy() method must be implemented by subclass');
        });

        test('should allow subclassing', () => {
            class MyCustomModule extends CustomModulePlugin {
                static get metadata() {
                    return {
                        name: 'MyCustomModule',
                        version: '1.0.0',
                        type: 'module',
                        description: 'My custom module',
                        frameworkVersion: '1.0.0',
                    };
                }

                static init(options = {}) {
                    return { initialized: true, options };
                }

                static destroy(instance) {
                    instance.initialized = false;
                }
            }

            const plugin = MyCustomModule.getPluginDefinition();

            expect(plugin.name).toBe('MyCustomModule');
            expect(plugin.type).toBe('module');
            expect(typeof plugin.init).toBe('function');
            expect(typeof plugin.destroy).toBe('function');

            const instance = plugin.init({ testOption: 'value' });
            expect(instance.initialized).toBe(true);
            expect(instance.options.testOption).toBe('value');

            plugin.destroy(instance);
            expect(instance.initialized).toBe(false);
        });
    });
});
