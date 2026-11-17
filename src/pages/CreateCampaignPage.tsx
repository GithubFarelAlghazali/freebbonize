import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Image as ImageIcon,
  Type,
  FileText,
  Layers,
  Tag,
} from "lucide-react";
import { supabase, STORAGE_BUCKET } from "../lib/supabase";
import {
  validateImageFile,
  extractImageDimensions,
} from "../lib/file-validator";

const RESERVED_SLUGS = [
  "admin",
  "api",
  "create",
  "new",
  "assets",
  "public",
  "static",
  "login",
  "register",
];

export default function CreateCampaignPage() {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [captionTemplate, setCaptionTemplate] = useState(
    "Halo! Saya [nama] siap berpartisipasi dalam [acara]! Ikutan juga yuk!"
  );
  const [captionProps, setCaptionProps] = useState<string[]>(["nama", "acara"]);
  const [newPropInput, setNewPropInput] = useState("");

  // File & Frame states
  const [frameFile, setFrameFile] = useState<File | null>(null);
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [frameDimensions, setFrameDimensions] = useState<{
    width: number;
    height: number;
    aspectRatio: number;
  } | null>(null);
  const [detectedMime, setDetectedMime] = useState<string>("image/png");

  // Validation states
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
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
      setSlugMessage(
        "Slug ini merupakan kata kunci sistem dan tidak dapat digunakan."
      );
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setSlugStatus("invalid");
      setSlugMessage(
        "Format slug hanya boleh huruf kecil, angka, dan tanda hubung (-)."
      );
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
        setSlugMessage(
          `Slug "${cleanSlug}" sudah digunakan. Silakan pilih nama lain.`
        );
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

  // File selection with binary magic bytes & dimension inspection
  async function handleFileSelected(file: File) {
    setFileError(null);

    const validation = await validateImageFile(file);
    if (!validation.valid) {
      setFileError(validation.error || "File tidak memenuhi syarat.");
      setFrameFile(null);
      setFramePreview(null);
      setFrameDimensions(null);
      return;
    }

    setDetectedMime(validation.detectedMime || "image/png");
    setFrameFile(file);

    try {
      const dims = await extractImageDimensions(file);
      setFrameDimensions(dims);
      setFramePreview(URL.createObjectURL(file));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memproses gambar.";
      setFileError(msg);
    }
  }

  function addProp(tag: string) {
    const clean = tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (clean && !captionProps.includes(clean)) {
      setCaptionProps([...captionProps, clean]);
      setNewPropInput("");
    }
  }

  function removeProp(tagToRemove: string) {
    setCaptionProps(captionProps.filter((p) => p !== tagToRemove));
  }

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
      // Backend Validation Call (via /api/validate-frame)
      try {
        const backendCheck = await fetch("/api/validate-frame", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Filename": frameFile.name,
          },
          body: frameFile,
        });

        if (backendCheck.ok) {
          const backendData = await backendCheck.json();
          if (!backendData.valid) {
            throw new Error(backendData.error || "Validasi backend gagal.");
          }
        }
      } catch (apiErr: unknown) {
        console.warn("Backend validator endpoint check:", apiErr);
      }

      // Upload frame to Supabase Storage
      const ext = frameFile.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `frames/${slug}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, frameFile, {
          contentType: detectedMime,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          `Gagal mengunggah gambar ke storage: ${uploadError.message}`
        );
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      const publicFrameUrl = urlData.publicUrl;

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

      navigate(`/${slug.trim().toLowerCase()}`);
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses kampanye.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#040506] text-[#e6e6e6] p-4 sm:p-8 flex flex-col justify-between items-center">
      {/* Top Glass Navigation Bar */}
      <nav className="w-full max-w-4xl mb-6 px-4 py-2.5 rounded-xl border border-[#363739] bg-[#07080a]/80 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* Azure Diamond Mark */}
          <div className="w-4 h-4 bg-[#4d8bff] rotate-45 rounded-[2px] shadow-[0_0_8px_rgba(77,139,255,0.6)]" />
          <span className="text-sm font-semibold tracking-tight text-white">
            Freebbonize
          </span>
        </div>
        <span className="text-xs font-mono text-[#9c9c9d]">
          v1.0.0 &bull; Open Source
        </span>
      </nav>

      {/* Main Form Card */}
      <div className="w-full max-w-4xl raycast-card p-6 sm:p-10 mb-8">
        {/* Header Section */}
        <header className="mb-8 border-b border-[#2f3031] pb-6">
          <div className="flex items-center gap-2 text-[#4d8bff] text-xs font-semibold tracking-wider uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d8bff]" />
            Buat Kampanye Twibbon Baru
          </div>
          <h1 className="text-2xl sm:text-4xl font-normal text-white tracking-tight">
            Buat Twibbon Anda dalam Hitungan Menit
          </h1>
          <p className="text-[#9c9c9d] mt-2 text-sm sm:text-base leading-relaxed">
            Tanpa login. Mendukung berbagai aspek rasio (persegi, potret 4:5,
            lanskap 16:9, dll.) tanpa pemotongan paksa.
          </p>
        </header>

        {submitError && (
          <div className="mb-6 p-4 rounded-lg bg-[#3d1417] border border-[#ff4d4d]/40 flex items-start gap-3 text-[#ff4d4d]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid 2 Columns for Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Input */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-[#9c9c9d] mb-2">
                <Type className="w-3.5 h-3.5 text-[#4d8bff]" />
                Nama Acara / Kampanye <span className="text-[#4d8bff]">*</span>
              </label>
              <div className="flex items-center bg-[#111214] border border-[#2f3031] rounded-lg overflow-hidden focus-within:border-[#4d8bff] focus-within:ring-1 focus-within:ring-[#4d8bff] transition-all">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="contoh: FancyEvent 2026"
                  className="w-full px-3 py-2 bg-transparent text-white font-mono text-sm placeholder-[#6a6b6c] focus:outline-none"
                />
              </div>
            </div>

            {/* Slug Input with URL Prefix Pill */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-[#9c9c9d] mb-2">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#4d8bff]" />
                  Kustom URL (Slug) <span className="text-[#4d8bff]">*</span>
                </span>
                {slugStatus === "checking" && (
                  <span className="text-[11px] text-[#9c9c9d] font-mono">
                    Memeriksa...
                  </span>
                )}
                {slugStatus === "available" && (
                  <span className="text-[11px] text-[#59d499] flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Tersedia
                  </span>
                )}
                {slugStatus === "taken" && (
                  <span className="text-[11px] text-[#ff4d4d] flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3" /> Terpakai
                  </span>
                )}
              </label>
              <div className="flex items-center bg-[#111214] border border-[#2f3031] rounded-lg overflow-hidden focus-within:border-[#4d8bff] focus-within:ring-1 focus-within:ring-[#4d8bff] transition-all">
                <span className="px-3 py-2 bg-[#1b1c1e] text-[#6a6b6c] text-xs font-mono border-r border-[#2f3031] select-none">
                  /
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugInput(e.target.value)}
                  placeholder="nama-acara-kamu"
                  className="w-full px-3 py-2 bg-transparent text-white font-mono text-sm placeholder-[#6a6b6c] focus:outline-none"
                />
              </div>
              {slugMessage && (
                <p
                  className={`text-xs mt-1.5 font-medium ${
                    slugStatus === "available"
                      ? "text-[#59d499]"
                      : "text-[#ff4d4d]"
                  }`}
                >
                  {slugMessage}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#9c9c9d] mb-2">
              <FileText className="w-3.5 h-3.5 text-[#6a6b6c]" />
              Deskripsi Acara (Opsional)
            </label>
            <div className="flex items-center bg-[#111214] border border-[#2f3031] rounded-lg overflow-hidden focus-within:border-[#4d8bff] focus-within:ring-1 focus-within:ring-[#4d8bff] transition-all">
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan keterangan singkat mengenai acara atau kampanye ini..."
                className="w-full px-3 py-2 bg-transparent text-white font-mono text-sm placeholder-[#6a6b6c] focus:outline-none"
              />
            </div>
          </div>

          {/* Frame Upload Dropzone with Flexible Aspect Ratio Preview */}
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-[#9c9c9d] mb-2">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#4d8bff]" />
                Unggah Bingkai Twibbon (.PNG, .JPG, .WEBP){" "}
                <span className="text-[#4d8bff]">*</span>
              </span>
              <span className="text-xs text-[#6a6b6c] font-mono">
                Maksimal 3MB &bull; Rasio Bebas
              </span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative border border-dashed border-[#454647] hover:border-[#4d8bff] rounded-xl p-6 sm:p-8 bg-[#111214]/60 hover:bg-[#111214] transition-all cursor-pointer flex flex-col items-center justify-center text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelected(e.target.files[0])
                }
                className="hidden"
              />

              {framePreview && frameDimensions ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div
                    className="max-w-[180px] max-h-[150px] rounded-lg overflow-hidden bg-black/50 border border-[#2f3031] flex items-center justify-center p-2 shadow-inner"
                    style={{
                      aspectRatio: `${frameDimensions.width} / ${frameDimensions.height}`,
                    }}
                  >
                    <img
                      src={framePreview}
                      alt="Twibbon Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left space-y-2">
                    <div className="text-sm font-medium text-white truncate max-w-xs">
                      {frameFile?.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="raycast-badge">
                        {frameDimensions.width} × {frameDimensions.height} px
                      </span>
                      <span className="raycast-badge text-[#4d8bff]">
                        Rasio {frameDimensions.aspectRatio}:1
                      </span>
                      <span className="raycast-badge text-[#59d499]">
                        {detectedMime}
                      </span>
                    </div>
                    <p className="text-xs text-[#6a6b6c]">
                      Klik di sini untuk mengganti berkas bingkai.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1b1c1e] border border-[#2f3031] flex items-center justify-center mx-auto text-[#4d8bff] group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Klik untuk unggah atau seret bingkai twibbon ke sini
                    </p>
                    <p className="text-xs text-[#6a6b6c] mt-1">
                      MIME type diverifikasi otomatis. Mendukung foto format
                      persegi, 4:5, 16:9, dan rasio lainnya.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {fileError && (
              <div className="mt-2 p-3 rounded-lg bg-[#3d1417] border border-[#ff4d4d]/40 flex items-center gap-2 text-[#ff4d4d] text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {fileError}
              </div>
            )}
          </div>

          {/* Caption Template & Variables */}
          <div className="p-5 rounded-xl bg-[#0b0d0f] border border-[#2f3031] space-y-4">
            <label className="block text-xs font-medium text-[#9c9c9d] uppercase tracking-wider">
              Pengaturan Caption Media Sosial
            </label>

            <div>
              <span className="text-xs text-[#6a6b6c] block mb-2">
                Template Caption (Gunakan format tanda kurung siku seperti{" "}
                <code className="text-[#4d8bff] font-mono">[nama]</code> untuk
                kolom yang dapat diisi peserta):
              </span>
              <div className="flex items-center bg-[#111214] border border-[#2f3031] rounded-lg overflow-hidden focus-within:border-[#4d8bff] focus-within:ring-1 focus-within:ring-[#4d8bff] transition-all">
                <textarea
                  rows={3}
                  value={captionTemplate}
                  onChange={(e) => setCaptionTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-white font-mono text-sm placeholder-[#6a6b6c] focus:outline-none"
                />
              </div>
            </div>

            {/* Tag Variables */}
            <div>
              <span className="text-xs text-[#6a6b6c] block mb-2">
                Variabel Input Form Peserta:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {captionProps.map((prop) => (
                  <span
                    key={prop}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1b1c1e] text-[#e6e6e6] text-xs font-mono rounded-md border border-[#2f3031]"
                  >
                    <Tag className="w-3 h-3 text-[#4d8bff]" />[{prop}]
                    <button
                      type="button"
                      onClick={() => removeProp(prop)}
                      className="hover:text-[#ff4d4d] text-[#6a6b6c] ml-1 text-sm font-bold leading-none cursor-pointer"
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
                    placeholder="+ tambah variabel"
                    className="px-2.5 py-1 text-xs bg-[#111214] border border-[#2f3031] rounded-md text-white placeholder-[#6a6b6c] focus:outline-none focus:border-[#4d8bff]"
                  />
                  <button
                    type="button"
                    onClick={() => addProp(newPropInput)}
                    className="px-2.5 py-1 text-xs bg-(--color-cobalt-edge) cursor-pointer border border-[#2f3031] rounded-md"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                slugStatus === "taken" ||
                slugStatus === "checking"
              }
              className="raycast-btn-primary flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>Memverifikasi & Mengunggah...</>
              ) : (
                <>
                  Publikasikan & Buka Twibbon
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Meta Strip per DESIGN.md */}
      <footer className="text-center text-xs font-mono text-[#6a6b6c] space-x-2 pb-4">
        <span>v1.0.0</span>
        <span>|</span>
        <span>100% Client-Side Engine</span>
        <span>|</span>
        <span>Supabase Storage</span>
        <span>|</span>
        <Link
          to="/"
          className="text-[#9c9c9d] hover:text-white transition-colors"
        >
          Freebbonize
        </Link>
      </footer>
    </main>
  );
}
