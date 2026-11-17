import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import CampaignViewPage from "./pages/CampaignViewPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Rute 1: Halaman pembuatan twibbon tanpa login */}
				<Route path="/" element={<CreateCampaignPage />} />

				{/* Rute 2: Halaman dinamis partisipan twibbon berdasarkan slug */}
				<Route path="/:slug" element={<CampaignViewPage />} />

				{/* 404 Fallback */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
}
