# KALYTHESAINZ Framework Design Document

## Overview

KALYTHESAINZ is a web-based 3D framework that serves as an abstraction layer over Three.js, providing a declarative API and visual tooling for creating and managing 3D scenes. The framework follows a layered architecture pattern with clear separation of concerns between core lifecycle management, 3D engine operations, and visual editing tools.

The framework aims to simplify 3D web development by providing:

- Declarative API for scene and object creation
- Visual tools for scene inspection and editing
- JSON-based scene serialization
- Event-driven architecture for loose coupling
- Direct access to underlying Three.js when needed

## Architecture

### System Architecture Overview

The framework follows a layered architecture with four distinct layers:

```
┌─────────────────────────────────────────┐
│              Tools Layer                │
│    (Inspector, Scene Tree, Gizmos)      │
├─────────────────────────────────────────┤
│             Objects Layer               │
│        (Box, Sphere, Plane)            │
├─────────────────────────────────────────┤
│             Engine Layer                │
│  (Scene, Renderer, Camera, Light)      │
├─────────────────────────────────────────┤
│              Core Layer                 │
│     (App, Config, EventBus)            │
└─────────────────────────────────────────┘
                    │
            ┌───────▼───────┐
            │   Three.js    │
            └───────────────┘
```

### Layer Responsibilities

**Core Layer**: Application lifecycle, configuration management, and inter-module communication
**Engine Layer**: 3D scene management, rendering, camera control, and lighting
**Objects Layer**: 3D primitive objects with simplified interfaces
**Tools Layer**: Visual editing and debugging tools

## Components and Interfaces

### Core Layer Components

#### App

```javascript
class App {
  static init(config = {})
  static getInstance()
  static destroy()

  // Event delegation
  on(event, callback)
  off(event, callback)
  emit(event, data)
}
```

#### Config

```javascript
class Config {
  static defaults = {
    renderer: { antialias: true, alpha: false },
    camera: { fov: 75, near: 0.1, far: 1000 },
    scene: { background: 0x222222 }
  }

  static get(key)
  static set(key, value)
  static merge(config)
}
```

#### EventBus

```javascript
class EventBus {
  static subscribe(event, callback)
  static unsubscribe(event, callback)
  static publish(event, data)
  static clear()
}
```

### Engine Layer Components

#### Scene

```javascript
class Scene {
  static init(containerId, config = {})
  static getInstance()
  static add(object)
  static remove(object)
  static find(id)
  static clear()
  static serialize()
  static deserialize(data)
}
```

#### Renderer

```javascript
class Renderer {
  constructor(config = {})

  setSize(width, height)
  render(scene, camera)
  dispose()

  // Direct Three.js access
  get threeRenderer()
}
```

#### Camera

```javascript
class Camera {
  constructor(type = 'perspective', config = {})

  setPosition(x, y, z)
  lookAt(x, y, z)
  setFov(fov)

  // Presets
  static topView()
  static frontView()
  static isometric()

  // Direct Three.js access
  get threeCamera()
}
```

#### Light

```javascript
class Light {
  static sun(intensity = 1, color = 0xffffff)
  static ambient(intensity = 0.4, color = 0xffffff)
  static point(x, y, z, intensity = 1, color = 0xffffff)
  static spot(x, y, z, target, intensity = 1, color = 0xffffff)
}
```

### Objects Layer Components

#### Object3D (Base Class)

```javascript
class Object3D {
  constructor(geometry, material)

  // Transform properties
  get position()
  set position(value)
  get rotation()
  set rotation(value)
  get scale()
  set scale(value)

  // Metadata
  get id()
  get name()
  set name(value)

  // Lifecycle
  dispose()
  clone()

  // Serialization
  serialize()
  static deserialize(data)

  // Direct Three.js access
  get threeMesh()
}
```

#### Primitive Objects

```javascript
class Box extends Object3D {
  static create(width = 1, height = 1, depth = 1, material = null)
}

class Sphere extends Object3D {
  static create(radius = 1, segments = 32, material = null)
}

class Plane extends Object3D {
  static create(width = 1, height = 1, material = null)
}
```

### Tools Layer Components

#### Inspector

```javascript
class Inspector {
  constructor(containerId)

  show(object)
  hide()
  refresh()

  // Property editing
  onPropertyChange(callback)
}
```

#### SceneTree

```javascript
class SceneTree {
  constructor(containerId)

  refresh()
  selectObject(id)

  // Events
  onObjectSelect(callback)
  onObjectVisibilityToggle(callback)
}
```

#### TransformGizmo

```javascript
class TransformGizmo {
  constructor(camera, renderer)

  attach(object)
  detach()
  setMode('translate' | 'rotate' | 'scale')

  // Events
  onTransformStart(callback)
  onTransformChange(callback)
  onTransformEnd(callback)
}
```

## Data Models

### Scene Data Model

```json
{
    "version": "1.0.0",
    "metadata": {
        "created": "2024-01-01T00:00:00Z",
        "modified": "2024-01-01T00:00:00Z",
        "author": "developer"
    },
    "camera": {
        "type": "perspective",
        "position": [0, 5, 10],
        "rotation": [0, 0, 0],
        "fov": 75
    },
    "lights": [
        {
            "type": "directional",
            "position": [10, 10, 5],
            "intensity": 1,
            "color": "#ffffff"
        }
    ],
    "objects": [
        {
            "id": "obj_001",
            "type": "Box",
            "name": "My Box",
            "transform": {
                "position": [0, 0, 0],
                "rotation": [0, 0, 0],
                "scale": [1, 1, 1]
            },
            "geometry": {
                "width": 1,
                "height": 1,
                "depth": 1
            },
            "material": {
                "type": "MeshStandardMaterial",
                "color": "#ff0000",
                "metalness": 0.5,
                "roughness": 0.5
            }
        }
    ]
}
```

### Object Metadata Model

```javascript
{
  id: string,           // Unique identifier
  name: string,         // Display name
  type: string,         // Object type (Box, Sphere, etc.)
  visible: boolean,     // Visibility state
  locked: boolean,      // Edit lock state
  tags: string[],       // Custom tags
  userData: object      // Custom user data
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Object creation properties (2.1, 2.2) can be combined into a comprehensive object creation property
- Visual update properties (2.3, 4.3) can be unified as they test the same real-time update behavior
- Event emission properties (7.1, 7.2, 7.3) can be consolidated into a comprehensive event system property
- Three.js access properties (8.1, 8.2, 8.3, 8.4) can be combined into a unified Three.js integration property

### Core Properties

**Property 1: Object creation completeness**
_For any_ valid object type and parameters, creating an object should result in a properly configured object with all required transform properties (position, rotation, scale) and metadata, added to the scene
**Validates: Requirements 2.1, 2.2**

**Property 2: Real-time visual updates**
_For any_ object property modification, the visual representation should update immediately and consistently across all visual interfaces (3D viewport, inspector, scene tree)
**Validates: Requirements 2.3, 4.3**

**Property 3: Resource cleanup consistency**
_For any_ object removal operation, all associated resources, references, and visual representations should be completely cleaned up without memory leaks
**Validates: Requirements 2.4**

**Property 4: Scene serialization round-trip**
_For any_ valid scene configuration, serializing then deserializing should produce an equivalent scene with identical object properties, transforms, and metadata
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 5: Visual tools synchronization**
_For any_ scene state change, all visual tools (scene tree, inspector, gizmos) should reflect the current state accurately and consistently
**Validates: Requirements 4.1, 4.2, 4.4**

**Property 6: Lighting preset consistency**
_For any_ lighting preset application, lights should be positioned optimally without conflicts, and multiple presets should work together harmoniously
**Validates: Requirements 5.2, 5.3**

**Property 7: Module integration stability**
_For any_ new module integration through defined interfaces, existing functionality should remain unaffected and continue operating correctly
**Validates: Requirements 6.4**

**Property 8: Event system reliability**
_For any_ object operation (create, modify, delete), appropriate events should be emitted, and all registered handlers should be invoked correctly
**Validates: Requirements 7.1, 7.2, 7.3**

**Property 9: Three.js integration consistency**
_For any_ framework object, direct access to underlying Three.js objects should be available, and direct manipulations should maintain framework state synchronization
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

## Error Handling

### Error Categories

**Initialization Errors**

- Invalid container element
- WebGL not supported
- Configuration validation failures
- Resource loading failures

**Runtime Errors**

- Object creation with invalid parameters
- Property assignment type mismatches
- Scene serialization/deserialization failures
- Event handler execution errors

**Integration Errors**

- Three.js version compatibility issues
- Direct manipulation conflicts
- Memory management failures
- Performance threshold violations

### Error Handling Strategy

**Graceful Degradation**

- Provide fallback options when advanced features fail
- Maintain core functionality even when optional features fail
- Clear error messages with suggested solutions

**Error Recovery**

- Automatic cleanup of failed operations
- State restoration after errors
- Event system isolation to prevent cascading failures

**Developer Feedback**

- Detailed error messages with context
- Stack traces in development mode
- Performance warnings for optimization opportunities

## Testing Strategy

### Dual Testing Approach

The framework will employ both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
**Property Tests**: Verify universal properties that should hold across all inputs

Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness.

### Property-Based Testing Requirements

**Testing Library**: fast-check (JavaScript property-based testing library)
**Test Configuration**: Minimum 100 iterations per property test
**Property Tagging**: Each property-based test must include a comment with the format: `**Feature: kalythesainz-framework, Property {number}: {property_text}**`

### Unit Testing Strategy

Unit tests will focus on:

- Specific API usage examples
- Edge cases (empty scenes, invalid parameters)
- Error condition handling
- Integration points between layers
- Browser compatibility scenarios

### Property-Based Testing Strategy

Property tests will verify:

- Object creation and manipulation across all valid inputs
- Serialization round-trip consistency
- Event system reliability
- Visual tool synchronization
- Three.js integration consistency

### Test Organization

```
tests/
├── unit/
│   ├── core/
│   ├── engine/
│   ├── objects/
│   └── tools/
├── properties/
│   ├── object-creation.test.js
│   ├── serialization.test.js
│   ├── event-system.test.js
│   └── visual-tools.test.js
└── integration/
    ├── scene-lifecycle.test.js
    └── tool-integration.test.js
```

## Implementation Considerations

### Performance Optimization

**Object Pooling**: Reuse geometry and material instances for common objects
**Event Batching**: Batch multiple property changes into single update cycles
**Lazy Loading**: Load visual tools only when needed
**Memory Management**: Automatic cleanup of disposed objects and unused resources

### Browser Compatibility

**Target Browsers**: Modern browsers with WebGL support (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
**Fallback Strategy**: Graceful degradation for older browsers with clear messaging
**Feature Detection**: Runtime detection of WebGL capabilities and extensions

### Development Workflow

**ESM-First Architecture**: Native ES modules for modern browser compatibility
**CDN Distribution**: Framework available via CDN without npm installation
**Hot Reloading**: Support for development-time scene updates
**Debug Mode**: Enhanced logging and validation in development builds
**Performance Monitoring**: Built-in performance metrics and warnings
**Documentation**: Comprehensive API documentation with interactive examples

### CDN and ESM Distribution

**Import Pattern**:

```javascript
// Direct CDN import
import {
    Scene,
    Box,
    Light,
} from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

// With import maps
import { Scene, Box, Light } from 'kalythesainz';
```

**Dependency Management**: Three.js loaded automatically as external dependency
**Browser Support**: Modern browsers with native ES module support
**Build Output**: Both minified and development versions available
**Source Maps**: Available for debugging in development

### Extensibility Architecture

**Plugin System**: Well-defined interfaces for extending functionality
**Custom Objects**: Base classes for creating custom 3D objects
**Tool Extensions**: Interfaces for adding custom visual tools
**Event Hooks**: Extensible event system for custom behaviors
