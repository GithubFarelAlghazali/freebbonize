import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "freebbonize-files";

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn("Supabase credentials missing in environment variables.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export interface Campaign {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	frame_url: string;
	frame_width: number;
	frame_height: number;
	frame_aspect_ratio: number;
	caption_template: string;
	caption_props: string[];
	created_at: string;
	updated_at: string;
}
