/**
 * Unit tests for Config class
 * Tests configuration management, validation, and merging functionality
 */

import { Config } from '../../../core/Config.js';

describe('Config', () => {
    beforeEach(() => {
        // Reset config before each test
        Config.reset();
    });

    afterEach(() => {
        // Clean up after each test
        Config.reset();
    });

    describe('Initialization', () => {
        test('should initialize with default values', () => {
            Config.init();

            expect(Config.get('renderer.antialias')).toBe(true);
            expect(Config.get('camera.fov')).toBe(75);
            expect(Config.get('scene.background')).toBe(0x222222);
        });

        test('should return same instance on multiple init calls', () => {
            const instance1 = Config.init();
            const instance2 = Config.init();

            expect(instance1).toBe(instance2);
        });
    });

    describe('Get/Set Operations', () => {
        beforeEach(() => {
            Config.init();
        });

        test('should get values by dot notation', () => {
            expect(Config.get('renderer.antialias')).toBe(true);
            expect(Config.get('camera.fov')).toBe(75);
        });

        test('should return undefined for non-existent keys', () => {
            expect(Config.get('nonexistent.key')).toBeUndefined();
        });

        test('should return full config when no key provided', () => {
            const fullConfig = Config.get();
            expect(fullConfig).toHaveProperty('renderer');
            expect(fullConfig).toHaveProperty('camera');
            expect(fullConfig).toHaveProperty('scene');
        });

        test('should set values by dot notation', () => {
            Config.set('renderer.antialias', false);
            expect(Config.get('renderer.antialias')).toBe(false);
        });

        test('should create nested objects when setting deep keys', () => {
            Config.set('new.nested.key', 'value');
            expect(Config.get('new.nested.key')).toBe('value');
        });

        test('should throw error for invalid key', () => {
            expect(() => Config.set('', 'value')).toThrow('Config key must be a non-empty string');
            expect(() => Config.set(null, 'value')).toThrow(
                'Config key must be a non-empty string',
            );
        });
    });

    describe('Validation', () => {
        beforeEach(() => {
            Config.init();
        });

        test('should validate FOV values', () => {
            expect(() => Config.set('camera.fov', 0)).toThrow('FOV must be between 0 and 180');
            expect(() => Config.set('camera.fov', 180)).toThrow('FOV must be between 0 and 180');
            expect(() => Config.set('camera.fov', 90)).not.toThrow();
        });

        test('should validate near values', () => {
            expect(() => Config.set('camera.near', 0)).toThrow('near value must be positive');
            expect(() => Config.set('camera.near', -1)).toThrow('near value must be positive');
            expect(() => Config.set('camera.near', 0.1)).not.toThrow();
        });

        test('should validate far values', () => {
            expect(() => Config.set('camera.far', 0)).toThrow('far value must be positive');
            expect(() => Config.set('camera.far', -1)).toThrow('far value must be positive');
            expect(() => Config.set('camera.far', 1000)).not.toThrow();
        });

        test('should validate targetFPS values', () => {
            expect(() => Config.set('performance.targetFPS', 0)).toThrow(
                'targetFPS must be between 1 and 240',
            );
            expect(() => Config.set('performance.targetFPS', 300)).toThrow(
                'targetFPS must be between 1 and 240',
            );
            expect(() => Config.set('performance.targetFPS', 60)).not.toThrow();
        });

        test('should validate type consistency', () => {
            expect(() => Config.set('renderer.antialias', 'not-boolean')).toThrow(
                'expected boolean, got string',
            );
            expect(() => Config.set('camera.fov', 'not-number')).toThrow(
                'expected number, got string',
            );
        });
    });

    describe('Merge Operations', () => {
        beforeEach(() => {
            Config.init();
        });

        test('should merge configuration objects', () => {
            const newConfig = {
                renderer: { antialias: false },
                camera: { fov: 90 },
            };

            Config.merge(newConfig);

            expect(Config.get('renderer.antialias')).toBe(false);
            expect(Config.get('camera.fov')).toBe(90);
            expect(Config.get('camera.near')).toBe(0.1); // Should preserve existing values
        });

        test('should deep merge nested objects', () => {
            const newConfig = {
                renderer: { powerPreference: 'low-power' },
            };

            Config.merge(newConfig);

            expect(Config.get('renderer.powerPreference')).toBe('low-power');
            expect(Config.get('renderer.antialias')).toBe(true); // Should preserve existing
        });

        test('should throw error for invalid merge input', () => {
            expect(() => Config.merge(null)).toThrow('Config must be an object');
            expect(() => Config.merge('not-object')).toThrow('Config must be an object');
        });
    });

    describe('Utility Methods', () => {
        beforeEach(() => {
            Config.init();
        });

        test('should check if key exists', () => {
            expect(Config.has('renderer.antialias')).toBe(true);
            expect(Config.has('nonexistent.key')).toBe(false);
        });

        test('should get all configuration keys', () => {
            const keys = Config.getKeys();
            expect(keys).toContain('renderer.antialias');
            expect(keys).toContain('camera.fov');
            expect(keys).toContain('scene.background');
        });

        test('should reset to defaults', () => {
            Config.set('renderer.antialias', false);
            Config.reset();
            expect(Config.get('renderer.antialias')).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        test('should handle operations before initialization', () => {
            // Config should auto-initialize
            expect(Config.get('renderer.antialias')).toBe(true);
        });

        test('should handle null and undefined values', () => {
            Config.init();
            Config.set('test.null', null);
            Config.set('test.undefined', undefined);

            expect(Config.get('test.null')).toBe(null);
            expect(Config.get('test.undefined')).toBe(undefined);
        });

        test('should handle array values', () => {
            Config.init();
            const testArray = [1, 2, 3];
            Config.set('test.array', testArray);

            const retrieved = Config.get('test.array');
            expect(retrieved).toEqual(testArray);
            expect(retrieved).not.toBe(testArray); // Should be a copy
        });

        test('should handle date values', () => {
            Config.init();
            const testDate = new Date();
            Config.set('test.date', testDate);

            const retrieved = Config.get('test.date');
            expect(retrieved).toEqual(testDate);
            expect(retrieved).not.toBe(testDate); // Should be a copy
        });
    });
});
