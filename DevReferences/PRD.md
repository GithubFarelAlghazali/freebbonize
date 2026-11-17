# Product Requirements Document (PRD)
## Project: Freebbonize

**Status:** Living Document / Active  
**Author / Team:** Freebbonize Development Team  
**Versi:** 1.0.0  
**Tanggal:** 17 November 2026  

---

## 1. Executive Summary & Project Overview

**Freebbonize** adalah aplikasi web generator Twibbon sumber terbuka (open-source) yang ringan, cepat, dan sepenuhnya berjalan di sisi klien (*client-side*). Dibangun menggunakan **React 19**, **TypeScript**, **Vite**, dan **Tailwind CSS v4**, Freebbonize dirancang sebagai alternatif independen dari platform pihak ketiga seperti Twibbonize. 

Aplikasi ini memudahkan penyelenggara acara (organizer) untuk membuat kampanye visual dan membagikan bingkai Twibbon dengan identitas kustom hanya dengan memodifikasi satu file konfigurasi JSON dan satu aset grafis, tanpa perlu mengubah logika kode program. Di sisi pengguna akhir, aplikasi menyediakan alur 3 langkah (*upload*, *adjust*, *download*) yang intuitif dengan manipulasi kanvas interaktif dan generator *caption* dinamis.

---

## 2. Problem Statement & Goals

### 2.1 Latar Belakang Masalah
- Banyak platform twibbon pihak ketiga memuat iklan berlebih, memerlukan akun/login, atau memproses gambar di server eksternal yang menimbulkan isu privasi.
- Penyelenggara acara membutuhkan solusi *self-hosted* yang cepat di-branding ulang (*re-skinning*) untuk acara internal, komunitas, kampus, maupun organisasi.

### 2.2 Tujuan Produk (Objectives)
- **Privasi Maksimal (100% Client-Side):** Semua pemrosesan citra dan data teks dilakukan langsung di browser pengguna; foto pengguna tidak diunggah ke server backend mana pun.
- **Kemudahan Kustomisasi (Zero-Code Rebranding):** Penyelenggara dapat mengganti frame acara dan variabel caption cukup dengan memperbarui file konfigurasi JSON dan file gambar frame.
- **Interaksi Kanvas Halus & Responsif:** Pengguna dapat menggeser, memperbesar/memperkecil, dan memutar foto dengan mulus di berbagai perangkat (desktop maupun *mobile touch*).
- **Konversi & Sharing Cepat:** Menyediakan ekspor instan format PNG kualitas tinggi dan penyalinan caption media sosial ke clipboard hanya dengan satu klik.

---

## 3. Target Audiens & Persona

| Peran | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **End User / Partisipan Event** | Peserta acara atau audiens umum yang ingin memasang foto profil twibbon untuk media sosial. | Alur cepat, preview instan, kontrol mudah (geser/putar/skala), salin teks caption otomatis, unduh tanpa watermark/iklan. |
| **Campaign Organizer / Developer** | Tim media/desain/panitia event yang mendistribusikan twibbon. | Kemudahan mengganti template frame dan teks campaign dalam hitungan menit tanpa harus merombak basis kode React. |

---

## 4. User Journey & Alur Aplikasi

Aplikasi dikelola melalui sebuah *state machine* sentral di `App.tsx` dengan nilai status `sidebarState`: `"landing"` $\rightarrow$ `"adjust"` $\rightarrow$ `"ready"`.

```
[ Step 1: Landing ]
       │
       ▼ (User upload foto)
[ Step 2: Adjust ] ◄── (Ganti foto / Transformasi)
       │
       ▼ (Klik 'Next')
[ Step 3: Ready / Download ] ◄── (Kustomisasi variabel caption)
       │
       ├── Download Gambar (.png)
       └── Copy Caption ke Clipboard
```

---

## 5. Fitur Utama & Kebutuhan Fungsional (Functional Requirements)

### 5.1 Step 1: Landing Page (`LandingPageSidebar`)
- **FR-1.1:** Menampilkan judul acara dan deskripsi singkat ajakan berpartisipasi.
- **FR-1.2:** Komponen unggah foto mendukung tipe file gambar: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`.
- **FR-1.3:** Saat file dipilih, sistem membaca file lokal menggunakan `URL.createObjectURL(file)` dan menginisialisasi objek `HTMLImageElement`.
- **FR-1.4:** Transisi otomatis ke status `"adjust"` setelah foto berhasil dimuat.

### 5.2 Step 2: Penyesuaian Kanvas & Transformasi (`TwibbonCanvas` & `AdjustPageSidebar`)
- **FR-2.1 Drag & Reposisi (Pointer Events):**
  - Menggunakan Pointer Events API (`onPointerDown`, `onPointerMove`, `onPointerUp`, `setPointerCapture`) sehingga kompatibel untuk mouse maupun layar sentuh (touch).
  - Posisi foto dihitung berdasarkan pergeseran delta koordinat yang dinormalisasi dengan rasio dimensi fisik canvas terhadap ukuran display layar (`canvas.width / canvas.clientWidth`).
- **FR-2.2 Kontrol Skala (Scale):**
  - Slider interaktif dengan rentang nilai $0\%$ hingga $200\%$ (default: $100\%$).
- **FR-2.3 Kontrol Rotasi (Rotate):**
  - Slider interaktif dengan rentang sudut $-180^\circ$ hingga $180^\circ$ (default: $0^\circ$).
- **FR-2.4 Penggantian Foto:**
  - Tombol *"Change photo"* memungkinkan pengguna memilih file gambar baru kapan saja tanpa kehilangan frame acuan.
- **FR-2.5 Transisi:**
  - Tombol *"Next"* mengalihkan status aplikasi ke tahap final (`"ready"`).

### 5.3 Step 3: Pembuatan Caption & Unduh (`DownloadPageSidebar`)
- **FR-3.1 Templating Caption Dinamis:**
  - Membaca properti `caption` dan `props` dari `src/campaign-data.json`.
  - Placeholder dalam pola `[variable_name]` secara otomatis digantikan oleh nilai yang dimasukkan pengguna.
  - Jika belum diisi, teks tetap mempertahankan label default token (contoh: `[name]`).
- **FR-3.2 Modal Input Variabel Caption:**
  - Modal interaktif *"Adjust caption"* merender input form dinamis berdasarkan array `props` yang terdaftar.
- **FR-3.3 Salin Caption (Clipboard API):**
  - Tombol *"Copy Caption"* menyalin teks akhir ke clipboard sistem menggunakan `navigator.clipboard.writeText`.
  - Memberikan feedback visual sementara (ikon `ClipboardCheck` dan status *"Copied!"* selama 3 detik).
- **FR-3.4 Ekspor & Unduh Gambar:**
  - Merender komposisi akhir pada canvas beresolusi penuh.
  - Mengekspor data canvas menggunakan `canvas.toDataURL("image/png")` dan memicu unduhan file otomatis (nama file default: `fancy-twibbon.png`).

### 5.4 Canvas Engine (`TwibbonCanvas`)
- **FR-4.1 Urutan Layering (Z-Index Compositing):**
  1. *Clear canvas* ($500 \times 500$ px base size).
  2. Gambar foto pengguna (diterapkan transformasi: translate, rotate, scale dari titik pusat origin).
  3. Gambar frame overlay twibbon (`frameSrc`) digambar di layer teratas menutupi foto pengguna.
- **FR-4.2 Re-render Reaktif:** Kanvas menggambar ulang secara instan setiap kali terjadi perubahan pada referensi gambar foto, frame, atau nilai transformasi ($x, y, scale, rotate$).

---

## 6. Format Data & Konfigurasi Kampanye

Untuk merombak tema kampanye (*re-theming*), konfigurasi terpusat pada file `src/campaign-data.json`:

```json
{
  "frameSrc": "/twibbon.png",
  "caption": "Hello my name is [name] from [school] and i am ready to be part of FancyEvent 2026!",
  "props": ["name", "school"]
}
```

- **`frameSrc`**: Lokasi file aset overlay transparan (ditempatkan di folder `public/`).
- **`caption`**: Template kalimat dengan penanda kurung siku `[token]`.
- **`props`**: Kunci/variabel yang otomatis dibuatkan input form pada modal kustomisasi caption.

---

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Spesifikasi & Ekspektasi |
|---|---|
| **Performa** | Waktu muat awal cepat (< 1 detik pada koneksi standar). Render kanvas instan tanpa lag saat pergeseran pointer (60 fps). |
| **Keamanan & Privasi** | *Zero network egress* untuk data foto pengguna. Pemrosesan murni *in-memory* browser via Blob/ObjectURL dan HTML5 2D Context. |
| **Kompatibilitas** | Berjalan di seluruh peramban modern (Chrome, Edge, Safari, Firefox) baik di lingkungan desktop maupun mobile browser. |
| **Responsivitas UI** | Layout adaptif (desktop: split horizontal side-by-side; mobile: stacked vertikal) menggunakan utilitas Tailwind CSS. |
| **Maintainability** | Kode bersih, terstruktur dalam modul komponen tunggal terpisah (`src/components/`), dan berbasis tipe ketat (strict TypeScript). |

---

## 8. Arsitektur Teknis & Struktur Proyek

### 8.1 Tech Stack
- **Framework & Core:** React 19, TypeScript
- **Build Tool:** Vite 8 (didukung React Compiler via Babel plugin)
- **Styling:** Tailwind CSS v4, Montserrat Google Font
- **Icons:** Lucide React (`Camera`, `CircleArrowRight`, `ArrowDownToLine`, `SquarePen`, `Clipboard`, `ClipboardCheck`)
- **Package Manager:** pnpm

### 8.2 Struktur Berkas
```
freebbonize/
├── Devreferences/
│   ├── PRD.md                       # Dokumen Spesifikasi Produk (File Ini)
│   └── Skills/                      # Dokumentasi & Standar Proyek
├── public/
│   └── twibbon.png                  # Frame PNG transparan default
├── src/
│   ├── assets/                      # Aset gambar pendukung / icons
│   ├── components/
│   │   ├── twibbon-canvas.tsx       # Rendering Canvas 2D & drag gesture
│   │   ├── landing-page.tsx         # Sidebar tahap 1 (upload foto)
│   │   ├── adjust-page.tsx          # Sidebar tahap 2 (slider transformasi)
│   │   └── download-page.tsx        # Sidebar tahap 3 (caption & download)
│   ├── campaign-data.json           # Sumber konfigurasi frame & template caption
│   ├── App.tsx                      # State machine & layout orkestrator utama
│   ├── App.css / index.css          # Setup font & Tailwind directives
│   └── main.tsx                     # Entry point React DOM
├── package.json
└── vite.config.ts
```

---

## 9. Rencana Pengembangan Mendatang (Future Roadmap)

1. **Multi-Frame Selection:** Memberikan pilihan beberapa variasi desain frame dalam satu event.
2. **Text Overlay on Canvas:** Memungkinkan teks nama/sekolah langsung dirender di atas kanvas twibbon sebelum diunduh.
3. **Pinch-to-Zoom Gesture:** Dukungan gesture multi-touch bawaan di layar HP untuk *pinch-to-zoom* foto di samping penggunaan slider.
4. **Direct Social Sharing:** Integrasi Web Share API untuk membagikan gambar dan teks langsung ke Instagram, WhatsApp, atau X (Twitter).
