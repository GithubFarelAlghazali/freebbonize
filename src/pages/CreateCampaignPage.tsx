import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	UploadCloud,
	CheckCircle2,
	AlertCircle,
	Sparkles,
	ArrowRight,
	Image as ImageIcon,
	Type,
	FileText,
	Layers,
	Tag,
} from "lucide-react";
import { supabase, STORAGE_BUCKET } from "../lib/supabase";

const RESERVED_SLUGS = ["admin", "api", "create", "new", "assets", "public", "static", "login", "register"];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export default function CreateCampaignPage() {
	const navigate = useNavigate();

	// Form states
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [captionTemplate, setCaptionTemplate] = useState("Halo! Saya [nama] siap berpartisipasi dalam [acara]! Ikutan juga yuk!");
	const [captionProps, setCaptionProps] = useState<string[]>(["nama", "acara"]);
	const [newPropInput, setNewPropInput] = useState("");

	// File & Frame states
	const [frameFile, setFrameFile] = useState<File | null>(null);
	const [framePreview, setFramePreview] = useState<string | null>(null);
	const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number } | null>(null);

	// Validation states
	const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
	const [slugMessage, setSlugMessage] = useState("");
	const [fileError, setFileError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Slug normalization
	function normalizeSlug(val: string): string {
		return val
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "")
			.replace(/-+/g, "-");
	}

	// Debounced slug availability checker
	async function checkSlug(slugToCheck: string) {
		const cleanSlug = slugToCheck.trim().toLowerCase();

		if (RESERVED_SLUGS.includes(cleanSlug)) {
			setSlugStatus("invalid");
			setSlugMessage("Slug ini merupakan kata kunci sistem dan tidak dapat digunakan.");
			return;
		}

		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
			setSlugStatus("invalid");
			setSlugMessage("Format slug hanya boleh huruf kecil, angka, dan tanda hubung (-).");
			return;
		}

		setSlugStatus("checking");

		try {
			const { data, error } = await supabase
				.from("campaigns")
				.select("id")
				.eq("slug", cleanSlug)
				.maybeSingle();

			if (error) {
				console.error("Error checking slug:", error);
				setSlugStatus("idle");
				return;
			}

			if (data) {
				setSlugStatus("taken");
				setSlugMessage(`Slug "${cleanSlug}" sudah digunakan. Silakan pilih nama lain.`);
			} else {
				setSlugStatus("available");
				setSlugMessage(`Slug "${cleanSlug}" tersedia!`);
			}
		} catch (err: unknown) {
			console.error("Slug check failed:", err);
			setSlugStatus("idle");
		}
	}

	function handleTitleChange(val: string) {
		setTitle(val);
		if (slugStatus === "idle" || slug === "") {
			const suggested = normalizeSlug(val).slice(0, 50);
			setSlug(suggested);
		}
	}

	function handleSlugInput(val: string) {
		const normalized = normalizeSlug(val);
		setSlug(normalized);
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			if (slug.length >= 2) {
				checkSlug(slug);
			} else {
				setSlugStatus("idle");
				setSlugMessage("");
			}
		}, 400);
		return () => clearTimeout(timer);
	}, [slug]);

	// File selection and dimension detection
	function handleFileSelected(file: File) {
		setFileError(null);

		// Size check
		if (file.size > MAX_FILE_SIZE) {
			setFileError(`Ukuran file melebihi batas maksimal 3MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
			return;
		}

		// Extension check
		const ext = file.name.split(".").pop()?.toLowerCase() || "";
		if (!["png", "jpg", "jpeg", "webp"].includes(ext)) {
			setFileError("Hanya file gambar dengan ekstensi .png, .jpg, .jpeg, atau .webp yang diizinkan.");
			return;
		}

		setFrameFile(file);
		const objectUrl = URL.createObjectURL(file);
		setFramePreview(objectUrl);

		// Inspect natural dimensions
		const img = new Image();
		img.onload = () => {
			setFrameDimensions({ width: img.naturalWidth, height: img.naturalHeight });
		};
		img.src = objectUrl;
	}

	// Dynamic props tag management
	function addProp(tag: string) {
		const clean = tag.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
		if (clean && !captionProps.includes(clean)) {
			setCaptionProps([...captionProps, clean]);
			setNewPropInput("");
		}
	}

	function removeProp(tagToRemove: string) {
		setCaptionProps(captionProps.filter((p) => p !== tagToRemove));
	}

	// Submission
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitError(null);

		if (!title.trim()) {
			setSubmitError("Nama kampanye wajib diisi.");
			return;
		}

		if (!slug.trim() || slugStatus !== "available") {
			setSubmitError("Silakan masukkan slug yang valid dan tersedia.");
			return;
		}

		if (!frameFile || !frameDimensions) {
			setSubmitError("Silakan unggah gambar bingkai Twibbon.");
			return;
		}

		setIsSubmitting(true);

		try {
			// 1. Upload frame to Supabase Storage
			const ext = frameFile.name.split(".").pop()?.toLowerCase() || "png";
			const fileName = `frames/${slug}-${Date.now()}.${ext}`;

			const { error: uploadError } = await supabase.storage
				.from(STORAGE_BUCKET)
				.upload(fileName, frameFile, {
					contentType: frameFile.type || "image/png",
					upsert: true,
				});

			if (uploadError) {
				throw new Error(`Gagal mengunggah gambar ke storage: ${uploadError.message}`);
			}

			// 2. Get Public URL
			const { data: urlData } = supabase.storage
				.from(STORAGE_BUCKET)
				.getPublicUrl(fileName);

			const publicFrameUrl = urlData.publicUrl;

			// 3. Insert record into PostgreSQL 'campaigns' table
			const { error: insertError } = await supabase.from("campaigns").insert({
				slug: slug.trim().toLowerCase(),
				title: title.trim(),
				description: description.trim() || null,
				frame_url: publicFrameUrl,
				frame_width: frameDimensions.width,
				frame_height: frameDimensions.height,
				caption_template: captionTemplate.trim(),
				caption_props: captionProps,
			});

			if (insertError) {
				throw new Error(`Gagal menyimpan kampanye: ${insertError.message}`);
			}

			// 4. Redirect to the newly created campaign page
			navigate(`/${slug.trim().toLowerCase()}`);
		} catch (err: unknown) {
			console.error("Submission failed:", err);
			const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses kampanye.";
			setSubmitError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-[#040506] text-[#e6e6e6] p-4 sm:p-8 flex justify-center items-center">
			<div className="w-full max-w-4xl bg-[#07080a] border border-[#2f3031] rounded-2xl p-6 sm:p-10 shadow-2xl">
				{/* Header Section */}
				<header className="mb-8 border-b border-[#2f3031] pb-6">
					<div className="flex items-center gap-2 text-[#ff6363] text-sm font-semibold tracking-wider uppercase mb-2">
						<Sparkles className="w-4 h-4" />
						Buat Kampanye Twibbon Baru
					</div>
					<h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
						Luncurkan Twibbon Anda dalam Hitungan Menit
					</h1>
					<p className="text-[#9c9c9d] mt-2 text-sm sm:text-base">
						Tanpa perlu login atau registrasi. Unggah bingkai twibbon Anda, tentukan URL kustom, dan bagikan langsung ke peserta acara.
					</p>
				</header>

				{submitError && (
					<div className="mb-6 p-4 rounded-xl bg-[#452324] border border-[#ff6363]/40 flex items-start gap-3 text-[#ff6363]">
						<AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
						<div className="text-sm font-medium">{submitError}</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Grid 2 Columns for Title and Slug */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Title Input */}
						<div>
							<label className="flex items-center gap-2 text-sm font-medium text-[#e6e6e6] mb-2">
								<Type className="w-4 h-4 text-[#ff6363]" />
								Nama Acara / Kampanye <span className="text-[#ff6363]">*</span>
							</label>
							<input
								type="text"
								required
								value={title}
								onChange={(e) => handleTitleChange(e.target.value)}
								placeholder="contoh: FancyEvent 2026"
								className="w-full px-4 py-3 bg-[#111214] border border-[#2f3031] rounded-xl text-white placeholder-[#6a6b6c] focus:outline-none focus:border-[#ff6363] transition-colors"
							/>
						</div>

						{/* Slug Input with URL Prefix Pill */}
						<div>
							<label className="flex items-center justify-between text-sm font-medium text-[#e6e6e6] mb-2">
								<span className="flex items-center gap-2">
									<Layers className="w-4 h-4 text-[#ff6363]" />
									Kustom URL (Slug) <span className="text-[#ff6363]">*</span>
								</span>
								{slugStatus === "checking" && <span className="text-xs text-[#9c9c9d]">Memeriksa...</span>}
								{slugStatus === "available" && (
									<span className="text-xs text-[#59d499] flex items-center gap-1">
										<CheckCircle2 className="w-3.5 h-3.5" /> Tersedia
									</span>
								)}
								{slugStatus === "taken" && (
									<span className="text-xs text-[#ff6363] flex items-center gap-1">
										<AlertCircle className="w-3.5 h-3.5" /> Terpakai
									</span>
								)}
							</label>
							<div className="flex items-center bg-[#111214] border border-[#2f3031] rounded-xl overflow-hidden focus-within:border-[#ff6363] transition-colors">
								<span className="px-3 py-3 bg-[#1b1c1e] text-[#6a6b6c] text-xs sm:text-sm font-mono border-r border-[#2f3031] select-none">
									/
								</span>
								<input
									type="text"
									required
									value={slug}
									onChange={(e) => handleSlugInput(e.target.value)}
									placeholder="nama-acara-kamu"
									className="w-full px-3 py-3 bg-transparent text-white font-mono text-sm placeholder-[#6a6b6c] focus:outline-none"
								/>
							</div>
							{slugMessage && (
								<p
									className={`text-xs mt-1.5 font-medium ${
										slugStatus === "available" ? "text-[#59d499]" : "text-[#ff6363]"
									}`}
								>
									{slugMessage}
								</p>
							)}
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="flex items-center gap-2 text-sm font-medium text-[#e6e6e6] mb-2">
							<FileText className="w-4 h-4 text-[#9c9c9d]" />
							Deskripsi Acara (Opsional)
						</label>
						<textarea
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Tuliskan keterangan singkat mengenai acara atau kampanye ini..."
							className="w-full px-4 py-3 bg-[#111214] border border-[#2f3031] rounded-xl text-white placeholder-[#6a6b6c] focus:outline-none focus:border-[#ff6363] transition-colors"
						/>
					</div>

					{/* Frame Upload Dropzone */}
					<div>
						<label className="flex items-center justify-between text-sm font-medium text-[#e6e6e6] mb-2">
							<span className="flex items-center gap-2">
								<ImageIcon className="w-4 h-4 text-[#ff6363]" />
								Unggah Bingkai Twibbon (.PNG Transparan) <span className="text-[#ff6363]">*</span>
							</span>
							<span className="text-xs text-[#9c9c9d]">Maksimal 3MB (PNG, JPG, WEBP)</span>
						</label>

						<div
							onClick={() => fileInputRef.current?.click()}
							className="group relative border-2 border-dashed border-[#454647] hover:border-[#ff6363] rounded-2xl p-6 sm:p-8 bg-[#111214]/60 hover:bg-[#111214] transition-all cursor-pointer flex flex-col items-center justify-center text-center"
						>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/webp"
								onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
								className="hidden"
							/>

							{framePreview ? (
								<div className="flex flex-col sm:flex-row items-center gap-6">
									<div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-black/40 border border-[#2f3031] flex items-center justify-center p-2 shadow-inner">
										<img
											src={framePreview}
											alt="Twibbon Preview"
											className="w-full h-full object-contain"
										/>
									</div>
									<div className="text-left space-y-2">
										<div className="text-sm font-semibold text-white truncate max-w-xs">
											{frameFile?.name}
										</div>
										{frameDimensions && (
											<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1b1c1e] text-[#9c9c9d] text-xs font-mono rounded-lg border border-[#2f3031]">
												{frameDimensions.width} × {frameDimensions.height} px
												<span className="text-[#ff6363]">
													({(frameDimensions.width / frameDimensions.height).toFixed(2)}:1)
												</span>
											</div>
										)}
										<p className="text-xs text-[#9c9c9d]">
											Klik di sini untuk mengganti gambar bingkai.
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<div className="w-12 h-12 rounded-xl bg-[#1b1c1e] border border-[#2f3031] flex items-center justify-center mx-auto text-[#ff6363] group-hover:scale-110 transition-transform">
										<UploadCloud className="w-6 h-6" />
									</div>
									<div>
										<p className="text-sm font-semibold text-white">
											Klik untuk unggah atau seret bingkai twibbon ke sini
										</p>
										<p className="text-xs text-[#6a6b6c] mt-1">
											Gunakan format PNG dengan area foto transparan agar foto peserta terlihat di belakang bingkai.
										</p>
									</div>
								</div>
							)}
						</div>

						{fileError && (
							<p className="text-xs text-[#ff6363] mt-2 flex items-center gap-1 font-medium">
								<AlertCircle className="w-3.5 h-3.5" />
								{fileError}
							</p>
						)}
					</div>

					{/* Caption Template & Variables */}
					<div className="p-5 rounded-2xl bg-[#0e1012] border border-[#2f3031] space-y-4">
						<label className="block text-sm font-medium text-[#e6e6e6]">
							Pengaturan Caption Media Sosial
						</label>

						<div>
							<span className="text-xs text-[#9c9c9d] block mb-2">
								Template Caption (Gunakan format tanda kurung siku seperti <code className="text-[#ff6363]">[nama]</code> untuk kolom yang dapat diisi peserta):
							</span>
							<textarea
								rows={2}
								value={captionTemplate}
								onChange={(e) => setCaptionTemplate(e.target.value)}
								className="w-full px-4 py-3 bg-[#111214] border border-[#2f3031] rounded-xl text-white text-sm placeholder-[#6a6b6c] focus:outline-none focus:border-[#ff6363] transition-colors"
							/>
						</div>

						{/* Tag Variables */}
						<div>
							<span className="text-xs text-[#9c9c9d] block mb-2">
								Variabel Input Form Peserta:
							</span>
							<div className="flex flex-wrap items-center gap-2">
								{captionProps.map((prop) => (
									<span
										key={prop}
										className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1b1c1e] text-[#e6e6e6] text-xs font-mono rounded-lg border border-[#2f3031]"
									>
										<Tag className="w-3 h-3 text-[#ff6363]" />
										[{prop}]
										<button
											type="button"
											onClick={() => removeProp(prop)}
											className="hover:text-[#ff6363] text-[#6a6b6c] ml-1 text-sm font-bold leading-none cursor-pointer"
										>
											×
										</button>
									</span>
								))}

								<div className="flex items-center gap-1">
									<input
										type="text"
										value={newPropInput}
										onChange={(e) => setNewPropInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addProp(newPropInput);
											}
										}}
										placeholder="+ tambah variabel (cth: instansi)"
										className="px-3 py-1 text-xs bg-[#111214] border border-[#2f3031] rounded-lg text-white placeholder-[#6a6b6c] focus:outline-none focus:border-[#ff6363]"
									/>
									<button
										type="button"
										onClick={() => addProp(newPropInput)}
										className="px-3 py-1 text-xs bg-[#1b1c1e] hover:bg-[#2f3031] text-[#e6e6e6] rounded-lg border border-[#2f3031] cursor-pointer"
									>
										Tambah
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Action Submit */}
					<div className="pt-4 flex justify-end">
						<button
							type="submit"
							disabled={isSubmitting || slugStatus === "taken" || slugStatus === "checking"}
							className="w-full sm:w-auto px-8 py-4 bg-[#e6e6e6] hover:bg-white text-[#040506] font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<>Membuat Kampanye...</>
							) : (
								<>
									Publikasikan & Buka Twibbon
									<ArrowRight className="w-5 h-5 text-[#ff6363]" />
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}
