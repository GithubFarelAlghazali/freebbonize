# Implementation Plan: 004 - Caption Variable Validation

## 1. Overview & Objectives

Rencana implementasi ini bertujuan untuk memperkuat validasi pada bagian **Pengaturan Caption Media Sosial** dan **Variabel Input Form Peserta** di halaman `CreateCampaignPage` (`/`).

Terdapat 3 aturan validasi utama yang akan diterapkan:

1. **Pencegahan Spasi pada Variabel:** Input variabel tidak boleh mengandung karakter spasi (contoh: `NAMA LENGKAP` ditolak).
2. **Kewajiban Huruf Kapital (_Uppercase Only_):** Input variabel **wajib menggunakan huruf kapital seluruhnya** (contoh: `nama` atau `Nama` ditolak; hanya format seperti `NAMA`, `ACARA`, `INSTITUSI` yang diterima).
3. **Validasi Sinkronisasi Dua Arah (_Template-to-Props Consistency_):**
   - Jika terdapat perbedaan penulisan atau kapitalisasi antara variabel di daftar form peserta dengan variabel di template caption (misalnya di daftar ditulis `NAMA` tetapi di template ditulis `[nama]` atau `[Nama]`), sistem wajib menolak dan menampilkan pesan kesalahan.
   - Jika ada variabel yang terdaftar di form peserta tetapi **tidak digunakan** sama sekali di dalam template caption (contoh: variabel `[ACARA]` ada di form, tapi template tidak memuat `[ACARA]`), sistem wajib menolak.
   - Jika ada variabel yang digunakan di dalam template caption tetapi **belum didaftarkan** pada form peserta, sistem wajib menolak.
   - Selama ada ketidaksesuaian, sistem **tidak boleh melanjutkan submit data** ke Supabase/PostgreSQL.

---

## 2. Design System Reference

Seluruh elemen antarmuka, input state, badge kesalahan, dan umpan balik visual wajib merujuk pada standar:

- **Design Reference File:** `DevReferences/Skills/DESIGN.md`
- **Tokens yang Digunakan:**
  - Background Container: `--color-obsidian` (`#111214`) & `--color-ink` (`#07080a`)
  - Border Subdued: `--color-slate` (`#2f3031`)
  - Accent / Focus: `--color-azure-pulse` (`#4d8bff`) & `--color-cobalt-edge` (`#143ca3`)
  - Error Background: `--color-error-hush` (`#3d1417`)
  - Error Border: `#ff4d4d` dengan opacity $40\%$
  - Error Text: `--color-error` (`#ff4d4d`)
  - Monospace Font: `JetBrains Mono` (`font-mono`) untuk representasi token `[VARIABEL]`

---

## 3. Spesifikasi Aturan Validasi (Validation Logic Specification)

### 3.1 Validasi Input Penambahan Variabel Baru (`newPropInput`)

Saat pengguna mengetik di input `+ tambah variabel` dan menekan **Enter** atau mengklik tombol **Tambah**:

| Kasus Input                                                                     | Status      | Pesan Kesalahan / Tindakan                                                                        |
| ------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Mengandung spasi (misal: `"NAMA PESERTA"`)                                      | ❌ Ditolak  | _"Nama variabel tidak boleh mengandung spasi (gunakan underscore, contoh: NAMA_PESERTA)."_        |
| Mengandung huruf kecil (misal: `"nama"`, `"Nama"`)                              | ❌ Ditolak  | _"Nama variabel wajib menggunakan huruf kapital seluruhnya (contoh: NAMA, ACARA, NAMA_LENGKAP)."_ |
| Mengandung simbol selain underscore (misal: `"NAMA-LENGKAP"`, `"NAMA@PESERTA"`) | ❌ Ditolak  | _"Nama variabel hanya boleh berisi huruf kapital (A-Z), angka (0-9), dan garis bawah (\_)."_      |
| Sudah ada di daftar `captionProps`                                              | ❌ Ditolak  | _"Variabel '[TOKEN]' sudah terdaftar sebelumnya."_                                                |
| Format valid (misal: `"NAMA"`, `"INSTITUSI_ASAL"`, `"ANGKATAN_2026"`)           | ✅ Diterima | Ditambahkan ke `captionProps`, input dibersihkan, error di-reset ke `null`.                       |

### 3.2 Validasi Konsistensi Template Caption (`captionTemplate`) vs Variabel Form (`captionProps`)

Dijalankan secara reaktif (saat template diketik / tag diubah) dan **wajib divalidasi ulang saat form di-submit** (`handleSubmit`):

1. **Ekstraksi Token Template:**
   Menggunakan regex pencarian pola kurung siku:

   ```typescript
   const matches = [...captionTemplate.matchAll(/\[([^\]]+)\]/g)];
   const rawTokens = matches.map((m) => m[1]); // e.g. ["NAMA", "acara", "Instansi"]
   ```

2. **Aturan Evaluasi Ketidaksesuaian:**

   - **Kasus A (Case Mismatch pada Template):**
     Jika ada token di template yang mengandung huruf kecil (misal `[nama]` atau `[Nama]`), laporkan:
     > _"Variabel '[token]' pada template caption harus menggunakan huruf kapital seluruhnya (contoh: [TOKEN])."_
   - **Kasus B (Token Template Belum Didaftarkan):**
     Jika token di template berhuruf kapital tetapi tidak terdaftar di `captionProps` (misal template ada `[SEKOLAH]`, tapi di props hanya ada `NAMA`), laporkan:
     > _"Variabel '[SEKOLAH]' digunakan di template caption namun belum ditambahkan pada Variabel Input Form Peserta."_
   - **Kasus C (Variabel Terdaftar Tidak Digunakan):**
     Jika ada variabel di `captionProps` yang tidak ditemukan di `captionTemplate` (misal props memuat `ACARA`, tetapi template tidak memiliki `[ACARA]`), laporkan:
     > _"Variabel '[ACARA]' terdaftar di form peserta namun tidak digunakan di dalam Template Caption."_

3. **Penolakan Submit (Submit Guard):**
   Jika ditemukan minimal 1 kesalahan sinkronisasi:
   - Form submission dihentikan (`return`).
   - `submitError` atau `captionSyncErrors` menampilkan daftar error secara transparan.
   - Layar otomatis menyorot ke blok _Pengaturan Caption Media Sosial_.

---

## 4. Rincian Implementasi Langkah Demi Langkah

### Langkah 1: Penyesuaian Nilai Default di `CreateCampaignPage.tsx`

Mengubah nilai bawaan template dan variabel agar menggunakan huruf kapital:

```typescript
const [captionTemplate, setCaptionTemplate] = useState(
  "Halo! Saya [NAMA] siap berpartisipasi dalam [ACARA]! Ikutan juga yuk!"
);
const [captionProps, setCaptionProps] = useState<string[]>(["NAMA", "ACARA"]);
const [propInputError, setPropInputError] = useState<string | null>(null);
const [captionSyncErrors, setCaptionSyncErrors] = useState<string[]>([]);
```

### Langkah 2: Implementasi Fungsi Validator Sinkronisasi (Uppercase Oriented)

Membuat fungsi murni (_pure function_) yang menerima `template` dan `props`:

```typescript
function validateCaptionVariables(template: string, props: string[]): string[] {
  const errors: string[] = [];
  const matches = [...template.matchAll(/\[([^\]]+)\]/g)];
  const rawTokens = matches.map((m) => m[1].trim());

  // 1. Cek adanya huruf kecil pada template (wajib huruf kapital seluruhnya)
  rawTokens.forEach((token) => {
    if (/[a-z]/.test(token)) {
      errors.push(
        `Variabel "[${token}]" pada template caption harus menggunakan huruf kapital seluruhnya (gunakan [${token.toUpperCase()}]).`
      );
    }
  });

  // 2. Cek token di template yang belum terdaftar di props
  rawTokens.forEach((token) => {
    const upperToken = token.toUpperCase();
    if (!props.includes(upperToken)) {
      errors.push(
        `Variabel "[${upperToken}]" digunakan di template caption namun belum didaftarkan pada Variabel Input Form Peserta.`
      );
    }
  });

  // 3. Cek variabel di props yang tidak dipakai di template
  props.forEach((prop) => {
    if (!rawTokens.includes(prop)) {
      errors.push(
        `Variabel "[${prop}]" terdaftar pada form peserta namun tidak digunakan di dalam Template Caption.`
      );
    }
  });

  return Array.from(new Set(errors));
}
```

### Langkah 3: Pengetatan Fungsi `addProp` (Uppercase Validation)

Memodifikasi fungsi penambahan variabel:

- Jika string kosong: reset input.
- Jika mengandung spasi `/\s/.test(tag)`: tampilkan error _"Nama variabel tidak boleh mengandung spasi (gunakan underscore, contoh: NAMA_LENGKAP)."_
- Jika mengandung huruf kecil `/[a-z]/.test(tag)`: tampilkan error _"Nama variabel wajib menggunakan huruf kapital seluruhnya (contoh: NAMA, ACARA)."_
- Jika mengandung simbol selain underscore `/[^A-Z0-9_]/.test(tag)`: tampilkan error _"Nama variabel hanya boleh berisi huruf kapital (A-Z), angka (0-9), dan garis bawah (\_)."_
- Jika sudah terdaftar: tampilkan error _"Variabel sudah terdaftar sebelumnya."_
- Jika valid: masukkan ke `captionProps`, bersihkan `newPropInput`, dan hapus `propInputError`.

### Langkah 4: Penyematan Validasi pada `handleSubmit`

Sebelum melakukan upload Supabase Storage dan insert database:

```typescript
const syncErrors = validateCaptionVariables(captionTemplate, captionProps);
if (syncErrors.length > 0) {
  setCaptionSyncErrors(syncErrors);
  setSubmitError(
    "Terdapat ketidaksesuaian antara template caption dan variabel form peserta. Silakan periksa pesan kesalahan di bawah."
  );
  setIsSubmitting(false);
  return;
}
```

### Langkah 5: Penyempurnaan Tampilan UI (Raycast Midnight Style)

- Menampilkan pesan kesalahan instan di bawah input `+ tambah variabel` saat ada spasi atau huruf kecil.
- Menampilkan panel kesalahan bertema Raycast (`#3d1417` dengan teks `#ff4d4d` dan ikon `AlertCircle`) di bagian _Pengaturan Caption Media Sosial_ jika terdapat error sinkronisasi.

---

## 5. Rencana Pengujian & Verifikasi (Testing Plan)

| No  | Skenario Pengujian                       | Input Uji                                                               | Ekspektasi Hasil                                                            |
| --- | ---------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Input variabel mengandung spasi          | Ketik `"NAMA LENGKAP"` lalu klik Tambah                                 | Muncul pesan error: tidak boleh mengandung spasi; tidak dimasukkan ke tags. |
| 2   | Input variabel mengandung huruf kecil    | Ketik `"nama"` atau `"Nama"` lalu klik Tambah                           | Muncul pesan error: wajib huruf kapital; tidak dimasukkan ke tags.          |
| 3   | Input variabel simbol tidak sah          | Ketik `"NAMA-LENGKAP"` atau `"NAMA@"`                                   | Muncul pesan error format karakter simbol.                                  |
| 4   | Mismatch Case di Template                | Props: `["NAMA"]`, Template: `"Halo [nama] siap!"`                      | Muncul pesan: `[nama]` harus huruf kapital (`[NAMA]`); submit diblokir.     |
| 5   | Variabel Template Belum Terdaftar        | Props: `["NAMA"]`, Template: `"Halo [NAMA] dari [SEKOLAH]"`             | Muncul pesan: `[SEKOLAH]` belum didaftarkan; submit diblokir.               |
| 6   | Variabel Props Tidak Digunakan           | Props: `["NAMA", "ACARA"]`, Template: `"Halo [NAMA] hadir!"`            | Muncul pesan: `[ACARA]` tidak digunakan di template; submit diblokir.       |
| 7   | Seluruh Variabel Cocok & Valid (Kapital) | Props: `["NAMA", "ACARA"]`, Template: `"Halo [NAMA] hadir di [ACARA]!"` | Tidak ada error; submit lolos ke tahap upload.                              |
| 8   | Linter & Build Check                     | `pnpm lint` & `pnpm build`                                              | 0 error, 0 warning.                                                         |

---

## 6. Rekomendasi Pesan Git Commit Setelah Eksekusi

```
feat: enforce uppercase caption variables and strict template validation
```
