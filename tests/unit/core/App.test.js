/**
 * Unit tests for App class
 * Tests application lifecycle management, singleton pattern, and event delegation
 */

import { App } from '../../../core/App.js';
import { Config } from '../../../core/Config.js';
import { EventBus } from '../../../core/EventBus.js';

// Mock DOM elements
const mockContainer = document.createElement('div');
mockContainer.id = 'test-container';
document.body.appendChild(mockContainer);

describe('App', () => {
    beforeEach(() => {
        // Clean up before each test
        if (App.isInitialized()) {
            App.destroy();
        }
        EventBus.clear();
        Config.reset();
    });

    afterEach(() => {
        // Clean up after each test
        if (App.isInitialized()) {
            App.destroy();
        }
    });

    describe('Initialization', () => {
        test('should initialize with default configuration', () => {
            const app = App.init();

            expect(App.isInitialized()).toBe(true);
            expect(App.getInstance()).toBe(app);

            const config = App.getConfig();
            expect(config.containerId).toBe('kalythesainz-container');
            expect(config.autoStart).toBe(true);
            expect(config.debug).toBe(false);
        });

        test('should initialize with custom configuration', () => {
            const customConfig = {
                containerId: 'custom-container',
                autoStart: false,
                debug: true,
                renderer: { antialias: false },
            };

            App.init(customConfig);

            const config = App.getConfig();
            expect(config.containerId).toBe('custom-container');
            expect(config.autoStart).toBe(false);
            expect(config.debug).toBe(true);

            // Should merge with Config
            expect(Config.get('renderer.antialias')).toBe(false);
        });

        test('should throw error when already initialized', () => {
            App.init();

            expect(() => App.init()).toThrow('App is already initialized');
        });

        test('should emit initialization event', (done) => {
            EventBus.subscribe('app:initialized', (event) => {
                expect(event.data).toHaveProperty('config');
                expect(event.data).toHaveProperty('timestamp');
                done();
            });

            App.init();
        });
    });

    describe('Singleton Pattern', () => {
        test('should return same instance', () => {
            const app1 = App.init();
            const app2 = App.getInstance();

            expect(app1).toBe(app2);
        });

        test('should return null when not initialized', () => {
            expect(App.getInstance()).toBe(null);
        });

        test('should check initialization status', () => {
            expect(App.isInitialized()).toBe(false);

            App.init();
            expect(App.isInitialized()).toBe(true);

            App.destroy();
            expect(App.isInitialized()).toBe(false);
        });
    });

    describe('Configuration Management', () => {
        beforeEach(() => {
            App.init({ containerId: 'test-container', debug: true });
        });

        test('should get app configuration', () => {
            const config = App.getConfig();

            expect(config.containerId).toBe('test-container');
            expect(config.debug).toBe(true);
            expect(config).toHaveProperty('version');
        });

        test('should get app runtime information', () => {
            const info = App.getInfo();

            expect(info).toHaveProperty('version');
            expect(info).toHaveProperty('initialized');
            expect(info).toHaveProperty('destroyed');
            expect(info).toHaveProperty('startTime');
            expect(info).toHaveProperty('uptime');
            expect(info.initialized).toBe(true);
            expect(info.destroyed).toBe(false);
        });

        test('should throw error when getting config before initialization', () => {
            App.destroy();

            expect(() => App.getConfig()).toThrow('App not initialized');
            expect(() => App.getInfo()).toThrow('App not initialized');
        });
    });

    describe('Event Delegation', () => {
        beforeEach(() => {
            App.init();
        });

        test('should subscribe to events', () => {
            const callback = jest.fn();
            const unsubscribe = App.on('test-event', callback);

            expect(typeof unsubscribe).toBe('function');
            App.emit('test-event', 'test-data');

            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should unsubscribe from events', () => {
            const callback = jest.fn();
            App.on('test-event', callback);

            const result = App.off('test-event', callback);
            expect(result).toBe(true);

            App.emit('test-event', 'test-data');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should emit events', () => {
            const callback = jest.fn();
            App.on('test-event', callback);

            const result = App.emit('test-event', 'test-data');

            expect(result.executed).toBe(1);
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'test-event',
                    data: 'test-data',
                }),
            );
        });

        test('should throw error when using events before initialization', () => {
            App.destroy();

            expect(() => App.on('test', jest.fn())).toThrow('App not initialized');
            expect(() => App.off('test', jest.fn())).toThrow('App not initialized');
            expect(() => App.emit('test', 'data')).toThrow('App not initialized');
        });
    });

    describe('Lifecycle Management', () => {
        test('should start application successfully', async () => {
            App.init({ containerId: 'test-container' });

            const startingCallback = jest.fn();
            const startedCallback = jest.fn();

            App.on('app:starting', startingCallback);
            App.on('app:started', startedCallback);

            await App.start();

            expect(startingCallback).toHaveBeenCalledTimes(1);
            expect(startedCallback).toHaveBeenCalledTimes(1);
        });

        test('should throw error when starting with invalid container', async () => {
            App.init({ containerId: 'non-existent-container' });

            await expect(App.start()).rejects.toThrow(
                "Container element with ID 'non-existent-container' not found",
            );
        });

        test('should stop application', async () => {
            App.init({ containerId: 'test-container' });
            await App.start();

            const stoppingCallback = jest.fn();
            const stoppedCallback = jest.fn();

            App.on('app:stopping', stoppingCallback);
            App.on('app:stopped', stoppedCallback);

            await App.stop();

            expect(stoppingCallback).toHaveBeenCalledTimes(1);
            expect(stoppedCallback).toHaveBeenCalledTimes(1);
        });

        test('should destroy application and clean up resources', async () => {
            App.init({ containerId: 'test-container' });
            await App.start();

            const destroyingCallback = jest.fn();
            App.on('app:destroying', destroyingCallback);

            await App.destroy();

            expect(destroyingCallback).toHaveBeenCalledTimes(1);
            expect(App.isInitialized()).toBe(false);
            expect(App.getInstance()).toBe(null);
        });

        test('should restart application', async () => {
            App.init({ containerId: 'test-container', debug: true });

            const newApp = await App.restart({ containerId: 'test-container', debug: false });

            expect(newApp).toBe(App);
            expect(App.isInitialized()).toBe(true);
            expect(App.getConfig().debug).toBe(false);
        });

        test('should handle lifecycle errors', async () => {
            App.init({ containerId: 'non-existent' });

            const errorCallback = jest.fn();
            App.on('app:error', errorCallback);

            await expect(App.start()).rejects.toThrow();
            expect(errorCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        type: 'start_error',
                    }),
                }),
            );
        });
    });

    describe('Configuration Validation', () => {
        test('should validate configuration object', () => {
            expect(() => App.init('not-object')).toThrow('Configuration must be an object');
        });

        test('should validate containerId', () => {
            expect(() => App.init({ containerId: 123 })).toThrow('containerId must be a string');
        });

        test('should validate autoStart', () => {
            expect(() => App.init({ autoStart: 'not-boolean' })).toThrow(
                'autoStart must be a boolean',
            );
        });

        test('should validate debug', () => {
            expect(() => App.init({ debug: 'not-boolean' })).toThrow('debug must be a boolean');
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            App.init({ debug: true });
        });

        test('should handle uncaught errors', (done) => {
            App.on('app:error', (event) => {
                expect(event.data.type).toBe('uncaught_error');
                done();
            });

            // Simulate uncaught error
            const errorEvent = new ErrorEvent('error', {
                error: new Error('Test uncaught error'),
                message: 'Test uncaught error',
            });
            window.dispatchEvent(errorEvent);
        });

        test('should handle unhandled promise rejections', (done) => {
            App.on('app:error', (event) => {
                expect(event.data.type).toBe('unhandled_rejection');
                done();
            });

            // Simulate unhandled rejection
            const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
                reason: new Error('Test rejection'),
            });
            window.dispatchEvent(rejectionEvent);
        });
    });

    describe('Edge Cases', () => {
        test('should handle multiple destroy calls', async () => {
            App.init();

            await App.destroy();
            await App.destroy(); // Should not throw

            expect(App.isInitialized()).toBe(false);
        });

        test('should handle stop before start', async () => {
            App.init();

            await App.stop(); // Should not throw

            expect(App.isInitialized()).toBe(true);
        });

        test('should allow reinitialization after destroy', () => {
            App.init({ debug: true });
            App.destroy();

            const newApp = App.init({ debug: false });

            expect(App.isInitialized()).toBe(true);
            expect(App.getConfig().debug).toBe(false);
        });
    });
});
