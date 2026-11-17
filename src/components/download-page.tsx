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
		<section className="p-6 sm:p-8 raycast-card flex flex-col justify-between gap-6 relative">
			{/* Modal Edit Caption Variables */}
			{isEdit && (
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
					<div className="bg-[#07080a] border border-[#2f3031] p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
						<div className="flex items-center justify-between border-b border-[#2f3031] pb-3">
							<h2 className="font-semibold text-sm text-white">Lengkapi Data Caption</h2>
							<button
								onClick={() => setIsEdit(false)}
								className="text-[#6a6b6c] hover:text-white text-base font-bold cursor-pointer"
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
										className="w-full raycast-input text-xs"
										onChange={(e) =>
											setCapValues((prev) => ({ ...prev, [prop]: e.target.value }))
										}
									/>
								</li>
							))}
						</ul>

						<button
							onClick={() => setIsEdit(false)}
							className="w-full raycast-btn-primary text-xs py-2.5 cursor-pointer"
						>
							Selesai
						</button>
					</div>
				</div>
			)}

			<article className="space-y-3">
				<div className="flex items-center justify-between">
					<h1 className="text-xl sm:text-2xl font-normal text-white tracking-tight">
						Twibbon Siap Dibagikan!
					</h1>
					{onBackToAdjust && (
						<button
							onClick={onBackToAdjust}
							className="text-xs text-[#9c9c9d] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
						>
							<ArrowLeft className="w-3 h-3" /> Ubah Posisi
						</button>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-[#9c9c9d]">
						<span>Caption Media Sosial:</span>
						{captionProps.length > 0 && (
							<button
								onClick={() => setIsEdit(true)}
								className="text-[#4d8bff] hover:underline flex items-center gap-1 cursor-pointer font-medium"
							>
								<SquarePen className="w-3 h-3" /> Sesuaikan Isian
							</button>
						)}
					</div>

					<p className="p-3 bg-[#111214] border border-[#2f3031] rounded-lg text-xs text-[#e6e6e6] leading-relaxed break-words font-mono select-all">
						{filledCaption}
					</p>

					<button
						onClick={handleCopyCaption}
						className="w-full raycast-btn-secondary text-xs flex items-center justify-center gap-2 py-2"
					>
						{isCopied ? (
							<>
								<ClipboardCheck className="w-3.5 h-3.5 text-[#59d499]" />
								<span className="text-[#59d499]">Caption Tersalin!</span>
							</>
						) : (
							<>
								<Clipboard className="w-3.5 h-3.5 text-[#9c9c9d]" />
								<span>Salin Teks Caption</span>
							</>
						)}
					</button>
				</div>
			</article>

			{/* Download Button */}
			<button
				onClick={handleDownloadCanvas}
				className="w-full raycast-btn-primary flex items-center justify-center gap-2 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl"
			>
				<ArrowDownToLine className="w-4 h-4 text-[#07080a]" />
				<span>Unduh Gambar Twibbon</span>
			</button>
		</section>
	);
}
