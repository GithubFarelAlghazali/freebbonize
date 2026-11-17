export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

/**
 * Memeriksa magic bytes sejati dari header file biner
 */
export function verifyMagicBytes(bytes: Uint8Array): string | null {
	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return "image/png";
	}

	// JPEG: FF D8 FF
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return "image/jpeg";
	}

	// WEBP: 'RIFF'....'WEBP' (52 49 46 46 ... 57 45 42 50)
	if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return "image/webp";
	}

	return null;
}

export interface ValidationResult {
	valid: boolean;
	error?: string;
	detectedMime?: string;
	fileSize?: number;
}

/**
 * Validasi lengkap berkas: ukuran (<= 3MB), ekstensi, dan magic bytes MIME
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
	// 1. Validasi Ukuran (Maks 3MB)
	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `Ukuran file melebihi batas maksimal 3MB (Ukuran file: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
		};
	}

	// 2. Validasi Ekstensi
	const ext = file.name.split(".").pop()?.toLowerCase() || "";
	if (!ALLOWED_EXTENSIONS.includes(ext)) {
		return {
			valid: false,
			error: `Ekstensi file .${ext || "unknown"} tidak didukung. Hanya file dengan ekstensi .png, .jpg, .jpeg, atau .webp yang diizinkan.`,
		};
	}

	// 3. Validasi Magic Bytes (Deteksi Asli Biner)
	try {
		const arrayBuffer = await file.slice(0, 16).arrayBuffer();
		const bytes = new Uint8Array(arrayBuffer);
		const detectedMime = verifyMagicBytes(bytes);

		if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
			return {
				valid: false,
				error: "Format berkas tidak valid atau rusak. Harus berupa gambar PNG, JPG/JPEG, atau WEBP asli.",
			};
		}

		return {
			valid: true,
			detectedMime,
			fileSize: file.size,
		};
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Gagal membaca header berkas.";
		return {
			valid: false,
			error: `Gagal membaca header berkas: ${msg}`,
		};
	}
}

/**
 * Mengekstrak dimensi asli (naturalWidth & naturalHeight) serta menghitung aspek rasio
 */
export function extractImageDimensions(
	fileOrUrl: File | string
): Promise<{ width: number; height: number; aspectRatio: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);

		img.onload = () => {
			const width = img.naturalWidth;
			const height = img.naturalHeight;
			const aspectRatio = height > 0 ? Number((width / height).toFixed(4)) : 1;
			if (typeof fileOrUrl !== "string") {
				URL.revokeObjectURL(url);
			}
			resolve({ width, height, aspectRatio });
		};

		img.onerror = () => {
			if (typeof fileOrUrl !== "string") {
				URL.revokeObjectURL(url);
			}
			reject(new Error("Gagal memuat gambar untuk membaca dimensi."));
		};

		img.src = url;
	});
}
