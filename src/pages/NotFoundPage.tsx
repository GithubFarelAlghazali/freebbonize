import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft, Plus } from "lucide-react";

interface NotFoundPageProps {
	requestedSlug?: string;
}

export default function NotFoundPage({ requestedSlug }: NotFoundPageProps) {
	return (
		<main className="min-h-screen bg-[#040506] text-white flex flex-col justify-center items-center p-6">
			<div className="max-w-md w-full bg-[#07080a] border border-[#2f3031] rounded-2xl p-8 sm:p-10 text-center shadow-2xl space-y-6">
				<div className="w-16 h-16 rounded-2xl bg-[#1b1c1e] border border-[#2f3031] flex items-center justify-center mx-auto text-[#ff6363]">
					<HelpCircle className="w-8 h-8" />
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-extrabold tracking-tight text-white">
						404
					</h1>
					<h2 className="text-lg font-semibold text-[#e6e6e6]">
						Kampanye Twibbon Tidak Ditemukan
					</h2>
					<p className="text-sm text-[#9c9c9d] leading-relaxed">
						{requestedSlug ? (
							<>
								Halaman dengan slug <span className="font-mono text-[#ff6363]">/{requestedSlug}</span> belum dibuat atau telah dipindahkan.
							</>
						) : (
							"Halaman yang Anda tuju tidak ditemukan."
						)}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 pt-2">
					<Link
						to="/"
						className="flex-1 py-3 px-4 bg-[#e6e6e6] hover:bg-white text-[#040506] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
					>
						<Plus className="w-4 h-4 text-[#ff6363]" />
						Buat Twibbon Ini
					</Link>
					<Link
						to="/"
						className="py-3 px-4 bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-white border border-[#2f3031] text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
					>
						<ArrowLeft className="w-4 h-4" />
						Beranda
					</Link>
				</div>
			</div>
		</main>
	);
}
