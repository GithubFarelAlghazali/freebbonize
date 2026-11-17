<div align="center">

  <img src="public/Main-Logo.png" alt="Freebbonize Logo" width="80" height="80" />

  # Freebbonize

  **A modern, lightweight, and privacy-first open-source Twibbon Campaign Platform**  
  *Create custom event frames, share dedicated links, and let participants composite their photos with dynamic captions in seconds — without login, watermarks, or ads.*

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT" />
  </p>

</div>

---

## 📸 1. Tampilan & Demo Aplikasi

Freebbonize mengusung sistem desain **Raycast Midnight Command Center** bernuansa gelap elegan (*Void Black*, *Ink*, *Obsidian*, dan aksen *Azure Pulse*).

### Halaman Pembuatan Kampanye (`/`)
Form instan tanpa autentikasi untuk meluncurkan kampanye baru dengan *slug* kustom, upload bingkai rasio bebas, preview interaktif, dan generator template caption.

| Preview Tampilan | Deskripsi Alur |
|---|---|
| <img src="docs/screenshots/create-campaign.png" alt="Halaman Pembuatan Kampanye" width="100%" /> | **Halaman Pembuatan Kampanye (`/`)**<br><br>Penyelenggara acara dapat menentukan URL kustom slug, mengunggah bingkai twibbon berasio bebas (drag & drop), melihat preview dimensi otomatis, dan menyusun template kalimat caption media sosial dengan tag variabel dinamis seperti `[nama]` dan `[instansi]`. |

### Halaman Kampanye Dinamis (`/:slug`)
Halaman peserta yang bersih untuk mengunggah foto, menyesuaikan posisi gambar di bawah bingkai twibbon secara *real-time*, dan mengunduh hasil akhir dalam resolusi tinggi.

| Step 1: Landing (Unggah Foto) | Step 2: Adjust (Atur Kanvas) | Step 3: Ready (Unduh & Caption) |
| :---: | :---: | :---: |
| <img src="docs/screenshots/campaign-landing.png" alt="Step 1: Landing Page" width="100%" /> | <img src="docs/screenshots/campaign-adjust.png" alt="Step 2: Adjust Canvas" width="100%" /> | <img src="docs/screenshots/campaign-ready.png" alt="Step 3: Ready & Download" width="100%" /> |
| **1. Unggah Foto Peserta**<br>Peserta membuka tautan kampanye dan memilih atau menyeret (*drag & drop*) foto profil yang akan dipasang. | **2. Penyesuaian Kanvas 2D**<br>Interaksi geser/drag bebas foto, kontrol skala perbesaran ($10\% - 250\%$), dan slider rotasi ($-180^\circ$ s.d. $180^\circ$). | **3. Salin Caption & Unduh**<br>Pengisian variabel form caption dinamis, salin teks ke clipboard dalam 1 klik, dan ekspor instan gambar PNG resolusi penuh. |

---

## 💡 2. Mengapa Freebbonize? (Problem vs Solution)

Banyak platform twibbon komersial membebani pengguna dengan iklan invasif, registrasi akun wajib, pemaksaan rasio 1:1, serta pengunggahan foto peserta ke server pihak ketiga yang berisiko privasi.

Freebbonize hadir dengan pendekatan yang berbeda:

| Masalah Platform Konvensional | Solusi Freebbonize |
|---|---|
| Foto peserta diproses di server pihak ketiga | **100% Client-Side Privacy**: Foto diproses lokal di browser pengguna via HTML5 Canvas; foto peserta tidak pernah menyentuh server backend. |
| Pengguna diwajibkan login/register & dipenuhi iklan | **Zero Friction**: Tanpa login, tanpa registrasi, tanpa iklan, dan tanpa watermark. |
| Memaksa crop foto ke rasio kotak (1:1) | **Bebas Rasio Aspek**: Mendukung rasio potret (4:5, 9:16), lanskap (16:9), kotak (1:1), atau resolusi kustom lainnya. |
| Ekstensi gambar palsu rawan merusak tampilan | **Validasi Biner Magic Bytes**: Memeriksa header berkas secara biner untuk memastikan format asli PNG, JPG, atau WEBP (maksimal 3MB). |

---

## ✨ 3. Fitur Utama

- 🚀 **Peluncuran Kampanye Tanpa Login (`/`)**:
  - Penentuan URL *slug* kustom (misal: `/dies-natalis-2026`).
  - Validasi ketersediaan *slug* secara *real-time* dengan *debounced check* ke PostgreSQL.
  - Dukungan upload bingkai via tombol maupun interaksi **Drag & Drop**.
- 🔗 **Rute Dinamis Berbagi (`/:slug`)**:
  - Setiap kampanye memiliki halaman partisipan mandiri yang siap dibagikan ke media sosial.
  - Tombol 1-klik untuk menyalin tautan kampanye.
- 🎨 **Kanvas Interaktif 2D Fleksibel**:
  - Manipulasi foto peserta secara responsif: drag/geser bebas (Pointer Events), zoom skala ($10\% - 250\%$), dan rotasi ($-180^\circ$ s.d. $180^\circ$).
  - Render kanvas otomatis mengikuti dimensi alami (*natural resolution*) bingkai twibbon.
- 📝 **Generator Caption Dinamis**:
  - Pembuat template caption dengan variabel kustom token (contoh: `[nama]`, `[instansi]`, `[jurusan]`).
  - Modal pengisian variabel otomatis untuk peserta dan tombol salin ke clipboard dalam 1 klik.
- 🛡️ **Validasi Berkas Berlapis**:
  - Inspeksi *binary magic bytes* (PNG, JPEG, WEBP) di sisi browser, Vite dev middleware, dan Supabase Edge Function.
  - Pembatasan ketat ukuran file maksimal 3MB.
- ☁️ **Cloud Storage & Database Terintegrasi**:
  - Penyimpanan bingkai di Supabase Storage Bucket publik CDN.
  - Database PostgreSQL dengan Row-Level Security (RLS) untuk akses publik anonim yang aman.

---

## 🏗️ 4. Arsitektur & Alur Sistem

### User Flow Diagram

```mermaid
flowchart TD
    subgraph Organizer ["Penyelenggara Acara"]
        A["Buka Halaman /"] --> B["Isi Judul, Slug & Caption Template"]
        B --> C["Drag & Drop / Upload Bingkai Twibbon"]
        C --> D{"Validasi 3MB & Magic Bytes"}
        D -- Valid --> E["Simpan ke Supabase Storage & Database"]
        D -- Tidak Valid --> C
        E --> F["Dapatkan Link Kampanye: /:slug"]
    end

    subgraph Participant ["Peserta Kampanye"]
        G["Buka Link /:slug"] --> H["Upload Foto Diri"]
        H --> I["Atur Foto di Kanvas (Geser, Skala, Rotasi)"]
        I --> J["Isi Variabel Caption (Nama, Instansi, dll.)"]
        J --> K["Download Twibbon PNG Resolusi Tinggi"]
        J --> L["Salin Caption ke Clipboard"]
    end

    F -. Dibagikan ke .-> G
```

### Teknologi yang Digunakan

- **Frontend:** React 19, TypeScript, React Router 7
- **Styling:** Tailwind CSS v4, Lucide Icons, Google Fonts (Inter & JetBrains Mono)
- **Engine Grafis:** HTML5 2D Canvas API (Pointer Events API)
- **Database & Storage:** PostgreSQL 17 (dengan Triggers & RLS), Supabase Storage CDN
- **Build Tool:** Vite 8 (dengan React Compiler) & pnpm

---

## 🗄️ 5. Rancangan Database

Database PostgreSQL dirancang dengan dua tabel inti (`campaigns` dan `campaign_analytics`) yang saling berelasi:

<div align="center">
  <img src="docs/database-schema.png" alt="Rancangan Database PostgreSQL Freebbonize" width="100%" />
</div>

<br />

| Tabel | Deskripsi & Relasi |
|---|---|
| **`public.campaigns`** | Menyimpan metadata acara, slug unik, URL frame di Supabase Storage, dimensi asli frame ($W \times H$), rasio aspek (kolom *GENERATED ALWAYS*), template caption, dan array JSONB token variabel. |
| **`public.campaign_analytics`** | Menyimpan metrik unduhan (`download_count` dan `last_download_at`) dengan relasi *foreign key* `campaign_id` ke tabel `campaigns` berstatus **`ON DELETE CASCADE`**. |

> **Catatan Teknis:** Trigger PostgreSQL `init_campaign_analytics` (*SECURITY DEFINER*) secara otomatis menginisialisasi baris analitik setiap kali kampanye baru berhasil dimasukkan. Kebijakan Row-Level Security (RLS) diaktifkan untuk memastikan akses baca dan unggah anonim tetap aman.

---

## 🚀 6. Panduan Instalasi & Konfigurasi

### 1. Kloning Repositori
```bash
git clone https://github.com/GithubFarelAlghazali/freebbonize.git
cd freebbonize
```

### 2. Pasang Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Lengkapi konfigurasi berikut:
```env
# Supabase Client Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_STORAGE_BUCKET=freebbonize-files

# Backend & Secret Configuration
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
MAX_FILE_SIZE_BYTES=3145728

# PostgreSQL Direct URL (untuk migration & seeder)
DATABASE_URL=postgresql://postgres:password@your-host:5432/postgres

# App URL
VITE_APP_URL=http://localhost:5173
```

### 4. Eksekusi Migrasi & Fresh Seeder Database
```bash
# Jalankan seluruh migrasi skema tabel & kebijakan RLS
pnpm db:migrate

# Jalankan fresh seeder (menghapus data lama & mengisi data contoh awal)
pnpm db:seed
```

### 5. Jalankan Server Development
```bash
pnpm dev
```
Buka browser pada alamat `http://localhost:5173`.

---

## 📋 7. Available Scripts

| Perintah | Deskripsi |
|---|---|
| `pnpm dev` | Menjalankan Vite dev server beserta middleware backend validator |
| `pnpm build` | Memeriksa tipe TypeScript dan membundel aset untuk produksi |
| `pnpm preview` | Menjalankan preview lokal dari hasil build produksi |
| `pnpm lint` | Menjalankan ESLint dengan standar *zero error & warning* |
| `pnpm db:migrate` | Menjalankan seluruh berkas migrasi SQL secara berurutan |
| `pnpm db:seed` | Menjalankan **fresh seeder** (reset data & isi data contoh baru) |

---

## 👥 8. Tim Pengembang & Kontribusi

Proyek ini dikembangkan dan dipelihara secara terbuka:
- **Lead Developer**: [Farel Alghazali](https://github.com/GithubFarelAlghazali)
- **Contributor**: [christianxavierVibecode](https://github.com/christianxavierVibecode)

Kontribusi dalam bentuk *pull request*, pelaporan *bug*, maupun saran fitur baru selalu terbuka melalui [GitHub Issues](https://github.com/GithubFarelAlghazali/freebbonize/issues).

---

## 📄 9. Lisensi

Proyek ini didistribusikan di bawah lisensi resmi **[MIT License](./LICENSE)**. Bebas digunakan untuk keperluan pribadi, komunitas, edukasi, maupun komersial.
