/**
 * KALYTHESAINZ TypeScript Definitions
 * Version 2.0.0
 *
 * A simple 3D web framework built on top of Three.js
 * Provides declarative API and visual tooling for 3D web development
 */

import * as THREE from 'three';

// ============================================================================
// Core Layer Types
// ============================================================================

/**
 * Main application class for KALYTHESAINZ framework
 */
export class App {
    constructor(config?: AppConfig);
    init(): void;
    start(): void;
    stop(): void;
    destroy(): void;
}

export interface AppConfig {
    containerId?: string;
    renderer?: RendererConfig;
    camera?: CameraConfig;
    lights?: LightConfig | false;
    autoStart?: boolean;
}

/**
 * Configuration manager for the framework
 */
export class Config {
    static get(key: string): any;
    static set(key: string, value: any): void;
    static getAll(): Record<string, any>;
    static reset(): void;
}

/**
 * Global event bus for cross-scene communication
 */
export class EventBus {
    static subscribe(
        event: string,
        callback: EventCallback,
        options?: EventOptions,
    ): UnsubscribeFunction;
    static publish(event: string, data?: any): void;
    static unsubscribe(event: string, callback?: EventCallback): void;
    static clear(): void;
}

export type EventCallback = (event: EventData) => void;
export type UnsubscribeFunction = () => void;

export interface EventData {
    name: string;
    data: any;
    timestamp: number;
    scene?: SceneInstance;
}

export interface EventOptions {
    once?: boolean;
    priority?: number;
}

/**
 * Plugin manager for extending framework functionality
 */
export class PluginManager {
    static register(plugin: Plugin): void;
    static unregister(pluginName: string): void;
    static get(pluginName: string): Plugin | undefined;
    static getAll(): Plugin[];
}

export interface Plugin {
    name: string;
    version: string;
    init(): void;
    destroy(): void;
}

export class CustomObjectPlugin implements Plugin {
    name: string;
    version: string;
    init(): void;
    destroy(): void;
}

export class CustomToolPlugin implements Plugin {
    name: string;
    version: string;
    init(): void;
    destroy(): void;
}

export class CustomModulePlugin implements Plugin {
    name: string;
    version: string;
    init(): void;
    destroy(): void;
}

export function createObjectPlugin(config: PluginConfig): CustomObjectPlugin;
export function createToolPlugin(config: PluginConfig): CustomToolPlugin;
export function createModulePlugin(config: PluginConfig): CustomModulePlugin;

export interface PluginConfig {
    name: string;
    version: string;
    init?: () => void;
    destroy?: () => void;
}

// ============================================================================
// Engine Layer Types
// ============================================================================

/**
 * SceneInstance - Instance-based scene manager
 *
 * ✨ RECOMMENDED API - This is the modern way to create scenes in v2.x
 *
 * Each SceneInstance is independent with its own renderer, camera, objects, and lifecycle.
 * Multiple instances can coexist without conflicts.
 */
export class SceneInstance {
    constructor(containerId: string, config?: SceneConfig);

    // Getters
    readonly threeScene: THREE.Scene;
    readonly renderer: Renderer;
    readonly camera: Camera;
    readonly lights: Light[];
    readonly objects: Map<string, ObjectData>;
    readonly isDisposed: boolean;
    readonly isRendering: boolean;
    readonly config: SceneConfig;

    // Object creation methods (instance-scoped)
    createBox(width: number, height: number, depth: number, material?: MaterialConfig): Box;
    createSphere(radius: number, segments?: number, material?: MaterialConfig): Sphere;
    createPlane(width: number, height: number, material?: MaterialConfig): Plane;

    // Light management (instance-scoped)
    addLight(type: LightType, config?: LightConfig): Light;
    removeLight(light: Light): boolean;

    // Object management
    add(object: Object3D | THREE.Object3D, id?: string): string;
    remove(objectOrId: Object3D | THREE.Object3D | string): boolean;
    find(id: string): ObjectData | undefined;
    findAll(predicate: (data: ObjectData) => boolean): ObjectData[];
    clear(disposeLights?: boolean): void;

    // Lifecycle
    destroy(): void;
    dispose(): void;

    // Rendering
    startRenderLoop(targetFPS?: number): void;
    stopRenderLoop(): void;
    render(): void;

    // Event system (instance-scoped)
    on(event: string, callback: EventCallback, options?: EventOptions): UnsubscribeFunction;
    off(event: string, callbackOrId: EventCallback | string): boolean;
    emit(event: string, data?: any): EventEmitResult;
    onGlobal(event: string, callback: EventCallback, options?: EventOptions): UnsubscribeFunction;
}

export interface SceneConfig {
    renderer?: RendererConfig;
    camera?: CameraConfig;
    lights?: LightConfig | false;
    autoStart?: boolean;
}

export interface RendererConfig {
    antialias?: boolean;
    alpha?: boolean;
    powerPreference?: 'high-performance' | 'low-power' | 'default';
}

export interface CameraConfig {
    type?: 'perspective' | 'orthographic';
    fov?: number;
    near?: number;
    far?: number;
    position?: { x: number; y: number; z: number };
}

export interface ObjectData {
    id: string;
    object: Object3D | THREE.Object3D;
    threeObject: THREE.Object3D;
    addedAt: number;
}

export interface EventEmitResult {
    event: EventData;
    executed: number;
    errors: Array<{ listener: string; error: string; stack: string }>;
}

/**
 * Create a new scene instance (Instance-based API)
 *
 * ✨ RECOMMENDED API - This is the modern way to create scenes in v2.x
 *
 * @param containerId - DOM container ID where the scene will be rendered
 * @param config - Scene configuration options
 * @returns New scene instance
 * @throws Error if containerId is invalid or configuration is invalid
 *
 * @example
 * ```typescript
 * // Create a scene with default settings
 * const scene = createScene('my-container');
 *
 * // Create a scene with custom configuration
 * const scene = createScene('my-container', {
 *   camera: { fov: 60, type: 'perspective' },
 *   lights: false,
 *   autoStart: true
 * });
 *
 * // Create multiple independent scenes
 * const scene1 = createScene('container-1');
 * const scene2 = createScene('container-2');
 * ```
 */
export function createScene(containerId: string, config?: SceneConfig): SceneInstance;

/**
 * Scene - Singleton scene manager (Backward Compatibility)
 *
 * @deprecated Scene.init() is deprecated in v2.x. Use createScene() instead.
 *
 * The Scene class provides backward compatibility with v1.x singleton API.
 * This API will be removed in v3.0.0.
 *
 * Migration guide:
 * - Old: const scene = Scene.init('container');
 * - New: const scene = createScene('container');
 *
 * Benefits of the new API:
 * - Multiple independent scenes
 * - Better React compatibility
 * - Clearer lifecycle management
 * - No global state
 */
export class Scene {
    /**
     * @deprecated Use createScene() instead
     */
    static init(containerId: string, config?: SceneConfig): SceneInstance;

    /**
     * @deprecated Use createScene() instead
     */
    static getInstance(): SceneInstance | null;

    /**
     * @deprecated Use scene.destroy() on the instance instead
     */
    static destroy(): void;
}

/**
 * Renderer wrapper for Three.js WebGLRenderer
 */
export class Renderer {
    constructor(containerId: string, config?: RendererConfig);
    readonly threeRenderer: THREE.WebGLRenderer;
    render(scene: THREE.Scene, camera: THREE.Camera): void;
    setSize(width: number, height: number): void;
    dispose(): void;
}

/**
 * Camera wrapper for Three.js cameras
 */
export class Camera {
    constructor(config?: CameraConfig);
    readonly threeCamera: THREE.Camera;
    setPosition(x: number, y: number, z: number): void;
    lookAt(x: number, y: number, z: number): void;
    updateAspect(aspect: number): void;
}

/**
 * Light wrapper for Three.js lights
 */
export class Light {
    constructor(threeLight: THREE.Light, type: LightType);
    readonly threeLight: THREE.Light;
    readonly type: LightType;

    /**
     * Create a directional light (sun)
     * @param config - Light configuration
     * @param scene - Optional scene instance to add light to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static sun(config?: DirectionalLightConfig, scene?: SceneInstance): Light;

    /**
     * Create an ambient light
     * @param config - Light configuration
     * @param scene - Optional scene instance to add light to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static ambient(config?: AmbientLightConfig, scene?: SceneInstance): Light;

    /**
     * Create a point light
     * @param x - X position
     * @param y - Y position
     * @param z - Z position
     * @param config - Light configuration
     * @param scene - Optional scene instance to add light to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static point(
        x: number,
        y: number,
        z: number,
        config?: PointLightConfig,
        scene?: SceneInstance,
    ): Light;

    /**
     * Create a spot light
     * @param config - Light configuration
     * @param scene - Optional scene instance to add light to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static spot(config?: SpotLightConfig, scene?: SceneInstance): Light;

    /**
     * Create a hemisphere light
     * @param config - Light configuration
     * @param scene - Optional scene instance to add light to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static hemisphere(config?: HemisphereLightConfig, scene?: SceneInstance): Light;

    setIntensity(intensity: number): void;
    setColor(color: string | number): void;
    dispose(): void;
}

export type LightType = 'sun' | 'ambient' | 'point' | 'spot' | 'hemisphere' | 'directional';

export interface LightConfig {
    intensity?: number;
    color?: string | number;
}

export interface DirectionalLightConfig extends LightConfig {
    position?: { x: number; y: number; z: number };
    castShadow?: boolean;
}

export interface AmbientLightConfig extends LightConfig {}

export interface PointLightConfig extends LightConfig {
    distance?: number;
    decay?: number;
    castShadow?: boolean;
}

export interface SpotLightConfig extends LightConfig {
    position?: { x: number; y: number; z: number };
    angle?: number;
    penumbra?: number;
    distance?: number;
    decay?: number;
    castShadow?: boolean;
}

export interface HemisphereLightConfig {
    skyColor?: string | number;
    groundColor?: string | number;
    intensity?: number;
}

/**
 * Base class for 3D objects
 */
export class Object3D {
    constructor(threeObject: THREE.Object3D);
    readonly threeObject: THREE.Object3D;
    readonly id: string;

    setPosition(x: number, y: number, z: number): void;
    setRotation(x: number, y: number, z: number): void;
    setScale(x: number, y: number, z: number): void;
    dispose(): void;
}

// ============================================================================
// Objects Layer Types
// ============================================================================

export interface MaterialConfig {
    color?: string | number;
    wireframe?: boolean;
    transparent?: boolean;
    opacity?: number;
}

/**
 * Box object (cube)
 */
export class Box extends Object3D {
    readonly width: number;
    readonly height: number;
    readonly depth: number;

    /**
     * Create a box
     * @param width - Box width
     * @param height - Box height
     * @param depth - Box depth
     * @param material - Material configuration
     * @param scene - Optional scene instance to add box to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static create(
        width: number,
        height: number,
        depth: number,
        material?: MaterialConfig,
        scene?: SceneInstance,
    ): Box;
}

/**
 * Sphere object
 */
export class Sphere extends Object3D {
    readonly radius: number;
    readonly widthSegments: number;
    readonly heightSegments: number;

    /**
     * Create a sphere
     * @param radius - Sphere radius
     * @param segments - Number of segments (default: 32)
     * @param material - Material configuration
     * @param scene - Optional scene instance to add sphere to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static create(
        radius: number,
        segments?: number,
        material?: MaterialConfig,
        scene?: SceneInstance,
    ): Sphere;
}

/**
 * Plane object (flat surface)
 */
export class Plane extends Object3D {
    readonly width: number;
    readonly height: number;

    /**
     * Create a plane
     * @param width - Plane width
     * @param height - Plane height
     * @param material - Material configuration
     * @param scene - Optional scene instance to add plane to
     * @deprecated Passing scene parameter is recommended. Omitting it uses deprecated singleton API.
     */
    static create(
        width: number,
        height: number,
        material?: MaterialConfig,
        scene?: SceneInstance,
    ): Plane;
}

// ============================================================================
// Tools Layer Types
// ============================================================================

/**
 * Inspector tool for debugging scenes
 */
export class Inspector {
    constructor(scene: SceneInstance);
    show(): void;
    hide(): void;
    update(): void;
    destroy(): void;
}

/**
 * Scene tree visualization tool
 */
export class SceneTree {
    constructor(scene: SceneInstance);
    render(): HTMLElement;
    update(): void;
    destroy(): void;
}

/**
 * Transform gizmo for manipulating objects
 */
export class TransformGizmo {
    constructor(scene: SceneInstance);
    attach(object: Object3D | THREE.Object3D): void;
    detach(): void;
    setMode(mode: 'translate' | 'rotate' | 'scale'): void;
    destroy(): void;
}

// ============================================================================
// Utils Layer Types
// ============================================================================

/**
 * Serializer for saving/loading scenes
 */
export class Serializer {
    static serialize(scene: SceneInstance): string;
    static deserialize(data: string, containerId: string): SceneInstance;
    static toJSON(scene: SceneInstance): object;
    static fromJSON(data: object, containerId: string): SceneInstance;
}

/**
 * Three.js integration utilities
 */
export class ThreeJsIntegration {
    static importObject(threeObject: THREE.Object3D): Object3D;
    static exportObject(object: Object3D): THREE.Object3D;
    static isThreeObject(obj: any): obj is THREE.Object3D;
}

// ============================================================================
// Framework Version
// ============================================================================

export const VERSION: string;

// ============================================================================
// Deprecated APIs
// ============================================================================

/**
 * Quick start helper for backward compatibility
 *
 * @deprecated quickStart() is deprecated in v2.x. Use createScene() with instance methods instead.
 *
 * This function will be removed in v3.0.0.
 *
 * Migration guide:
 * - Old: const scene = quickStart('container');
 * - New: const scene = createScene('container'); scene.addLight('sun');
 */
export function quickStart(containerId: string, config?: SceneConfig): SceneInstance;
