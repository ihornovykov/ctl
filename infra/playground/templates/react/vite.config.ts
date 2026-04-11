import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const hmrClientPort = Number(process.env.PLAYGROUND_HMR_CLIENT_PORT);
const previewBase = process.env.PLAYGROUND_VITE_BASE?.trim();
export default defineConfig({
	base: previewBase && previewBase.length > 0 ? previewBase : "./",
	plugins: [react()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		...(Number.isFinite(hmrClientPort) && hmrClientPort > 0
			? { hmr: { clientPort: hmrClientPort } }
			: {}),
	},
});
