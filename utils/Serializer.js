/**
 * Serializer utility class for KALYTHESAINZ framework
 * Handles scene-to-JSON serialization and JSON-to-scene deserialization
 */

import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

export class Serializer {
    /**
     * Serialize a scene to JSON format
     * @param {Scene} scene - Scene instance to serialize
     * @returns {object} Serialized scene data
     * @throws {Error} If scene is invalid or disposed
     */
    static serializeScene(scene) {
        if (!scene) {
            throw new Error('Scene is required for serialization');
        }

        if (scene.isDisposed) {
            throw new Error('Cannot serialize disposed scene');
        }

        try {
            const sceneData = {
                version: '1.0.0',
                metadata: {
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    author: 'kalythesainz-framework',
                    objectCount: scene.objects.size,
                    lightCount: scene.lights.length,
                },
                camera: Serializer.#serializeCamera(scene.camera),
                lights: scene.lights.map((light) => Serializer.#serializeLight(light)),
                objects: Array.from(scene.objects.values()).map((objectData) =>
                    Serializer.#serializeObject(objectData.object, objectData.id),
                ),
            };

            // Emit serialization event
            EventBus.publish('serializer:scene-serialized', {
                scene,
                data: sceneData,
                timestamp: Date.now(),
            });

            return sceneData;
        } catch (error) {
            // Emit error event
            EventBus.publish('serializer:serialization-error', {
                scene,
                error: error.message,
                timestamp: Date.now(),
            });
            throw new Error(`Scene serialization failed: ${error.message}`);
        }
    }

    /**
     * Deserialize scene from JSON data
     * @param {object} data - Serialized scene data
     * @param {Scene} targetScene - Scene instance to deserialize into
     * @throws {Error} If data is invalid or deserialization fails
     */
    static async deserializeScene(data, targetScene) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid scene data: must be a valid object');
        }

        if (!targetScene) {
            throw new Error('Target scene is required for deserialization');
        }

        if (targetScene.isDisposed) {
            throw new Error('Cannot deserialize to disposed scene');
        }

        try {
            // Validate data structure
            Serializer.#validateSceneData(data);

            // Clear existing scene
            targetScene.clear(true);

            // Deserialize camera if present
            if (data.camera) {
                Serializer.#deserializeCamera(data.camera, targetScene);
            }

            // Deserialize lights
            if (data.lights && Array.isArray(data.lights)) {
                for (const lightData of data.lights) {
                    const light = await Serializer.#deserializeLight(lightData);
                    if (light) {
                        targetScene.addLight(light);
                    }
                }
            }

            // Deserialize objects
            if (data.objects && Array.isArray(data.objects)) {
                for (const objectData of data.objects) {
                    const object = await Serializer.#deserializeObject(objectData);
                    if (object) {
                        targetScene.add(object, objectData.id);
                    }
                }
            }

            // Emit deserialization event
            EventBus.publish('serializer:scene-deserialized', {
                scene: targetScene,
                data,
                timestamp: Date.now(),
            });
        } catch (error) {
            // Emit error event
            EventBus.publish('serializer:deserialization-error', {
                scene: targetScene,
                data,
                error: error.message,
                timestamp: Date.now(),
            });
            throw new Error(`Scene deserialization failed: ${error.message}`);
        }
    }

    /**
     * Serialize an individual object
     * @param {object} object - Object to serialize
     * @returns {object} Serialized object data
     */
    static serializeObject(object) {
        if (!object) {
            throw new Error('Object is required for serialization');
        }

        try {
            // Use object's serialize method if available
            if (typeof object.serialize === 'function') {
                return object.serialize();
            }

            // Fallback serialization for objects without serialize method
            return Serializer.#serializeObject(object);
        } catch (error) {
            throw new Error(`Object serialization failed: ${error.message}`);
        }
    }

    /**
     * Deserialize an individual object
     * @param {object} data - Serialized object data
     * @returns {object} Deserialized object
     */
    static async deserializeObject(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid object data: must be a valid object');
        }

        try {
            return await Serializer.#deserializeObject(data);
        } catch (error) {
            throw new Error(`Object deserialization failed: ${error.message}`);
        }
    }

    /**
     * Validate scene data structure
     * @private
     */
    static #validateSceneData(data) {
        if (!data.version) {
            throw new Error('Missing version in scene data');
        }

        if (data.objects && !Array.isArray(data.objects)) {
            throw new Error('Objects must be an array');
        }

        if (data.lights && !Array.isArray(data.lights)) {
            throw new Error('Lights must be an array');
        }

        if (data.camera && typeof data.camera !== 'object') {
            throw new Error('Camera data must be an object');
        }

        if (data.metadata && typeof data.metadata !== 'object') {
            throw new Error('Metadata must be an object');
        }
    }

    /**
     * Serialize camera data
     * @private
     */
    static #serializeCamera(camera) {
        if (!camera) {
            return null;
        }

        try {
            const cameraData = {
                type: camera.type,
                position: camera.position.toArray(),
                rotation: [
                    camera.threeCamera.rotation.x,
                    camera.threeCamera.rotation.y,
                    camera.threeCamera.rotation.z,
                ],
            };

            if (camera.type === 'perspective') {
                cameraData.fov = camera.threeCamera.fov;
                cameraData.aspect = camera.threeCamera.aspect;
                cameraData.near = camera.threeCamera.near;
                cameraData.far = camera.threeCamera.far;
            } else if (camera.type === 'orthographic') {
                cameraData.left = camera.threeCamera.left;
                cameraData.right = camera.threeCamera.right;
                cameraData.top = camera.threeCamera.top;
                cameraData.bottom = camera.threeCamera.bottom;
                cameraData.near = camera.threeCamera.near;
                cameraData.far = camera.threeCamera.far;
            }

            return cameraData;
        } catch (error) {
            console.warn('Failed to serialize camera:', error.message);
            return null;
        }
    }

    /**
     * Deserialize camera data
     * @private
     */
    static #deserializeCamera(cameraData, scene) {
        if (!cameraData || !scene.camera) {
            return;
        }

        try {
            // Update camera position
            if (cameraData.position && Array.isArray(cameraData.position)) {
                scene.camera.setPosition(
                    cameraData.position[0],
                    cameraData.position[1],
                    cameraData.position[2],
                );
            }

            // Update camera rotation
            if (cameraData.rotation && Array.isArray(cameraData.rotation)) {
                scene.camera.threeCamera.rotation.set(
                    cameraData.rotation[0],
                    cameraData.rotation[1],
                    cameraData.rotation[2],
                );
            }

            // Update camera-specific properties
            if (cameraData.type === 'perspective' && scene.camera.type === 'perspective') {
                if (typeof cameraData.fov === 'number') {
                    scene.camera.setFov(cameraData.fov);
                }
                if (typeof cameraData.aspect === 'number') {
                    scene.camera.setAspect(cameraData.aspect);
                }
                if (typeof cameraData.near === 'number' && typeof cameraData.far === 'number') {
                    scene.camera.setClippingPlanes(cameraData.near, cameraData.far);
                }
            }
        } catch (error) {
            console.warn('Failed to deserialize camera:', error.message);
        }
    }

    /**
     * Serialize light data
     * @private
     */
    static #serializeLight(light) {
        if (!light || !light.threeLight) {
            return null;
        }

        try {
            const lightData = {
                type: light.type,
                intensity: light.threeLight.intensity,
                color: light.threeLight.color.getHex(),
            };

            // Add position for positional lights
            if (light.threeLight.position) {
                lightData.position = light.threeLight.position.toArray();
            }

            // Add target for directional and spot lights
            if (light.threeLight.target && light.threeLight.target.position) {
                lightData.target = light.threeLight.target.position.toArray();
            }

            // Add spot light specific properties
            if (light.type === 'spot') {
                lightData.distance = light.threeLight.distance;
                lightData.angle = light.threeLight.angle;
                lightData.penumbra = light.threeLight.penumbra;
                lightData.decay = light.threeLight.decay;
            }

            // Add point light specific properties
            if (light.type === 'point') {
                lightData.distance = light.threeLight.distance;
                lightData.decay = light.threeLight.decay;
            }

            // Add hemisphere light specific properties
            if (light.type === 'hemisphere') {
                lightData.groundColor = light.threeLight.groundColor.getHex();
            }

            // Add shadow information
            if (light.threeLight.castShadow !== undefined) {
                lightData.castShadow = light.threeLight.castShadow;
            }

            return lightData;
        } catch (error) {
            console.warn('Failed to serialize light:', error.message);
            return null;
        }
    }

    /**
     * Deserialize light data
     * @private
     */
    static async #deserializeLight(lightData) {
        if (!lightData || !lightData.type) {
            return null;
        }

        try {
            // Import Light class dynamically to avoid circular imports
            const { Light } = await import('../engine/Light.js');

            let light;

            switch (lightData.type) {
                case 'directional':
                    light = Light.sun({
                        intensity: lightData.intensity || 1,
                        color: lightData.color || 0xffffff,
                        position: lightData.position || [10, 10, 5],
                        target: lightData.target || [0, 0, 0],
                        castShadow: lightData.castShadow || false,
                    });
                    break;

                case 'ambient':
                    light = Light.ambient({
                        intensity: lightData.intensity || 0.4,
                        color: lightData.color || 0xffffff,
                    });
                    break;

                case 'point':
                    const pos = lightData.position || [0, 5, 0];
                    light = Light.point(pos[0], pos[1], pos[2], {
                        intensity: lightData.intensity || 1,
                        color: lightData.color || 0xffffff,
                        distance: lightData.distance || 0,
                        decay: lightData.decay || 2,
                        castShadow: lightData.castShadow || false,
                    });
                    break;

                case 'spot':
                    light = Light.spot({
                        x: lightData.position ? lightData.position[0] : 0,
                        y: lightData.position ? lightData.position[1] : 10,
                        z: lightData.position ? lightData.position[2] : 0,
                        target: lightData.target || [0, 0, 0],
                        intensity: lightData.intensity || 1,
                        color: lightData.color || 0xffffff,
                        distance: lightData.distance || 0,
                        angle: lightData.angle || Math.PI / 3,
                        penumbra: lightData.penumbra || 0,
                        decay: lightData.decay || 2,
                        castShadow: lightData.castShadow || true,
                    });
                    break;

                case 'hemisphere':
                    light = Light.hemisphere({
                        skyColor: lightData.color || 0xffffbb,
                        groundColor: lightData.groundColor || 0x080820,
                        intensity: lightData.intensity || 1,
                    });
                    break;

                default:
                    console.warn(`Unknown light type: ${lightData.type}`);
                    return null;
            }

            return light;
        } catch (error) {
            console.warn('Failed to deserialize light:', error.message);
            return null;
        }
    }

    /**
     * Serialize object data
     * @private
     */
    static #serializeObject(object, objectId = null) {
        if (!object) {
            return null;
        }

        try {
            // Use object's serialize method if available
            if (typeof object.serialize === 'function') {
                const serialized = object.serialize();
                if (objectId) {
                    serialized.id = objectId;
                }
                return serialized;
            }

            // Fallback serialization for objects without serialize method
            const objectData = {
                id: objectId || object.id || object.uuid || 'unknown',
                type: object.constructor.name,
                name: object.name || 'Unnamed Object',
                visible: object.visible !== undefined ? object.visible : true,
                locked: object.locked !== undefined ? object.locked : false,
                tags: object.tags || [],
                userData: object.userData || {},
            };

            // Add transform data
            if (object.threeMesh || object.threeObject) {
                const threeObj = object.threeMesh || object.threeObject;
                objectData.transform = {
                    position: threeObj.position.toArray(),
                    rotation: [threeObj.rotation.x, threeObj.rotation.y, threeObj.rotation.z],
                    scale: threeObj.scale.toArray(),
                };
            }

            // Add geometry data if available
            if (object.threeMesh && object.threeMesh.geometry) {
                objectData.geometry = {
                    type: object.threeMesh.geometry.constructor.name,
                    // Add basic geometry parameters - this could be expanded
                };
            }

            // Add material data if available
            if (object.threeMesh && object.threeMesh.material) {
                const material = object.threeMesh.material;
                objectData.material = {
                    type: material.constructor.name,
                    color: material.color ? material.color.getHex() : 0xffffff,
                    opacity: material.opacity !== undefined ? material.opacity : 1,
                    transparent: material.transparent || false,
                };

                // Add material-specific properties
                if (material.metalness !== undefined)
                    objectData.material.metalness = material.metalness;
                if (material.roughness !== undefined)
                    objectData.material.roughness = material.roughness;
                if (material.emissive) objectData.material.emissive = material.emissive.getHex();
                if (material.wireframe !== undefined)
                    objectData.material.wireframe = material.wireframe;
            }

            return objectData;
        } catch (error) {
            console.warn('Failed to serialize object:', error.message);
            return null;
        }
    }

    /**
     * Deserialize object data
     * @private
     */
    static async #deserializeObject(objectData) {
        if (!objectData || !objectData.type) {
            return null;
        }

        try {
            let object;

            // Try to deserialize using specific object classes
            switch (objectData.type) {
                case 'Box':
                    const { Box } = await import('../objects/Box.js');
                    object = Box.deserialize(objectData);
                    break;

                case 'Sphere':
                    const { Sphere } = await import('../objects/Sphere.js');
                    object = Sphere.deserialize(objectData);
                    break;

                case 'Plane':
                    const { Plane } = await import('../objects/Plane.js');
                    object = Plane.deserialize(objectData);
                    break;

                default:
                    // Try to deserialize as generic Object3D
                    const { Object3D } = await import('../engine/Object3D.js');
                    if (Object3D.deserialize) {
                        object = Object3D.deserialize(objectData);
                    } else {
                        console.warn(`Cannot deserialize unknown object type: ${objectData.type}`);
                        return null;
                    }
                    break;
            }

            return object;
        } catch (error) {
            console.warn('Failed to deserialize object:', error.message);
            return null;
        }
    }

    /**
     * Create a deep copy of serializable data
     * @param {object} data - Data to copy
     * @returns {object} Deep copy of data
     */
    static deepCopy(data) {
        if (data === null || typeof data !== 'object') {
            return data;
        }

        if (data instanceof Date) {
            return new Date(data.getTime());
        }

        if (Array.isArray(data)) {
            return data.map((item) => Serializer.deepCopy(item));
        }

        const copy = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                copy[key] = Serializer.deepCopy(data[key]);
            }
        }

        return copy;
    }

    /**
     * Validate serialized data integrity
     * @param {object} data - Data to validate
     * @returns {boolean} True if data is valid
     */
    static validateData(data) {
        try {
            if (!data || typeof data !== 'object') {
                return false;
            }

            // Check required fields
            if (!data.version || !data.metadata) {
                return false;
            }

            // Validate objects array
            if (data.objects && !Array.isArray(data.objects)) {
                return false;
            }

            // Validate lights array
            if (data.lights && !Array.isArray(data.lights)) {
                return false;
            }

            // Validate each object
            if (data.objects) {
                for (const obj of data.objects) {
                    if (!obj.id || !obj.type) {
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}

export default Serializer;
