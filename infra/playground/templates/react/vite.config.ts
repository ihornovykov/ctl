import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const hmrClientPort = Number(process.env.PLAYGROUND_HMR_CLIENT_PORT);
const hmrProtocol = process.env.PLAYGROUND_HMR_PROTOCOL?.trim();
const previewBase = process.env.PLAYGROUND_VITE_BASE?.trim();

const hmr =
	Number.isFinite(hmrClientPort) && hmrClientPort > 0
		? {
				clientPort: hmrClientPort,
				...(hmrProtocol === "ws" || hmrProtocol === "wss"
					? { protocol: hmrProtocol }
					: {}),
			}
		: undefined;

export default defineConfig({
	base: previewBase && previewBase.length > 0 ? previewBase : "./",
	plugins: [react()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		...(hmr ? { hmr } : {}),
	},
});
