/**
 * Inspector component for KALYTHESAINZ framework
 * Provides property editing interface for selected objects
 */

import { EventBus } from '../core/EventBus.js';

export class Inspector {
    #containerId = null;
    #container = null;
    #currentObject = null;
    #onPropertyChangeCallback = null;
    #isDisposed = false;
    #propertyInputs = new Map();

    /**
     * Create a new Inspector instance
     * @param {string} containerId - DOM container ID for the inspector
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

        // Initialize UI
        this.#initializeUI();

        // Set up event listeners
        this.#setupEventListeners();
    }

    /**
     * Get current object being inspected
     * @returns {object|null} Current object
     */
    get currentObject() {
        return this.#currentObject;
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
     * Show inspector for an object
     * @param {object} object - Object to inspect
     */
    show(object) {
        if (this.#isDisposed) {
            throw new Error('Cannot show object in disposed Inspector');
        }

        if (!object) {
            this.hide();
            return;
        }

        this.#currentObject = object;
        this.#renderProperties();

        // Show inspector
        const inspectorContent = this.#container.querySelector('.inspector-content');
        if (inspectorContent) {
            inspectorContent.style.display = 'block';
        }

        const emptyState = this.#container.querySelector('.inspector-empty');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    /**
     * Hide inspector
     */
    hide() {
        if (this.#isDisposed) {
            throw new Error('Cannot hide disposed Inspector');
        }

        this.#currentObject = null;
        this.#propertyInputs.clear();

        // Hide inspector
        const inspectorContent = this.#container.querySelector('.inspector-content');
        if (inspectorContent) {
            inspectorContent.style.display = 'none';
        }

        const emptyState = this.#container.querySelector('.inspector-empty');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }

    /**
     * Refresh inspector display
     */
    refresh() {
        if (this.#isDisposed) {
            throw new Error('Cannot refresh disposed Inspector');
        }

        if (this.#currentObject) {
            this.#renderProperties();
        }
    }

    /**
     * Register callback for property changes
     * @param {Function} callback - Callback function
     */
    onPropertyChange(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.#onPropertyChangeCallback = callback;
    }

    /**
     * Dispose the inspector
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
        this.#currentObject = null;
        this.#onPropertyChangeCallback = null;
        this.#propertyInputs.clear();
        this.#isDisposed = true;
    }

    /**
     * Initialize UI structure
     * @private
     */
    #initializeUI() {
        this.#container.innerHTML = `
            <div class="inspector">
                <div class="inspector-header">
                    <h3>Inspector</h3>
                </div>
                <div class="inspector-empty">
                    <p>Select an object to inspect</p>
                </div>
                <div class="inspector-content" style="display: none;">
                    <div class="inspector-section" id="inspector-metadata"></div>
                    <div class="inspector-section" id="inspector-transform"></div>
                    <div class="inspector-section" id="inspector-material"></div>
                </div>
            </div>
        `;

        // Add basic styles
        this.#addStyles();
    }

    /**
     * Render object properties
     * @private
     */
    #renderProperties() {
        if (!this.#currentObject) {
            return;
        }

        this.#propertyInputs.clear();

        // Render metadata section
        this.#renderMetadataSection();

        // Render transform section
        this.#renderTransformSection();

        // Render material section
        this.#renderMaterialSection();
    }

    /**
     * Render metadata section
     * @private
     */
    #renderMetadataSection() {
        const section = this.#container.querySelector('#inspector-metadata');
        if (!section) return;

        section.innerHTML = `
            <h4 class="inspector-section-title">Metadata</h4>
            <div class="inspector-property">
                <label>ID</label>
                <input type="text" value="${this.#currentObject.id}" readonly />
            </div>
            <div class="inspector-property">
                <label>Name</label>
                <input type="text" id="prop-name" value="${this.#currentObject.name}" />
            </div>
            <div class="inspector-property">
                <label>Type</label>
                <input type="text" value="${this.#currentObject.constructor.name}" readonly />
            </div>
            <div class="inspector-property">
                <label>Visible</label>
                <input type="checkbox" id="prop-visible" ${this.#currentObject.visible ? 'checked' : ''} />
            </div>
        `;

        // Add event listeners
        const nameInput = section.querySelector('#prop-name');
        if (nameInput) {
            nameInput.addEventListener('change', (e) => {
                this.#updateProperty('name', e.target.value);
            });
            this.#propertyInputs.set('name', nameInput);
        }

        const visibleInput = section.querySelector('#prop-visible');
        if (visibleInput) {
            visibleInput.addEventListener('change', (e) => {
                this.#updateProperty('visible', e.target.checked);
            });
            this.#propertyInputs.set('visible', visibleInput);
        }
    }

    /**
     * Render transform section
     * @private
     */
    #renderTransformSection() {
        const section = this.#container.querySelector('#inspector-transform');
        if (!section) return;

        const pos = this.#currentObject.position;
        const rot = this.#currentObject.rotation;
        const scale = this.#currentObject.scale;

        section.innerHTML = `
            <h4 class="inspector-section-title">Transform</h4>
            <div class="inspector-property-group">
                <label>Position</label>
                <div class="inspector-vector">
                    <input type="number" id="prop-pos-x" value="${pos.x.toFixed(2)}" step="0.1" />
                    <input type="number" id="prop-pos-y" value="${pos.y.toFixed(2)}" step="0.1" />
                    <input type="number" id="prop-pos-z" value="${pos.z.toFixed(2)}" step="0.1" />
                </div>
            </div>
            <div class="inspector-property-group">
                <label>Rotation</label>
                <div class="inspector-vector">
                    <input type="number" id="prop-rot-x" value="${(rot.x * (180 / Math.PI)).toFixed(2)}" step="1" />
                    <input type="number" id="prop-rot-y" value="${(rot.y * (180 / Math.PI)).toFixed(2)}" step="1" />
                    <input type="number" id="prop-rot-z" value="${(rot.z * (180 / Math.PI)).toFixed(2)}" step="1" />
                </div>
            </div>
            <div class="inspector-property-group">
                <label>Scale</label>
                <div class="inspector-vector">
                    <input type="number" id="prop-scale-x" value="${scale.x.toFixed(2)}" step="0.1" min="0.01" />
                    <input type="number" id="prop-scale-y" value="${scale.y.toFixed(2)}" step="0.1" min="0.01" />
                    <input type="number" id="prop-scale-z" value="${scale.z.toFixed(2)}" step="0.1" min="0.01" />
                </div>
            </div>
        `;

        // Add event listeners for position
        ['x', 'y', 'z'].forEach((axis) => {
            const input = section.querySelector(`#prop-pos-${axis}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                        const newPos = { ...this.#currentObject.position };
                        newPos[axis] = value;
                        this.#updateProperty('position', [newPos.x, newPos.y, newPos.z]);
                    }
                });
                this.#propertyInputs.set(`position.${axis}`, input);
            }
        });

        // Add event listeners for rotation
        ['x', 'y', 'z'].forEach((axis) => {
            const input = section.querySelector(`#prop-rot-${axis}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    const degrees = parseFloat(e.target.value);
                    if (!isNaN(degrees)) {
                        const radians = degrees * (Math.PI / 180);
                        const newRot = { ...this.#currentObject.rotation };
                        newRot[axis] = radians;
                        this.#updateProperty('rotation', [newRot.x, newRot.y, newRot.z]);
                    }
                });
                this.#propertyInputs.set(`rotation.${axis}`, input);
            }
        });

        // Add event listeners for scale
        ['x', 'y', 'z'].forEach((axis) => {
            const input = section.querySelector(`#prop-scale-${axis}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                        const newScale = { ...this.#currentObject.scale };
                        newScale[axis] = value;
                        this.#updateProperty('scale', [newScale.x, newScale.y, newScale.z]);
                    }
                });
                this.#propertyInputs.set(`scale.${axis}`, input);
            }
        });
    }

    /**
     * Render material section
     * @private
     */
    #renderMaterialSection() {
        const section = this.#container.querySelector('#inspector-material');
        if (!section) return;

        const material = this.#currentObject.threeMesh?.material;
        if (!material) {
            section.innerHTML = '';
            return;
        }

        const color = material.color ? `#${material.color.getHexString()}` : '#ffffff';

        section.innerHTML = `
            <h4 class="inspector-section-title">Material</h4>
            <div class="inspector-property">
                <label>Color</label>
                <input type="color" id="prop-color" value="${color}" />
            </div>
            <div class="inspector-property">
                <label>Opacity</label>
                <input type="range" id="prop-opacity" min="0" max="1" step="0.01" value="${material.opacity || 1}" />
                <span id="prop-opacity-value">${((material.opacity || 1) * 100).toFixed(0)}%</span>
            </div>
        `;

        // Add event listeners
        const colorInput = section.querySelector('#prop-color');
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                this.#updateMaterialProperty('color', e.target.value);
            });
            this.#propertyInputs.set('material.color', colorInput);
        }

        const opacityInput = section.querySelector('#prop-opacity');
        const opacityValue = section.querySelector('#prop-opacity-value');
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (opacityValue) {
                    opacityValue.textContent = `${(value * 100).toFixed(0)}%`;
                }
            });
            opacityInput.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                this.#updateMaterialProperty('opacity', value);
            });
            this.#propertyInputs.set('material.opacity', opacityInput);
        }
    }

    /**
     * Update object property
     * @private
     */
    #updateProperty(property, value) {
        if (!this.#currentObject) {
            return;
        }

        try {
            // Validate value based on property type
            const validatedValue = this.#validatePropertyValue(property, value);

            // Update object property
            this.#currentObject[property] = validatedValue;

            // Trigger callback
            if (this.#onPropertyChangeCallback) {
                this.#onPropertyChangeCallback({
                    object: this.#currentObject,
                    property,
                    value: validatedValue,
                });
            }

            // Emit event
            EventBus.publish('inspector:propertyChanged', {
                object: this.#currentObject,
                property,
                value: validatedValue,
            });
        } catch (error) {
            console.error(`Failed to update property ${property}:`, error);
            // Revert input value
            this.refresh();
        }
    }

    /**
     * Update material property
     * @private
     */
    #updateMaterialProperty(property, value) {
        if (!this.#currentObject || !this.#currentObject.threeMesh?.material) {
            return;
        }

        try {
            const material = this.#currentObject.threeMesh.material;

            if (property === 'color') {
                material.color.set(value);
            } else if (property === 'opacity') {
                material.opacity = value;
                material.transparent = value < 1;
            } else {
                material[property] = value;
            }

            // Trigger callback
            if (this.#onPropertyChangeCallback) {
                this.#onPropertyChangeCallback({
                    object: this.#currentObject,
                    property: `material.${property}`,
                    value,
                });
            }

            // Emit event
            EventBus.publish('inspector:propertyChanged', {
                object: this.#currentObject,
                property: `material.${property}`,
                value,
            });
        } catch (error) {
            console.error(`Failed to update material property ${property}:`, error);
        }
    }

    /**
     * Validate property value
     * @private
     */
    #validatePropertyValue(property, value) {
        switch (property) {
            case 'name':
                if (typeof value !== 'string') {
                    throw new Error('Name must be a string');
                }
                return value;

            case 'visible':
                if (typeof value !== 'boolean') {
                    throw new Error('Visible must be a boolean');
                }
                return value;

            case 'position':
            case 'rotation':
            case 'scale':
                if (!Array.isArray(value) || value.length !== 3) {
                    throw new Error(`${property} must be an array of 3 numbers`);
                }
                if (value.some((v) => typeof v !== 'number' || isNaN(v))) {
                    throw new Error(`${property} values must be valid numbers`);
                }
                return value;

            default:
                return value;
        }
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Listen for object property changes from other sources
        EventBus.subscribe('object:positionChanged', (event) => {
            if (event.data.object === this.#currentObject) {
                this.#updateInputValues('position', event.data.newPosition);
            }
        });

        EventBus.subscribe('object:rotationChanged', (event) => {
            if (event.data.object === this.#currentObject) {
                this.#updateInputValues('rotation', event.data.newRotation);
            }
        });

        EventBus.subscribe('object:scaleChanged', (event) => {
            if (event.data.object === this.#currentObject) {
                this.#updateInputValues('scale', event.data.newScale);
            }
        });

        EventBus.subscribe('object:nameChanged', (event) => {
            if (event.data.object === this.#currentObject) {
                const input = this.#propertyInputs.get('name');
                if (input) {
                    input.value = event.data.newName;
                }
            }
        });

        EventBus.subscribe('object:visibilityChanged', (event) => {
            if (event.data.object === this.#currentObject) {
                const input = this.#propertyInputs.get('visible');
                if (input) {
                    input.checked = event.data.newVisible;
                }
            }
        });

        // Listen for scene tree selection
        EventBus.subscribe('sceneTree:objectSelected', (event) => {
            this.show(event.data.object);
        });
    }

    /**
     * Update input values without triggering change events
     * @private
     */
    #updateInputValues(property, values) {
        if (property === 'position') {
            ['x', 'y', 'z'].forEach((axis, index) => {
                const input = this.#propertyInputs.get(`position.${axis}`);
                if (input) {
                    input.value = values[index].toFixed(2);
                }
            });
        } else if (property === 'rotation') {
            ['x', 'y', 'z'].forEach((axis, index) => {
                const input = this.#propertyInputs.get(`rotation.${axis}`);
                if (input) {
                    input.value = (values[index] * (180 / Math.PI)).toFixed(2);
                }
            });
        } else if (property === 'scale') {
            ['x', 'y', 'z'].forEach((axis, index) => {
                const input = this.#propertyInputs.get(`scale.${axis}`);
                if (input) {
                    input.value = values[index].toFixed(2);
                }
            });
        }
    }

    /**
     * Add basic styles
     * @private
     */
    #addStyles() {
        // Check if styles already exist
        if (document.getElementById('inspector-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'inspector-styles';
        style.textContent = `
            .inspector {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #2a2a2a;
                color: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }

            .inspector-header {
                background: #1e1e1e;
                padding: 12px 16px;
                border-bottom: 1px solid #3a3a3a;
            }

            .inspector-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #e0e0e0;
            }

            .inspector-empty {
                padding: 40px 20px;
                text-align: center;
                color: #888;
                font-size: 13px;
            }

            .inspector-content {
                padding: 16px;
                max-height: 600px;
                overflow-y: auto;
            }

            .inspector-section {
                margin-bottom: 20px;
            }

            .inspector-section-title {
                font-size: 12px;
                font-weight: 600;
                color: #888;
                text-transform: uppercase;
                margin: 0 0 12px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid #3a3a3a;
            }

            .inspector-property {
                margin-bottom: 12px;
            }

            .inspector-property label {
                display: block;
                font-size: 12px;
                color: #aaa;
                margin-bottom: 4px;
            }

            .inspector-property input[type="text"],
            .inspector-property input[type="number"] {
                width: 100%;
                padding: 6px 8px;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 3px;
                color: #e0e0e0;
                font-size: 13px;
            }

            .inspector-property input[type="text"]:focus,
            .inspector-property input[type="number"]:focus {
                outline: none;
                border-color: #0d7377;
            }

            .inspector-property input[type="text"]:read-only {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .inspector-property input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }

            .inspector-property input[type="color"] {
                width: 100%;
                height: 32px;
                padding: 2px;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 3px;
                cursor: pointer;
            }

            .inspector-property input[type="range"] {
                width: calc(100% - 50px);
                margin-right: 8px;
            }

            .inspector-property-group {
                margin-bottom: 16px;
            }

            .inspector-property-group label {
                display: block;
                font-size: 12px;
                color: #aaa;
                margin-bottom: 4px;
            }

            .inspector-vector {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }

            .inspector-vector input {
                padding: 6px 8px;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 3px;
                color: #e0e0e0;
                font-size: 13px;
                text-align: center;
            }

            .inspector-vector input:focus {
                outline: none;
                border-color: #0d7377;
            }
        `;

        document.head.appendChild(style);
    }
}

export default Inspector;
