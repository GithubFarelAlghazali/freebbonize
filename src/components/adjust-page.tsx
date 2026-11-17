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
		<section className="p-6 sm:p-8 bg-[#07080a] border border-[#2f3031] rounded-2xl flex flex-col justify-between gap-6 shadow-2xl">
			<article>
				<h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
					Sesuaikan Posisimu
				</h1>
				<p className="text-xs sm:text-sm text-[#9c9c9d]">
					Geser foto langsung di kanvas, lalu gunakan slider untuk skala dan rotasi.
				</p>
			</article>

			<div className="space-y-4">
				{/* Scale Slider */}
				<div className="bg-[#111214] border border-[#2f3031] p-4 rounded-xl space-y-2">
					<div className="flex items-center justify-between text-xs font-medium">
						<span className="flex items-center gap-1.5 text-[#e6e6e6]">
							<ZoomIn className="w-3.5 h-3.5 text-[#ff6363]" />
							Ukuran Foto (Skala)
						</span>
						<span className="font-mono text-[#ff6363] bg-[#1b1c1e] px-2 py-0.5 rounded border border-[#2f3031]">
							{transform.scale}%
						</span>
					</div>
					<input
						type="range"
						className="w-full accent-[#ff6363] cursor-pointer"
						value={transform.scale}
						onChange={(e) => setTransform((t) => ({ ...t, scale: +e.target.value }))}
						min={10}
						max={250}
						id="scale"
					/>
				</div>

				{/* Rotate Slider */}
				<div className="bg-[#111214] border border-[#2f3031] p-4 rounded-xl space-y-2">
					<div className="flex items-center justify-between text-xs font-medium">
						<span className="flex items-center gap-1.5 text-[#e6e6e6]">
							<RotateCw className="w-3.5 h-3.5 text-[#ff6363]" />
							Putar (Rotasi)
						</span>
						<span className="font-mono text-[#ff6363] bg-[#1b1c1e] px-2 py-0.5 rounded border border-[#2f3031]">
							{transform.rotate}°
						</span>
					</div>
					<input
						type="range"
						className="w-full accent-[#ff6363] cursor-pointer"
						value={transform.rotate}
						min={-180}
						max={180}
						onChange={(e) => setTransform((t) => ({ ...t, rotate: +e.target.value }))}
						id="rotate"
					/>
				</div>
			</div>

			<div className="flex gap-3 font-semibold pt-2">
				{/* Change Photo Button */}
				<div className="relative group flex-1 bg-[#111214] hover:bg-[#1b1c1e] text-[#e6e6e6] border border-[#2f3031] hover:border-[#ff6363] p-3.5 rounded-xl transition-all cursor-pointer text-center">
					<input
						onChange={handleChangePhoto}
						accept="image/png, image/jpeg, image/jpg, image/webp"
						type="file"
						className="absolute inset-0 z-10 opacity-0 cursor-pointer"
					/>
					<div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
						<Camera className="w-4 h-4 text-[#ff6363]" />
						<span>Ganti Foto</span>
					</div>
				</div>

				{/* Next Button */}
				<button
					type="button"
					onClick={() => onGenerate("ready")}
					className="flex-1 bg-[#e6e6e6] hover:bg-white text-[#040506] p-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
				>
					<span>Lanjut</span>
					<ArrowRight className="w-4 h-4 text-[#ff6363]" />
				</button>
			</div>
		</section>
	);
}
