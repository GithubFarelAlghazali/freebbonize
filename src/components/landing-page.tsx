import { Camera } from "lucide-react";

interface LandingPageSidebarProps {
	title?: string;
	description?: string | null;
	onPhotoSelected: (img: HTMLImageElement) => void;
}

export default function LandingPageSidebar({
	title = "Twibbon Event",
	description = "Upload fotomu untuk bergabung dalam kampanye ini dan bagikan ke media sosial!",
	onPhotoSelected,
}: LandingPageSidebarProps) {
	function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const img = new Image();
		img.onload = () => onPhotoSelected(img);
		img.src = URL.createObjectURL(file);
	}

	return (
		<section className="p-6 sm:p-8 raycast-card flex flex-col justify-between gap-6">
			<article className="space-y-3">
				<div className="inline-flex items-center gap-1.5 raycast-badge text-[#4d8bff] uppercase tracking-wider font-semibold">
					<span className="w-1.5 h-1.5 rounded-full bg-[#4d8bff]" />
					Kampanye Twibbon
				</div>
				<h1 className="text-xl sm:text-2xl font-normal text-white tracking-tight leading-snug">
					{title}
				</h1>
				<p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
					{description || "Upload fotomu untuk bergabung dalam kampanye ini dan bagikan ke media sosial!"}
				</p>
			</article>

			<div className="relative group overflow-hidden raycast-btn-primary text-center py-3.5 flex items-center justify-center gap-2 cursor-pointer">
				<input
					onChange={handleUpload}
					accept="image/png, image/jpeg, image/jpg, image/webp"
					type="file"
					className="absolute inset-0 z-10 opacity-0 cursor-pointer"
				/>
				<Camera className="w-4 h-4 text-[#07080a]" />
				<span>Pilih & Unggah Fotomu</span>
			</div>
		</section>
	);
}
