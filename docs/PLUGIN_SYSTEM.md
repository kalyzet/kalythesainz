# KALYTHESAINZ Plugin System

The KALYTHESAINZ framework includes a powerful plugin system that allows you to extend the framework with custom objects, tools, and modules.

## Overview

The plugin system provides:

- **Plugin Registration**: Register custom plugins with validation
- **Lifecycle Management**: Activate and deactivate plugins as needed
- **Dependency Resolution**: Automatic dependency management
- **Type Safety**: Validation of plugin interfaces
- **Event System**: Plugin lifecycle events for monitoring

## Plugin Types

### 1. Object Plugins

Object plugins allow you to create custom 3D objects that integrate with the framework.

```javascript
import { createObjectPlugin, PluginManager } from 'kalythesainz';

const cylinderPlugin = createObjectPlugin({
    name: 'Cylinder',
    version: '1.0.0',
    description: 'Custom cylinder object',
    create: (params = {}) => {
        const radius = params.radius || 1;
        const height = params.height || 2;
        // Create and return Object3D instance
        return new Object3D(geometry, material);
    },
});

PluginManager.register(cylinderPlugin);

// Use the plugin
const cylinder = PluginManager.get('Cylinder').create({ radius: 2, height: 4 });
```

### 2. Tool Plugins

Tool plugins provide visual or utility tools for working with scenes.

```javascript
import { createToolPlugin, PluginManager } from 'kalythesainz';

const gridHelperPlugin = createToolPlugin({
    name: 'GridHelper',
    version: '1.0.0',
    description: 'Grid helper tool',
    init: (options = {}) => {
        // Initialize and return tool instance
        return {
            show: () => {
                /* ... */
            },
            hide: () => {
                /* ... */
            },
        };
    },
    destroy: (instance) => {
        // Clean up resources
        instance.dispose();
    },
});

PluginManager.register(gridHelperPlugin);
const gridHelper = PluginManager.activate('GridHelper', { size: 20 });
gridHelper.show();
```

### 3. Module Plugins

Module plugins extend the framework with new functionality or services.

```javascript
import { createModulePlugin, PluginManager } from 'kalythesainz';

const analyticsPlugin = createModulePlugin({
    name: 'Analytics',
    version: '1.0.0',
    description: 'Analytics module',
    init: (options = {}) => {
        // Initialize and return module instance
        return {
            trackEvent: (event) => {
                /* ... */
            },
            getStats: () => {
                /* ... */
            },
        };
    },
    destroy: (instance) => {
        // Clean up
    },
});

PluginManager.register(analyticsPlugin);
const analytics = PluginManager.activate('Analytics');
analytics.trackEvent('scene:loaded');
```

## Plugin Dependencies

Plugins can declare dependencies on other plugins:

```javascript
const reportingPlugin = createModulePlugin({
    name: 'Reporting',
    version: '1.0.0',
    description: 'Reporting module',
    dependencies: ['Analytics'], // Requires Analytics plugin
    init: () => {
        const analytics = PluginManager.getInstance('Analytics');
        return {
            generateReport: () => {
                const stats = analytics.getStats();
                // Generate report
            },
        };
    },
    destroy: () => {},
});
```

When you activate a plugin with dependencies, the framework automatically activates its dependencies first.

## Using Base Classes

You can also extend base classes for more control:

```javascript
import { CustomObjectPlugin } from 'kalythesainz';

class PyramidPlugin extends CustomObjectPlugin {
    static get metadata() {
        return {
            name: 'Pyramid',
            version: '1.0.0',
            type: 'object',
            description: 'Custom pyramid object',
            frameworkVersion: '1.0.0',
        };
    }

    static create(params = {}) {
        // Create pyramid
        return new Object3D(geometry, material);
    }
}

PluginManager.register(PyramidPlugin.getPluginDefinition());
```

## Plugin Manager API

### Registration

```javascript
// Register a plugin
PluginManager.register(plugin);

// Unregister a plugin
PluginManager.unregister('PluginName');

// Check if plugin is registered
PluginManager.has('PluginName');
```

### Activation

```javascript
// Activate a plugin
const instance = PluginManager.activate('PluginName', options);

// Deactivate a plugin
PluginManager.deactivate('PluginName');

// Check if plugin is active
PluginManager.isActive('PluginName');

// Get plugin instance
const instance = PluginManager.getInstance('PluginName');
```

### Queries

```javascript
// Get plugin data
const plugin = PluginManager.get('PluginName');

// Get all plugins
const allPlugins = PluginManager.getAll();

// Get plugins by type
const objectPlugins = PluginManager.getAll('object');
const toolPlugins = PluginManager.getAll('tool');
const modulePlugins = PluginManager.getAll('module');
```

### Cleanup

```javascript
// Clear all plugins
PluginManager.clear();
```

## Plugin Events

The plugin system emits events through the EventBus:

```javascript
import { EventBus } from 'kalythesainz';

// Plugin registered
EventBus.subscribe('plugin:registered', (event) => {
    console.log('Plugin registered:', event.data.plugin.name);
});

// Plugin activated
EventBus.subscribe('plugin:activated', (event) => {
    console.log('Plugin activated:', event.data.name);
});

// Plugin deactivated
EventBus.subscribe('plugin:deactivated', (event) => {
    console.log('Plugin deactivated:', event.data.name);
});

// Plugin unregistered
EventBus.subscribe('plugin:unregistered', (event) => {
    console.log('Plugin unregistered:', event.data.name);
});

// Plugin error
EventBus.subscribe('plugin:error', (event) => {
    console.error('Plugin error:', event.data);
});
```

## Plugin Validation

The plugin system validates plugins during registration:

- **Required Properties**: name, version, type
- **Type-Specific Requirements**:
    - Object plugins: must have `create` method
    - Tool plugins: must have `init` and `destroy` methods
    - Module plugins: must have `init` and `destroy` methods
- **Version Format**: must be valid semver (e.g., "1.0.0")
- **Dependencies**: all dependencies must be registered

## Best Practices

1. **Use Semantic Versioning**: Follow semver for plugin versions
2. **Document Dependencies**: Clearly document what your plugin depends on
3. **Clean Up Resources**: Always implement proper cleanup in `destroy` methods
4. **Handle Errors**: Use try-catch blocks in plugin methods
5. **Test Plugins**: Write tests for your custom plugins
6. **Version Compatibility**: Specify compatible framework versions

## Example: Complete Plugin

```javascript
import { createModulePlugin, PluginManager, EventBus } from 'kalythesainz';

const myPlugin = createModulePlugin({
    name: 'MyPlugin',
    version: '1.0.0',
    description: 'My custom plugin',
    frameworkVersion: '1.0.0',
    dependencies: [],
    init: (options = {}) => {
        // Initialize plugin
        const state = {
            initialized: true,
            options,
        };

        // Subscribe to events
        const unsubscribe = EventBus.subscribe('scene:object-added', (event) => {
            console.log('Object added:', event.data.objectId);
        });

        return {
            state,
            doSomething: () => {
                // Plugin functionality
            },
            cleanup: unsubscribe,
        };
    },
    destroy: (instance) => {
        // Clean up
        instance.cleanup();
        instance.state.initialized = false;
    },
});

// Register and use
PluginManager.register(myPlugin);
const instance = PluginManager.activate('MyPlugin', { debug: true });
instance.doSomething();

// Later...
PluginManager.deactivate('MyPlugin');
PluginManager.unregister('MyPlugin');
```

## See Also

- [API Documentation](./API.md)
- [Event System](./EVENTS.md)
- [Examples](../examples/)
