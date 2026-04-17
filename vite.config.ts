import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
	base: '/CBar_Web-0381/',
	plugins: [react(), tailwind()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/web"),
		},
	},
	server: {
		allowedHosts: true,
		hmr: { overlay: false }
	}
});
