import { createContext } from "@ctl/api/context";
import { warmDockerImages } from "@ctl/api/lib/code-runner";
import { streamGrade } from "@ctl/api/lib/grade-stream";
import { warmPlaygroundImage } from "@ctl/api/lib/playground-session";
import { appRouter } from "@ctl/api/routers/index";
import { auth } from "@ctl/auth";
import { env } from "@ctl/env/server";
import fastifyCors from "@fastify/cors";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import Fastify from "fastify";

import { registerPlaygroundPreviewProxy } from "./register-playground-preview";

const baseCorsConfig = {
	origin: env.CORS_ORIGIN,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86_400,
};

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const fastify = Fastify({
	logger: true,
});

fastify.register(fastifyCors, baseCorsConfig);

registerPlaygroundPreviewProxy(fastify);

fastify.register((rpcApp) => {
	rpcApp.addContentTypeParser("*", (_, _payload, done) => {
		done(null, undefined);
	});

	rpcApp.all("/rpc/*", async (request, reply) => {
		const { matched } = await rpcHandler.handle(request, reply, {
			context: await createContext(request.headers),
			prefix: "/rpc",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});

	rpcApp.all("/api-reference/*", async (request, reply) => {
		const { matched } = await apiHandler.handle(request, reply, {
			context: await createContext(request.headers),
			prefix: "/api-reference",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});
});

fastify.route({
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
			fastify.log.error({ err: error }, "Authentication Error:");
			reply.status(500).send({
				error: "Internal authentication error",
				code: "AUTH_FAILURE",
			});
		}
	},
});

fastify.post("/api/tasks/grade-stream", async (request, reply) => {
	const context = await createContext(request.headers);
	if (!context.session) {
		return reply.status(401).send({ error: "Unauthorized" });
	}
	const { taskId, code } = request.body as { taskId: string; code: string };
	const origin = request.headers.origin ?? env.CORS_ORIGIN;
	reply.raw.setHeader("Content-Type", "text/event-stream");
	reply.raw.setHeader("Cache-Control", "no-cache");
	reply.raw.setHeader("Connection", "keep-alive");
	reply.raw.setHeader("Access-Control-Allow-Origin", origin);
	reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
	reply.raw.writeHead(200);
	const send = (data: unknown) => {
		reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
	};
	try {
		for await (const event of streamGrade({
			taskId,
			code,
			userId: context.session.user.id,
		})) {
			send(event);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		send({ type: "error", message });
	} finally {
		reply.raw.end();
	}
});

fastify.get("/", () => "OK");

const listenPort = Number(process.env.PORT) || 3000;
fastify.listen({ port: listenPort }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log(`Server running on port ${listenPort}`);
	warmDockerImages().catch((e) =>
		fastify.log.warn({ err: e }, "Docker image warm-up failed (non-fatal)")
	);
	warmPlaygroundImage().catch((e) =>
		fastify.log.warn({ err: e }, "Playground image warm-up failed (non-fatal)")
	);
});
