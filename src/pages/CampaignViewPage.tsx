import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, PlusCircle, AlertCircle, Share2, Check } from "lucide-react";
import { supabase, type Campaign } from "../lib/supabase";
import TwibbonCanvas from "../components/twibbon-canvas";
import LandingPageSidebar from "../components/landing-page";
import AdjustPageSidebar from "../components/adjust-page";
import DownloadPageSidebar from "../components/download-page";
import NotFoundPage from "./NotFoundPage";

export default function CampaignViewPage() {
	const { slug } = useParams<{ slug: string }>();

	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const [sidebarState, setSidebarState] = useState<"landing" | "adjust" | "ready">("landing");
	const [userPhoto, setUserPhoto] = useState<HTMLImageElement | null>(null);
	const [photoTransform, setPhotoTransform] = useState({ x: 0, y: 0, scale: 100, rotate: 0 });
	const [isUrlCopied, setIsUrlCopied] = useState(false);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		async function fetchCampaign() {
			if (!slug) return;
			setIsLoading(true);
			setFetchError(null);

			try {
				const { data, error } = await supabase
					.from("campaigns")
					.select("*")
					.eq("slug", slug.toLowerCase().trim())
					.maybeSingle();

				if (error) {
					throw error;
				}

				if (!data) {
					setCampaign(null);
				} else {
					setCampaign(data as Campaign);
				}
			} catch (err: unknown) {
				console.error("Failed to fetch campaign:", err);
				const message = err instanceof Error ? err.message : "Gagal memuat kampanye.";
				setFetchError(message);
			} finally {
				setIsLoading(false);
			}
		}

		fetchCampaign();
	}, [slug]);

	function handlePhotoSelected(img: HTMLImageElement) {
		setUserPhoto(img);
		setSidebarState("adjust");
	}

	function handleCopyShareUrl() {
		navigator.clipboard.writeText(window.location.href);
		setIsUrlCopied(true);
		setTimeout(() => setIsUrlCopied(false), 2500);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#040506] flex flex-col justify-center items-center text-white space-y-3">
				<Loader2 className="w-8 h-8 text-[#ff6363] animate-spin" />
				<p className="text-sm font-medium text-[#9c9c9d]">Memuat kampanye Twibbon...</p>
			</div>
		);
	}

	if (fetchError) {
		return (
			<div className="min-h-screen bg-[#040506] flex flex-col justify-center items-center text-white p-6">
				<div className="max-w-md w-full bg-[#07080a] border border-[#2f3031] p-8 rounded-2xl text-center space-y-4">
					<AlertCircle className="w-12 h-12 text-[#ff6363] mx-auto" />
					<h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
					<p className="text-sm text-[#9c9c9d]">{fetchError}</p>
					<Link
						to="/"
						className="inline-block px-5 py-2.5 bg-[#e6e6e6] text-[#040506] font-semibold text-sm rounded-xl"
					>
						Kembali ke Beranda
					</Link>
				</div>
			</div>
		);
	}

	if (!campaign) {
		return <NotFoundPage requestedSlug={slug} />;
	}

	return (
		<main className="min-h-screen bg-[#040506] text-white flex flex-col justify-between">
			{/* Top Navbar */}
			<header className="w-full border-b border-[#2f3031] bg-[#07080a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
				<div className="flex items-center gap-3">
					<Link to="/" className="text-lg font-bold tracking-tight text-white hover:text-[#ff6363] transition-colors">
						Freebbonize<span className="text-[#ff6363]">.</span>
					</Link>
					<span className="text-[#2f3031]">/</span>
					<span className="text-xs font-mono text-[#9c9c9d] bg-[#111214] px-2.5 py-1 rounded-md border border-[#2f3031] truncate max-w-[150px] sm:max-w-xs">
						{campaign.slug}
					</span>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={handleCopyShareUrl}
						className="px-3.5 py-1.5 bg-[#111214] hover:bg-[#1b1c1e] border border-[#2f3031] text-[#e6e6e6] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						{isUrlCopied ? (
							<>
								<Check className="w-3.5 h-3.5 text-[#59d499]" />
								<span className="text-[#59d499]">Link Tersalin</span>
							</>
						) : (
							<>
								<Share2 className="w-3.5 h-3.5 text-[#ff6363]" />
								<span>Bagikan Link</span>
							</>
						)}
					</button>

					<Link
						to="/"
						className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e6e6e6] hover:bg-white text-[#040506] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
					>
						<PlusCircle className="w-3.5 h-3.5 text-[#ff6363]" />
						<span>Buat Twibbon Baru</span>
					</Link>
				</div>
			</header>

			{/* Main Workspace */}
			<div className="flex-1 flex justify-center items-center p-4 sm:p-8">
				<div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
					{/* Canvas Section */}
					<section className="w-full md:w-1/2 flex justify-center">
						<TwibbonCanvas
							userPhoto={userPhoto}
							frameSrc={campaign.frame_url}
							frameWidth={campaign.frame_width}
							frameHeight={campaign.frame_height}
							transform={photoTransform}
							setTransform={setPhotoTransform}
							isEditMode={sidebarState === "adjust"}
							canvasRef={canvasRef}
						/>
					</section>

					{/* Sidebar Controls Section */}
					<section className="w-full md:w-1/2 max-w-lg">
						{sidebarState === "landing" && (
							<LandingPageSidebar
								title={campaign.title}
								description={campaign.description}
								onPhotoSelected={handlePhotoSelected}
							/>
						)}
						{sidebarState === "adjust" && (
							<AdjustPageSidebar
								onPhotoSelected={handlePhotoSelected}
								transform={photoTransform}
								setTransform={setPhotoTransform}
								onGenerate={setSidebarState}
							/>
						)}
						{sidebarState === "ready" && (
							<DownloadPageSidebar
								canvas={canvasRef}
								captionTemplate={campaign.caption_template}
								captionProps={campaign.caption_props}
								slug={campaign.slug}
								onBackToAdjust={() => setSidebarState("adjust")}
							/>
						)}
					</section>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full border-t border-[#2f3031] py-4 text-center text-xs text-[#6a6b6c]">
				Dibuat dengan Freebbonize &bull; 100% Client-Side Twibbon Generator
			</footer>
		</main>
	);
}
