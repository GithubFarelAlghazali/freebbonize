import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { handleBackendValidation } from "./server/validator.ts";

function backendValidatorPlugin(): Plugin {
	return {
		name: "backend-validator-plugin",
		configureServer(server) {
			server.middlewares.use("/api/validate-frame", handleBackendValidation);
		},
		configurePreviewServer(server) {
			server.middlewares.use("/api/validate-frame", handleBackendValidation);
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		babel({ presets: [reactCompilerPreset()] }),
		backendValidatorPlugin(),
	],
});
