/**
 * Example: Using the KALYTHESAINZ Plugin System
 *
 * This example demonstrates how to:
 * 1. Create custom object plugins
 * 2. Create custom tool plugins
 * 3. Create custom module plugins
 * 4. Register and activate plugins
 * 5. Use plugins with dependencies
 */

import {
    PluginManager,
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
    CustomObjectPlugin,
} from '../index.js';
import { Object3D } from '../engine/Object3D.js';
import * as THREE from 'three';

// Example 1: Create a custom object plugin using the helper function
const cylinderPlugin = createObjectPlugin({
    name: 'Cylinder',
    version: '1.0.0',
    description: 'Custom cylinder object',
    create: (params = {}) => {
        const radius = params.radius || 1;
        const height = params.height || 2;
        const segments = params.segments || 32;

        const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
        const material = new THREE.MeshStandardMaterial({
            color: params.color || 0x00ff00,
        });

        return new Object3D(geometry, material);
    },
});

// Example 2: Create a custom object plugin by extending the base class
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
        const size = params.size || 1;
        const geometry = new THREE.ConeGeometry(size, size * 1.5, 4);
        const material = new THREE.MeshStandardMaterial({
            color: params.color || 0xff00ff,
        });

        return new Object3D(geometry, material);
    }
}

// Example 3: Create a custom tool plugin
const gridHelperPlugin = createToolPlugin({
    name: 'GridHelper',
    version: '1.0.0',
    description: 'Grid helper tool for scene visualization',
    init: (options = {}) => {
        const size = options.size || 10;
        const divisions = options.divisions || 10;
        const grid = new THREE.GridHelper(size, divisions);

        return {
            grid,
            show: () => {
                grid.visible = true;
            },
            hide: () => {
                grid.visible = false;
            },
            dispose: () => {
                grid.geometry.dispose();
                grid.material.dispose();
            },
        };
    },
    destroy: (instance) => {
        instance.dispose();
    },
});

// Example 4: Create a custom module plugin with dependencies
const analyticsPlugin = createModulePlugin({
    name: 'Analytics',
    version: '1.0.0',
    description: 'Analytics module for tracking scene statistics',
    init: (options = {}) => {
        const stats = {
            objectsCreated: 0,
            objectsRemoved: 0,
            renderFrames: 0,
        };

        return {
            stats,
            trackObjectCreation: () => {
                stats.objectsCreated++;
            },
            trackObjectRemoval: () => {
                stats.objectsRemoved++;
            },
            trackRenderFrame: () => {
                stats.renderFrames++;
            },
            getStats: () => ({ ...stats }),
            reset: () => {
                stats.objectsCreated = 0;
                stats.objectsRemoved = 0;
                stats.renderFrames = 0;
            },
        };
    },
    destroy: (instance) => {
        instance.reset();
    },
});

// Example 5: Create a plugin that depends on another plugin
const advancedAnalyticsPlugin = createModulePlugin({
    name: 'AdvancedAnalytics',
    version: '1.0.0',
    description: 'Advanced analytics with reporting',
    dependencies: ['Analytics'], // Depends on Analytics plugin
    init: (options = {}) => {
        const analyticsInstance = PluginManager.getInstance('Analytics');

        return {
            generateReport: () => {
                const stats = analyticsInstance.getStats();
                return {
                    ...stats,
                    averageObjectLifetime:
                        stats.objectsCreated > 0 ? stats.renderFrames / stats.objectsCreated : 0,
                    objectRetentionRate:
                        stats.objectsCreated > 0
                            ? (stats.objectsCreated - stats.objectsRemoved) / stats.objectsCreated
                            : 0,
                };
            },
        };
    },
    destroy: () => {
        // Cleanup if needed
    },
});

// Main example function
export function runPluginExample() {
    console.log('=== KALYTHESAINZ Plugin System Example ===\n');

    // Register plugins
    console.log('1. Registering plugins...');
    PluginManager.register(cylinderPlugin);
    PluginManager.register(PyramidPlugin.getPluginDefinition());
    PluginManager.register(gridHelperPlugin);
    PluginManager.register(analyticsPlugin);
    PluginManager.register(advancedAnalyticsPlugin);
    console.log('   ✓ All plugins registered\n');

    // List all registered plugins
    console.log('2. Registered plugins:');
    const allPlugins = PluginManager.getAll();
    allPlugins.forEach((plugin) => {
        console.log(`   - ${plugin.name} v${plugin.version} (${plugin.type})`);
    });
    console.log();

    // Create objects using custom object plugins
    console.log('3. Creating objects with custom plugins...');
    const cylinderData = PluginManager.get('Cylinder');
    const cylinder = cylinderData.create({ radius: 1.5, height: 3, color: 0x00ff00 });
    console.log('   ✓ Created cylinder:', cylinder.id);

    const pyramidData = PluginManager.get('Pyramid');
    const pyramid = pyramidData.create({ size: 2, color: 0xff00ff });
    console.log('   ✓ Created pyramid:', pyramid.id);
    console.log();

    // Activate tool plugin
    console.log('4. Activating GridHelper tool...');
    const gridHelper = PluginManager.activate('GridHelper', { size: 20, divisions: 20 });
    console.log('   ✓ GridHelper activated');
    gridHelper.show();
    console.log('   ✓ Grid visible\n');

    // Activate module plugins (with dependency resolution)
    console.log('5. Activating Analytics modules...');
    const analytics = PluginManager.activate('Analytics');
    console.log('   ✓ Analytics activated');

    // This will auto-activate Analytics if not already active
    const advancedAnalytics = PluginManager.activate('AdvancedAnalytics');
    console.log('   ✓ AdvancedAnalytics activated (with dependency)\n');

    // Use analytics
    console.log('6. Using analytics...');
    analytics.trackObjectCreation();
    analytics.trackObjectCreation();
    analytics.trackRenderFrame();
    analytics.trackRenderFrame();
    analytics.trackRenderFrame();

    const stats = analytics.getStats();
    console.log('   Basic stats:', stats);

    const report = advancedAnalytics.generateReport();
    console.log('   Advanced report:', report);
    console.log();

    // Query plugin status
    console.log('7. Plugin status:');
    console.log('   - Cylinder registered:', PluginManager.has('Cylinder'));
    console.log('   - GridHelper active:', PluginManager.isActive('GridHelper'));
    console.log('   - Analytics active:', PluginManager.isActive('Analytics'));
    console.log('   - AdvancedAnalytics active:', PluginManager.isActive('AdvancedAnalytics'));
    console.log();

    // Deactivate plugins
    console.log('8. Deactivating plugins...');
    PluginManager.deactivate('AdvancedAnalytics');
    console.log('   ✓ AdvancedAnalytics deactivated');
    PluginManager.deactivate('Analytics');
    console.log('   ✓ Analytics deactivated');
    PluginManager.deactivate('GridHelper');
    console.log('   ✓ GridHelper deactivated\n');

    // Get plugins by type
    console.log('9. Plugins by type:');
    const objectPlugins = PluginManager.getAll('object');
    console.log(`   - Object plugins: ${objectPlugins.map((p) => p.name).join(', ')}`);
    const toolPlugins = PluginManager.getAll('tool');
    console.log(`   - Tool plugins: ${toolPlugins.map((p) => p.name).join(', ')}`);
    const modulePlugins = PluginManager.getAll('module');
    console.log(`   - Module plugins: ${modulePlugins.map((p) => p.name).join(', ')}`);
    console.log();

    console.log('=== Example Complete ===');
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runPluginExample();
}
