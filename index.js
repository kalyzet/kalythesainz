/**
 * KALYTHESAINZ - A simple 3D web framework built on top of Three.js
 *
 * Main entry point for the framework
 * Provides declarative API and visual tooling for 3D web development
 *
 * ⚠️ INTERNAL USE ONLY
 * This file is used for development and testing purposes.
 * When published to npm, users will import from the bundled files:
 * - dist/kalythesainz.esm.js (ESM format for modern bundlers)
 * - dist/kalythesainz.umd.min.js (UMD format for CommonJS/browser)
 */

// Core Layer exports
export { App } from './core/App.js';
export { Config } from './core/Config.js';
export { EventBus } from './core/EventBus.js';
export { PluginManager } from './core/PluginManager.js';
export {
    CustomObjectPlugin,
    CustomToolPlugin,
    CustomModulePlugin,
    createObjectPlugin,
    createToolPlugin,
    createModulePlugin,
} from './core/PluginInterfaces.js';

// Engine Layer exports
export { Scene } from './engine/Scene.js';
export { Renderer } from './engine/Renderer.js';
export { Camera } from './engine/Camera.js';
export { Light } from './engine/Light.js';
export { Object3D } from './engine/Object3D.js';

// Objects Layer exports
export { Box } from './objects/Box.js';
export { Sphere } from './objects/Sphere.js';
export { Plane } from './objects/Plane.js';

// Tools Layer exports
export { Inspector } from './tools/Inspector.js';
export { SceneTree } from './tools/SceneTree.js';
export { TransformGizmo } from './tools/TransformGizmo.js';

// Utils exports
export { Serializer } from './utils/Serializer.js';
export { ThreeJsIntegration } from './utils/ThreeJsIntegration.js';

// Framework version
export const VERSION = '1.0.0';

// Quick start helper
export function quickStart(containerId, config = {}) {
    const scene = Scene.init(containerId, config);
    Light.sun();
    return scene;
}
