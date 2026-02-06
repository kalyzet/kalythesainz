/**
 * Unit tests for Inspector class
 * Tests property editing interface, real-time updates, and validation
 * Requirements: 4.2, 4.3
 */

import { Inspector } from '../../../tools/Inspector.js';
import { Scene } from '../../../engine/Scene.js';
import { Box } from '../../../objects/Box.js';
import { EventBus } from '../../../core/EventBus.js';

describe('Inspector', () => {
    let container;
    let scene;

    beforeEach(() => {
        // Clear EventBus
        EventBus.clear();

        // Create container element
        container = document.createElement('div');
        container.id = 'inspector-container';
        document.body.appendChild(container);

        // Initialize scene
        const sceneContainer = document.createElement('div');
        sceneContainer.id = 'scene-container';
        document.body.appendChild(sceneContainer);

        scene = Scene.init('scene-container');
    });

    afterEach(() => {
        // Clean up
        if (scene) {
            Scene.destroy();
        }
        EventBus.clear();

        // Remove containers
        const containers = document.querySelectorAll('#inspector-container, #scene-container');
        containers.forEach((c) => c.remove());
    });

    describe('Initialization', () => {
        test('should create Inspector with valid container', () => {
            const inspector = new Inspector('inspector-container');

            expect(inspector).toBeDefined();
            expect(inspector.container).toBe(container);
            expect(inspector.isDisposed).toBe(false);
        });

        test('should throw error for invalid container ID', () => {
            expect(() => new Inspector('')).toThrow('Container ID must be a non-empty string');
            expect(() => new Inspector(null)).toThrow('Container ID must be a non-empty string');
        });

        test('should throw error for non-existent container', () => {
            expect(() => new Inspector('non-existent')).toThrow(
                "Container element with ID 'non-existent' not found",
            );
        });

        test('should initialize UI structure', () => {
            new Inspector('inspector-container');

            expect(container.querySelector('.inspector')).toBeTruthy();
            expect(container.querySelector('.inspector-header')).toBeTruthy();
            expect(container.querySelector('.inspector-empty')).toBeTruthy();
            expect(container.querySelector('.inspector-content')).toBeTruthy();
        });

        test('should show empty state by default', () => {
            new Inspector('inspector-container');

            const emptyState = container.querySelector('.inspector-empty');
            const content = container.querySelector('.inspector-content');

            expect(emptyState.style.display).not.toBe('none');
            expect(content.style.display).toBe('none');
        });
    });

    describe('Show and Hide', () => {
        let inspector;

        beforeEach(() => {
            inspector = new Inspector('inspector-container');
        });

        test('should show inspector for valid object', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Test Box';
            scene.add(box);

            inspector.show(box);

            expect(inspector.currentObject).toBe(box);

            const emptyState = container.querySelector('.inspector-empty');
            const content = container.querySelector('.inspector-content');

            expect(emptyState.style.display).toBe('none');
            expect(content.style.display).toBe('block');
        });

        test('should hide inspector when show called with null', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);
            expect(inspector.currentObject).toBe(box);

            inspector.show(null);
            expect(inspector.currentObject).toBeNull();
        });

        test('should hide inspector', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);
            inspector.hide();

            expect(inspector.currentObject).toBeNull();

            const emptyState = container.querySelector('.inspector-empty');
            const content = container.querySelector('.inspector-content');

            expect(emptyState.style.display).toBe('block');
            expect(content.style.display).toBe('none');
        });

        test('should throw error when showing on disposed inspector', () => {
            inspector.dispose();
            const box = Box.create(1, 1, 1);

            expect(() => inspector.show(box)).toThrow('Cannot show object in disposed Inspector');
        });

        test('should throw error when hiding disposed inspector', () => {
            inspector.dispose();

            expect(() => inspector.hide()).toThrow('Cannot hide disposed Inspector');
        });
    });

    describe('Property Display', () => {
        let inspector;

        beforeEach(() => {
            inspector = new Inspector('inspector-container');
        });

        test('should display object metadata', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Test Box';
            scene.add(box);

            inspector.show(box);

            const nameInput = container.querySelector('#prop-name');
            const visibleInput = container.querySelector('#prop-visible');

            expect(nameInput).toBeTruthy();
            expect(nameInput.value).toBe('Test Box');
            expect(visibleInput).toBeTruthy();
            expect(visibleInput.checked).toBe(true);
        });

        test('should display transform properties', () => {
            const box = Box.create(1, 1, 1);
            box.position = [1, 2, 3];
            scene.add(box);

            inspector.show(box);

            const posX = container.querySelector('#prop-pos-x');
            const posY = container.querySelector('#prop-pos-y');
            const posZ = container.querySelector('#prop-pos-z');

            expect(posX).toBeTruthy();
            expect(parseFloat(posX.value)).toBeCloseTo(1, 1);
            expect(parseFloat(posY.value)).toBeCloseTo(2, 1);
            expect(parseFloat(posZ.value)).toBeCloseTo(3, 1);
        });

        test('should display material properties', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);

            const colorInput = container.querySelector('#prop-color');
            const opacityInput = container.querySelector('#prop-opacity');

            expect(colorInput).toBeTruthy();
            expect(opacityInput).toBeTruthy();
        });
    });

    describe('Property Editing', () => {
        let inspector;

        beforeEach(() => {
            inspector = new Inspector('inspector-container');
        });

        test('should update object name', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Original Name';
            scene.add(box);

            inspector.show(box);

            const nameInput = container.querySelector('#prop-name');
            nameInput.value = 'New Name';
            nameInput.dispatchEvent(new Event('change'));

            expect(box.name).toBe('New Name');
        });

        test('should update object visibility', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);

            const visibleInput = container.querySelector('#prop-visible');
            visibleInput.checked = false;
            visibleInput.dispatchEvent(new Event('change'));

            expect(box.visible).toBe(false);
        });

        test('should update position', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);

            const posX = container.querySelector('#prop-pos-x');
            posX.value = '5';
            posX.dispatchEvent(new Event('change'));

            expect(box.position.x).toBeCloseTo(5, 1);
        });

        test('should update rotation', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);

            const rotY = container.querySelector('#prop-rot-y');
            rotY.value = '90';
            rotY.dispatchEvent(new Event('change'));

            expect(box.rotation.y).toBeCloseTo(Math.PI / 2, 2);
        });

        test('should update scale', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);

            const scaleX = container.querySelector('#prop-scale-x');
            scaleX.value = '2';
            scaleX.dispatchEvent(new Event('change'));

            expect(box.scale.x).toBeCloseTo(2, 1);
        });

        test('should call onPropertyChange callback', () => {
            const callback = jest.fn();
            inspector.onPropertyChange(callback);

            const box = Box.create(1, 1, 1);
            scene.add(box);

            inspector.show(box);

            const nameInput = container.querySelector('#prop-name');
            nameInput.value = 'New Name';
            nameInput.dispatchEvent(new Event('change'));

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback.mock.calls[0][0].object).toBe(box);
            expect(callback.mock.calls[0][0].property).toBe('name');
            expect(callback.mock.calls[0][0].value).toBe('New Name');
        });

        test('should emit propertyChanged event', (done) => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            EventBus.subscribe('inspector:propertyChanged', (event) => {
                expect(event.data.object).toBe(box);
                expect(event.data.property).toBe('name');
                expect(event.data.value).toBe('New Name');
                done();
            });

            inspector.show(box);

            const nameInput = container.querySelector('#prop-name');
            nameInput.value = 'New Name';
            nameInput.dispatchEvent(new Event('change'));
        });

        test('should throw error for invalid callback', () => {
            expect(() => inspector.onPropertyChange('not-function')).toThrow(
                'Callback must be a function',
            );
        });
    });

    describe('Refresh', () => {
        let inspector;

        beforeEach(() => {
            inspector = new Inspector('inspector-container');
        });

        test('should refresh property display', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Original Name';
            scene.add(box);

            inspector.show(box);

            // Change object externally
            box.name = 'Changed Name';

            inspector.refresh();

            const nameInput = container.querySelector('#prop-name');
            expect(nameInput.value).toBe('Changed Name');
        });

        test('should throw error when refreshing disposed inspector', () => {
            inspector.dispose();

            expect(() => inspector.refresh()).toThrow('Cannot refresh disposed Inspector');
        });
    });

    describe('Event Listeners', () => {
        let inspector;

        beforeEach(() => {
            inspector = new Inspector('inspector-container');
        });

        test('should show object when selected in scene tree', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            EventBus.publish('sceneTree:objectSelected', {
                object: box,
            });

            expect(inspector.currentObject).toBe(box);
        });

        test('should update inputs when object properties change externally', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Original Name';
            scene.add(box);

            inspector.show(box);

            // Simulate external name change
            EventBus.publish('object:nameChanged', {
                object: box,
                newName: 'External Change',
            });

            const nameInput = container.querySelector('#prop-name');
            expect(nameInput.value).toBe('External Change');
        });
    });

    describe('Disposal', () => {
        test('should dispose properly', () => {
            const inspector = new Inspector('inspector-container');

            inspector.dispose();

            expect(inspector.isDisposed).toBe(true);
            expect(container.innerHTML).toBe('');
        });

        test('should allow multiple dispose calls', () => {
            const inspector = new Inspector('inspector-container');

            inspector.dispose();
            expect(() => inspector.dispose()).not.toThrow();
        });
    });
});
