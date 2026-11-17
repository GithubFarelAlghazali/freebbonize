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
		<section className="p-6 sm:p-8 bg-[#07080a] border border-[#2f3031] rounded-2xl flex flex-col justify-between gap-6 shadow-2xl">
			<article className="space-y-3">
				<div className="inline-block px-3 py-1 bg-[#1b1c1e] text-[#ff6363] text-xs font-semibold uppercase tracking-wider rounded-md border border-[#2f3031]">
					Kampanye Twibbon
				</div>
				<h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
					{title}
				</h1>
				<p className="text-sm sm:text-base text-[#9c9c9d] leading-relaxed">
					{description || "Upload fotomu untuk bergabung dalam kampanye ini dan bagikan ke media sosial!"}
				</p>
			</article>

			<div className="relative group overflow-hidden bg-[#e6e6e6] hover:bg-white text-[#040506] p-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer">
				<input
					onChange={handleUpload}
					accept="image/png, image/jpeg, image/jpg, image/webp"
					type="file"
					className="absolute inset-0 z-10 opacity-0 cursor-pointer"
				/>
				<div className="flex items-center justify-center gap-3">
					<Camera className="w-5 h-5 text-[#ff6363]" />
					<span>Pilih & Unggah Fotomu</span>
				</div>
			</div>
		</section>
	);
}
