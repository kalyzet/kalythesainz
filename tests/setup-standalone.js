/**
 * Standalone test setup without Jest dependencies
 * Provides minimal Three.js mock for standalone tests
 */

import { JSDOM } from 'jsdom';

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    writable: true,
    configurable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock canvas context
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
});

// Minimal Three.js mock
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    toArray() {
        return [this.x, this.y, this.z];
    }
}

class Color {
    constructor(color = 0xffffff) {
        this._value = color;
    }
    set(color) {
        this._value = typeof color === 'number' ? color : 0xffffff;
        return this;
    }
    setHex(hex) {
        this._value = hex;
        return this;
    }
    getHex() {
        return this._value;
    }
    clone() {
        return new Color(this._value);
    }
}

class Euler {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    clone() {
        return new Euler(this.x, this.y, this.z);
    }
}

class Object3D {
    constructor() {
        this.position = new Vector3();
        this.rotation = new Euler();
        this.scale = new Vector3(1, 1, 1);
        this.children = [];
        this.parent = null;
        this.uuid = Math.random().toString(36).substring(7);
        this.isObject3D = true;
    }
    add(object) {
        if (object && object !== this) {
            if (object.parent) {
                object.parent.remove(object);
            }
            object.parent = this;
            this.children.push(object);
        }
        return this;
    }
    remove(object) {
        const index = this.children.indexOf(object);
        if (index !== -1) {
            object.parent = null;
            this.children.splice(index, 1);
        }
        return this;
    }
}

class Scene extends Object3D {
    constructor() {
        super();
        this.background = null;
        this.isScene = true;
    }
}

class Camera extends Object3D {
    constructor() {
        super();
        this.isCamera = true;
    }
}

class PerspectiveCamera extends Camera {
    constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.isPerspectiveCamera = true;
    }
    updateProjectionMatrix() {}
}

class WebGLRenderer {
    constructor(options = {}) {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: false };
    }
    setSize(width, height) {}
    setPixelRatio(ratio) {}
    render(scene, camera) {}
    dispose() {}
}

class Geometry {
    constructor() {
        this.uuid = Math.random().toString(36).substring(7);
    }
    dispose() {}
}

class BoxGeometry extends Geometry {
    constructor(width = 1, height = 1, depth = 1) {
        super();
        this.parameters = { width, height, depth };
    }
}

class SphereGeometry extends Geometry {
    constructor(radius = 1, widthSegments = 32, heightSegments = 16) {
        super();
        this.parameters = { radius, widthSegments, heightSegments };
    }
}

class PlaneGeometry extends Geometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        super();
        this.parameters = { width, height, widthSegments, heightSegments };
    }
}

class Material {
    constructor() {
        this.uuid = Math.random().toString(36).substring(7);
        this.isMaterial = true;
    }
    dispose() {}
}

class MeshStandardMaterial extends Material {
    constructor(options = {}) {
        super();
        this.color = new Color(options.color || 0xffffff);
        this.metalness = options.metalness || 0;
        this.roughness = options.roughness || 1;
        this.opacity = options.opacity || 1;
        this.transparent = options.transparent || false;
        this.emissive = new Color(options.emissive || 0x000000);
        this.wireframe = options.wireframe || false;
        this.side = options.side || 0;
    }
}

class Mesh extends Object3D {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
        this.isMesh = true;
    }
}

class Light extends Object3D {
    constructor(color, intensity) {
        super();
        this.color = new Color(color);
        this.intensity = intensity;
        this.isLight = true;
    }
}

class DirectionalLight extends Light {
    constructor(color, intensity) {
        super(color, intensity);
        this.target = new Object3D();
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 512, height: 512 },
            camera: {
                near: 0.5,
                far: 500,
                left: -10,
                right: 10,
                top: 10,
                bottom: -10,
            },
        };
    }
}

class AmbientLight extends Light {
    constructor(color, intensity) {
        super(color, intensity);
    }
}

class PointLight extends Light {
    constructor(color, intensity, distance, decay) {
        super(color, intensity);
        this.distance = distance || 0;
        this.decay = decay || 2;
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 512, height: 512 },
            camera: { near: 0.5, far: 500 },
        };
    }
}

class SpotLight extends Light {
    constructor(color, intensity, distance, angle, penumbra, decay) {
        super(color, intensity);
        this.distance = distance || 0;
        this.angle = angle || Math.PI / 3;
        this.penumbra = penumbra || 0;
        this.decay = decay || 2;
        this.target = new Object3D();
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 512, height: 512 },
            camera: { near: 0.5, far: 500, fov: 50 },
        };
    }
}

class HemisphereLight extends Light {
    constructor(skyColor, groundColor, intensity) {
        super(skyColor, intensity);
        this.groundColor = new Color(groundColor);
    }
}

// Export mock Three.js
export default {
    Vector3,
    Color,
    Euler,
    Object3D,
    Scene,
    Camera,
    PerspectiveCamera,
    WebGLRenderer,
    Geometry,
    BoxGeometry,
    SphereGeometry,
    PlaneGeometry,
    Material,
    MeshStandardMaterial,
    Mesh,
    Light,
    DirectionalLight,
    AmbientLight,
    PointLight,
    SpotLight,
    HemisphereLight,
    DoubleSide: 2,
};
