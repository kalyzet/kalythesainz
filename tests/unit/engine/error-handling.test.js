/**
 * Error Handling Tests for Instance-Based API
 * Tests Requirements: 2.1.6, 5.5, 7.5
 */

import { createScene } from '../../../index.js';
import { Box } from '../../../objects/Box.js';
import { Sphere } from '../../../objects/Sphere.js';
import { Plane } from '../../../objects/Plane.js';
import { Light } from '../../../engine/Light.js';

describe('Error Handling Tests', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Invalid Container ID (Requirement 2.1.6)', () => {
        test('should throw error for null container ID', () => {
            expect(() => createScene(null)).toThrow('containerId must be a non-empty string');
        });

        test('should throw error for undefined container ID', () => {
            expect(() => createScene(undefined)).toThrow('containerId must be a non-empty string');
        });

        test('should throw error for empty string container ID', () => {
            expect(() => createScene('')).toThrow('containerId must be a non-empty string');
        });

        test('should throw error for non-string container ID', () => {
            expect(() => createScene(123)).toThrow('containerId must be a non-empty string');
        });

        test('should throw error for non-existent container ID', () => {
            expect(() => createScene('non-existent')).toThrow(
                "Container element with ID 'non-existent' not found in DOM",
            );
        });
    });

    describe('Invalid Configuration (Requirement 7.5)', () => {
        test('should throw error for non-object configuration', () => {
            expect(() => createScene('test-container', 'invalid')).toThrow(
                'Configuration must be an object',
            );
        });

        test('should throw error for invalid autoStart type', () => {
            expect(() => createScene('test-container', { autoStart: 'yes' })).toThrow(
                'config.autoStart must be a boolean',
            );
        });

        test('should throw error for invalid renderer config type', () => {
            expect(() => createScene('test-container', { renderer: 'invalid' })).toThrow(
                'config.renderer must be an object',
            );
        });

        test('should throw error for invalid camera.type', () => {
            expect(() => createScene('test-container', { camera: { type: 'fisheye' } })).toThrow(
                'config.camera.type must be one of: perspective, orthographic',
            );
        });

        test('should throw error for invalid lights config type', () => {
            expect(() => createScene('test-container', { lights: 'invalid' })).toThrow(
                'config.lights must be an object or false',
            );
        });
    });

    describe('Accessing Disposed Scene (Requirement 5.5)', () => {
        let scene;

        beforeEach(() => {
            scene = createScene('test-container', { autoStart: false });
        });

        test('should throw error when creating box in disposed scene', () => {
            scene.destroy();
            expect(() => scene.createBox(1, 1, 1)).toThrow('Cannot create box in disposed scene');
        });

        test('should throw error when creating sphere in disposed scene', () => {
            scene.destroy();
            expect(() => scene.createSphere(1, 32)).toThrow(
                'Cannot create sphere in disposed scene',
            );
        });

        test('should throw error when creating plane in disposed scene', () => {
            scene.destroy();
            expect(() => scene.createPlane(1, 1)).toThrow('Cannot create plane in disposed scene');
        });

        test('should throw error when adding object to disposed scene', () => {
            const box = Box.create(1, 1, 1);
            scene.destroy();
            expect(() => scene.add(box)).toThrow('Cannot add object to disposed scene');
        });

        test('should throw error when removing object from disposed scene', () => {
            scene.destroy();
            expect(() => scene.remove('some-id')).toThrow(
                'Cannot remove object from disposed scene',
            );
        });

        test('should throw error when adding light to disposed scene', () => {
            scene.destroy();
            expect(() => scene.addLight('sun')).toThrow('Cannot add light to disposed scene');
        });

        test('should throw error when starting render loop on disposed scene', () => {
            scene.destroy();
            expect(() => scene.startRenderLoop()).toThrow(
                'Cannot start render loop on disposed scene',
            );
        });

        test('should throw error when rendering disposed scene', () => {
            scene.destroy();
            expect(() => scene.render()).toThrow('Cannot render disposed scene');
        });

        test('should throw error when subscribing to events on disposed scene', () => {
            scene.destroy();
            expect(() => scene.on('test', () => {})).toThrow(
                'Cannot subscribe to events on disposed scene',
            );
        });
    });

    describe('Invalid Scene Parameter (Requirement 2.1.6)', () => {
        test('should throw error when Box.create receives invalid scene parameter', () => {
            expect(() => Box.create(1, 1, 1, null, { invalid: 'scene' })).toThrow(
                'Scene parameter must be a valid SceneInstance or Scene with an add() method',
            );
        });

        test('should throw error when Sphere.create receives invalid scene parameter', () => {
            expect(() => Sphere.create(1, 32, null, { invalid: 'scene' })).toThrow(
                'Scene parameter must be a valid SceneInstance or Scene with an add() method',
            );
        });

        test('should throw error when Plane.create receives invalid scene parameter', () => {
            expect(() => Plane.create(1, 1, null, { invalid: 'scene' })).toThrow(
                'Scene parameter must be a valid SceneInstance or Scene with an add() method',
            );
        });
    });

    describe('Descriptive Error Messages', () => {
        test('should provide descriptive error for missing container', () => {
            try {
                createScene('missing-container');
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toContain('missing-container');
                expect(error.message).toContain('not found');
            }
        });

        test('should provide descriptive error for disposed scene access', () => {
            const scene = createScene('test-container', { autoStart: false });
            scene.destroy();

            try {
                scene.createBox();
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toContain('disposed');
                expect(error.message).toContain('box');
            }
        });
    });
});
