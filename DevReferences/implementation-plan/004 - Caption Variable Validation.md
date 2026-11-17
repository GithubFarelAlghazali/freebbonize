# Implementation Plan: 004 - Caption Variable Validation

## 1. Overview & Objectives

Rencana implementasi ini bertujuan untuk memperkuat validasi pada bagian **Pengaturan Caption Media Sosial** dan **Variabel Input Form Peserta** di halaman `CreateCampaignPage` (`/`).

Terdapat 3 aturan validasi utama yang akan diterapkan:
1. **Pencegahan Spasi pada Variabel:** Input variabel tidak boleh mengandung karakter spasi (contoh: `nama lengkap` ditolak).
2. **Kewajiban Huruf Kecil (*Lowercase Only*):** Input variabel wajib menggunakan huruf kecil (contoh: `Nama` atau `NAMA` ditolak).
3. **Validasi Sinkronisasi Dua Arah (*Template-to-Props Consistency*):**
   - Jika terdapat perbedaan penulisan antara variabel di daftar form peserta dengan variabel di template caption (misalnya di daftar ditulis `nama` tetapi di template ditulis `[Nama]`), sistem wajib menolak dan menampilkan pesan kesalahan.
   - Jika ada variabel yang terdaftar di form peserta tetapi **tidak digunakan** sama sekali di dalam template caption (contoh: variabel `[acara]` ada di form, tapi template tidak memuat `[acara]`), sistem wajib menolak.
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
  - Monospace Font: `JetBrains Mono` (`font-mono`) untuk representasi token `[variabel]`

---

## 3. Spesifikasi Aturan Validasi (Validation Logic Specification)

### 3.1 Validasi Input Penambahan Variabel Baru (`newPropInput`)

Saat pengguna mengetik di input `+ tambah variabel` dan menekan **Enter** atau mengklik tombol **Tambah**:

| Kasus Input | Status | Pesan Kesalahan / Tindakan |
|---|---|---|
| Mengandung spasi (misal: `"nama peserta"`) | ❌ Ditolak | *"Nama variabel tidak boleh mengandung spasi (gunakan underscore, contoh: nama_peserta)."* |
| Mengandung huruf kapital (misal: `"Nama"` atau `"ACARA"`) | ❌ Ditolak | *"Nama variabel wajib menggunakan huruf kecil seluruhnya (contoh: nama, acara)."* |
| Mengandung karakter simbol selain underscore (misal: `"nama-lengkap"`, `"nama@peserta"`) | ❌ Ditolak | *"Nama variabel hanya boleh berisi huruf kecil (a-z), angka (0-9), dan garis bawah (_)."* |
| Sudah ada di daftar `captionProps` | ❌ Ditolak | *"Variabel '[token]' sudah terdaftar sebelumnya."* |
| Format valid (misal: `"nama"`, `"institusi_asal"`, `"angkatan2026"`) | ✅ Diterima | Ditambahkan ke `captionProps`, input dibersihkan, error di-reset ke `null`. |

### 3.2 Validasi Konsistensi Template Caption (`captionTemplate`) vs Variabel Form (`captionProps`)

Dijalankan secara reaktif (saat template diketik / tag diubah) dan **wajib divalidasi ulang saat form di-submit** (`handleSubmit`):

1. **Ekstraksi Token Template:**
   Menggunakan regex pencarian pola kurung siku:
   ```typescript
   const matches = [...captionTemplate.matchAll(/\[([^\]]+)\]/g)];
   const rawTokens = matches.map((m) => m[1]); // e.g. ["Nama", "acara"]
   ```

2. **Aturan Evaluasi Ketidaksesuaian:**
   - **Kasus A (Case Mismatch pada Template):**
     Jika ada token di template yang memiliki huruf kapital (misal `[Nama]` atau `[ACARA]`), laporkan:
     > *"Variabel '[Token]' pada template caption harus menggunakan huruf kecil seluruhnya (contoh: [token])."*
   - **Kasus B (Token Template Belum Didaftarkan):**
     Jika token di template berhuruf kecil tetapi tidak terdaftar di `captionProps` (misal template ada `[sekolah]`, tapi di props hanya ada `nama`), laporkan:
     > *"Variabel '[sekolah]' digunakan di template caption namun belum ditambahkan pada Variabel Input Form Peserta."*
   - **Kasus C (Variabel Terdaftar Tidak Digunakan):**
     Jika ada variabel di `captionProps` yang tidak ditemukan di `captionTemplate` (misal props memuat `acara`, tetapi template tidak memiliki `[acara]`), laporkan:
     > *"Variabel '[acara]' terdaftar di form peserta namun tidak digunakan di dalam Template Caption."*

3. **Penolakan Submit (Submit Guard):**
   Jika ditemukan minimal 1 kesalahan sinkronisasi:
   - Form submission dihentikan (`return`).
   - `submitError` atau `captionSyncErrors` menampilkan daftar error secara transparan.
   - Layar otomatis menyorot ke blok *Pengaturan Caption Media Sosial*.

---

## 4. Rincian Implementasi Langkah Demi Langkah

### Langkah 1: Penambahan State Validasi di `CreateCampaignPage.tsx`
Menambahkan state lokal untuk melacak kesalahan input tag dan sinkronisasi:
```typescript
const [propInputError, setPropInputError] = useState<string | null>(null);
const [captionSyncErrors, setCaptionSyncErrors] = useState<string[]>([]);
```

### Langkah 2: Implementasi Fungsi Validator Sinkronisasi
Membuat fungsi murni (*pure function*) yang menerima `template` dan `props`:
```typescript
function validateCaptionVariables(
  template: string,
  props: string[]
): string[] {
  const errors: string[] = [];
  const matches = [...template.matchAll(/\[([^\]]+)\]/g)];
  const rawTokens = matches.map((m) => m[1]);
  const templateTokensLower = rawTokens.map((t) => t.toLowerCase());

  // 1. Cek huruf kapital pada template
  rawTokens.forEach((token) => {
    if (/[A-Z]/.test(token)) {
      errors.push(
        `Variabel "[${token}]" pada template caption harus menggunakan huruf kecil (gunakan [${token.toLowerCase()}]).`
      );
    }
  });

  // 2. Cek token di template yang belum terdaftar di props
  templateTokensLower.forEach((token) => {
    if (!props.includes(token)) {
      errors.push(
        `Variabel "[${token}]" digunakan di template caption namun belum didaftarkan pada form peserta.`
      );
    }
  });

  // 3. Cek variabel di props yang tidak dipakai di template
  props.forEach((prop) => {
    if (!templateTokensLower.includes(prop)) {
      errors.push(
        `Variabel "[${prop}]" terdaftar pada form peserta namun tidak digunakan di dalam template caption.`
      );
    }
  });

  return Array.from(new Set(errors));
}
```

### Langkah 3: Pengetatan Fungsi `addProp` & Real-Time Input Sanitizer
Memodifikasi fungsi penambahan variabel:
- Memeriksa adanya spasi via regex `/\s/`.
- Memeriksa adanya huruf kapital via regex `/[A-Z]/`.
- Memeriksa karakter terlarang via regex `/[^a-z0-9_]/`.
- Memberikan feedback visual `propInputError` jika melanggar.

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
- Menampilkan pesan kesalahan instan di bawah input `+ tambah variabel` saat ada spasi atau huruf kapital.
- Menampilkan panel kesalahan bertema Raycast (`#3d1417` dengan teks `#ff4d4d` dan ikon `AlertCircle`) di bagian *Pengaturan Caption Media Sosial* jika terdapat error sinkronisasi.

---

## 5. Rencana Pengujian & Verifikasi (Testing Plan)

| No | Skenario Pengujian | Input Uji | Ekspektasi Hasil |
|---|---|---|---|
| 1 | Input variabel mengandung spasi | Ketik `"nama lengkap"` lalu klik Tambah | Muncul pesan error: tidak boleh mengandung spasi; tidak dimasukkan ke tags. |
| 2 | Input variabel mengandung huruf besar | Ketik `"Nama"` atau `"ACARA"` lalu klik Tambah | Muncul pesan error: wajib huruf kecil; tidak dimasukkan ke tags. |
| 3 | Input variabel simbol tidak sah | Ketik `"nama-lengkap"` atau `"nama@"` | Muncul pesan error format karakter. |
| 4 | Mismatch Case di Template | Props: `["nama"]`, Template: `"Halo [Nama] siap!"` | Muncul pesan: `[Nama]` harus huruf kecil; submit diblokir. |
| 5 | Variabel Template Belum Terdaftar | Props: `["nama"]`, Template: `"Halo [nama] dari [sekolah]"` | Muncul pesan: `[sekolah]` belum didaftarkan; submit diblokir. |
| 6 | Variabel Props Tidak Digunakan | Props: `["nama", "acara"]`, Template: `"Halo [nama] hadir!"` | Muncul pesan: `[acara]` tidak digunakan di template; submit diblokir. |
| 7 | Seluruh Variabel Cocok & Valid | Props: `["nama", "acara"]`, Template: `"Halo [nama] hadir di [acara]!"` | Tidak ada error; submit lolos ke tahap upload. |
| 8 | Linter & Build Check | `pnpm lint` & `pnpm build` | 0 error, 0 warning. |

---

## 6. Rekomendasi Pesan Git Commit Setelah Eksekusi

```
feat: add strict variable validation and template synchronization
```
