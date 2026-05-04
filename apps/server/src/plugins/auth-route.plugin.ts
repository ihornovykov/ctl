import { auth } from "@ctl/auth";
import type { FastifyPluginAsync } from "fastify";

const authRoutePlugin: FastifyPluginAsync = async (app) => {
	await app.route({
		method: ["GET", "POST"],
		url: "/api/auth/*",
		async handler(request, reply) {
			try {
				const url = new URL(request.url, `http://${request.headers.host}`);
				const headers = new Headers();
				for (const [key, value] of Object.entries(request.headers)) {
					if (value) {
						headers.append(key, value.toString());
					}
				}
				const req = new Request(url.toString(), {
					method: request.method,
					headers,
					body: request.body ? JSON.stringify(request.body) : undefined,
				});
				const response = await auth.handler(req);
				reply.status(response.status);
				for (const [key, value] of response.headers) {
					reply.header(key, value);
				}
				reply.send(response.body ? await response.text() : null);
			} catch (error) {
				app.log.error({ err: error }, "Authentication Error:");
				reply.status(500).send({
					error: "Internal authentication error",
					code: "AUTH_FAILURE",
				});
			}
		},
	});
};

export default authRoutePlugin;
