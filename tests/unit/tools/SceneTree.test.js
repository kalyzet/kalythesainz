/**
 * Unit tests for SceneTree class
 * Tests hierarchical display, object selection, and visibility toggle functionality
 * Requirements: 4.1, 4.2
 */

import { SceneTree } from '../../../tools/SceneTree.js';
import { Scene } from '../../../engine/Scene.js';
import { Box } from '../../../objects/Box.js';
import { EventBus } from '../../../core/EventBus.js';

describe('SceneTree', () => {
    let container;
    let scene;

    beforeEach(() => {
        // Clear EventBus
        EventBus.clear();

        // Create container element
        container = document.createElement('div');
        container.id = 'scene-tree-container';
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
        const containers = document.querySelectorAll('#scene-tree-container, #scene-container');
        containers.forEach((c) => c.remove());
    });

    describe('Initialization', () => {
        test('should create SceneTree with valid container', () => {
            const sceneTree = new SceneTree('scene-tree-container');

            expect(sceneTree).toBeDefined();
            expect(sceneTree.container).toBe(container);
            expect(sceneTree.isDisposed).toBe(false);
        });

        test('should throw error for invalid container ID', () => {
            expect(() => new SceneTree('')).toThrow('Container ID must be a non-empty string');
            expect(() => new SceneTree(null)).toThrow('Container ID must be a non-empty string');
        });

        test('should throw error for non-existent container', () => {
            expect(() => new SceneTree('non-existent')).toThrow(
                "Container element with ID 'non-existent' not found",
            );
        });

        test('should throw error if scene not initialized', () => {
            Scene.destroy();
            expect(() => new SceneTree('scene-tree-container')).toThrow(
                'Scene must be initialized before creating SceneTree',
            );
        });

        test('should initialize UI structure', () => {
            new SceneTree('scene-tree-container');

            expect(container.querySelector('.scene-tree')).toBeTruthy();
            expect(container.querySelector('.scene-tree-header')).toBeTruthy();
            expect(container.querySelector('.scene-tree-content')).toBeTruthy();
        });
    });

    describe('Object Display', () => {
        let sceneTree;

        beforeEach(() => {
            sceneTree = new SceneTree('scene-tree-container');
        });

        test('should display empty state when no objects', () => {
            sceneTree.refresh();

            const emptyMessage = container.querySelector('.scene-tree-empty');
            expect(emptyMessage).toBeTruthy();
            expect(emptyMessage.textContent).toContain('No objects in scene');
        });

        test('should display objects in scene', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Test Box';
            scene.add(box);

            sceneTree.refresh();

            const items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(1);

            const label = items[0].querySelector('.scene-tree-item-label');
            expect(label.textContent).toBe('Test Box');
        });

        test('should display multiple objects', () => {
            const box1 = Box.create(1, 1, 1);
            box1.name = 'Box 1';
            scene.add(box1);

            const box2 = Box.create(1, 1, 1);
            box2.name = 'Box 2';
            scene.add(box2);

            sceneTree.refresh();

            const items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(2);
        });

        test('should display object type badge', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            const typeBadge = container.querySelector('.scene-tree-item-type');
            expect(typeBadge).toBeTruthy();
            expect(typeBadge.textContent).toBe('Box');
        });

        test('should auto-refresh when objects added', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            const items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(1);
        });

        test('should auto-refresh when objects removed', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            let items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(1);

            scene.remove(box.id);

            items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(0);
        });
    });

    describe('Object Selection', () => {
        let sceneTree;

        beforeEach(() => {
            sceneTree = new SceneTree('scene-tree-container');
        });

        test('should select object when clicked', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Test Box';
            scene.add(box);

            sceneTree.refresh();

            const item = container.querySelector('.scene-tree-item-content');
            item.click();

            expect(sceneTree.selectedObjectId).toBe(box.id);
            expect(item.parentElement.classList.contains('selected')).toBe(true);
        });

        test('should deselect previous object when selecting new one', () => {
            const box1 = Box.create(1, 1, 1);
            box1.name = 'Box 1';
            scene.add(box1);

            const box2 = Box.create(1, 1, 1);
            box2.name = 'Box 2';
            scene.add(box2);

            sceneTree.refresh();

            const items = container.querySelectorAll('.scene-tree-item-content');

            items[0].click();
            expect(sceneTree.selectedObjectId).toBe(box1.id);

            items[1].click();
            expect(sceneTree.selectedObjectId).toBe(box2.id);
            expect(items[0].parentElement.classList.contains('selected')).toBe(false);
            expect(items[1].parentElement.classList.contains('selected')).toBe(true);
        });

        test('should call onObjectSelect callback', () => {
            const callback = jest.fn();
            sceneTree.onObjectSelect(callback);

            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            const item = container.querySelector('.scene-tree-item-content');
            item.click();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback.mock.calls[0][0].objectId).toBe(box.id);
            expect(callback.mock.calls[0][0].object).toBe(box);
        });

        test('should emit objectSelected event', (done) => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            EventBus.subscribe('sceneTree:objectSelected', (event) => {
                expect(event.data.objectId).toBe(box.id);
                expect(event.data.object).toBe(box);
                done();
            });

            sceneTree.refresh();

            const item = container.querySelector('.scene-tree-item-content');
            item.click();
        });

        test('should throw error for invalid callback', () => {
            expect(() => sceneTree.onObjectSelect('not-function')).toThrow(
                'Callback must be a function',
            );
        });

        test('should select object programmatically', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            sceneTree.selectObject(box.id);

            expect(sceneTree.selectedObjectId).toBe(box.id);
            const item = container.querySelector(`[data-object-id="${box.id}"]`);
            expect(item.classList.contains('selected')).toBe(true);
        });
    });

    describe('Visibility Toggle', () => {
        let sceneTree;

        beforeEach(() => {
            sceneTree = new SceneTree('scene-tree-container');
        });

        test('should toggle object visibility', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            const visibilityBtn = container.querySelector('.scene-tree-visibility-btn');
            expect(box.visible).toBe(true);

            visibilityBtn.click();

            expect(box.visible).toBe(false);
        });

        test('should update visibility button icon', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            const visibilityBtn = container.querySelector('.scene-tree-visibility-btn');
            const initialIcon = visibilityBtn.textContent;

            visibilityBtn.click();

            expect(visibilityBtn.textContent).not.toBe(initialIcon);
        });

        test('should call onObjectVisibilityToggle callback', () => {
            const callback = jest.fn();
            sceneTree.onObjectVisibilityToggle(callback);

            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            const visibilityBtn = container.querySelector('.scene-tree-visibility-btn');
            visibilityBtn.click();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback.mock.calls[0][0].objectId).toBe(box.id);
            expect(callback.mock.calls[0][0].visible).toBe(false);
        });

        test('should emit visibilityToggled event', (done) => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            EventBus.subscribe('sceneTree:visibilityToggled', (event) => {
                expect(event.data.objectId).toBe(box.id);
                expect(event.data.visible).toBe(false);
                done();
            });

            sceneTree.refresh();

            const visibilityBtn = container.querySelector('.scene-tree-visibility-btn');
            visibilityBtn.click();
        });

        test('should throw error for invalid visibility callback', () => {
            expect(() => sceneTree.onObjectVisibilityToggle('not-function')).toThrow(
                'Callback must be a function',
            );
        });
    });

    describe('Event Listeners', () => {
        let sceneTree;

        beforeEach(() => {
            sceneTree = new SceneTree('scene-tree-container');
        });

        test('should update when object name changes', () => {
            const box = Box.create(1, 1, 1);
            box.name = 'Original Name';
            scene.add(box);

            sceneTree.refresh();

            let label = container.querySelector('.scene-tree-item-label');
            expect(label.textContent).toBe('Original Name');

            // Simulate name change event
            box.name = 'New Name';
            EventBus.publish('object:nameChanged', {
                id: box.id,
                newName: 'New Name',
            });

            label = container.querySelector('.scene-tree-item-label');
            expect(label.textContent).toBe('New Name');
        });

        test('should update when scene cleared', () => {
            const box = Box.create(1, 1, 1);
            scene.add(box);

            sceneTree.refresh();

            let items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(1);

            scene.clear();

            items = container.querySelectorAll('.scene-tree-item');
            expect(items.length).toBe(0);
        });
    });

    describe('Disposal', () => {
        test('should dispose properly', () => {
            const sceneTree = new SceneTree('scene-tree-container');

            sceneTree.dispose();

            expect(sceneTree.isDisposed).toBe(true);
            expect(container.innerHTML).toBe('');
        });

        test('should throw error when using disposed instance', () => {
            const sceneTree = new SceneTree('scene-tree-container');
            sceneTree.dispose();

            expect(() => sceneTree.refresh()).toThrow('Cannot refresh disposed SceneTree');
            expect(() => sceneTree.selectObject('id')).toThrow(
                'Cannot select object in disposed SceneTree',
            );
        });

        test('should allow multiple dispose calls', () => {
            const sceneTree = new SceneTree('scene-tree-container');

            sceneTree.dispose();
            expect(() => sceneTree.dispose()).not.toThrow();
        });
    });
});
