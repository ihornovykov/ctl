import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "./src/index.ts",
	format: "esm",
	outDir: "./dist",
	clean: true,
	noExternal: [/@ctl\/.*/],
	external: ["dockerode", "docker-modem", "ssh2", "cpu-features"],
});
