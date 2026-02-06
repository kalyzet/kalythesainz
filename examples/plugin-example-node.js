/**
 * Example: Using the KALYTHESAINZ Plugin System (Node.js compatible)
 *
 * This example demonstrates the plugin system without requiring browser APIs
 */

import { PluginManager } from '../core/PluginManager.js';
import { EventBus } from '../core/EventBus.js';
import {
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
} from '../core/PluginInterfaces.js';

// Example 1: Create a simple object plugin
const customShapePlugin = createObjectPlugin({
    name: 'CustomShape',
    version: '1.0.0',
    description: 'Custom shape object',
    create: (params = {}) => {
        return {
            type: 'CustomShape',
            id: `shape_${Date.now()}`,
            params,
            dispose: () => {
                console.log('   Disposing custom shape');
            },
        };
    },
});

// Example 2: Create a tool plugin
const debugToolPlugin = createToolPlugin({
    name: 'DebugTool',
    version: '1.0.0',
    description: 'Debug tool for logging',
    init: (options = {}) => {
        const logs = [];
        return {
            log: (message) => {
                const entry = { timestamp: Date.now(), message };
                logs.push(entry);
                if (options.verbose) {
                    console.log(`   [DEBUG] ${message}`);
                }
            },
            getLogs: () => [...logs],
            clear: () => {
                logs.length = 0;
            },
        };
    },
    destroy: (instance) => {
        instance.clear();
    },
});

// Example 3: Create a module plugin
const analyticsPlugin = createModulePlugin({
    name: 'Analytics',
    version: '1.0.0',
    description: 'Analytics module',
    init: () => {
        const stats = {
            objectsCreated: 0,
            objectsRemoved: 0,
            events: 0,
        };

        return {
            trackObjectCreation: () => {
                stats.objectsCreated++;
            },
            trackObjectRemoval: () => {
                stats.objectsRemoved++;
            },
            trackEvent: () => {
                stats.events++;
            },
            getStats: () => ({ ...stats }),
            reset: () => {
                stats.objectsCreated = 0;
                stats.objectsRemoved = 0;
                stats.events = 0;
            },
        };
    },
    destroy: (instance) => {
        instance.reset();
    },
});

// Example 4: Create a plugin with dependencies
const reportingPlugin = createModulePlugin({
    name: 'Reporting',
    version: '1.0.0',
    description: 'Reporting module with analytics',
    dependencies: ['Analytics'],
    init: () => {
        const analyticsInstance = PluginManager.getInstance('Analytics');

        return {
            generateReport: () => {
                const stats = analyticsInstance.getStats();
                return {
                    ...stats,
                    timestamp: new Date().toISOString(),
                    totalActivity: stats.objectsCreated + stats.objectsRemoved + stats.events,
                };
            },
        };
    },
    destroy: () => {},
});

// Main example function
function runPluginExample() {
    console.log('=== KALYTHESAINZ Plugin System Example ===\n');

    // Subscribe to plugin events
    EventBus.subscribe('plugin:registered', (event) => {
        console.log(`   [EVENT] Plugin registered: ${event.data.plugin.name}`);
    });

    EventBus.subscribe('plugin:activated', (event) => {
        console.log(`   [EVENT] Plugin activated: ${event.data.name}`);
    });

    EventBus.subscribe('plugin:deactivated', (event) => {
        console.log(`   [EVENT] Plugin deactivated: ${event.data.name}`);
    });

    // Register plugins
    console.log('1. Registering plugins...');
    PluginManager.register(customShapePlugin);
    PluginManager.register(debugToolPlugin);
    PluginManager.register(analyticsPlugin);
    PluginManager.register(reportingPlugin);
    console.log();

    // List all registered plugins
    console.log('2. Registered plugins:');
    const allPlugins = PluginManager.getAll();
    allPlugins.forEach((plugin) => {
        console.log(`   - ${plugin.name} v${plugin.version} (${plugin.type})`);
    });
    console.log();

    // Create objects using custom object plugin
    console.log('3. Creating objects with custom plugin...');
    const shapePlugin = PluginManager.get('CustomShape');
    const shape1 = shapePlugin.create({ size: 10, color: 'red' });
    const shape2 = shapePlugin.create({ size: 20, color: 'blue' });
    console.log(`   ✓ Created shape: ${shape1.id}`);
    console.log(`   ✓ Created shape: ${shape2.id}`);
    console.log();

    // Activate tool plugin
    console.log('4. Activating DebugTool...');
    const debugTool = PluginManager.activate('DebugTool', { verbose: true });
    debugTool.log('Debug tool initialized');
    debugTool.log('Testing logging functionality');
    console.log(`   ✓ Logged ${debugTool.getLogs().length} messages`);
    console.log();

    // Activate module plugins (with dependency resolution)
    console.log('5. Activating Analytics and Reporting...');
    const analytics = PluginManager.activate('Analytics');
    const reporting = PluginManager.activate('Reporting'); // Auto-activates Analytics
    console.log();

    // Use analytics
    console.log('6. Using analytics...');
    analytics.trackObjectCreation();
    analytics.trackObjectCreation();
    analytics.trackObjectRemoval();
    analytics.trackEvent();
    analytics.trackEvent();
    analytics.trackEvent();

    const stats = analytics.getStats();
    console.log('   Basic stats:', stats);

    const report = reporting.generateReport();
    console.log('   Report:', report);
    console.log();

    // Query plugin status
    console.log('7. Plugin status:');
    console.log('   - CustomShape registered:', PluginManager.has('CustomShape'));
    console.log('   - DebugTool active:', PluginManager.isActive('DebugTool'));
    console.log('   - Analytics active:', PluginManager.isActive('Analytics'));
    console.log('   - Reporting active:', PluginManager.isActive('Reporting'));
    console.log();

    // Get plugins by type
    console.log('8. Plugins by type:');
    const objectPlugins = PluginManager.getAll('object');
    console.log(`   - Object plugins: ${objectPlugins.map((p) => p.name).join(', ')}`);
    const toolPlugins = PluginManager.getAll('tool');
    console.log(`   - Tool plugins: ${toolPlugins.map((p) => p.name).join(', ')}`);
    const modulePlugins = PluginManager.getAll('module');
    console.log(`   - Module plugins: ${modulePlugins.map((p) => p.name).join(', ')}`);
    console.log();

    // Test dependency enforcement
    console.log('9. Testing dependency enforcement...');
    try {
        PluginManager.deactivate('Analytics');
        console.log('   ✗ Should not allow deactivating Analytics (has dependents)');
    } catch (error) {
        console.log('   ✓ Correctly prevented deactivating Analytics (has dependents)');
    }
    console.log();

    // Deactivate plugins in correct order
    console.log('10. Deactivating plugins...');
    PluginManager.deactivate('Reporting');
    PluginManager.deactivate('Analytics');
    PluginManager.deactivate('DebugTool');
    console.log();

    // Unregister plugins
    console.log('11. Unregistering plugins...');
    PluginManager.unregister('Reporting');
    PluginManager.unregister('Analytics');
    PluginManager.unregister('DebugTool');
    PluginManager.unregister('CustomShape');
    console.log(`   ✓ All plugins unregistered (${PluginManager.getAll().length} remaining)`);
    console.log();

    console.log('=== Example Complete ===');
}

// Run the example
runPluginExample();
