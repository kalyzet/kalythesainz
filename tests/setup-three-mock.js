/**
 * Three.js mock implementation
 * Shared between setup.js and __mocks__/three.js
 */

import { jest } from '@jest/globals';

// Mock Three.js for testing environment
const mockThree = {};

// Define Color first since it's used by materials
mockThree.Color = jest.fn().mockImplementation((color) => ({
    setHex: jest.fn(function (hex) {
        this._hex = hex;
        return this;
    }),
    set: jest.fn(function (value) {
        if (typeof value === 'number') {
            this._hex = value;
        }
        return this;
    }),
    getHex: jest.fn(function () {
        return this._hex || 0xffffff;
    }),
    getHexString: jest.fn(function () {
        return (this._hex || 0xffffff).toString(16).padStart(6, '0');
    }),
    clone: jest.fn(function () {
        const c = new mockThree.Color();
        c._hex = this._hex;
        return c;
    }),
    _hex: typeof color === 'number' ? color : 0xffffff,
}));

// Now define the rest
Object.assign(mockThree, {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
        setSize: jest.fn(),
        setPixelRatio: jest.fn(),
        setClearColor: jest.fn(),
        render: jest.fn(),
        dispose: jest.fn(),
        domElement: document.createElement('canvas'),
        getSize: jest.fn((target) => {
            target.x = 800;
            target.y = 600;
            return target;
        }),
        getPixelRatio: jest.fn(() => 1),
        shadowMap: { enabled: false },
    })),
    Scene: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        remove: jest.fn(),
        children: [],
        isScene: true,
        type: 'Scene',
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => {
        const position = {
            x: 0,
            y: 0,
            z: 0,
            set: function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            },
            toArray: function () {
                return [this.x, this.y, this.z];
            },
            clone: function () {
                return { x: this.x, y: this.y, z: this.z, toArray: () => [this.x, this.y, this.z] };
            },
        };
        return {
            position,
            rotation: {
                x: 0,
                y: 0,
                z: 0,
            },
            lookAt: jest.fn(),
            updateProjectionMatrix: jest.fn(),
            fov: 75,
            aspect: 1,
            near: 0.1,
            far: 1000,
            isCamera: true,
        };
    }),
    OrthographicCamera: jest.fn().mockImplementation(() => {
        const position = {
            x: 0,
            y: 0,
            z: 0,
            set: function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            },
            toArray: function () {
                return [this.x, this.y, this.z];
            },
            clone: function () {
                return { x: this.x, y: this.y, z: this.z, toArray: () => [this.x, this.y, this.z] };
            },
        };
        return {
            position,
            rotation: {
                x: 0,
                y: 0,
                z: 0,
            },
            lookAt: jest.fn(),
            updateProjectionMatrix: jest.fn(),
            left: -10,
            right: 10,
            top: 10,
            bottom: -10,
            near: 0.1,
            far: 1000,
            isCamera: true,
        };
    }),
    DirectionalLight: jest.fn().mockImplementation(() => {
        const position = {
            x: 0,
            y: 0,
            z: 0,
            set: function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            },
            toArray: function () {
                return [this.x, this.y, this.z];
            },
        };
        const color = new mockThree.Color(0xffffff);
        return {
            position,
            intensity: 1,
            color,
            isLight: true,
            target: {
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                    set: function (x, y, z) {
                        this.x = x;
                        this.y = y;
                        this.z = z;
                    },
                },
            },
            castShadow: false,
            shadow: {
                camera: {
                    left: -10,
                    right: 10,
                    top: 10,
                    bottom: -10,
                    near: 0.1,
                    far: 50,
                },
                mapSize: { width: 1024, height: 1024 },
            },
        };
    }),
    PointLight: jest.fn().mockImplementation(() => {
        const position = {
            x: 0,
            y: 0,
            z: 0,
            set: function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            },
            toArray: function () {
                return [this.x, this.y, this.z];
            },
        };
        const color = new mockThree.Color(0xffffff);
        return {
            position,
            intensity: 1,
            color,
            isLight: true,
        };
    }),
    AmbientLight: jest.fn().mockImplementation(() => {
        const color = new mockThree.Color(0xffffff);
        return {
            intensity: 0.4,
            color,
            isLight: true,
        };
    }),
    BoxGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isBufferGeometry: true,
    })),
    SphereGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isBufferGeometry: true,
    })),
    PlaneGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isBufferGeometry: true,
    })),
    CylinderGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isBufferGeometry: true,
    })),
    ConeGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isBufferGeometry: true,
    })),
    BufferGeometry: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isBufferGeometry: true,
    })),
    MeshStandardMaterial: jest.fn().mockImplementation((params = {}) => {
        const colorHex = params.color !== undefined ? params.color : 0xffffff;
        // Create a proper color object using the Color constructor
        const colorObj = new mockThree.Color(colorHex);
        const mat = {
            dispose: jest.fn(),
            clone: jest.fn().mockReturnThis(),
            color: colorObj,
            opacity: params.opacity !== undefined ? params.opacity : 1,
            transparent: params.transparent !== undefined ? params.transparent : false,
            isMaterial: true,
        };
        return mat;
    }),
    MeshBasicMaterial: jest.fn().mockImplementation((params = {}) => {
        const colorHex = params.color !== undefined ? params.color : 0xffffff;
        // Create a proper color object using the Color constructor
        const colorObj = new mockThree.Color(colorHex);
        const mat = {
            dispose: jest.fn(),
            clone: jest.fn().mockReturnThis(),
            color: colorObj,
            opacity: params.opacity !== undefined ? params.opacity : 1,
            transparent: params.transparent !== undefined ? params.transparent : false,
            isMaterial: true,
        };
        return mat;
    }),
    MeshPhongMaterial: jest.fn().mockImplementation((params = {}) => {
        const colorHex = params.color !== undefined ? params.color : 0xffffff;
        // Create a proper color object using the Color constructor
        const colorObj = new mockThree.Color(colorHex);
        const mat = {
            dispose: jest.fn(),
            clone: jest.fn().mockReturnThis(),
            color: colorObj,
            opacity: params.opacity !== undefined ? params.opacity : 1,
            transparent: params.transparent !== undefined ? params.transparent : false,
            isMaterial: true,
        };
        return mat;
    }),
    Material: jest.fn().mockImplementation(() => ({
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        isMaterial: true,
    })),
    Mesh: jest.fn().mockImplementation((geometry, material) => ({
        position: {
            set: jest.fn(function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }),
            copy: jest.fn(function (v) {
                this.x = v.x;
                this.y = v.y;
                this.z = v.z;
            }),
            clone: jest.fn(function () {
                return { x: this.x, y: this.y, z: this.z, toArray: () => [this.x, this.y, this.z] };
            }),
            toArray: jest.fn(function () {
                return [this.x, this.y, this.z];
            }),
            x: 0,
            y: 0,
            z: 0,
        },
        rotation: {
            set: jest.fn(function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }),
            copy: jest.fn(function (e) {
                this.x = e.x;
                this.y = e.y;
                this.z = e.z;
            }),
            clone: jest.fn(function () {
                return { x: this.x, y: this.y, z: this.z };
            }),
            x: 0,
            y: 0,
            z: 0,
        },
        scale: {
            set: jest.fn(function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }),
            copy: jest.fn(function (v) {
                this.x = v.x;
                this.y = v.y;
                this.z = v.z;
            }),
            clone: jest.fn(function () {
                return { x: this.x, y: this.y, z: this.z, toArray: () => [this.x, this.y, this.z] };
            }),
            toArray: jest.fn(function () {
                return [this.x, this.y, this.z];
            }),
            x: 1,
            y: 1,
            z: 1,
        },
        visible: true,
        dispose: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        geometry: geometry || null,
        material: material || null,
        userData: {},
        uuid: Math.random().toString(36).substring(7),
        isMesh: true,
        isObject3D: true,
    })),
    Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
        x,
        y,
        z,
        set: jest.fn(function (nx, ny, nz) {
            this.x = nx;
            this.y = ny;
            this.z = nz;
            return this;
        }),
        copy: jest.fn(function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }),
        clone: jest.fn(function () {
            return new mockThree.Vector3(this.x, this.y, this.z);
        }),
        toArray: jest.fn(function () {
            return [this.x, this.y, this.z];
        }),
    })),
    Vector2: jest.fn().mockImplementation((x = 0, y = 0) => ({
        x,
        y,
        set: jest.fn(function (nx, ny) {
            this.x = nx;
            this.y = ny;
            return this;
        }),
        copy: jest.fn(function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        }),
        subVectors: jest.fn(function (a, b) {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            return this;
        }),
    })),
    Euler: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
        x,
        y,
        z,
        set: jest.fn(function (nx, ny, nz) {
            this.x = nx;
            this.y = ny;
            this.z = nz;
            return this;
        }),
        copy: jest.fn(function (e) {
            this.x = e.x;
            this.y = e.y;
            this.z = e.z;
            return this;
        }),
        clone: jest.fn(function () {
            return new mockThree.Euler(this.x, this.y, this.z);
        }),
    })),
});

// Export as default and named exports
export default mockThree;
export const {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    OrthographicCamera,
    DirectionalLight,
    PointLight,
    AmbientLight,
    BoxGeometry,
    SphereGeometry,
    PlaneGeometry,
    CylinderGeometry,
    ConeGeometry,
    BufferGeometry,
    MeshStandardMaterial,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Material,
    Mesh,
    Vector3,
    Vector2,
    Euler,
    Color,
} = mockThree;
