import { Camera, ArrowRight, RotateCw, ZoomIn } from "lucide-react";

type TransformType = {
	x: number;
	y: number;
	scale: number;
	rotate: number;
};

type AdjustPageProps = {
	transform: TransformType;
	setTransform: React.Dispatch<React.SetStateAction<TransformType>>;
	onPhotoSelected: (img: HTMLImageElement) => void;
	onGenerate: React.Dispatch<React.SetStateAction<"landing" | "adjust" | "ready">>;
};

export default function AdjustPageSidebar({ transform, setTransform, onPhotoSelected, onGenerate }: AdjustPageProps) {
	function handleChangePhoto(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const img = new Image();
		img.onload = () => onPhotoSelected(img);
		img.src = URL.createObjectURL(file);
	}

	return (
		<section className="p-6 sm:p-8 raycast-card flex flex-col justify-between gap-6">
			<article>
				<h1 className="text-xl sm:text-2xl font-normal text-white tracking-tight mb-1">
					Sesuaikan Posisimu
				</h1>
				<p className="text-xs text-[#9c9c9d] leading-relaxed">
					Geser foto langsung di kanvas, lalu gunakan kontrol di bawah untuk mengatur skala dan sudut rotasi.
				</p>
			</article>

			<div className="space-y-3">
				{/* Scale Slider */}
				<div className="bg-[#111214] border border-[#2f3031] p-3.5 rounded-lg space-y-2">
					<div className="flex items-center justify-between text-xs font-medium">
						<span className="flex items-center gap-1.5 text-[#e6e6e6]">
							<ZoomIn className="w-3.5 h-3.5 text-[#4d8bff]" />
							Ukuran Foto (Skala)
						</span>
						<span className="raycast-badge text-[#4d8bff]">
							{transform.scale}%
						</span>
					</div>
					<input
						type="range"
						className="w-full accent-[#4d8bff] cursor-pointer"
						value={transform.scale}
						onChange={(e) => setTransform((t) => ({ ...t, scale: +e.target.value }))}
						min={10}
						max={250}
						id="scale"
					/>
				</div>

				{/* Rotate Slider */}
				<div className="bg-[#111214] border border-[#2f3031] p-3.5 rounded-lg space-y-2">
					<div className="flex items-center justify-between text-xs font-medium">
						<span className="flex items-center gap-1.5 text-[#e6e6e6]">
							<RotateCw className="w-3.5 h-3.5 text-[#4d8bff]" />
							Putar (Rotasi)
						</span>
						<span className="raycast-badge text-[#4d8bff]">
							{transform.rotate}°
						</span>
					</div>
					<input
						type="range"
						className="w-full accent-[#4d8bff] cursor-pointer"
						value={transform.rotate}
						min={-180}
						max={180}
						onChange={(e) => setTransform((t) => ({ ...t, rotate: +e.target.value }))}
						id="rotate"
					/>
				</div>
			</div>

			<div className="flex gap-2.5 pt-1">
				{/* Change Photo Button */}
				<div className="relative group flex-1 raycast-btn-secondary text-center py-2.5 flex items-center justify-center gap-2 cursor-pointer">
					<input
						onChange={handleChangePhoto}
						accept="image/png, image/jpeg, image/jpg, image/webp"
						type="file"
						className="absolute inset-0 z-10 opacity-0 cursor-pointer"
					/>
					<Camera className="w-4 h-4 text-[#9c9c9d]" />
					<span className="text-xs sm:text-sm">Ganti Foto</span>
				</div>

				{/* Next Button */}
				<button
					type="button"
					onClick={() => onGenerate("ready")}
					className="flex-1 raycast-btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 cursor-pointer"
				>
					<span>Lanjut</span>
					<ArrowRight className="w-4 h-4" />
				</button>
			</div>
		</section>
	);
}
