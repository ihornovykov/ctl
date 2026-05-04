import { warmDockerImages } from "@ctl/api/lib/code-runner";
import { warmPlaygroundImage } from "@ctl/api/lib/playground-session";
import type { FastifyPluginAsync } from "fastify";

const cronPlugin: FastifyPluginAsync = async (app) => {
	await app.addHook("onReady", async () => {
		await warmDockerImages().catch((error) =>
			app.log.warn({ err: error }, "Docker image warm-up failed (non-fatal)")
		);
		await warmPlaygroundImage().catch((error) =>
			app.log.warn(
				{ err: error },
				"Playground image warm-up failed (non-fatal)"
			)
		);
	});
};

export default cronPlugin;
