import { useState } from "react";
import { ArrowDownToLine, SquarePen, Clipboard, ClipboardCheck, ArrowLeft } from "lucide-react";

type CaptionType = Record<string, string>;

interface DownloadPageSidebarProps {
	canvas: React.RefObject<HTMLCanvasElement | null>;
	captionTemplate?: string;
	captionProps?: string[];
	slug?: string;
	onBackToAdjust?: () => void;
}

function fillCaption(template: string, values: CaptionType) {
	return template.replace(/\[(\w+)\]/g, (_, key) => values[key]?.trim() || `[${key}]`);
}

export default function DownloadPageSidebar({
	canvas,
	captionTemplate = "Halo! Saya [nama] siap berpartisipasi!",
	captionProps = ["nama"],
	slug = "twibbon",
	onBackToAdjust,
}: DownloadPageSidebarProps) {
	const [isEdit, setIsEdit] = useState(false);
	const [captionValues, setCapValues] = useState<CaptionType>(() =>
		Object.fromEntries(captionProps.map((key) => [key, ""]))
	);
	const [isCopied, setIsCopied] = useState(false);

	const filledCaption = fillCaption(captionTemplate, captionValues);

	function handleDownloadCanvas() {
		if (!canvas.current) return;
		const dataUrl = canvas.current.toDataURL("image/png");
		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${slug}-twibbon.png`;
		link.click();
	}

	function handleCopyCaption() {
		setIsCopied(true);
		navigator.clipboard.writeText(filledCaption);
		setTimeout(() => {
			setIsCopied(false);
		}, 2500);
	}

	return (
		<section className="p-6 sm:p-8 bg-[#07080a] border border-[#2f3031] rounded-2xl flex flex-col justify-between gap-6 shadow-2xl relative">
			{/* Modal Edit Caption Variables */}
			{isEdit && (
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
					<div className="bg-[#07080a] border border-[#2f3031] p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
						<div className="flex items-center justify-between border-b border-[#2f3031] pb-3">
							<h2 className="font-semibold text-lg text-white">Lengkapi Data Caption</h2>
							<button
								onClick={() => setIsEdit(false)}
								className="text-[#6a6b6c] hover:text-white text-lg font-bold"
							>
								✕
							</button>
						</div>

						<ul className="space-y-3">
							{captionProps.map((prop) => (
								<li key={prop} className="flex flex-col gap-1">
									<label htmlFor={prop} className="text-xs font-mono text-[#9c9c9d] capitalize">
										{prop}:
									</label>
									<input
										type="text"
										id={prop}
										value={captionValues[prop] || ""}
										placeholder={`Masukkan ${prop}`}
										className="w-full px-3 py-2 bg-[#111214] border border-[#2f3031] rounded-lg text-white text-sm focus:outline-none focus:border-[#ff6363]"
										onChange={(e) =>
											setCapValues((prev) => ({ ...prev, [prop]: e.target.value }))
										}
									/>
								</li>
							))}
						</ul>

						<button
							onClick={() => setIsEdit(false)}
							className="w-full py-2.5 bg-[#e6e6e6] hover:bg-white text-[#040506] font-semibold text-sm rounded-xl transition-all cursor-pointer"
						>
							Selesai
						</button>
					</div>
				</div>
			)}

			<article className="space-y-3">
				<div className="flex items-center justify-between">
					<h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
						Twibbon Siap Dibagikan!
					</h1>
					{onBackToAdjust && (
						<button
							onClick={onBackToAdjust}
							className="text-xs text-[#9c9c9d] hover:text-[#ff6363] flex items-center gap-1 cursor-pointer"
						>
							<ArrowLeft className="w-3.5 h-3.5" /> Ubah Posisi
						</button>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-[#9c9c9d]">
						<span>Caption Media Sosial:</span>
						{captionProps.length > 0 && (
							<button
								onClick={() => setIsEdit(true)}
								className="text-[#ff6363] hover:underline flex items-center gap-1 cursor-pointer font-medium"
							>
								<SquarePen className="w-3.5 h-3.5" /> Sesuaikan Nama
							</button>
						)}
					</div>

					<p className="p-3 bg-[#111214] border border-[#2f3031] rounded-xl text-xs sm:text-sm text-[#e6e6e6] leading-relaxed break-words font-mono select-all">
						{filledCaption}
					</p>

					<button
						onClick={handleCopyCaption}
						className="w-full py-2.5 px-4 bg-[#1b1c1e] hover:bg-[#2f3031] border border-[#2f3031] text-[#e6e6e6] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
					>
						{isCopied ? (
							<>
								<ClipboardCheck className="w-4 h-4 text-[#59d499]" />
								<span className="text-[#59d499]">Caption Tersalin!</span>
							</>
						) : (
							<>
								<Clipboard className="w-4 h-4 text-[#ff6363]" />
								<span>Salin Teks Caption</span>
							</>
						)}
					</button>
				</div>
			</article>

			{/* Download Button */}
			<button
				onClick={handleDownloadCanvas}
				className="w-full py-4 bg-[#e6e6e6] hover:bg-white text-[#040506] font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all"
			>
				<ArrowDownToLine className="w-5 h-5 text-[#ff6363]" />
				<span>Unduh Gambar Twibbon</span>
			</button>
		</section>
	);
}
