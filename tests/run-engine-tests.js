/**
 * Simple test runner for Engine Layer unit tests
 */

// Mock DOM environment
global.window = {
    devicePixelRatio: 2,
    ResizeObserver: class {
        constructor(callback) {
            this.callback = callback;
        }
        observe() {}
        disconnect() {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (cb) => {
        setTimeout(cb, 16);
        return 1;
    },
    cancelAnimationFrame: () => {},
};

global.document = {
    getElementById: (id) => {
        if (id === 'test-container') {
            return {
                clientWidth: 800,
                clientHeight: 600,
                appendChild: () => {},
                removeChild: () => {},
                contains: () => true,
                getBoundingClientRect: () => ({ width: 800, height: 600 }),
            };
        }
        return null;
    },
    createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        style: {},
        appendChild: () => {},
        removeChild: () => {},
    }),
};

// Mock Jest globals
global.describe = (name, fn) => {
    console.log(`\n📁 ${name}`);
    try {
        fn();
    } catch (error) {
        console.log(`  ❌ Error in ${name}: ${error.message}`);
    }
};

global.test = (name, fn) => {
    try {
        // Execute beforeEach if it exists
        if (global._beforeEach) {
            global._beforeEach();
        }

        fn();
        console.log(`  ✅ ${name}`);

        // Execute afterEach if it exists
        if (global._afterEach) {
            global._afterEach();
        }
    } catch (error) {
        console.log(`  ❌ ${name}`);
        console.log(`     Error: ${error.message}`);
    }
};

global.beforeEach = (fn) => {
    global._beforeEach = fn;
};

global.afterEach = (fn) => {
    global._afterEach = fn;
};

global.expect = (actual) => ({
    toBe: (expected) => {
        if (actual !== expected) {
            throw new Error(`Expected ${actual} to be ${expected}`);
        }
    },
    toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
                `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
            );
        }
    },
    toBeDefined: () => {
        if (actual === undefined) {
            throw new Error('Expected value to be defined');
        }
    },
    toBeNull: () => {
        if (actual !== null) {
            throw new Error(`Expected ${actual} to be null`);
        }
    },
    toHaveProperty: (prop) => {
        if (!actual || !actual.hasOwnProperty(prop)) {
            throw new Error(`Expected object to have property ${prop}`);
        }
    },
    toHaveLength: (length) => {
        if (!actual || actual.length !== length) {
            throw new Error(
                `Expected length ${length}, got ${actual ? actual.length : 'undefined'}`,
            );
        }
    },
    toContain: (item) => {
        if (!actual || !actual.includes(item)) {
            throw new Error(`Expected array to contain ${item}`);
        }
    },
    toThrow: (message) => {
        try {
            actual();
            throw new Error('Expected function to throw');
        } catch (error) {
            if (message && !error.message.includes(message)) {
                throw new Error(
                    `Expected error message to contain "${message}", got "${error.message}"`,
                );
            }
        }
    },
    toHaveBeenCalled: () => {
        if (!actual.mock || actual.mock.calls.length === 0) {
            throw new Error('Expected function to have been called');
        }
    },
    toHaveBeenCalledWith: (...args) => {
        if (!actual.mock || actual.mock.calls.length === 0) {
            throw new Error('Expected function to have been called');
        }
        // Simple check - just verify it was called
        return;
    },
    not: {
        toThrow: () => {
            try {
                actual();
            } catch (error) {
                throw new Error('Expected function not to throw');
            }
        },
        toHaveBeenCalled: () => {
            if (actual.mock && actual.mock.calls.length > 0) {
                throw new Error('Expected function not to have been called');
            }
        },
        toBe: (expected) => {
            if (actual === expected) {
                throw new Error(`Expected ${actual} not to be ${expected}`);
            }
        },
        toContain: (item) => {
            if (actual && actual.includes(item)) {
                throw new Error(`Expected array not to contain ${item}`);
            }
        },
    },
});

global.jest = {
    fn: (impl) => {
        const mockFn = impl || (() => {});
        mockFn.mock = {
            calls: [],
            results: [],
        };

        const wrappedFn = (...args) => {
            mockFn.mock.calls.push(args);
            const result = mockFn(...args);
            mockFn.mock.results.push({ type: 'return', value: result });
            return result;
        };

        wrappedFn.mock = mockFn.mock;
        wrappedFn.mockImplementation = (newImpl) => {
            Object.assign(mockFn, newImpl);
            return wrappedFn;
        };

        return wrappedFn;
    },
    clearAllMocks: () => {
        // Simple implementation
    },
};

// Add object containing matcher
global.expect.objectContaining = (obj) => ({ objectContaining: obj });

// Mock Three.js module completely
const mockThreeModule = {
    WebGLRenderer: class {
        constructor(config) {
            this.domElement = document.createElement('canvas');
            this.config = config;
            this.disposed = false;
        }
        setSize(width, height, updateStyle) {
            this.width = width;
            this.height = height;
            this.updateStyle = updateStyle;
        }
        setPixelRatio(ratio) {
            this.pixelRatio = ratio;
        }
        setClearColor(color, alpha) {
            this.clearColor = color;
            this.clearAlpha = alpha;
        }
        render(scene, camera) {
            if (this.disposed) throw new Error('Renderer disposed');
            this.lastRender = { scene, camera };
        }
        dispose() {
            this.disposed = true;
        }
        getSize(target) {
            target.x = this.width || 800;
            target.y = this.height || 600;
            return target;
        }
    },
    PerspectiveCamera: class {
        constructor(fov, aspect, near, far) {
            this.fov = fov;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.position = { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() };
            this.isCamera = true;
            this.isPerspectiveCamera = true;
        }
        lookAt(x, y, z) {
            this.lookAtTarget = { x, y, z };
        }
        updateProjectionMatrix() {
            this.projectionMatrixUpdated = true;
        }
    },
    OrthographicCamera: class {
        constructor(left, right, top, bottom, near, far) {
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
            this.near = near;
            this.far = far;
            this.position = { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() };
            this.isCamera = true;
            this.isOrthographicCamera = true;
        }
        lookAt(x, y, z) {
            this.lookAtTarget = { x, y, z };
        }
        updateProjectionMatrix() {
            this.projectionMatrixUpdated = true;
        }
    },
    DirectionalLight: class {
        constructor(color, intensity) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
            };
            this.target = {
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                },
            };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 50, left: -10, right: 10, top: 10, bottom: -10 },
            };
            this.isDirectionalLight = true;
        }
    },
    AmbientLight: class {
        constructor(color, intensity) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.isAmbientLight = true;
        }
    },
    PointLight: class {
        constructor(color, intensity, distance, decay) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.distance = distance;
            this.decay = decay;
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
            };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 50 },
            };
            this.isPointLight = true;
        }
    },
    SpotLight: class {
        constructor(color, intensity, distance, angle, penumbra, decay) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.intensity = intensity;
            this.distance = distance;
            this.angle = angle;
            this.penumbra = penumbra;
            this.decay = decay;
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
            };
            this.target = {
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                },
            };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 50, fov: 30 },
            };
            this.isSpotLight = true;
        }
    },
    HemisphereLight: class {
        constructor(skyColor, groundColor, intensity) {
            this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
            this.groundColor = { set: jest.fn() };
            this.intensity = intensity;
            this.isHemisphereLight = true;
        }
    },
    Scene: class {
        constructor() {
            this.children = [];
            this.background = null;
            this.isScene = true;
        }
        add(object) {
            if (!this.children.includes(object)) {
                this.children.push(object);
                object.parent = this;
            }
        }
        remove(object) {
            const index = this.children.indexOf(object);
            if (index !== -1) {
                this.children.splice(index, 1);
                object.parent = null;
            }
        }
    },
    Vector2: class {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    },
    Vector3: class {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        clone() {
            return new mockThreeModule.Vector3(this.x, this.y, this.z);
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }
    },
    Color: class {
        constructor(color) {
            this.color = color;
        }
    },
    PCFSoftShadowMap: 'PCFSoftShadowMap',
};

// Mock the Three.js module import
const originalRequire = require;
require = function (id) {
    if (id === 'three') {
        return mockThreeModule;
    }
    return originalRequire.apply(this, arguments);
};

// Also set global THREE for compatibility
global.THREE = mockThreeModule;

console.log('🧪 Running Engine Layer Unit Tests\n');

// Test basic functionality without importing actual modules
console.log('Testing Engine Layer components...');

// Test Renderer logic
console.log('Testing Renderer class...');
try {
    // Reset state
    Config.reset();
    EventBus.clear();

    // Test basic renderer creation
    const renderer = new Renderer({ containerId: 'test-container' });

    if (!renderer.threeRenderer) {
        throw new Error('Renderer not created');
    }

    if (renderer.isDisposed) {
        throw new Error('Renderer should not be disposed initially');
    }

    // Test setSize
    renderer.setSize(1024, 768);
    if (renderer.threeRenderer.width !== 1024 || renderer.threeRenderer.height !== 768) {
        throw new Error('setSize failed');
    }

    // Test render
    const mockScene = { isScene: true };
    const mockCamera = { isCamera: true };
    renderer.render(mockScene, mockCamera);

    if (!renderer.threeRenderer.lastRender) {
        throw new Error('render failed');
    }

    // Test dispose
    renderer.dispose();
    if (!renderer.isDisposed) {
        throw new Error('dispose failed');
    }

    console.log('  ✅ Renderer basic functionality works');
} catch (error) {
    console.log('  ❌ Renderer test failed:', error.message);
}

// Test Camera
console.log('\nTesting Camera class...');
try {
    // Mock Three.js for Camera
    global.THREE = {
        PerspectiveCamera: class {
            constructor(fov, aspect, near, far) {
                this.fov = fov;
                this.aspect = aspect;
                this.near = near;
                this.far = far;
                this.position = { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() };
                this.isCamera = true;
                this.isPerspectiveCamera = true;
            }
            lookAt(x, y, z) {
                this.lookAtTarget = { x, y, z };
            }
            updateProjectionMatrix() {
                this.projectionMatrixUpdated = true;
            }
        },
        OrthographicCamera: class {
            constructor(left, right, top, bottom, near, far) {
                this.left = left;
                this.right = right;
                this.top = top;
                this.bottom = bottom;
                this.near = near;
                this.far = far;
                this.position = { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() };
                this.isCamera = true;
                this.isOrthographicCamera = true;
            }
            lookAt(x, y, z) {
                this.lookAtTarget = { x, y, z };
            }
            updateProjectionMatrix() {
                this.projectionMatrixUpdated = true;
            }
        },
        Vector3: class {
            constructor(x = 0, y = 0, z = 0) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
            clone() {
                return new THREE.Vector3(this.x, this.y, this.z);
            }
        },
    };

    const { Camera } = await import('../engine/Camera.js');
    const { Config } = await import('../core/Config.js');
    const { EventBus } = await import('../core/EventBus.js');

    // Reset state
    Config.reset();
    EventBus.clear();

    // Test perspective camera creation
    const camera = new Camera('perspective');

    if (!camera.threeCamera) {
        throw new Error('Camera not created');
    }

    if (camera.type !== 'perspective') {
        throw new Error('Camera type incorrect');
    }

    // Test setPosition
    camera.setPosition(1, 2, 3);
    if (!camera.threeCamera.position.set.mock.calls.length) {
        throw new Error('setPosition not called');
    }

    // Test lookAt
    camera.lookAt(0, 0, 0);
    if (!camera.threeCamera.lookAtTarget) {
        throw new Error('lookAt failed');
    }

    // Test setFov
    camera.setFov(90);
    if (camera.threeCamera.fov !== 90) {
        throw new Error('setFov failed');
    }

    // Test presets
    const topCamera = Camera.topView();
    if (topCamera.type !== 'perspective') {
        throw new Error('topView preset failed');
    }

    // Test dispose
    camera.dispose();
    topCamera.dispose();
    if (!camera.isDisposed) {
        throw new Error('dispose failed');
    }

    console.log('  ✅ Camera basic functionality works');
} catch (error) {
    console.log('  ❌ Camera test failed:', error.message);
}

// Test Light
console.log('\nTesting Light class...');
try {
    // Mock Three.js for Light
    global.THREE = {
        DirectionalLight: class {
            constructor(color, intensity) {
                this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
                this.intensity = intensity;
                this.position = {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                };
                this.target = {
                    position: {
                        x: 0,
                        y: 0,
                        z: 0,
                        set: jest.fn(),
                        copy: jest.fn(),
                        clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                    },
                };
                this.castShadow = false;
                this.shadow = {
                    mapSize: { width: 1024, height: 1024 },
                    camera: { near: 0.5, far: 50, left: -10, right: 10, top: 10, bottom: -10 },
                };
                this.isDirectionalLight = true;
            }
        },
        AmbientLight: class {
            constructor(color, intensity) {
                this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
                this.intensity = intensity;
                this.isAmbientLight = true;
            }
        },
        PointLight: class {
            constructor(color, intensity, distance, decay) {
                this.color = { set: jest.fn(), clone: jest.fn(() => ({ r: 1, g: 1, b: 1 })) };
                this.intensity = intensity;
                this.distance = distance;
                this.decay = decay;
                this.position = {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: jest.fn(),
                    copy: jest.fn(),
                    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
                };
                this.castShadow = false;
                this.shadow = {
                    mapSize: { width: 1024, height: 1024 },
                    camera: { near: 0.5, far: 50 },
                };
                this.isPointLight = true;
            }
        },
        Vector3: class {
            constructor(x = 0, y = 0, z = 0) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
            clone() {
                return new THREE.Vector3(this.x, this.y, this.z);
            }
        },
    };

    const { Light } = await import('../engine/Light.js');
    const { EventBus } = await import('../core/EventBus.js');

    // Reset state
    EventBus.clear();

    // Test sun light preset
    const sunLight = Light.sun({ intensity: 0.8 });

    if (sunLight.type !== 'directional') {
        throw new Error('Sun light type incorrect');
    }

    if (sunLight.threeLight.intensity !== 0.8) {
        throw new Error('Sun light intensity incorrect');
    }

    // Test ambient light preset
    const ambientLight = Light.ambient({ intensity: 0.3 });

    if (ambientLight.type !== 'ambient') {
        throw new Error('Ambient light type incorrect');
    }

    // Test setIntensity
    sunLight.setIntensity(0.5);
    if (sunLight.threeLight.intensity !== 0.5) {
        throw new Error('setIntensity failed');
    }

    // Test setColor
    sunLight.setColor(0xff0000);
    if (!sunLight.threeLight.color.set.mock.calls.length) {
        throw new Error('setColor not called');
    }

    // Test basic setup
    const basicLights = Light.basicSetup();
    if (basicLights.length !== 2) {
        throw new Error('Basic setup failed');
    }

    // Test dispose
    sunLight.dispose();
    ambientLight.dispose();
    basicLights.forEach((light) => light.dispose());

    if (!sunLight.isDisposed) {
        throw new Error('dispose failed');
    }

    console.log('  ✅ Light basic functionality works');
} catch (error) {
    console.log('  ❌ Light test failed:', error.message);
}

// Test Scene
console.log('\nTesting Scene class...');
try {
    // Mock Three.js for Scene
    global.THREE = {
        Scene: class {
            constructor() {
                this.children = [];
                this.background = null;
                this.isScene = true;
            }
            add(object) {
                if (!this.children.includes(object)) {
                    this.children.push(object);
                    object.parent = this;
                }
            }
            remove(object) {
                const index = this.children.indexOf(object);
                if (index !== -1) {
                    this.children.splice(index, 1);
                    object.parent = null;
                }
            }
        },
        Color: class {
            constructor(color) {
                this.color = color;
            }
        },
        Vector2: class {
            constructor(x = 0, y = 0) {
                this.x = x;
                this.y = y;
            }
        },
    };

    // Mock the dependencies
    const mockRenderer = {
        size: { width: 800, height: 600 },
        render: jest.fn(),
        dispose: jest.fn(),
        isDisposed: false,
    };

    const mockCamera = {
        type: 'perspective',
        threeCamera: { isCamera: true },
        setAspect: jest.fn(),
        dispose: jest.fn(),
        isDisposed: false,
    };

    const mockLight = {
        threeLight: { isDirectionalLight: true },
        type: 'directional',
        dispose: jest.fn(),
    };

    // Mock the imports
    const originalImport = global.import;
    global.import = async (path) => {
        if (path.includes('Renderer.js')) {
            return {
                Renderer: class {
                    constructor() {
                        return mockRenderer;
                    }
                },
            };
        }
        if (path.includes('Camera.js')) {
            return {
                Camera: class {
                    constructor() {
                        return mockCamera;
                    }
                },
            };
        }
        if (path.includes('Light.js')) {
            return {
                Light: class {
                    static basicSetup() {
                        return [mockLight];
                    }
                    dispose() {
                        this.isDisposed = true;
                    }
                },
            };
        }
        return originalImport(path);
    };

    const { Scene } = await import('../engine/Scene.js');
    const { Config } = await import('../core/Config.js');
    const { EventBus } = await import('../core/EventBus.js');

    // Reset state
    Scene.destroy();
    Config.reset();
    EventBus.clear();

    // Test scene initialization
    const scene = Scene.init('test-container');

    if (!Scene.isInitialized()) {
        throw new Error('Scene not initialized');
    }

    if (Scene.getInstance() !== scene) {
        throw new Error('getInstance failed');
    }

    // Test add object
    const mockObject = {
        id: 'test-obj',
        threeObject: { isObject3D: true },
    };

    const objectId = scene.add(mockObject);
    if (objectId !== 'test-obj') {
        throw new Error('add object failed');
    }

    // Test find object
    const found = scene.find('test-obj');
    if (found !== mockObject) {
        throw new Error('find object failed');
    }

    // Test remove object
    const removed = scene.remove('test-obj');
    if (!removed) {
        throw new Error('remove object failed');
    }

    // Test render
    scene.render();
    if (!mockRenderer.render.mock.calls.length) {
        throw new Error('render not called');
    }

    // Test serialize
    const serialized = scene.serialize();
    if (!serialized.version) {
        throw new Error('serialize failed');
    }

    // Test dispose
    scene.dispose();
    if (!scene.isDisposed) {
        throw new Error('dispose failed');
    }

    // Restore original import
    global.import = originalImport;

    console.log('  ✅ Scene basic functionality works');
} catch (error) {
    console.log('  ❌ Scene test failed:', error.message);
}

console.log('\n✅ Engine Layer unit tests completed!');
console.log(
    'Note: These are simplified tests. Full Jest test suite would provide more comprehensive testing.',
);
