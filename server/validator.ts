import type { IncomingMessage, ServerResponse } from "http";

export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export function checkMagicBytes(buffer: Buffer): string | null {
	if (buffer.length < 12) return null;

	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0d &&
		buffer[5] === 0x0a &&
		buffer[6] === 0x1a &&
		buffer[7] === 0x0a
	) {
		return "image/png";
	}

	// JPEG: FF D8 FF
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return "image/jpeg";
	}

	// WEBP: 'RIFF'....'WEBP' (52 49 46 46 ... 57 45 42 50)
	if (
		buffer[0] === 0x52 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x46 &&
		buffer[8] === 0x57 &&
		buffer[9] === 0x45 &&
		buffer[10] === 0x42 &&
		buffer[11] === 0x50
	) {
		return "image/webp";
	}

	return null;
}

export interface ServerValidationResult {
	valid: boolean;
	status: number;
	error?: string;
	mimeType?: string;
	size?: number;
}

export function validateUploadedBuffer(buffer: Buffer, filename: string): ServerValidationResult {
	// 1. Validasi Ukuran (Maksimal 3MB)
	if (buffer.length > MAX_FILE_SIZE) {
		return {
			valid: false,
			status: 400,
			error: `Ukuran file melebihi batas maksimal 3MB (Ukuran file: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
		};
	}

	// 2. Validasi Ekstensi
	const ext = filename.split(".").pop()?.toLowerCase() || "";
	if (!ALLOWED_EXTENSIONS.includes(ext)) {
		return {
			valid: false,
			status: 400,
			error: `Ekstensi berkas .${ext || "unknown"} tidak didukung. Hanya diperbolehkan: .png, .jpg, .jpeg, .webp.`,
		};
	}

	// 3. Validasi Magic Bytes (Deteksi Asli MIME Type)
	const detectedMime = checkMagicBytes(buffer);
	if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
		return {
			valid: false,
			status: 400,
			error: "Format berkas tidak valid atau rusak. Harus berupa gambar PNG, JPG/JPEG, atau WEBP asli.",
		};
	}

	return {
		valid: true,
		status: 200,
		mimeType: detectedMime,
		size: buffer.length,
	};
}

/**
 * Middleware handler untuk Vite dev server (/api/validate-frame)
 */
export async function handleBackendValidation(req: IncomingMessage, res: ServerResponse) {
	if (req.method === "OPTIONS") {
		res.writeHead(200, {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, X-Filename",
		});
		res.end();
		return;
	}

	if (req.method !== "POST") {
		res.writeHead(405, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "Method not allowed. Gunakan POST." }));
		return;
	}

	const chunks: Buffer[] = [];

	req.on("data", (chunk: Buffer) => {
		chunks.push(chunk);
	});

	req.on("end", () => {
		const fullBuffer = Buffer.concat(chunks);
		const filename = (req.headers["x-filename"] as string) || "upload.png";

		const result = validateUploadedBuffer(fullBuffer, filename);

		res.writeHead(result.status, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		});
		res.end(JSON.stringify(result));
	});

	req.on("error", (err) => {
		res.writeHead(500, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: err.message || "Internal server error" }));
	});
}
