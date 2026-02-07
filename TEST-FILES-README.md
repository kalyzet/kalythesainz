# 🧪 File Testing KALYTHESAINZ

## 📁 File Testing yang Tersedia

### 1. `test-ultra-simple.html` ⭐⭐⭐ PALING RECOMMENDED

**File testing dengan console log lengkap dan diagnostik otomatis**

- ✅ Console log detail untuk setiap langkah loading
- ✅ Deteksi otomatis masalah (file:// protocol, dll)
- ✅ Error handling terbaik dengan diagnostic info
- ✅ UI yang menarik dengan gradient background
- ✅ Import langsung dari source files (tidak perlu build)
- ✅ Menggunakan import maps untuk resolve Three.js

**Cara Menggunakan:**

```bash
# Start server
python -m http.server 8000

# Buka browser
http://localhost:8000/test-ultra-simple.html
```

**Apa yang Terlihat:**

- Console log hijau di bawah layar
- Log detail setiap langkah loading
- 3 objek 3D berputar (box merah, sphere hijau, box biru)
- Pesan sukses besar jika berhasil
- Diagnostic info otomatis jika ada error

---

### 2. `test-working.html` ⭐⭐ RECOMMENDED

**File testing yang pasti bekerja dengan import maps**

- ✅ Menggunakan import maps untuk resolve 'three'
- ✅ Import langsung dari source files
- ✅ Info panel dengan status loading
- ✅ Tidak perlu build

**Cara Menggunakan:**

```bash
# Start server
python -m http.server 8000

# Buka browser
http://localhost:8000/test-working.html
```

---

### 3. `test-simple.html` ⭐ DEBUG MODE

**File testing dengan debug console lengkap**

- ✅ Menampilkan log detail setiap langkah loading
- ✅ Error handling yang baik
- ✅ Debug console di layar
- ✅ Menggunakan file build (`./dist/kalythesainz.js`)

**Cara Menggunakan:**

```bash
# Start server
python -m http.server 8000

# Buka browser
http://localhost:8000/test-simple.html
```

**Apa yang Terlihat:**

- Debug console hijau di kiri atas
- Log setiap langkah loading
- 3 objek 3D berputar (box merah, sphere hijau, plane biru)
- Error message jika ada masalah

---

### 2. `test-direct-source.html`

**File testing yang import langsung dari source files**

- ✅ Tidak perlu build
- ✅ Import langsung dari folder `engine/`, `objects/`, dll
- ✅ Debug console dengan status loading
- ✅ Cocok untuk development

**Cara Menggunakan:**

```bash
# Start server
python -m http.server 8000

# Buka browser
http://localhost:8000/test-direct-source.html
```

**Keuntungan:**

- Tidak perlu `npm run build`
- Langsung test perubahan code
- Lebih cepat untuk development

---

### 3. `test-local.html`

**File testing original**

- Import dari `./dist/kalythesainz.js`
- Info panel sederhana
- FPS counter

---

## 🔍 Troubleshooting

### Masalah: Hanya Muncul "Loading..."

**Kemungkinan Penyebab:**

1. **File tidak dijalankan dengan HTTP server**

    ```
    ❌ SALAH: file:///C:/path/to/test-simple.html
    ✅ BENAR: http://localhost:8000/test-simple.html
    ```

2. **File build belum ada**

    ```bash
    # Cek apakah folder dist ada
    ls dist/

    # Jika tidak ada, build dulu
    npm run build
    ```

3. **Port salah atau server tidak jalan**

    ```bash
    # Pastikan server berjalan di port 8000
    python -m http.server 8000
    ```

4. **Browser cache**
    ```
    # Hard refresh
    Windows/Linux: Ctrl + Shift + R
    Mac: Cmd + Shift + R
    ```

### Masalah: Error di Console

**Buka Chrome DevTools (F12) dan lihat:**

1. **Tab Console** - Lihat error message
2. **Tab Network** - Cek file mana yang gagal dimuat
3. **Tab Sources** - Debug code

**Error Umum:**

```
Failed to load module script
→ Solusi: Gunakan HTTP server, bukan file://

Cannot find module './dist/kalythesainz.js'
→ Solusi: Jalankan npm run build

THREE is not defined
→ Solusi: Cek koneksi internet (Three.js dari CDN)
```

---

## ✅ Checklist Sebelum Testing

- [ ] Sudah clone repository
- [ ] Sudah `npm install`
- [ ] Sudah `npm run build` (untuk test-simple.html)
- [ ] Server HTTP sudah jalan
- [ ] Browser modern (Chrome/Firefox/Edge)
- [ ] Koneksi internet aktif (untuk Three.js CDN)

---

## 🎯 Rekomendasi

**Untuk Testing Pertama Kali:**
→ Gunakan `test-simple.html` karena ada debug console

**Untuk Development:**
→ Gunakan `test-direct-source.html` karena tidak perlu build

**Untuk Production Testing:**
→ Gunakan `test-local.html` dengan file build

---

## 📞 Jika Masih Bermasalah

1. **Cek Console Browser (F12)**
    - Lihat error message lengkap
    - Screenshot dan share

2. **Cek Network Tab**
    - Lihat file mana yang gagal dimuat
    - Cek status code (200 = OK, 404 = Not Found)

3. **Test dengan File Paling Sederhana**

    ```html
    <!DOCTYPE html>
    <html>
        <body>
            <h1>Test</h1>
            <script>
                console.log('Hello');
            </script>
        </body>
    </html>
    ```

    Jika ini tidak jalan, masalahnya di server/browser

4. **Pastikan Three.js Bisa Dimuat**
    ```html
    <script type="module">
        import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
        console.log('THREE loaded:', THREE.REVISION);
    </script>
    ```

---

## 🚀 Quick Commands

```bash
# Build framework
npm run build

# Start server (pilih salah satu)
python -m http.server 8000
npx http-server -p 8000
npm run dev

# Test files
http://localhost:8000/test-simple.html
http://localhost:8000/test-direct-source.html
http://localhost:8000/test-local.html
```
