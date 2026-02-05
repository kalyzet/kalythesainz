# 🌌 Kalythesainz

**Kalythesainz** adalah framework web ringan untuk membantu pembuatan dan manipulasi objek 3D secara interaktif di browser, dengan pendekatan modular, declarative, dan ramah developer.

Framework ini dirancang sebagai pondasi untuk:

- Menampilkan objek 3D di website tanpa setup ribet
- Memberikan kontrol penuh terhadap scene 3D
- Menjadi tools bantu desain & visualisasi berbasis web

---

## ✨ Fitur Utama

- 🧩 Declarative 3D Object API
- 🎛️ Abstraksi Scene, Camera, dan Light
- 🌀 Transformasi objek (rotate, scale, translate)
- 🖱️ Interaksi mouse & keyboard
- ⚡ Ringan, modular, dan extensible
- 🌐 Native Web (Canvas + WebGL)

---

## 🏗️ Gambaran Arsitektur

```
Kalythesainz
├── core/
│   ├── scene-manager
│   ├── renderer
│   └── event-system
│
├── engine/
│   ├── object3d
│   ├── camera
│   └── light
│
├── utils/
│   ├── math-helper
│   ├── loader
│   └── debug
│
└── api/
    └── declarative-config
```

Arsitektur ini dirancang agar mudah dikembangkan dan tidak mengikat developer pada satu pendekatan rendering saja.

---

## 🧪 Contoh Penggunaan

```js
import { Scene, Cube } from 'kalythesainz';

const scene = new Scene('#canvas');

const cube = new Cube({
    size: 1,
    color: '#00ffaa',
});

cube.rotate(0, 0.01, 0);
scene.add(cube);
scene.start();
```

---

## 🛠️ Tech Stack

- **Bahasa**: JavaScript / TypeScript
- **Rendering**: WebGL (dengan opsi adapter Three.js)
- **Build Tool**: Vite
- **Target Platform**: Modern Web Browser

---

## 📦 Instalasi (Planned)

```bash
npm install kalythesainz
```

Atau via CDN (rencana):

```html
<script src="https://cdn.kalythesainz.dev/core.js"></script>
```

---

## 🧭 Roadmap Pengembangan

- [ ] Core Scene Engine
- [ ] Primitive Objects (Cube, Sphere, Plane)
- [ ] Camera & Lighting API
- [ ] Mouse & Keyboard Interaction
- [ ] Loader (.glb / .gltf dari Blender)
- [ ] Web-based Visual Editor

---

## 🤝 Kontribusi

Kontribusi terbuka untuk siapa saja.

Silakan buat:

- Issue untuk bug atau ide
- Pull Request untuk fitur atau perbaikan

---

## 📜 Lisensi

MIT License © 2026 — **Kalythesainz**
