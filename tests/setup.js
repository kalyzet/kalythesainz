/**
 * Test setup for KALYTHESAINZ framework
 * Configures Jest environment for ESM and Three.js testing
 */

// Mock Three.js for testing environment
const mockThree = {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
        setSize: jest.fn(),
        render: jest.fn(),
        dispose: jest.fn(),
        domElement: document.createElement('canvas'),
    })),
    Scene: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        remove: jest.fn(),
        children: [],
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
        position: { set: jest.fn() },
        lookAt: jest.fn(),
    })),
    DirectionalLight: jest.fn().mockImplementation(() => ({
        position: { set: jest.fn() },
        intensity: 1,
        color: { setHex: jest.fn() },
    })),
    AmbientLight: jest.fn().mockImplementation(() => ({
        intensity: 0.4,
        color: { setHex: jest.fn() },
    })),
    BoxGeometry: jest.fn(),
    SphereGeometry: jest.fn(),
    PlaneGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
        position: { set: jest.fn(), x: 0, y: 0, z: 0 },
        rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
        scale: { set: jest.fn(), x: 1, y: 1, z: 1 },
        dispose: jest.fn(),
    })),
    Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z })),
    Color: jest.fn().mockImplementation(() => ({ setHex: jest.fn() })),
};

// Make Three.js available globally for tests
global.THREE = mockThree;

// Mock DOM elements
Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn((cb) => setTimeout(cb, 16)),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
    value: jest.fn(),
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
}));

// Setup console for better test output
const originalError = console.error;
console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('Warning: ReactDOM.render')) {
        return;
    }
    originalError.call(console, ...args);
};
