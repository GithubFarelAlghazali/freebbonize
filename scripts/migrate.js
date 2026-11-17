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

const migrationsDir = path.resolve("supabase/migrations");
if (!fs.existsSync(migrationsDir)) {
	console.error("❌ Error: Direktori supabase/migrations tidak ditemukan.");
	process.exit(1);
}

const files = fs
	.readdirSync(migrationsDir)
	.filter((file) => file.endsWith(".sql"))
	.sort();

console.log("🚀 Menjalankan migrasi database...");
for (const file of files) {
	const filePath = path.join(migrationsDir, file);
	console.log(`- Menerapkan migrasi: ${file}`);
	execSync(`psql "${dbUrl}" -f "${filePath}"`, { stdio: "inherit" });
}

console.log("✅ Semua migrasi berhasil diterapkan!");
