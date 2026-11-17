import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

// Magic bytes signatures inspection
function verifyMagicBytes(bytes: Uint8Array): string | null {
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

serve(async (req) => {
	// CORS handling
	if (req.method === "OPTIONS") {
		return new Response("ok", {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	}

	try {
		const formData = await req.formData();
		const file = formData.get("frame") as File;
		const slug = (formData.get("slug") as string)?.trim().toLowerCase();

		if (!file || !slug) {
			return new Response(
				JSON.stringify({ error: "File frame dan slug wajib disertakan." }),
				{ status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
			);
		}

		// 1. Validasi Ukuran File (Maksimal 3MB)
		if (file.size > MAX_FILE_SIZE) {
			return new Response(
				JSON.stringify({
					error: `Ukuran file melebihi batas maksimal 3MB (Ukuran file: ${(
						file.size /
						(1024 * 1024)
					).toFixed(2)} MB).`,
				}),
				{ status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
			);
		}

		// 2. Validasi Ekstensi Berkas
		const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
		if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
			return new Response(
				JSON.stringify({
					error: "Ekstensi file tidak didukung. Hanya diperbolehkan: .png, .jpg, .jpeg, .webp.",
				}),
				{ status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
			);
		}

		// 3. Validasi Magic Bytes (Deteksi Asli MIME Type)
		const arrayBuffer = await file.arrayBuffer();
		const headerBytes = new Uint8Array(arrayBuffer.slice(0, 16));
		const detectedMime = verifyMagicBytes(headerBytes);

		if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
			return new Response(
				JSON.stringify({
					error: "Format berkas tidak valid atau rusak. Harus berupa gambar PNG, JPG/JPEG, atau WEBP asli.",
				}),
				{ status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
			);
		}

		// 4. Inisialisasi Supabase Admin Client
		const supabaseAdmin = createClient(
			Deno.env.get("SUPABASE_URL") ?? "",
			Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
		);

		// 5. Upload ke Supabase Storage
		const fileName = `frames/${slug}-${Date.now()}.${fileExt}`;
		const bucketName = Deno.env.get("VITE_SUPABASE_STORAGE_BUCKET") || "freebbonize-files";

		const { error: uploadError } = await supabaseAdmin.storage
			.from(bucketName)
			.upload(fileName, arrayBuffer, {
				contentType: detectedMime,
				upsert: true,
			});

		if (uploadError) {
			return new Response(JSON.stringify({ error: uploadError.message }), {
				status: 500,
				headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
			});
		}

		// 6. Dapatkan Public URL
		const { data: urlData } = supabaseAdmin.storage
			.from(bucketName)
			.getPublicUrl(fileName);

		return new Response(
			JSON.stringify({
				success: true,
				frameUrl: urlData.publicUrl,
				fileName: fileName,
				detectedMime: detectedMime,
				fileSize: file.size,
			}),
			{ status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Internal server error";
		return new Response(
			JSON.stringify({ error: message }),
			{ status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
		);
	}
});
