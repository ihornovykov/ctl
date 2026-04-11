import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const hmrClientPort = Number(process.env.PLAYGROUND_HMR_CLIENT_PORT);
const previewBase = process.env.PLAYGROUND_VITE_BASE?.trim();
export default defineConfig({
	base: previewBase && previewBase.length > 0 ? previewBase : "./",
	plugins: [vue()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		...(Number.isFinite(hmrClientPort) && hmrClientPort > 0
			? { hmr: { clientPort: hmrClientPort } }
			: {}),
	},
});
