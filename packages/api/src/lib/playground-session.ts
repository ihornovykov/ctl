import { createHmac, timingSafeEqual } from "node:crypto";
import http from "node:http";

import { env } from "@ctl/env/server";
import { EventPublisher, ORPCError } from "@orpc/server";
import Docker from "dockerode";
import { nanoid } from "nanoid";

const docker = new Docker();

export type PlaygroundFramework = "react" | "vue";

export type PlaygroundLogEvent = {
	stream: "stdout" | "stderr";
	chunk: string;
};

type SessionRecord = {
	userId: string;
	containerId: string;
	framework: PlaygroundFramework;
	hostPort: number;
	previewGateToken: string;
};

const PLAYGROUND_PV_COOKIE = "playground_pv";

const timingSafeEqualStr = (a: string, b: string): boolean => {
	const ba = Buffer.from(a, "utf8");
	const bb = Buffer.from(b, "utf8");
	if (ba.length !== bb.length) {
		return false;
	}
	return timingSafeEqual(ba, bb);
};

const parsePlaygroundPvPair = (
	raw: string
): { sessionId: string; token: string } | null => {
	const sigSep = raw.lastIndexOf(".");
	if (sigSep <= 0) {
		return null;
	}
	const payload = raw.slice(0, sigSep);
	const sig = raw.slice(sigSep + 1);
	const expected = createHmac("sha256", env.BETTER_AUTH_SECRET)
		.update(payload)
		.digest("base64url");
	if (!timingSafeEqualStr(sig, expected)) {
		return null;
	}
	const colon = payload.indexOf(":");
	if (colon <= 0) {
		return null;
	}
	return {
		sessionId: payload.slice(0, colon),
		token: payload.slice(colon + 1),
	};
};

export const extractPlaygroundPvFromCookieHeader = (
	cookieHeader: string | undefined
): string | null => {
	if (!cookieHeader) {
		return null;
	}
	for (const part of cookieHeader.split(";")) {
		const t = part.trim();
		if (!t.startsWith(`${PLAYGROUND_PV_COOKIE}=`)) {
			continue;
		}
		const v = t.slice(PLAYGROUND_PV_COOKIE.length + 1);
		try {
			return decodeURIComponent(v);
		} catch {
			return null;
		}
	}
	return null;
};

export type PlaygroundPreviewAuth = {
	sessionId: string;
	sessionUserId: string | undefined;
	queryGate: string | null;
	pvCookieRaw: string | null;
};

export const resolvePlaygroundPreviewUpstream = (
	auth: PlaygroundPreviewAuth
): { hostname: string; port: number } | null => {
	const rec = sessions.get(auth.sessionId);
	if (!rec) {
		return null;
	}
	const uid = auth.sessionUserId;
	if (uid && rec.userId === uid) {
		return { hostname: "127.0.0.1", port: rec.hostPort };
	}
	if (
		auth.queryGate &&
		timingSafeEqualStr(auth.queryGate, rec.previewGateToken)
	) {
		return { hostname: "127.0.0.1", port: rec.hostPort };
	}
	if (auth.pvCookieRaw) {
		const parsed = parsePlaygroundPvPair(auth.pvCookieRaw);
		if (
			parsed &&
			parsed.sessionId === auth.sessionId &&
			timingSafeEqualStr(parsed.token, rec.previewGateToken)
		) {
			return { hostname: "127.0.0.1", port: rec.hostPort };
		}
	}
	return null;
};

export const buildPlaygroundPvCookieValue = (
	sessionId: string,
	gateToken: string
): string => {
	const payload = `${sessionId}:${gateToken}`;
	const sig = createHmac("sha256", env.BETTER_AUTH_SECRET)
		.update(payload)
		.digest("base64url");
	return `${payload}.${sig}`;
};

export const getPlaygroundPvCookieToSetOnHtml = (
	auth: PlaygroundPreviewAuth
): string | null => {
	const rec = sessions.get(auth.sessionId);
	if (!rec) {
		return null;
	}
	if (
		!(
			auth.queryGate && timingSafeEqualStr(auth.queryGate, rec.previewGateToken)
		)
	) {
		return null;
	}
	return buildPlaygroundPvCookieValue(auth.sessionId, rec.previewGateToken);
};

const waitForPlaygroundDevServer = (
	port: number,
	basePath: string,
	timeoutMs: number
): Promise<void> => {
	const path = basePath.endsWith("/") ? basePath : `${basePath}/`;
	const deadline = Date.now() + timeoutMs;
	return new Promise((resolve, reject) => {
		const attempt = (): void => {
			if (Date.now() > deadline) {
				reject(
					new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Playground dev server failed to become ready in time",
					})
				);
				return;
			}
			const req = http.request(
				{
					hostname: "127.0.0.1",
					port,
					path,
					method: "GET",
					timeout: 2500,
				},
				(res) => {
					res.resume();
					if (res.statusCode !== undefined && res.statusCode < 500) {
						resolve();
						return;
					}
					setTimeout(attempt, 400);
				}
			);
			req.on("error", () => setTimeout(attempt, 400));
			req.on("timeout", () => {
				req.destroy();
				setTimeout(attempt, 400);
			});
			req.end();
		};
		attempt();
	});
};

const sessions = new Map<string, SessionRecord>();

export const playgroundLogPublisher = new EventPublisher<
	Record<string, PlaygroundLogEvent>
>({ maxBufferedEvents: 400 });

const ensurePlaygroundImage = async (): Promise<void> => {
	const image = env.PLAYGROUND_DOCKER_IMAGE;
	try {
		await docker.getImage(image).inspect();
	} catch {
		await new Promise<void>((resolve, reject) => {
			docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
				if (err) {
					return reject(err);
				}
				docker.modem.followProgress(stream, (e: Error | null) => {
					if (e) {
						return reject(e);
					}
					resolve();
				});
			});
		});
	}
};

export const warmPlaygroundImage = async (): Promise<void> => {
	try {
		await ensurePlaygroundImage();
	} catch (e) {
		console.warn("Playground image warm-up failed:", e);
	}
};

const SAFE_PATH_RE = /^[\w./-]+$/;
const LEADING_SLASHES = /^\/+/;

const normalizeRelativePath = (p: string): string => {
	const t = p.replace(LEADING_SLASHES, "").trim();
	if (!t || t.includes("..") || !SAFE_PATH_RE.test(t)) {
		throw new ORPCError("BAD_REQUEST", { message: "Invalid path" });
	}
	return t;
};

const execInContainerWait = async (
	container: Docker.Container,
	shellCommand: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
	const exec = await container.exec({
		Cmd: ["sh", "-c", shellCommand],
		AttachStdout: true,
		AttachStderr: true,
	});
	const stream = await exec.start({ hijack: true, stdin: false });

	let stdout = "";
	let stderr = "";

	await new Promise<void>((resolve, reject) => {
		container.modem.demuxStream(
			stream as NodeJS.ReadableStream,
			{
				write: (chunk: Buffer) => {
					stdout += chunk.toString();
				},
			},
			{
				write: (chunk: Buffer) => {
					stderr += chunk.toString();
				},
			}
		);
		(stream as NodeJS.ReadableStream).on("end", resolve);
		(stream as NodeJS.ReadableStream).on("error", reject);
	});

	const inspect = await exec.inspect();
	const exitCode = inspect.ExitCode ?? -1;
	return { stdout, stderr, exitCode };
};

const writeFileInContainer = async (
	container: Docker.Container,
	relativePath: string,
	content: string
): Promise<void> => {
	const norm = normalizeRelativePath(relativePath);
	const encoded = Buffer.from(content, "utf8").toString("base64");
	const slash = norm.lastIndexOf("/");
	const mkdir =
		slash === -1 ? "" : `mkdir -p "/workspace/${norm.slice(0, slash)}" && `;
	const shell = `${mkdir}echo "${encoded}" | base64 -d > "/workspace/${norm}"`;
	const { exitCode, stderr } = await execInContainerWait(container, shell);
	if (exitCode !== 0) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `writeFile failed: ${stderr || "unknown"}`,
		});
	}
};

const runDevLogStream = async (
	container: Docker.Container,
	sessionId: string
) => {
	try {
		const basePath = `/preview/${sessionId}/`;
		const publicPort = String(Number(process.env.PORT) || 3000);
		const devCmd = `cd /workspace && PLAYGROUND_HMR_CLIENT_PORT=${publicPort} PLAYGROUND_VITE_BASE=${JSON.stringify(basePath)} npm run dev -- --host 0.0.0.0 --port 5173`;
		const exec = await container.exec({
			Cmd: ["sh", "-c", devCmd],
			AttachStdout: true,
			AttachStderr: true,
		});
		const stream = await exec.start({ hijack: true, stdin: false });
		container.modem.demuxStream(
			stream as NodeJS.ReadableStream,
			{
				write: (chunk: Buffer) => {
					playgroundLogPublisher.publish(sessionId, {
						stream: "stdout",
						chunk: chunk.toString(),
					});
				},
			},
			{
				write: (chunk: Buffer) => {
					playgroundLogPublisher.publish(sessionId, {
						stream: "stderr",
						chunk: chunk.toString(),
					});
				},
			}
		);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		playgroundLogPublisher.publish(sessionId, {
			stream: "stderr",
			chunk: `[playground] dev server failed to start: ${msg}\n`,
		});
	}
};

const attachDevLogStream = (
	container: Docker.Container,
	sessionId: string
): void => {
	runDevLogStream(container, sessionId).catch(() => undefined);
};

const getSessionOrThrow = (
	sessionId: string,
	userId: string
): SessionRecord => {
	const rec = sessions.get(sessionId);
	if (!rec || rec.userId !== userId) {
		throw new ORPCError("NOT_FOUND", {
			message: "Playground session not found",
		});
	}
	return rec;
};

export const ensurePlaygroundSessionOwner = (
	sessionId: string,
	userId: string
): void => {
	getSessionOrThrow(sessionId, userId);
};

export const createPlaygroundSession = async (input: {
	userId: string;
	framework: PlaygroundFramework;
	initialFiles?: Record<string, string>;
}): Promise<{
	sessionId: string;
	hostPort: number;
	previewGateToken: string;
}> => {
	await ensurePlaygroundImage();
	const sessionId = nanoid();
	const previewGateToken = nanoid(32);
	const tpl = input.framework === "react" ? "react" : "vue";

	const container = await docker.createContainer({
		Image: env.PLAYGROUND_DOCKER_IMAGE,
		Cmd: ["tail", "-f", "/dev/null"],
		WorkingDir: "/",
		ExposedPorts: { "5173/tcp": {} },
		HostConfig: {
			PortBindings: { "5173/tcp": [{ HostIp: "127.0.0.1", HostPort: "0" }] },
			AutoRemove: true,
		},
	});

	await container.start();
	const inspect = await container.inspect();
	const binding = inspect.NetworkSettings.Ports["5173/tcp"]?.[0]?.HostPort;
	if (!binding) {
		await container.stop().catch(() => undefined);
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to bind preview port",
		});
	}
	const hostPort = Number(binding);

	const setup = `rm -rf /workspace && mkdir -p /workspace && cp -r /templates/${tpl}/. /workspace/`;
	const { exitCode, stderr } = await execInContainerWait(container, setup);
	if (exitCode !== 0) {
		await container.stop().catch(() => undefined);
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Template copy failed: ${stderr || "unknown"}`,
		});
	}

	if (input.initialFiles) {
		for (const [path, content] of Object.entries(input.initialFiles)) {
			await writeFileInContainer(container, path, content);
		}
	}

	attachDevLogStream(container, sessionId);

	sessions.set(sessionId, {
		userId: input.userId,
		containerId: inspect.Id,
		framework: input.framework,
		hostPort,
		previewGateToken,
	});

	const basePath = `/preview/${sessionId}/`;
	await waitForPlaygroundDevServer(hostPort, basePath, 90_000);

	return { sessionId, hostPort, previewGateToken };
};

export const writePlaygroundFile = async (input: {
	sessionId: string;
	userId: string;
	path: string;
	content: string;
}): Promise<void> => {
	const rec = getSessionOrThrow(input.sessionId, input.userId);
	const container = docker.getContainer(rec.containerId);
	await writeFileInContainer(container, input.path, input.content);
};

export type PlaygroundTestResult = {
	title: string;
	passed: boolean;
	error?: string;
};

type VitestJsonFile = {
	name?: string;
	status?: string;
	message?: string;
	assertionResults?: Array<{
		title?: string;
		fullName?: string;
		ancestorTitles?: string[];
		status?: string;
		failureMessages?: string[];
	}>;
};

type VitestJsonRoot = {
	success?: boolean;
	testResults?: VitestJsonFile[];
};

const parseVitestJsonReport = (raw: string): VitestJsonRoot | null => {
	const t = raw.trim();
	if (!t) {
		return null;
	}
	try {
		return JSON.parse(t) as VitestJsonRoot;
	} catch {
		const i = t.indexOf("{");
		if (i === -1) {
			return null;
		}
		try {
			return JSON.parse(t.slice(i)) as VitestJsonRoot;
		} catch {
			return null;
		}
	}
};

const assertionDisplayTitle = (
	ar: NonNullable<VitestJsonFile["assertionResults"]>[number],
	fileName: string
): string => {
	const fn = ar.fullName?.trim();
	if (fn) {
		return fn;
	}
	const parts = [...(ar.ancestorTitles ?? []), ar.title].filter(
		(x): x is string => Boolean(x && String(x).trim())
	);
	if (parts.length > 0) {
		return parts.join(" › ");
	}
	const t = ar.title?.trim();
	if (t) {
		return t;
	}
	return fileName || "Test";
};

const mapVitestJsonToResults = (raw: string): PlaygroundTestResult[] => {
	const trimmed = raw.trim();
	if (!trimmed) {
		return [{ title: "Tests", passed: false, error: "Empty test output" }];
	}
	const data = parseVitestJsonReport(trimmed);
	if (!data) {
		return [
			{
				title: "Tests",
				passed: false,
				error: `Could not parse Vitest JSON: ${trimmed.slice(0, 240)}`,
			},
		];
	}
	const out: PlaygroundTestResult[] = [];
	for (const file of data.testResults ?? []) {
		const fileName = file.name?.split("/").pop() ?? "suite";
		const assertions = file.assertionResults ?? [];
		if (assertions.length === 0) {
			if (file.status === "failed" || file.message) {
				out.push({
					title: fileName,
					passed: false,
					error: file.message ?? "Test file failed",
				});
			}
			continue;
		}
		for (const ar of assertions) {
			const title = assertionDisplayTitle(ar, fileName);
			const passed = ar.status === "passed";
			out.push({
				title,
				passed,
				error: passed
					? undefined
					: (ar.failureMessages?.join("\n") ?? "failed"),
			});
		}
	}
	if (out.length === 0) {
		const ok = data.success !== false;
		return [{ title: "Tests", passed: ok }];
	}
	return out;
};

export const runPlaygroundTests = async (input: {
	sessionId: string;
	userId: string;
}): Promise<PlaygroundTestResult[]> => {
	const rec = getSessionOrThrow(input.sessionId, input.userId);
	const container = docker.getContainer(rec.containerId);
	const shell =
		"cd /workspace && npx vitest run --reporter=json --outputFile=/tmp/vitest-out.json >/dev/null 2>/tmp/vitest-err.txt; vitest_ec=$?; " +
		"json=$(cat /tmp/vitest-out.json 2>/dev/null || true); " +
		"printf '%s' \"$json\"; " +
		"exit $vitest_ec";
	const { stdout, stderr, exitCode } = await execInContainerWait(
		container,
		shell
	);
	const out = stdout.trim();
	if (!out && (exitCode !== 0 || stderr.trim())) {
		return [
			{
				title: "Tests",
				passed: false,
				error: stderr.trim() || `vitest exited with code ${exitCode}`,
			},
		];
	}
	return mapVitestJsonToResults(out || stdout);
};

export const destroyPlaygroundSession = async (input: {
	sessionId: string;
	userId: string;
}): Promise<void> => {
	const rec = sessions.get(input.sessionId);
	if (!rec || rec.userId !== input.userId) {
		return;
	}
	sessions.delete(input.sessionId);
	try {
		const c = docker.getContainer(rec.containerId);
		await c.stop({ t: 5 });
	} catch {
		// container may already be removed (AutoRemove)
	}
};
