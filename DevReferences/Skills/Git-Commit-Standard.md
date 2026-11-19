---
name: commit-skills-standard
description: Standar pesan commit Git: awalan feat, fix, docs, style, refactor, atau chore diikuti penjelasan perubahan yang jelas. Gunakan saat membuat, menyarankan, atau merapikan pesan commit.
---

# Commit Skills Standard

Standar ini wajib diikuti setiap kali AI membuat, menyarankan, atau melakukan commit terhadap sebuah perubahan.

## Aturan Utama

Pesan commit **wajib** menjelaskan perubahan secara jelas dan **wajib** diawali salah satu prefix berikut:

| Prefix | Kapan dipakai |
|--------|---------------|
| `feat` | Menambah fitur atau kemampuan baru |
| `fix` | Memperbaiki bug atau kesalahan |
| `docs` | Perubahan dokumentasi saja (README, panduan, komentar dokumen) |
| `style` | Perubahan tampilan/format kode yang tidak mengubah logika (spasi, indentasi, titik koma, CSS/UI polish) |
| `refactor` | Merapikan struktur kode tanpa menambah fitur atau memperbaiki bug |
| `chore` | Pekerjaan pendukung: konfigurasi, dependency, build, tooling, pembersihan file |

## Format

```
<prefix>: <deskripsi singkat dan jelas>
```

- Prefix huruf kecil, diikuti titik dua dan satu spasi.
- Deskripsi diawali kata kerja dalam bentuk perintah (add, integrate, resolve, update, remove, rename, dst.), huruf kecil, tanpa titik di akhir.
- Idealnya maksimal sekitar 72 karakter pada baris pertama.
- Deskripsi harus menyebut APA yang berubah dan di bagian mana, bukan sekadar "update" atau "fix bug".

## Contoh yang Benar

```
feat: add user authentication
feat: integrate Gemini API for auto-summary
fix: resolve login validation bug
docs: update project installation guide
style: align button spacing on dashboard page
refactor: extract session check into helper function
chore: update composer dependencies
```

## Contoh yang Salah

```
update                      -> tanpa prefix, tidak jelas
fix: bug                    -> deskripsi terlalu kabur
Feat: Add Login.            -> kapitalisasi dan titik tidak sesuai
feat: add login and fix css and update readme  -> campur banyak jenis perubahan
```

## Langkah Kerja AI

1. Periksa perubahan lewat `git status` dan `git diff` (atau `git diff --staged`).
2. Tentukan jenis perubahan utama dan pilih satu prefix yang paling sesuai.
3. Tulis deskripsi yang spesifik sesuai format di atas.
4. Jika perubahan mencakup beberapa jenis yang berbeda (misalnya fitur baru + perbaikan dokumentasi), sarankan memisahkannya menjadi beberapa commit, masing-masing dengan prefix sendiri.
5. Bila perubahan rumit, boleh tambahkan body setelah satu baris kosong untuk menjelaskan alasan perubahan; baris pertama tetap mengikuti format standar.
6. Jangan melakukan commit dengan pesan di luar standar ini. Jika konteks perubahan tidak jelas, tanyakan dulu kepada pengguna.

## Pemilihan Prefix Saat Ragu

- Ubah perilaku untuk pengguna akhir, fungsi baru -> `feat`
- Perilaku salah menjadi benar -> `fix`
- Hanya file .md atau dokumentasi -> `docs`
- Hanya tampilan/format, logika sama -> `style`
- Logika sama, struktur lebih rapi -> `refactor`
- Config, dependency, tooling, housekeeping -> `chore`
