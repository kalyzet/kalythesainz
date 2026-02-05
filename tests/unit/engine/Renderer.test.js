/**
 * Unit tests for Renderer class
 */

import { Renderer } from '../../../engine/Renderer.js';
import { Config } from '../../../core/Config.js';
import { EventBus } from '../../../core/EventBus.js';

// Mock Three.js
global.THREE = {
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
    Vector2: class {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    },
    PCFSoftShadowMap: 'PCFSoftShadowMap',
};

// Mock DOM
global.document = {
    getElementById: (id) => {
        if (id === 'test-container') {
            return {
                clientWidth: 800,
                clientHeight: 600,
                appendChild: jest.fn(),
                removeChild: jest.fn(),
                contains: jest.fn(() => true),
                getBoundingClientRect: () => ({ width: 800, height: 600 }),
            };
        }
        return null;
    },
    createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn(),
    }),
};

global.window = {
    devicePixelRatio: 2,
    ResizeObserver: class {
        constructor(callback) {
            this.callback = callback;
        }
        observe() {}
        disconnect() {}
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

describe('Renderer', () => {
    beforeEach(() => {
        // Reset Config and EventBus
        Config.reset();
        EventBus.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        EventBus.clear();
    });

    describe('constructor', () => {
        test('should create renderer with default configuration', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            expect(renderer).toBeDefined();
            expect(renderer.threeRenderer).toBeDefined();
            expect(renderer.canvas).toBeDefined();
            expect(renderer.container).toBeDefined();
            expect(renderer.isDisposed).toBe(false);

            renderer.dispose();
        });

        test('should create renderer with custom configuration', () => {
            const config = {
                containerId: 'test-container',
                width: 1024,
                height: 768,
                renderer: {
                    antialias: false,
                    alpha: true,
                },
            };

            const renderer = new Renderer(config);

            expect(renderer.threeRenderer.width).toBe(1024);
            expect(renderer.threeRenderer.height).toBe(768);
            expect(renderer.threeRenderer.config.antialias).toBe(false);
            expect(renderer.threeRenderer.config.alpha).toBe(true);

            renderer.dispose();
        });

        test('should throw error if container not found', () => {
            expect(() => {
                new Renderer({ containerId: 'non-existent' });
            }).toThrow("Container element with ID 'non-existent' not found");
        });

        test('should throw error with invalid configuration', () => {
            expect(() => {
                new Renderer({ containerId: 123 });
            }).toThrow('containerId must be a string');

            expect(() => {
                new Renderer({ width: -100 });
            }).toThrow('width must be a positive number');
        });
    });

    describe('setSize', () => {
        test('should set renderer size correctly', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            renderer.setSize(1920, 1080);

            expect(renderer.threeRenderer.width).toBe(1920);
            expect(renderer.threeRenderer.height).toBe(1080);
            expect(renderer.size.width).toBe(1920);
            expect(renderer.size.height).toBe(1080);

            renderer.dispose();
        });

        test('should throw error with invalid dimensions', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            expect(() => renderer.setSize('invalid', 600)).toThrow(
                'Width and height must be numbers',
            );
            expect(() => renderer.setSize(-100, 600)).toThrow(
                'Width and height must be positive numbers',
            );

            renderer.dispose();
        });

        test('should throw error if renderer is disposed', () => {
            const renderer = new Renderer({ containerId: 'test-container' });
            renderer.dispose();

            expect(() => renderer.setSize(800, 600)).toThrow(
                'Cannot set size on disposed renderer',
            );
        });
    });

    describe('render', () => {
        test('should render scene with camera', () => {
            const renderer = new Renderer({ containerId: 'test-container' });
            const mockScene = { isScene: true };
            const mockCamera = { isCamera: true };

            renderer.render(mockScene, mockCamera);

            expect(renderer.threeRenderer.lastRender.scene).toBe(mockScene);
            expect(renderer.threeRenderer.lastRender.camera).toBe(mockCamera);

            renderer.dispose();
        });

        test('should throw error with invalid parameters', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            expect(() => renderer.render(null, { isCamera: true })).toThrow(
                'First parameter must be a Three.js Scene',
            );
            expect(() => renderer.render({ isScene: true }, null)).toThrow(
                'Second parameter must be a Three.js Camera',
            );

            renderer.dispose();
        });

        test('should throw error if renderer is disposed', () => {
            const renderer = new Renderer({ containerId: 'test-container' });
            renderer.dispose();

            expect(() => renderer.render({ isScene: true }, { isCamera: true })).toThrow(
                'Cannot render with disposed renderer',
            );
        });
    });

    describe('setPixelRatio', () => {
        test('should set pixel ratio', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            renderer.setPixelRatio(1.5);

            expect(renderer.threeRenderer.pixelRatio).toBe(1.5);

            renderer.dispose();
        });

        test('should use device pixel ratio by default', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            renderer.setPixelRatio();

            expect(renderer.threeRenderer.pixelRatio).toBe(2); // Mocked devicePixelRatio

            renderer.dispose();
        });
    });

    describe('setClearColor', () => {
        test('should set clear color', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            renderer.setClearColor(0xff0000, 0.5);

            expect(renderer.threeRenderer.clearColor).toBe(0xff0000);
            expect(renderer.threeRenderer.clearAlpha).toBe(0.5);

            renderer.dispose();
        });
    });

    describe('dispose', () => {
        test('should dispose renderer and clean up resources', () => {
            const renderer = new Renderer({ containerId: 'test-container' });
            const container = renderer.container;
            const canvas = renderer.canvas;

            renderer.dispose();

            expect(renderer.isDisposed).toBe(true);
            expect(renderer.threeRenderer).toBe(null);
            expect(container.removeChild).toHaveBeenCalledWith(canvas);
        });

        test('should not throw error if disposed multiple times', () => {
            const renderer = new Renderer({ containerId: 'test-container' });

            renderer.dispose();
            expect(() => renderer.dispose()).not.toThrow();
        });
    });

    describe('events', () => {
        test('should emit renderer created event', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('renderer:created', eventSpy);

            const renderer = new Renderer({ containerId: 'test-container' });

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        renderer: renderer,
                    }),
                }),
            );

            renderer.dispose();
        });

        test('should emit resize event when size changes', () => {
            const eventSpy = jest.fn();
            EventBus.subscribe('renderer:resized', eventSpy);

            const renderer = new Renderer({ containerId: 'test-container' });
            renderer.setSize(1024, 768);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        width: 1024,
                        height: 768,
                    }),
                }),
            );

            renderer.dispose();
        });
    });
});
