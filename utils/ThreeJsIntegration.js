/**
 * ThreeJsIntegration utility for KALYTHESAINZ framework
 * Provides conflict resolution and synchronization for mixed usage patterns
 */

import { EventBus } from '../core/EventBus.js';

export class ThreeJsIntegration {
    /**
     * Wrap a Three.js object with framework tracking
     * Allows seamless integration of direct Three.js objects
     * @param {THREE.Object3D} threeObject - Three.js object to wrap
     * @param {object} frameworkWrapper - Optional framework wrapper object
     * @returns {THREE.Object3D} The same Three.js object with tracking metadata
     */
    static wrapThreeObject(threeObject, frameworkWrapper = null) {
        if (!threeObject) {
            throw new Error('Three.js object is required');
        }

        // Add framework metadata
        threeObject.userData._kalythesainzTracked = true;
        threeObject.userData._kalythesainzWrapper = frameworkWrapper;
        threeObject.userData._kalythesainzTimestamp = Date.now();

        return threeObject;
    }

    /**
     * Check if a Three.js object is tracked by the framework
     * @param {THREE.Object3D} threeObject - Three.js object to check
     * @returns {boolean} True if tracked
     */
    static isTracked(threeObject) {
        return threeObject?.userData?._kalythesainzTracked === true;
    }

    /**
     * Get framework wrapper for a Three.js object
     * @param {THREE.Object3D} threeObject - Three.js object
     * @returns {object|null} Framework wrapper or null
     */
    static getWrapper(threeObject) {
        return threeObject?.userData?._kalythesainzWrapper || null;
    }

    /**
     * Detect conflicts between framework and direct Three.js manipulation
     * @param {object} frameworkObject - Framework object
     * @returns {object} Conflict report
     */
    static detectConflicts(frameworkObject) {
        if (!frameworkObject || !frameworkObject.threeMesh) {
            return { hasConflicts: false, conflicts: [] };
        }

        const conflicts = [];
        const threeMesh = frameworkObject.threeMesh;

        // Check if Three.js object was modified directly
        const lastModified = threeMesh.userData._kalythesainzLastModified || 0;
        const lastSynced = threeMesh.userData._kalythesainzLastSynced || 0;

        if (lastModified > lastSynced) {
            conflicts.push({
                type: 'unsyncedModification',
                message: 'Three.js object was modified without syncing',
                timestamp: lastModified,
            });
        }

        // Check for property mismatches
        if (frameworkObject.visible !== threeMesh.visible) {
            conflicts.push({
                type: 'visibilityMismatch',
                message: 'Visibility state differs between framework and Three.js',
                framework: frameworkObject.visible,
                threejs: threeMesh.visible,
            });
        }

        return {
            hasConflicts: conflicts.length > 0,
            conflicts,
        };
    }

    /**
     * Resolve conflicts by syncing from Three.js to framework
     * @param {object} frameworkObject - Framework object
     * @returns {object} Resolution report
     */
    static resolveConflicts(frameworkObject) {
        if (!frameworkObject || typeof frameworkObject.syncFromThree !== 'function') {
            throw new Error('Framework object must have syncFromThree method');
        }

        const conflicts = ThreeJsIntegration.detectConflicts(frameworkObject);

        if (!conflicts.hasConflicts) {
            return {
                resolved: false,
                message: 'No conflicts to resolve',
            };
        }

        // Sync from Three.js
        const syncResult = frameworkObject.syncFromThree();

        // Mark as synced
        if (frameworkObject.threeMesh) {
            frameworkObject.threeMesh.userData._kalythesainzLastSynced = Date.now();
        }

        // Emit resolution event
        EventBus.publish('threejs:conflictsResolved', {
            object: frameworkObject,
            conflicts: conflicts.conflicts,
            syncResult,
            timestamp: Date.now(),
        });

        return {
            resolved: true,
            conflictsResolved: conflicts.conflicts.length,
            syncResult,
        };
    }

    /**
     * Enable automatic conflict detection and resolution
     * @param {object} frameworkObject - Framework object
     * @param {number} interval - Check interval in milliseconds (default: 100)
     * @returns {Function} Cleanup function to stop auto-resolution
     */
    static enableAutoResolve(frameworkObject, interval = 100) {
        if (!frameworkObject) {
            throw new Error('Framework object is required');
        }

        const intervalId = setInterval(() => {
            const conflicts = ThreeJsIntegration.detectConflicts(frameworkObject);
            if (conflicts.hasConflicts) {
                ThreeJsIntegration.resolveConflicts(frameworkObject);
            }
        }, interval);

        // Return cleanup function
        return () => clearInterval(intervalId);
    }

    /**
     * Create a proxy for safe direct Three.js manipulation
     * Automatically tracks modifications for conflict detection
     * @param {THREE.Object3D} threeObject - Three.js object
     * @returns {Proxy} Proxied Three.js object
     */
    static createSafeProxy(threeObject) {
        if (!threeObject) {
            throw new Error('Three.js object is required');
        }

        return new Proxy(threeObject, {
            set(target, property, value) {
                // Track modification
                target.userData._kalythesainzLastModified = Date.now();

                // Set the value
                target[property] = value;

                // Emit modification event
                EventBus.publish('threejs:directModification', {
                    object: target,
                    property,
                    value,
                    timestamp: Date.now(),
                });

                return true;
            },
        });
    }

    /**
     * Batch sync multiple framework objects
     * Useful for syncing entire scenes after direct Three.js manipulation
     * @param {Array} frameworkObjects - Array of framework objects
     * @returns {object} Batch sync report
     */
    static batchSync(frameworkObjects) {
        if (!Array.isArray(frameworkObjects)) {
            throw new Error('frameworkObjects must be an array');
        }

        const report = {
            total: frameworkObjects.length,
            synced: 0,
            failed: 0,
            errors: [],
        };

        for (const obj of frameworkObjects) {
            try {
                if (obj && typeof obj.syncFromThree === 'function') {
                    obj.syncFromThree();
                    report.synced++;
                }
            } catch (error) {
                report.failed++;
                report.errors.push({
                    object: obj,
                    error: error.message,
                });
            }
        }

        // Emit batch sync event
        EventBus.publish('threejs:batchSynced', {
            report,
            timestamp: Date.now(),
        });

        return report;
    }

    /**
     * Validate Three.js integration setup
     * Checks if all framework objects have proper Three.js access
     * @param {object} scene - Scene instance
     * @returns {object} Validation report
     */
    static validateIntegration(scene) {
        const report = {
            valid: true,
            issues: [],
            objects: 0,
        };

        if (!scene || !scene.objects) {
            report.valid = false;
            report.issues.push('Invalid scene object');
            return report;
        }

        // Check all objects
        for (const [objectId, objectData] of scene.objects) {
            report.objects++;

            const obj = objectData.object;

            // Check if object has Three.js access
            if (!obj.threeMesh && !obj.threeObject) {
                report.valid = false;
                report.issues.push({
                    objectId,
                    issue: 'Missing Three.js object access',
                });
            }

            // Check if syncFromThree method exists
            if (typeof obj.syncFromThree !== 'function') {
                report.valid = false;
                report.issues.push({
                    objectId,
                    issue: 'Missing syncFromThree method',
                });
            }
        }

        return report;
    }

    /**
     * Create integration guide for developers
     * Returns best practices and usage patterns
     * @returns {object} Integration guide
     */
    static getIntegrationGuide() {
        return {
            bestPractices: [
                'Always call syncFromThree() after direct Three.js manipulation',
                'Use setAutoSync() for continuous synchronization in mixed usage scenarios',
                'Prefer framework methods over direct Three.js access when possible',
                'Use ThreeJsIntegration.wrapThreeObject() when adding raw Three.js objects',
                'Enable conflict detection in development mode',
            ],
            usagePatterns: {
                directAccess: {
                    description: 'Access underlying Three.js object for advanced features',
                    example: `
const box = Box.create();
const threeMesh = box.threeMesh;
threeMesh.castShadow = true;
box.syncFromThree(); // Sync after modification
                    `.trim(),
                },
                mixedUsage: {
                    description: 'Mix framework and Three.js APIs safely',
                    example: `
const box = Box.create();
box.setAutoSync(true); // Enable auto-sync
box.threeMesh.material.wireframe = true; // Direct Three.js
box.position = [1, 2, 3]; // Framework API
                    `.trim(),
                },
                conflictResolution: {
                    description: 'Detect and resolve conflicts',
                    example: `
const conflicts = ThreeJsIntegration.detectConflicts(box);
if (conflicts.hasConflicts) {
    ThreeJsIntegration.resolveConflicts(box);
}
                    `.trim(),
                },
            },
            commonPitfalls: [
                'Forgetting to sync after direct manipulation',
                'Modifying Three.js objects without framework awareness',
                'Not handling conflicts in mixed usage scenarios',
                'Disposing Three.js objects without framework cleanup',
            ],
        };
    }
}

export default ThreeJsIntegration;
