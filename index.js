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
import { Scene } from './engine/Scene.js';
import { SceneInstance } from './engine/SceneInstance.js';
import { Renderer } from './engine/Renderer.js';
import { Camera } from './engine/Camera.js';
import { Light } from './engine/Light.js';
import { Object3D } from './engine/Object3D.js';

export { Scene, SceneInstance, Renderer, Camera, Light, Object3D };

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

/**
 * Create a new scene instance (Instance-based API)
 * This is the recommended way to create scenes in v2.x
 *
 * @param {string} containerId - DOM container ID where the scene will be rendered
 * @param {object} config - Scene configuration options
 * @param {object} config.renderer - Renderer configuration (antialias, alpha, etc.)
 * @param {object} config.camera - Camera configuration (type, fov, near, far, etc.)
 * @param {object|false} config.lights - Light configuration or false to disable default lights
 * @param {boolean} config.autoStart - Whether to start render loop automatically (default: true)
 * @returns {SceneInstance} New scene instance
 * @throws {Error} If containerId is invalid or configuration is invalid
 *
 * @example
 * // Create a scene with default settings
 * const scene = createScene('my-container');
 *
 * @example
 * // Create a scene with custom configuration
 * const scene = createScene('my-container', {
 *   camera: { fov: 60, type: 'perspective' },
 *   lights: false, // Disable default lights
 *   autoStart: true
 * });
 *
 * @example
 * // Create multiple independent scenes
 * const scene1 = createScene('container-1');
 * const scene2 = createScene('container-2');
 */
export function createScene(containerId, config = {}) {
    return new SceneInstance(containerId, config);
}

// Quick start helper
export function quickStart(containerId, config = {}) {
    const scene = Scene.init(containerId, config);
    Light.sun();
    return scene;
}
