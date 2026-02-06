/**
 * SceneTree component for KALYTHESAINZ framework
 * Provides hierarchical display of scene objects with selection and visibility controls
 */

import { EventBus } from '../core/EventBus.js';
import { Scene } from '../engine/Scene.js';

export class SceneTree {
    #containerId = null;
    #container = null;
    #scene = null;
    #selectedObjectId = null;
    #onObjectSelectCallback = null;
    #onObjectVisibilityToggleCallback = null;
    #isDisposed = false;

    /**
     * Create a new SceneTree instance
     * @param {string} containerId - DOM container ID for the scene tree
     * @throws {Error} If container not found
     */
    constructor(containerId) {
        if (!containerId || typeof containerId !== 'string') {
            throw new Error('Container ID must be a non-empty string');
        }

        this.#containerId = containerId;
        this.#container = document.getElementById(containerId);

        if (!this.#container) {
            throw new Error(`Container element with ID '${containerId}' not found`);
        }

        // Get scene instance
        this.#scene = Scene.getInstance();
        if (!this.#scene) {
            throw new Error('Scene must be initialized before creating SceneTree');
        }

        // Initialize UI
        this.#initializeUI();

        // Set up event listeners
        this.#setupEventListeners();

        // Initial render
        this.refresh();
    }

    /**
     * Get selected object ID
     * @returns {string|null} Selected object ID
     */
    get selectedObjectId() {
        return this.#selectedObjectId;
    }

    /**
     * Get container element
     * @returns {HTMLElement} Container element
     */
    get container() {
        return this.#container;
    }

    /**
     * Check if disposed
     * @returns {boolean} True if disposed
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Refresh the scene tree display
     */
    refresh() {
        if (this.#isDisposed) {
            throw new Error('Cannot refresh disposed SceneTree');
        }

        if (!this.#scene) {
            return;
        }

        // Clear existing content
        const treeContent = this.#container.querySelector('.scene-tree-content');
        if (!treeContent) {
            return;
        }

        treeContent.innerHTML = '';

        // Get all objects from scene
        const objects = this.#scene.objects;

        if (objects.size === 0) {
            treeContent.innerHTML = '<div class="scene-tree-empty">No objects in scene</div>';
            return;
        }

        // Create tree items
        const treeList = document.createElement('ul');
        treeList.className = 'scene-tree-list';

        for (const [objectId, objectData] of objects) {
            const treeItem = this.#createTreeItem(objectId, objectData.object);
            treeList.appendChild(treeItem);
        }

        treeContent.appendChild(treeList);
    }

    /**
     * Select an object in the tree
     * @param {string} objectId - Object ID to select
     */
    selectObject(objectId) {
        if (this.#isDisposed) {
            throw new Error('Cannot select object in disposed SceneTree');
        }

        // Deselect previous
        if (this.#selectedObjectId) {
            const prevItem = this.#container.querySelector(
                `[data-object-id="${this.#selectedObjectId}"]`,
            );
            if (prevItem) {
                prevItem.classList.remove('selected');
            }
        }

        // Select new
        this.#selectedObjectId = objectId;

        if (objectId) {
            const item = this.#container.querySelector(`[data-object-id="${objectId}"]`);
            if (item) {
                item.classList.add('selected');
            }

            // Trigger callback
            if (this.#onObjectSelectCallback) {
                const object = this.#scene.find(objectId);
                this.#onObjectSelectCallback({ objectId, object });
            }

            // Emit event
            EventBus.publish('sceneTree:objectSelected', {
                objectId,
                object: this.#scene.find(objectId),
            });
        }
    }

    /**
     * Register callback for object selection
     * @param {Function} callback - Callback function
     */
    onObjectSelect(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.#onObjectSelectCallback = callback;
    }

    /**
     * Register callback for object visibility toggle
     * @param {Function} callback - Callback function
     */
    onObjectVisibilityToggle(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.#onObjectVisibilityToggleCallback = callback;
    }

    /**
     * Dispose the scene tree
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        // Clear container
        if (this.#container) {
            this.#container.innerHTML = '';
        }

        // Clear references
        this.#container = null;
        this.#scene = null;
        this.#selectedObjectId = null;
        this.#onObjectSelectCallback = null;
        this.#onObjectVisibilityToggleCallback = null;
        this.#isDisposed = true;
    }

    /**
     * Initialize UI structure
     * @private
     */
    #initializeUI() {
        this.#container.innerHTML = `
            <div class="scene-tree">
                <div class="scene-tree-header">
                    <h3>Scene Tree</h3>
                </div>
                <div class="scene-tree-content"></div>
            </div>
        `;

        // Add basic styles
        this.#addStyles();
    }

    /**
     * Create a tree item for an object
     * @private
     */
    #createTreeItem(objectId, object) {
        const li = document.createElement('li');
        li.className = 'scene-tree-item';
        li.setAttribute('data-object-id', objectId);

        if (this.#selectedObjectId === objectId) {
            li.classList.add('selected');
        }

        // Create item content
        const itemContent = document.createElement('div');
        itemContent.className = 'scene-tree-item-content';

        // Visibility toggle button
        const visibilityBtn = document.createElement('button');
        visibilityBtn.className = 'scene-tree-visibility-btn';
        visibilityBtn.textContent = object.visible ? '👁' : '👁‍🗨';
        visibilityBtn.title = object.visible ? 'Hide object' : 'Show object';
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.#toggleObjectVisibility(objectId, object);
        });

        // Object name/label
        const label = document.createElement('span');
        label.className = 'scene-tree-item-label';
        label.textContent = object.name || objectId;

        // Object type badge
        const typeBadge = document.createElement('span');
        typeBadge.className = 'scene-tree-item-type';
        typeBadge.textContent = object.constructor.name;

        // Assemble item
        itemContent.appendChild(visibilityBtn);
        itemContent.appendChild(label);
        itemContent.appendChild(typeBadge);

        // Click handler for selection
        itemContent.addEventListener('click', () => {
            this.selectObject(objectId);
        });

        li.appendChild(itemContent);

        return li;
    }

    /**
     * Toggle object visibility
     * @private
     */
    #toggleObjectVisibility(objectId, object) {
        if (!object) {
            return;
        }

        // Toggle visibility
        object.visible = !object.visible;

        // Update button
        const item = this.#container.querySelector(`[data-object-id="${objectId}"]`);
        if (item) {
            const btn = item.querySelector('.scene-tree-visibility-btn');
            if (btn) {
                btn.textContent = object.visible ? '👁' : '👁‍🗨';
                btn.title = object.visible ? 'Hide object' : 'Show object';
            }
        }

        // Trigger callback
        if (this.#onObjectVisibilityToggleCallback) {
            this.#onObjectVisibilityToggleCallback({
                objectId,
                object,
                visible: object.visible,
            });
        }

        // Emit event
        EventBus.publish('sceneTree:visibilityToggled', {
            objectId,
            object,
            visible: object.visible,
        });
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Listen for scene changes
        EventBus.subscribe('scene:object-added', () => {
            this.refresh();
        });

        EventBus.subscribe('scene:object-removed', () => {
            this.refresh();
        });

        EventBus.subscribe('scene:cleared', () => {
            this.refresh();
        });

        EventBus.subscribe('object:nameChanged', (event) => {
            const { id } = event.data;
            const item = this.#container.querySelector(`[data-object-id="${id}"]`);
            if (item) {
                const label = item.querySelector('.scene-tree-item-label');
                if (label) {
                    label.textContent = event.data.newName;
                }
            }
        });

        EventBus.subscribe('object:visibilityChanged', (event) => {
            const { id, newVisible } = event.data;
            const item = this.#container.querySelector(`[data-object-id="${id}"]`);
            if (item) {
                const btn = item.querySelector('.scene-tree-visibility-btn');
                if (btn) {
                    btn.textContent = newVisible ? '👁' : '👁‍🗨';
                    btn.title = newVisible ? 'Hide object' : 'Show object';
                }
            }
        });
    }

    /**
     * Add basic styles
     * @private
     */
    #addStyles() {
        // Check if styles already exist
        if (document.getElementById('scene-tree-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'scene-tree-styles';
        style.textContent = `
            .scene-tree {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #2a2a2a;
                color: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }

            .scene-tree-header {
                background: #1e1e1e;
                padding: 12px 16px;
                border-bottom: 1px solid #3a3a3a;
            }

            .scene-tree-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #e0e0e0;
            }

            .scene-tree-content {
                padding: 8px;
                max-height: 400px;
                overflow-y: auto;
            }

            .scene-tree-empty {
                padding: 20px;
                text-align: center;
                color: #888;
                font-size: 13px;
            }

            .scene-tree-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .scene-tree-item {
                margin: 2px 0;
            }

            .scene-tree-item-content {
                display: flex;
                align-items: center;
                padding: 6px 8px;
                border-radius: 3px;
                cursor: pointer;
                transition: background 0.15s;
            }

            .scene-tree-item-content:hover {
                background: #3a3a3a;
            }

            .scene-tree-item.selected .scene-tree-item-content {
                background: #0d7377;
            }

            .scene-tree-visibility-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 16px;
                padding: 0;
                margin-right: 8px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: opacity 0.15s;
            }

            .scene-tree-visibility-btn:hover {
                opacity: 1;
            }

            .scene-tree-item-label {
                flex: 1;
                font-size: 13px;
                color: #e0e0e0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .scene-tree-item-type {
                font-size: 11px;
                color: #888;
                background: #1e1e1e;
                padding: 2px 6px;
                border-radius: 3px;
                margin-left: 8px;
            }
        `;

        document.head.appendChild(style);
    }
}

export default SceneTree;
