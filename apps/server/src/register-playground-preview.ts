import type { IncomingMessage } from "node:http";
import { createContext } from "@ctl/api/context";
import {
	extractPlaygroundPvFromCookieHeader,
	getPlaygroundPvCookieToSetOnHtml,
	type PlaygroundPreviewAuth,
	resolvePlaygroundPreviewUpstream,
} from "@ctl/api/lib/playground-session";
import type { FastifyInstance } from "fastify";
import httpProxy from "http-proxy";

const PREVIEW_SESSION_PATH = /^\/preview\/([^/?#]+)/;

type IncomingWithPv = IncomingMessage & { playgroundPvCookieValue?: string };

const previewAuth = (
	sessionId: string,
	rawUrl: string,
	cookieHeader: string | undefined,
	sessionUserId: string | undefined
): PlaygroundPreviewAuth => {
	const q = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?") + 1) : "";
	const queryGate = new URLSearchParams(q).get("g");
	return {
		sessionId,
		sessionUserId,
		queryGate,
		pvCookieRaw: extractPlaygroundPvFromCookieHeader(cookieHeader),
	};
};

export const registerPlaygroundPreviewProxy = (fastify: FastifyInstance) => {
	const proxy = httpProxy.createProxyServer({
		ws: true,
		xfwd: true,
	});

	proxy.on("error", (err, _req, res) => {
		fastify.log.warn({ err }, "playground preview proxy error");
		if (res && "writeHead" in res && typeof res.writeHead === "function") {
			try {
				res.writeHead(502, { "Content-Type": "text/plain" });
				res.end("Bad gateway");
			} catch {
				// ignore
			}
		}
	});

	proxy.on("proxyRes", (proxyRes, req) => {
		const pv = (req as IncomingWithPv).playgroundPvCookieValue;
		if (!pv) {
			return;
		}
		const ct = proxyRes.headers["content-type"];
		const head = Array.isArray(ct) ? ct[0] : ct;
		if (typeof head !== "string" || !head.includes("text/html")) {
			return;
		}
		const cookieStr = `playground_pv=${encodeURIComponent(pv)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200`;
		const existing = proxyRes.headers["set-cookie"];
		if (Array.isArray(existing)) {
			proxyRes.headers["set-cookie"] = [...existing, cookieStr];
		} else if (existing) {
			proxyRes.headers["set-cookie"] = [existing, cookieStr];
		} else {
			proxyRes.headers["set-cookie"] = [cookieStr];
		}
	});

	fastify.get<{ Params: { sessionId: string } }>(
		"/preview/:sessionId",
		(request, reply) => {
			const { sessionId } = request.params;
			const raw = request.raw.url ?? "";
			const q = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
			return reply.redirect(`/preview/${sessionId}/${q}`);
		}
	);

	fastify.route<{
		Params: { sessionId: string; "*": string };
	}>({
		method: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		url: "/preview/:sessionId/*",
		handler: async (request, reply) => {
			reply.hijack();
			const { sessionId } = request.params;
			const ctx = await createContext(request.headers);
			const userId = ctx.session?.user?.id;
			const rawUrl = request.raw.url ?? "/";
			const auth = previewAuth(
				sessionId,
				rawUrl,
				request.headers.cookie,
				userId
			);
			const pvCookie = getPlaygroundPvCookieToSetOnHtml(auth);
			if (pvCookie) {
				(request.raw as IncomingWithPv).playgroundPvCookieValue = pvCookie;
			}
			const upstream = resolvePlaygroundPreviewUpstream(auth);
			if (!upstream) {
				reply.raw.statusCode = 403;
				reply.raw.setHeader("Content-Type", "text/plain");
				reply.raw.end("Forbidden");
				return;
			}
			const target = `http://${upstream.hostname}:${upstream.port}`;
			proxy.web(
				request.raw,
				reply.raw,
				{ target, changeOrigin: true },
				(err) => {
					if (err) {
						fastify.log.warn({ err }, "playground preview web proxy");
						try {
							if (!reply.raw.headersSent) {
								reply.raw.statusCode = 502;
								reply.raw.end("Bad gateway");
							}
						} catch {
							// ignore
						}
					}
				}
			);
		},
	});

	fastify.server.on("upgrade", async (req, socket, head) => {
		const url = req.url ?? "";
		if (!url.startsWith("/preview/")) {
			return;
		}
		const m = PREVIEW_SESSION_PATH.exec(url.split("?")[0] ?? "");
		if (!m?.[1]) {
			return;
		}
		const sessionId = m[1];
		const ctx = await createContext(req.headers);
		const userId = ctx.session?.user?.id;
		const auth = previewAuth(sessionId, url, req.headers.cookie, userId);
		const upstream = resolvePlaygroundPreviewUpstream(auth);
		if (!upstream) {
			socket.destroy();
			return;
		}
		const target = `http://${upstream.hostname}:${upstream.port}`;
		proxy.ws(req, socket, head, { target, changeOrigin: true }, (err) => {
			if (err) {
				fastify.log.warn({ err }, "playground preview ws proxy");
			}
		});
	});
};
