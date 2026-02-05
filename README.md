# KALYTHESAINZ Framework

A simple 3D web framework built on top of Three.js with declarative API and visual tooling.

## Features

- 🚀 **Zero Installation**: Use directly from CDN with ES modules
- 🎯 **Declarative API**: Simple, intuitive interface for 3D development
- 🛠️ **Visual Tools**: Built-in inspector, scene tree, and transform gizmos
- 📦 **Modular Architecture**: Clean separation of concerns
- 🔧 **Three.js Integration**: Direct access to underlying Three.js objects when needed
- 💾 **Scene Serialization**: Save and load scenes in JSON format

## Quick Start

### CDN Usage (Recommended)

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My 3D Scene</title>
    </head>
    <body>
        <div id="canvas-container" style="width: 100vw; height: 100vh;"></div>

        <script type="module">
            import {
                Scene,
                Box,
                Light,
            } from 'https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js';

            // Initialize scene
            const scene = Scene.init('canvas-container');

            // Add lighting
            Light.sun();
            Light.ambient(0.4);

            // Create and add objects
            const box = Box.create(2, 2, 2);
            scene.add(box);

            // Position the box
            box.position = { x: 0, y: 1, z: 0 };
        </script>
    </body>
</html>
```

### With Import Maps

```html
<script type="importmap">
    {
        "imports": {
            "kalythesainz": "https://cdn.jsdelivr.net/npm/kalythesainz@latest/dist/kalythesainz.js",
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        }
    }
</script>

<script type="module">
    import { quickStart, Box, Sphere } from 'kalythesainz';

    // Quick start with default setup
    const scene = quickStart('canvas-container');

    // Add objects
    const box = Box.create(1, 1, 1);
    const sphere = Sphere.create(0.8, 32);

    sphere.position = { x: 2, y: 0, z: 0 };

    scene.add(box, sphere);
</script>
```

## API Overview

### Core Components

- **Scene**: Main scene manager with rendering loop
- **Camera**: Camera controls with presets (topView, frontView, isometric)
- **Light**: Lighting presets (sun, ambient, point, spot)

### 3D Objects

- **Box**: Rectangular box primitive
- **Sphere**: Spherical primitive
- **Plane**: Flat plane primitive

### Visual Tools

- **Inspector**: Property editor for selected objects
- **SceneTree**: Hierarchical view of scene objects
- **TransformGizmo**: Interactive transform handles

### Utilities

- **Serializer**: Save/load scenes in JSON format
- **EventBus**: Inter-component communication

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/kalythesainz.git
cd kalythesainz

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure

```
kalythesainz/
├── core/           # Core framework components
├── engine/         # 3D engine layer
├── objects/        # 3D primitive objects
├── tools/          # Visual editing tools
├── utils/          # Utility functions
├── ui/             # Development UI
├── tests/          # Test files
└── index.js        # Main entry point
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires native ES module support and WebGL.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## Roadmap

- [x] Core framework architecture
- [x] Basic 3D objects and lighting
- [x] CDN distribution
- [ ] Visual tools implementation
- [ ] Advanced materials and textures
- [ ] Plugin system
- [ ] Performance optimizations
