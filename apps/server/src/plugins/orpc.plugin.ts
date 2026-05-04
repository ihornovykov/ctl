import { createContext } from "@ctl/api/context";
import { streamGrade } from "@ctl/api/lib/grade-stream";
import { appRouter } from "@ctl/api/routers/index";
import { env } from "@ctl/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { FastifyPluginAsync } from "fastify";
import { registerPlaygroundPreviewProxy } from "../lib/playground-preview";

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

const orpcPlugin: FastifyPluginAsync = async (app) => {
	await registerPlaygroundPreviewProxy(app);

	app.addContentTypeParser("*", (_, _payload, done) => {
		done(null, undefined);
	});

	app.all("/rpc/*", async (request, reply) => {
		const { matched } = await rpcHandler.handle(request, reply, {
			context: await createContext(request.headers),
			prefix: "/rpc",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});

	app.all("/api-reference/*", async (request, reply) => {
		const { matched } = await apiHandler.handle(request, reply, {
			context: await createContext(request.headers),
			prefix: "/api-reference",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});

	app.post("/api/tasks/grade-stream", async (request, reply) => {
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
};

export default orpcPlugin;
