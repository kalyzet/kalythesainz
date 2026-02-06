/**
 * TransformGizmo component for KALYTHESAINZ framework
 * Provides interactive transform handles for position, rotation, and scale manipulation
 */

import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

export class TransformGizmo {
    #camera = null;
    #renderer = null;
    #attachedObject = null;
    #mode = 'translate'; // 'translate', 'rotate', 'scale'
    #gizmoGroup = null;
    #isActive = false;
    #isDragging = false;
    #isDisposed = false;

    // Callbacks
    #onTransformStartCallback = null;
    #onTransformChangeCallback = null;
    #onTransformEndCallback = null;

    // Interaction state
    #selectedAxis = null;
    #startPosition = new THREE.Vector3();
    #startRotation = new THREE.Euler();
    #startScale = new THREE.Vector3();
    #mouseStart = new THREE.Vector2();
    #raycaster = new THREE.Raycaster();

    /**
     * Create a new TransformGizmo instance
     * @param {Camera} camera - Camera instance
     * @param {Renderer} renderer - Renderer instance
     * @throws {Error} If camera or renderer is invalid
     */
    constructor(camera, renderer) {
        if (!camera || !camera.threeCamera) {
            throw new Error('Valid camera instance is required');
        }

        if (!renderer || !renderer.threeRenderer) {
            throw new Error('Valid renderer instance is required');
        }

        this.#camera = camera;
        this.#renderer = renderer;

        // Create gizmo group
        this.#gizmoGroup = new THREE.Group();
        this.#gizmoGroup.visible = false;

        // Build gizmo geometry
        this.#buildGizmo();

        // Set up event listeners
        this.#setupEventListeners();
    }

    /**
     * Get current mode
     * @returns {string} Current mode ('translate', 'rotate', 'scale')
     */
    get mode() {
        return this.#mode;
    }

    /**
     * Get attached object
     * @returns {object|null} Attached object
     */
    get attachedObject() {
        return this.#attachedObject;
    }

    /**
     * Get gizmo group
     * @returns {THREE.Group} Gizmo group
     */
    get gizmoGroup() {
        return this.#gizmoGroup;
    }

    /**
     * Check if active
     * @returns {boolean} True if active
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * Check if disposed
     * @returns {boolean} True if disposed
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Attach gizmo to an object
     * @param {object} object - Object to attach to
     */
    attach(object) {
        if (this.#isDisposed) {
            throw new Error('Cannot attach to disposed TransformGizmo');
        }

        if (!object || !object.threeMesh) {
            throw new Error('Object must have threeMesh property');
        }

        this.#attachedObject = object;
        this.#isActive = true;

        // Position gizmo at object position
        this.#updateGizmoPosition();

        // Show gizmo
        this.#gizmoGroup.visible = true;

        // Emit event
        EventBus.publish('transformGizmo:attached', {
            object,
            mode: this.#mode,
        });
    }

    /**
     * Detach gizmo from current object
     */
    detach() {
        if (this.#isDisposed) {
            throw new Error('Cannot detach disposed TransformGizmo');
        }

        const previousObject = this.#attachedObject;

        this.#attachedObject = null;
        this.#isActive = false;
        this.#isDragging = false;
        this.#selectedAxis = null;

        // Hide gizmo
        this.#gizmoGroup.visible = false;

        // Emit event
        if (previousObject) {
            EventBus.publish('transformGizmo:detached', {
                object: previousObject,
            });
        }
    }

    /**
     * Set gizmo mode
     * @param {string} mode - Mode ('translate', 'rotate', 'scale')
     */
    setMode(mode) {
        if (this.#isDisposed) {
            throw new Error('Cannot set mode on disposed TransformGizmo');
        }

        const validModes = ['translate', 'rotate', 'scale'];
        if (!validModes.includes(mode)) {
            throw new Error(`Invalid mode. Must be one of: ${validModes.join(', ')}`);
        }

        this.#mode = mode;

        // Rebuild gizmo for new mode
        this.#buildGizmo();

        // Update position if attached
        if (this.#attachedObject) {
            this.#updateGizmoPosition();
        }

        // Emit event
        EventBus.publish('transformGizmo:modeChanged', {
            mode,
            object: this.#attachedObject,
        });
    }

    /**
     * Register callback for transform start
     * @param {Function} callback - Callback function
     */
    onTransformStart(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.#onTransformStartCallback = callback;
    }

    /**
     * Register callback for transform change
     * @param {Function} callback - Callback function
     */
    onTransformChange(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.#onTransformChangeCallback = callback;
    }

    /**
     * Register callback for transform end
     * @param {Function} callback - Callback function
     */
    onTransformEnd(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.#onTransformEndCallback = callback;
    }

    /**
     * Update gizmo (call this in render loop)
     */
    update() {
        if (this.#isDisposed || !this.#isActive || !this.#attachedObject) {
            return;
        }

        // Update gizmo position to follow object
        if (!this.#isDragging) {
            this.#updateGizmoPosition();
        }

        // Scale gizmo based on camera distance for consistent size
        const distance = this.#camera.threeCamera.position.distanceTo(
            this.#attachedObject.position,
        );
        const scale = distance * 0.15;
        this.#gizmoGroup.scale.set(scale, scale, scale);
    }

    /**
     * Dispose the gizmo
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        // Detach if attached
        if (this.#attachedObject) {
            this.detach();
        }

        // Dispose gizmo geometry and materials
        this.#gizmoGroup.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        // Clear references
        this.#camera = null;
        this.#renderer = null;
        this.#attachedObject = null;
        this.#gizmoGroup = null;
        this.#onTransformStartCallback = null;
        this.#onTransformChangeCallback = null;
        this.#onTransformEndCallback = null;
        this.#isDisposed = true;
    }

    /**
     * Build gizmo geometry
     * @private
     */
    #buildGizmo() {
        // Clear existing gizmo
        while (this.#gizmoGroup.children.length > 0) {
            const child = this.#gizmoGroup.children[0];
            this.#gizmoGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        if (this.#mode === 'translate') {
            this.#buildTranslateGizmo();
        } else if (this.#mode === 'rotate') {
            this.#buildRotateGizmo();
        } else if (this.#mode === 'scale') {
            this.#buildScaleGizmo();
        }
    }

    /**
     * Build translate gizmo
     * @private
     */
    #buildTranslateGizmo() {
        const arrowLength = 1;
        const arrowRadius = 0.02;
        const coneHeight = 0.2;
        const coneRadius = 0.05;

        // X axis (red)
        this.#createArrow(
            new THREE.Vector3(arrowLength, 0, 0),
            0xff0000,
            'x',
            arrowRadius,
            coneHeight,
            coneRadius,
        );

        // Y axis (green)
        this.#createArrow(
            new THREE.Vector3(0, arrowLength, 0),
            0x00ff00,
            'y',
            arrowRadius,
            coneHeight,
            coneRadius,
        );

        // Z axis (blue)
        this.#createArrow(
            new THREE.Vector3(0, 0, arrowLength),
            0x0000ff,
            'z',
            arrowRadius,
            coneHeight,
            coneRadius,
        );
    }

    /**
     * Build rotate gizmo
     * @private
     */
    #buildRotateGizmo() {
        const radius = 1;
        const segments = 64;

        // X axis (red)
        this.#createCircle(radius, segments, 0xff0000, 'x', new THREE.Euler(0, 0, Math.PI / 2));

        // Y axis (green)
        this.#createCircle(radius, segments, 0x00ff00, 'y', new THREE.Euler(0, 0, 0));

        // Z axis (blue)
        this.#createCircle(radius, segments, 0x0000ff, 'z', new THREE.Euler(Math.PI / 2, 0, 0));
    }

    /**
     * Build scale gizmo
     * @private
     */
    #buildScaleGizmo() {
        const lineLength = 1;
        const cubeSize = 0.1;

        // X axis (red)
        this.#createScaleHandle(new THREE.Vector3(lineLength, 0, 0), 0xff0000, 'x', cubeSize);

        // Y axis (green)
        this.#createScaleHandle(new THREE.Vector3(0, lineLength, 0), 0x00ff00, 'y', cubeSize);

        // Z axis (blue)
        this.#createScaleHandle(new THREE.Vector3(0, 0, lineLength), 0x0000ff, 'z', cubeSize);
    }

    /**
     * Create arrow for translate gizmo
     * @private
     */
    #createArrow(direction, color, axis, arrowRadius, coneHeight, coneRadius) {
        const group = new THREE.Group();
        group.userData.axis = axis;

        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(
            arrowRadius,
            arrowRadius,
            direction.length() - coneHeight,
            8,
        );
        const shaftMaterial = new THREE.MeshBasicMaterial({ color });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);

        // Arrow cone
        const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({ color });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);

        // Position and orient
        if (axis === 'x') {
            shaft.rotation.z = -Math.PI / 2;
            shaft.position.x = direction.x / 2 - coneHeight / 2;
            cone.rotation.z = -Math.PI / 2;
            cone.position.x = direction.x - coneHeight / 2;
        } else if (axis === 'y') {
            shaft.position.y = direction.y / 2 - coneHeight / 2;
            cone.position.y = direction.y - coneHeight / 2;
        } else if (axis === 'z') {
            shaft.rotation.x = Math.PI / 2;
            shaft.position.z = direction.z / 2 - coneHeight / 2;
            cone.rotation.x = Math.PI / 2;
            cone.position.z = direction.z - coneHeight / 2;
        }

        group.add(shaft);
        group.add(cone);
        this.#gizmoGroup.add(group);
    }

    /**
     * Create circle for rotate gizmo
     * @private
     */
    #createCircle(radius, segments, color, axis, rotation) {
        const geometry = new THREE.TorusGeometry(radius, 0.02, 8, segments);
        const material = new THREE.MeshBasicMaterial({ color });
        const circle = new THREE.Mesh(geometry, material);

        circle.rotation.copy(rotation);
        circle.userData.axis = axis;

        this.#gizmoGroup.add(circle);
    }

    /**
     * Create scale handle
     * @private
     */
    #createScaleHandle(position, color, axis, cubeSize) {
        const group = new THREE.Group();
        group.userData.axis = axis;

        // Line
        const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, position.length(), 8);
        const lineMaterial = new THREE.MeshBasicMaterial({ color });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);

        // Cube handle
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        // Position and orient
        if (axis === 'x') {
            line.rotation.z = -Math.PI / 2;
            line.position.x = position.x / 2;
            cube.position.copy(position);
        } else if (axis === 'y') {
            line.position.y = position.y / 2;
            cube.position.copy(position);
        } else if (axis === 'z') {
            line.rotation.x = Math.PI / 2;
            line.position.z = position.z / 2;
            cube.position.copy(position);
        }

        group.add(line);
        group.add(cube);
        this.#gizmoGroup.add(group);
    }

    /**
     * Update gizmo position
     * @private
     */
    #updateGizmoPosition() {
        if (!this.#attachedObject) {
            return;
        }

        this.#gizmoGroup.position.copy(this.#attachedObject.position);
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Listen for scene tree selection
        EventBus.subscribe('sceneTree:objectSelected', (event) => {
            if (event.data.object) {
                this.attach(event.data.object);
            } else {
                this.detach();
            }
        });

        // Listen for object removal
        EventBus.subscribe('scene:object-removed', (event) => {
            if (this.#attachedObject && event.data.objectId === this.#attachedObject.id) {
                this.detach();
            }
        });
    }

    /**
     * Handle mouse down for gizmo interaction
     * @param {MouseEvent} event - Mouse event
     * @param {THREE.Scene} scene - Three.js scene containing gizmo
     */
    handleMouseDown(event, scene) {
        if (!this.#isActive || !this.#attachedObject) {
            return false;
        }

        // Get mouse position
        const rect = this.#renderer.threeRenderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );

        // Raycast to gizmo
        this.#raycaster.setFromCamera(mouse, this.#camera.threeCamera);
        const intersects = this.#raycaster.intersectObjects(this.#gizmoGroup.children, true);

        if (intersects.length > 0) {
            // Find which axis was clicked
            let object = intersects[0].object;
            while (object && !object.userData.axis) {
                object = object.parent;
            }

            if (object && object.userData.axis) {
                this.#selectedAxis = object.userData.axis;
                this.#isDragging = true;
                this.#mouseStart.copy(mouse);

                // Store initial transform
                this.#startPosition.copy(this.#attachedObject.position);
                this.#startRotation.copy(this.#attachedObject.rotation);
                this.#startScale.copy(this.#attachedObject.scale);

                // Trigger callback
                if (this.#onTransformStartCallback) {
                    this.#onTransformStartCallback({
                        object: this.#attachedObject,
                        mode: this.#mode,
                        axis: this.#selectedAxis,
                    });
                }

                // Emit event
                EventBus.publish('transformGizmo:transformStart', {
                    object: this.#attachedObject,
                    mode: this.#mode,
                    axis: this.#selectedAxis,
                });

                return true;
            }
        }

        return false;
    }

    /**
     * Handle mouse move for gizmo interaction
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        if (!this.#isDragging || !this.#attachedObject) {
            return;
        }

        // Get mouse position
        const rect = this.#renderer.threeRenderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );

        const delta = new THREE.Vector2().subVectors(mouse, this.#mouseStart);

        // Apply transform based on mode
        if (this.#mode === 'translate') {
            this.#applyTranslation(delta);
        } else if (this.#mode === 'rotate') {
            this.#applyRotation(delta);
        } else if (this.#mode === 'scale') {
            this.#applyScale(delta);
        }

        // Trigger callback
        if (this.#onTransformChangeCallback) {
            this.#onTransformChangeCallback({
                object: this.#attachedObject,
                mode: this.#mode,
                axis: this.#selectedAxis,
            });
        }

        // Emit event
        EventBus.publish('transformGizmo:transformChange', {
            object: this.#attachedObject,
            mode: this.#mode,
            axis: this.#selectedAxis,
        });
    }

    /**
     * Handle mouse up for gizmo interaction
     */
    handleMouseUp() {
        if (!this.#isDragging) {
            return;
        }

        this.#isDragging = false;
        this.#selectedAxis = null;

        // Trigger callback
        if (this.#onTransformEndCallback) {
            this.#onTransformEndCallback({
                object: this.#attachedObject,
                mode: this.#mode,
            });
        }

        // Emit event
        EventBus.publish('transformGizmo:transformEnd', {
            object: this.#attachedObject,
            mode: this.#mode,
        });
    }

    /**
     * Apply translation
     * @private
     */
    #applyTranslation(delta) {
        const sensitivity = 5;
        const offset = new THREE.Vector3();

        if (this.#selectedAxis === 'x') {
            offset.x = delta.x * sensitivity;
        } else if (this.#selectedAxis === 'y') {
            offset.y = delta.y * sensitivity;
        } else if (this.#selectedAxis === 'z') {
            offset.z = -delta.y * sensitivity;
        }

        this.#attachedObject.position = [
            this.#startPosition.x + offset.x,
            this.#startPosition.y + offset.y,
            this.#startPosition.z + offset.z,
        ];
    }

    /**
     * Apply rotation
     * @private
     */
    #applyRotation(delta) {
        const sensitivity = Math.PI * 2;
        const rotation = new THREE.Euler().copy(this.#startRotation);

        if (this.#selectedAxis === 'x') {
            rotation.x += delta.y * sensitivity;
        } else if (this.#selectedAxis === 'y') {
            rotation.y += delta.x * sensitivity;
        } else if (this.#selectedAxis === 'z') {
            rotation.z += delta.x * sensitivity;
        }

        this.#attachedObject.rotation = [rotation.x, rotation.y, rotation.z];
    }

    /**
     * Apply scale
     * @private
     */
    #applyScale(delta) {
        const sensitivity = 2;
        const scale = new THREE.Vector3().copy(this.#startScale);
        const scaleDelta = 1 + delta.y * sensitivity;

        if (this.#selectedAxis === 'x') {
            scale.x = Math.max(0.01, this.#startScale.x * scaleDelta);
        } else if (this.#selectedAxis === 'y') {
            scale.y = Math.max(0.01, this.#startScale.y * scaleDelta);
        } else if (this.#selectedAxis === 'z') {
            scale.z = Math.max(0.01, this.#startScale.z * scaleDelta);
        }

        this.#attachedObject.scale = [scale.x, scale.y, scale.z];
    }
}

export default TransformGizmo;
