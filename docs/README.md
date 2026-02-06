# KALYTHESAINZ Documentation

Welcome to the KALYTHESAINZ framework documentation! This directory contains comprehensive guides and references to help you build 3D web applications.

## 📚 Documentation Index

### For Beginners

- **[Getting Started Guide](GETTING_STARTED.md)** - Your first steps with KALYTHESAINZ
    - Installation via CDN
    - Creating your first scene
    - Adding interactivity
    - Using visual tools
    - Saving and loading scenes

### For Developers

- **[API Documentation](API.md)** - Complete API reference
    - Core Layer (App, Config, EventBus)
    - Engine Layer (Scene, Camera, Light, Renderer)
    - Objects Layer (Box, Sphere, Plane, Object3D)
    - Tools Layer (Inspector, SceneTree, TransformGizmo)
    - Utils Layer (Serializer, ThreeJsIntegration)
    - Code examples for every API

- **[Plugin System](PLUGIN_SYSTEM.md)** - Extend the framework
    - Creating custom objects
    - Creating custom tools
    - Creating custom modules
    - Plugin lifecycle and dependencies

### For Troubleshooting

- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solutions to common issues
    - Installation & setup issues
    - Scene rendering problems
    - Object creation issues
    - Event system debugging
    - Serialization problems
    - Performance optimization
    - Browser compatibility

## 🎯 Quick Links

### By Use Case

**I want to...**

- **Get started quickly** → [Getting Started Guide](GETTING_STARTED.md)
- **Look up an API** → [API Documentation](API.md)
- **See working examples** → [Examples Directory](../examples/)
- **Extend the framework** → [Plugin System](PLUGIN_SYSTEM.md)
- **Fix an issue** → [Troubleshooting Guide](TROUBLESHOOTING.md)

### By Topic

**Core Concepts**

- Scene initialization → [Getting Started](GETTING_STARTED.md#your-first-scene)
- Object creation → [API: Objects Layer](API.md#objects-layer)
- Event system → [API: EventBus](API.md#eventbus)
- Serialization → [API: Serializer](API.md#serializer)

**Visual Tools**

- Scene Tree → [API: SceneTree](API.md#scenetree)
- Inspector → [API: Inspector](API.md#inspector)
- Transform Gizmo → [API: TransformGizmo](API.md#transformgizmo)

**Advanced Topics**

- Three.js integration → [API: ThreeJsIntegration](API.md#threejsintegration)
- Plugin development → [Plugin System](PLUGIN_SYSTEM.md)
- Performance optimization → [Troubleshooting: Performance](TROUBLESHOOTING.md#performance-issues)

## 📖 Learning Path

### Beginner Path (30 minutes)

1. Read [Getting Started Guide](GETTING_STARTED.md) (15 min)
2. Try [CDN Quick Start Example](../examples/cdn-quickstart.html) (5 min)
3. Experiment with [Complete Demo](../examples/complete-demo.html) (10 min)

### Intermediate Path (1-2 hours)

1. Complete Beginner Path
2. Study [API Documentation](API.md) - Core and Engine layers (30 min)
3. Build a simple project using the framework (30-60 min)
4. Explore [Advanced Features Example](../examples/advanced-features.html) (15 min)

### Advanced Path (2-4 hours)

1. Complete Intermediate Path
2. Study [API Documentation](API.md) - Tools and Utils layers (30 min)
3. Read [Plugin System Guide](PLUGIN_SYSTEM.md) (30 min)
4. Try [Plugin Example](../examples/plugin-example.js) (15 min)
5. Build a custom plugin for your use case (1-2 hours)

## 🎨 Examples

All examples are located in the [examples directory](../examples/):

- **complete-demo.html** - Full-featured application showcasing all framework features
- **cdn-quickstart.html** - Minimal setup demonstrating CDN usage
- **advanced-features.html** - Events, serialization, and Three.js integration
- **plugin-example.js** - Creating custom objects, tools, and modules

## 🔧 Development

### Running Examples Locally

```bash
# Start a local server
python -m http.server 8000

# Or use Node.js
npx http-server

# Open in browser
open http://localhost:8000/examples/complete-demo.html
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/unit/core/EventBus.test.js
```

## 🤝 Contributing

Found an issue in the documentation? Want to add examples?

1. Check existing documentation for similar content
2. Follow the existing documentation style
3. Include code examples where appropriate
4. Test all code examples before submitting
5. Update this index if adding new documentation files

## 📝 Documentation Style Guide

When contributing to documentation:

- Use clear, concise language
- Include working code examples
- Show both correct (✅) and incorrect (❌) usage
- Add comments to explain complex concepts
- Link to related documentation
- Keep examples minimal and focused

## 🆘 Getting Help

If you can't find what you're looking for:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Search the [API Documentation](API.md)
3. Look at [working examples](../examples/)
4. Open an issue on GitHub

## 📄 License

This documentation is part of the KALYTHESAINZ framework and is licensed under the MIT License.

---

**Happy coding!** 🎨✨
