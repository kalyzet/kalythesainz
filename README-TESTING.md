# 🧪 Testing Framework KALYTHESAINZ

> **Quick Start Guide untuk Testing Framework**

---

## ⚡ Super Quick Start (30 Detik)

### Windows:

1. Double-click: `start-test.bat`
2. Buka browser: `http://localhost:8000/test-ultra-simple.html`

### Mac/Linux:

1. Terminal: `python3 -m http.server 8000`
2. Buka browser: `http://localhost:8000/test-ultra-simple.html`

**Expected Result:** 3 objek 3D berputar + console log hijau + pesan "SUKSES!"

---

## 📚 Dokumentasi Lengkap

Pilih dokumentasi sesuai kebutuhan:

### 🚀 Quick Start (1-3 menit)

- **`INSTRUKSI-SINGKAT.txt`** - Panduan super cepat (text format)
- **`MULAI-DISINI.md`** - Panduan quick start (markdown format)

### 📊 Comprehensive (5-10 menit)

- **`STATUS-TESTING.md`** - Status framework + troubleshooting lengkap
- **`CARA-TESTING.md`** - Panduan step-by-step detail
- **`TEST-FILES-README.md`** - Deskripsi semua file test

### 📖 Reference

- **`DOKUMENTASI-INDEX.md`** - Index semua dokumentasi
- **`TESTING-FLOWCHART.txt`** - Visual flowchart testing
- **`SUMMARY-PERUBAHAN.md`** - Summary perubahan terbaru

---

## 🧪 File Test yang Tersedia

### 1. `test-ultra-simple.html` ⭐⭐⭐ RECOMMENDED

**Fitur:**

- Console log lengkap setiap langkah
- Auto-detect masalah
- Diagnostic info otomatis
- UI menarik

**Kapan Digunakan:** Testing pertama kali, debugging

---

### 2. `test-working.html` ⭐⭐ ALTERNATIVE

**Fitur:**

- Simple dan reliable
- Import maps sudah setup
- Info panel dengan status

**Kapan Digunakan:** Alternative jika test-ultra-simple terlalu verbose

---

### 3. `test-threejs-only.html` 🔧 DIAGNOSTIC

**Fitur:**

- Test Three.js saja (tanpa framework)
- Isolate masalah
- Minimal setup

**Kapan Digunakan:** Jika ada masalah dan ingin tahu apakah Three.js bisa dimuat

---

### 4. `test-simple.html` 🐛 DEBUG MODE

**Fitur:**

- Debug console detail
- Menggunakan dist build
- Step-by-step loading log

**Kapan Digunakan:** Test file build (`dist/kalythesainz.js`)

---

### 5. `test-local.html` 📦 BASIC

**Fitur:**

- Basic test
- FPS counter
- Menggunakan dist build

**Kapan Digunakan:** Test dasar setelah build

---

### 6. `test-direct-source.html` 🔨 DEVELOPMENT

**Fitur:**

- Import langsung dari source files
- Tidak perlu build
- Cocok untuk development

**Kapan Digunakan:** Development dan test perubahan code langsung

---

## ⚠️ Masalah Umum dan Solusi

### Masalah 1: Layar Putih Kosong atau "Loading..." Terus

**Penyebab:** File dibuka dengan double-click (`file://` protocol)

**Solusi:**

```bash
# HARUS menggunakan HTTP server!
python -m http.server 8000

# Lalu buka:
http://localhost:8000/test-ultra-simple.html
```

---

### Masalah 2: Error "Failed to resolve module specifier 'three'"

**Penyebab:** Browser tidak bisa resolve import 'three'

**Solusi:** Gunakan file dengan import maps:

- ✅ `test-ultra-simple.html`
- ✅ `test-working.html`
- ✅ `test-threejs-only.html`

---

### Masalah 3: Error "Cannot find module './dist/kalythesainz.js'"

**Penyebab:** File build belum ada

**Solusi 1 (Recommended):** Gunakan file yang import dari source:

- ✅ `test-ultra-simple.html`
- ✅ `test-working.html`

**Solusi 2:** Build framework dulu:

```bash
npm run build
```

---

### Masalah 4: CDN Error

**Penyebab:** Package belum dipublish ke npm

**Solusi:** Gunakan testing lokal (bukan CDN)

---

## 🔍 Diagnostic Checklist

Jika masih bermasalah, cek:

- [ ] **HTTP Server berjalan?** - Cek terminal untuk pesan "Serving HTTP on..."
- [ ] **URL benar?** - Harus `http://localhost:8000/...` (bukan `file://...`)
- [ ] **Browser console?** - Tekan F12, cek error di tab Console
- [ ] **Internet connection?** - Three.js dimuat dari CDN
- [ ] **Browser support?** - Gunakan Chrome, Firefox, Edge, atau Safari

---

## ✅ Kriteria Sukses

Framework dianggap berhasil jika:

1. ✅ URL di browser: `http://localhost:8000/...`
2. ✅ Console log: "SUKSES! KALYTHESAINZ BERJALAN DENGAN SEMPURNA!"
3. ✅ 3 objek 3D terlihat dan berputar
4. ✅ Tidak ada error merah di console
5. ✅ FPS stabil (jika ada counter)

---

## 📞 Butuh Bantuan?

1. **Cek dokumentasi** sesuai kebutuhan (lihat di atas)
2. **Cek browser console** (F12) untuk error
3. **Screenshot error** dan console log
4. **Tanyakan developer** dengan info lengkap:
    - Browser dan versi
    - Operating system
    - URL yang diakses
    - Error message lengkap

---

## 🎯 Rekomendasi Testing

### Step 1: Test Three.js Dulu

```
http://localhost:8000/test-threejs-only.html
```

**Jika gagal:** Masalah di Three.js atau setup  
**Jika sukses:** Lanjut ke Step 2

### Step 2: Test Framework

```
http://localhost:8000/test-ultra-simple.html
```

**Jika gagal:** Lihat console log untuk error detail  
**Jika sukses:** Framework berjalan dengan baik! 🎉

### Step 3: Test Build (Opsional)

```bash
npm run build
http://localhost:8000/test-simple.html
```

---

## 📊 Perbandingan File Test

| File                     | Logging | Diagnostics | Build Required | Recommended |
| ------------------------ | ------- | ----------- | -------------- | ----------- |
| `test-ultra-simple.html` | ⭐⭐⭐  | ⭐⭐⭐      | ❌             | ⭐⭐⭐      |
| `test-working.html`      | ⭐⭐    | ⭐          | ❌             | ⭐⭐        |
| `test-threejs-only.html` | ⭐⭐    | ⭐⭐        | ❌             | 🔧          |
| `test-simple.html`       | ⭐⭐⭐  | ⭐          | ✅             | 🐛          |
| `test-local.html`        | ⭐      | ❌          | ✅             | 📦          |

---

## 🎓 Learning Path

### Beginner (Testing):

1. Baca `INSTRUKSI-SINGKAT.txt` (1 menit)
2. Jalankan `start-test.bat`
3. Buka `http://localhost:8000/test-ultra-simple.html`
4. Sukses! 🎉

### Intermediate (Usage):

1. Baca `README.md`
2. Baca `docs/GETTING_STARTED.md`
3. Build something!

### Advanced (Development):

1. Baca semua docs
2. Explore source code
3. Contribute!

---

## 🎉 Kesimpulan

**Framework Status:** ✅ Siap untuk testing lokal

**Recommended File:** `test-ultra-simple.html`

**Quick Start:**

1. `start-test.bat` (Windows) atau `python3 -m http.server 8000` (Mac/Linux)
2. Buka `http://localhost:8000/test-ultra-simple.html`
3. Lihat 3 objek 3D berputar

**Expected Result:**

- ✅ 3 objek 3D berputar
- ✅ Console log hijau
- ✅ Pesan "SUKSES!"

**Next Steps:**

- Jika sukses: Baca `README.md` untuk cara implementasi
- Jika gagal: Baca `STATUS-TESTING.md` untuk troubleshooting

---

**Last Updated:** 7 Februari 2026  
**Framework Version:** 1.0.0  
**Status:** ✅ Ready for testing

---

## 📚 Dokumentasi Lainnya

- **Framework Documentation:** `README.md`
- **Getting Started:** `docs/GETTING_STARTED.md`
- **API Reference:** `docs/API.md`
- **Plugin System:** `docs/PLUGIN_SYSTEM.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING.md`
