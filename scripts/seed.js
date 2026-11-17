import fs from "fs";
import path from "path";
import { execSync } from "child_process";

if (fs.existsSync(".env")) {
	process.loadEnvFile(".env");
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	console.error("❌ Error: DATABASE_URL tidak ditemukan di berkas .env");
	process.exit(1);
}

const seedPath = path.resolve("supabase/seed.sql");
if (!fs.existsSync(seedPath)) {
	console.error("❌ Error: Berkas supabase/seed.sql tidak ditemukan.");
	process.exit(1);
}

console.log("🌱 Menjalankan database seeder...");
try {
	execSync(`psql "${dbUrl}" -f "${seedPath}"`, { stdio: "inherit" });
	console.log("✅ Seeder berhasil dieksekusi!");
} catch (err) {
	console.error("❌ Gagal mengeksekusi seeder:", err.message);
	process.exit(1);
}
