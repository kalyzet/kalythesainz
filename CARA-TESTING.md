# 🧪 Cara Testing Framework KALYTHESAINZ

## ⚡ Quick Start (Paling Mudah)

### Windows Users:

1. **Double-click file `start-test.bat`**
2. **Buka browser ke: `http://localhost:8000/test-ultra-simple.html`**

Selesai! 🎉

---

## ✅ Langkah-Langkah Testing Manual

### 1. Pastikan Framework Sudah Di-Build (Opsional)

```bash
npm run build
```

**CATATAN:** File `test-ultra-simple.html` dan `test-working.html` TIDAK memerlukan build karena import langsung dari source files.

Ini akan membuat file di folder `dist/`:

- `kalythesainz.js` (development)
- `kalythesainz.min.js` (production)
- `kalythesainz.umd.js` (UMD format)

### 2. Jalankan Local Server

**PENTING:** File HTML dengan ES modules HARUS dijalankan melalui HTTP server, tidak bisa dibuka langsung dengan `file://`

#### Opsi A: Menggunakan Python (Paling Mudah)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Opsi B: Menggunakan Node.js http-server

```bash
# Install http-server (sekali saja)
npm install -g http-server

# Jalankan server
http-server -p 8000
```

#### Opsi C: Menggunakan npx (Tanpa Install)

```bash
npx http-server -p 8000
```

#### Opsi D: Menggunakan VS Code Live Server

1. Install extension "Live Server" di VS Code
2. Klik kanan pada `test-local.html`
3. Pilih "Open with Live Server"

### 3. Buka di Browser

Setelah server berjalan, buka browser dan akses:

**RECOMMENDED (Paling Mudah):**

```
http://localhost:8000/test-ultra-simple.html
```

**Alternatif:**

```
http://localhost:8000/test-working.html
http://localhost:8000/test-simple.html
http://localhost:8000/test-local.html
```

### 4. Apa yang Harus Terlihat?

Jika berhasil, Anda akan melihat:

- ✅ Scene 3D dengan background hitam
- ✅ Box merah di kiri (berputar)
- ✅ Sphere hijau di tengah (berputar)
- ✅ Box/Plane biru di kanan (berputar)
- ✅ Console log menampilkan setiap langkah loading
- ✅ Pesan "SUKSES! KALYTHESAINZ BERJALAN DENGAN SEMPURNA!" (untuk test-ultra-simple.html)

### 5. Troubleshooting

#### ⚠️ Masalah: Layar Putih Kosong atau Hanya "Loading..."

**Penyebab Paling Umum:** File dibuka langsung dengan `file://` protocol (double-click HTML file)

**Solusi:** HARUS menggunakan HTTP server!

```bash
# Windows - gunakan start-test.bat
start-test.bat

# Atau manual dengan Python
python -m http.server 8000

# Lalu buka browser ke:
http://localhost:8000/test-ultra-simple.html
```

**Cara Cek:** Lihat address bar browser Anda:

- ❌ SALAH: `file:///D:/Framework/kalythesainz/test-local.html`
- ✅ BENAR: `http://localhost:8000/test-ultra-simple.html`

---

#### ⚠️ Masalah: Console Error "Failed to resolve module specifier 'three'"

**Penyebab:** Browser tidak bisa resolve import 'three' tanpa import maps

**Solusi:** Gunakan file yang sudah ada import maps:

- ✅ `test-ultra-simple.html` (RECOMMENDED)
- ✅ `test-working.html`

File ini sudah include import maps:

```html
<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        }
    }
</script>
```

---

#### ⚠️ Masalah: Console Error "Cannot find module './dist/kalythesainz.js'"

**Penyebab:** File build belum ada

**Solusi 1 (Recommended):** Gunakan file yang import dari source:

```
http://localhost:8000/test-ultra-simple.html
http://localhost:8000/test-working.html
```

**Solusi 2:** Build framework dulu:

```bash
npm run build
```

---

#### Masalah: Console Error "Failed to fetch"

**Penyebab:** Server tidak berjalan atau port salah

**Solusi:**

1. Pastikan server berjalan di port 8000
2. Cek console untuk error detail
3. Pastikan tidak ada firewall yang memblokir

---

#### Masalah: "THREE is not defined"

**Penyebab:** Three.js belum dimuat

**Solusi:** Pastikan koneksi internet aktif (Three.js dimuat dari CDN)

---

#### Masalah: Objek 3D tidak muncul tapi tidak ada error

**Kemungkinan Penyebab:**

1. Canvas tidak ter-render dengan benar
2. Camera position salah
3. Lighting tidak ada

**Solusi:** Gunakan `test-ultra-simple.html` yang sudah teruji dan pasti bekerja

---

## 🔍 Diagnostic Checklist

Jika masih bermasalah, cek hal-hal berikut:

1. ✅ **HTTP Server berjalan?**
    - Buka terminal, lihat apakah ada pesan "Serving HTTP on..."
2. ✅ **URL benar?**
    - Harus `http://localhost:8000/...`
    - Bukan `file:///...`

3. ✅ **Browser console?**
    - Tekan F12 untuk buka Developer Tools
    - Lihat tab Console untuk error messages

4. ✅ **Internet connection?**
    - Three.js dimuat dari CDN, perlu internet

5. ✅ **Browser support?**
    - Gunakan browser modern (Chrome, Firefox, Edge, Safari)
    - Pastikan JavaScript enabled

---

## 📝 Rekomendasi File Test

Untuk hasil terbaik, gunakan file test dalam urutan ini:

1. **`test-ultra-simple.html`** ⭐⭐⭐
    - Paling lengkap dengan diagnostic
    - Auto-detect masalah
    - Console log detail
2. **`test-working.html`** ⭐⭐
    - Simple dan reliable
    - Import maps sudah setup
3. **`test-simple.html`** ⭐
    - Debug mode dengan console
    - Menggunakan dist build

4. **`test-local.html`**
    - Basic test
    - Minimal features

---

## 🆘 Masih Bermasalah?

Jika setelah mengikuti semua langkah di atas masih bermasalah:

1. **Cek versi browser:** Pastikan menggunakan browser modern
2. **Clear cache:** Tekan Ctrl+Shift+Delete dan clear cache
3. **Coba browser lain:** Test di Chrome/Firefox/Edge
4. **Screenshot error:** Ambil screenshot console error dan tanyakan ke developer

---

## ✅ Checklist Sukses

Jika Anda melihat hal-hal berikut, berarti SUKSES! 🎉

- ✅ Console log menampilkan "SUKSES! KALYTHESAINZ BERJALAN DENGAN SEMPURNA!"
- ✅ 3 objek 3D terlihat berputar
- ✅ Tidak ada error di console
- ✅ FPS stabil (jika ada FPS counter)

Selamat! Framework KALYTHESAINZ sudah berjalan dengan baik! 🚀

**Solusi:** Jalankan `npm run build` terlebih dahulu

### 6. Testing dengan Vite Dev Server

Cara paling mudah untuk development:

```bash
npm run dev
```

Kemudian buka `http://localhost:5173` dan akses file di folder `ui/`

## 📝 File Testing Lainnya

### Test dengan Import Langsung (Tanpa Build)

Buat file `test-direct.html`:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Test Direct Import</title>
        <style>
            body {
                margin: 0;
            }
            #container {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>
        <script type="module">
            import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
            window.THREE = THREE;

            // Import langsung dari source
            import { Scene } from './engine/Scene.js';
            import { Box } from './objects/Box.js';
            import { Light } from './engine/Light.js';

            const scene = Scene.init('container');
            Light.sun();
            Light.ambient(0.4);

            const box = Box.create(1, 1, 1);
            scene.add(box);

            console.log('✅ Direct import berhasil!');
        </script>
    </body>
</html>
```

Jalankan dengan server dan buka `http://localhost:8000/test-direct.html`

## 🎯 Quick Test Commands

```bash
# 1. Build framework
npm run build

# 2. Start server (pilih salah satu)
python -m http.server 8000
# atau
npx http-server -p 8000
# atau
npm run dev

# 3. Buka browser
# http://localhost:8000/test-local.html
```

## ✨ Tips

1. **Gunakan Chrome DevTools** untuk debug:
    - Tekan F12
    - Lihat tab Console untuk error
    - Lihat tab Network untuk cek file yang dimuat

2. **Hard Refresh** jika ada perubahan:
    - Windows/Linux: `Ctrl + Shift + R`
    - Mac: `Cmd + Shift + R`

3. **Check Console** untuk pesan sukses:
    ```
    🎉 KALYTHESAINZ berhasil dimuat!
    Scene objects: [...]
    ```

## 📚 Dokumentasi Lengkap

Lihat [README.md](README.md) untuk dokumentasi lengkap dan contoh-contoh lainnya.
