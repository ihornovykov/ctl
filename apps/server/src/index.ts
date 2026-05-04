import "./instrument";

import { env } from "@ctl/env/server";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import authRoutePlugin from "./plugins/auth-route.plugin";
import cronPlugin from "./plugins/cron.plugin";
import orpcPlugin from "./plugins/orpc.plugin";

const baseCorsConfig = {
	origin: env.CORS_ORIGIN,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"b3",
		"traceparent",
	],
	credentials: true,
	maxAge: 86_400,
};

const isDev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;

const main = async () => {
	const app = Fastify({
		logger: isDev
			? {
					transport: {
						target: "pino-pretty",
						options: {
							colorize: true,
							translateTime: "HH:MM:ss Z",
							ignore: "pid,hostname",
						},
					},
				}
			: true,
		bodyLimit: 12 * 1024 * 1024,
	});

	await app.register(fastifyCors, baseCorsConfig);
	await app.register(orpcPlugin);
	await app.register(authRoutePlugin);
	await app.register(cronPlugin);

	app.get("/", async () => "OK");

	try {
		await app.listen({ port, host: "0.0.0.0" });
		app.log.info(`Server running on port ${port}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
