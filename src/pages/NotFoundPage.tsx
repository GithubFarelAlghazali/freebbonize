import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft, Plus } from "lucide-react";

interface NotFoundPageProps {
	requestedSlug?: string;
}

export default function NotFoundPage({ requestedSlug }: NotFoundPageProps) {
	return (
		<main className="min-h-screen bg-[#040506] text-white flex flex-col justify-center items-center p-6">
			<div className="max-w-md w-full raycast-card p-8 sm:p-10 text-center space-y-6">
				<div className="w-12 h-12 rounded-xl bg-[#111214] border border-[#2f3031] flex items-center justify-center mx-auto text-[#4d8bff]">
					<HelpCircle className="w-6 h-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-normal tracking-tight text-white">
						404
					</h1>
					<h2 className="text-sm font-medium text-[#e6e6e6]">
						Kampanye Twibbon Tidak Ditemukan
					</h2>
					<p className="text-xs text-[#9c9c9d] leading-relaxed">
						{requestedSlug ? (
							<>
								Halaman dengan slug <span className="raycast-badge text-[#4d8bff]">/{requestedSlug}</span> belum dibuat atau telah dipindahkan.
							</>
						) : (
							"Halaman yang Anda tuju tidak ditemukan."
						)}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2.5 pt-2">
					<Link
						to="/"
						className="flex-1 raycast-btn-primary flex items-center justify-center gap-1.5 text-xs py-2.5"
					>
						<Plus className="w-3.5 h-3.5 text-[#07080a]" />
						Buat Twibbon Ini
					</Link>
					<Link
						to="/"
						className="raycast-btn-secondary flex items-center justify-center gap-1.5 text-xs py-2.5"
					>
						<ArrowLeft className="w-3.5 h-3.5 text-[#9c9c9d]" />
						Beranda
					</Link>
				</div>
			</div>
		</main>
	);
}
