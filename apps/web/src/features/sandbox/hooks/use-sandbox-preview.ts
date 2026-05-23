import { env } from "@ctl/env/web";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { client } from "@/shared/api/orpc";

import {
	SANDBOX_PREVIEW_HMR_SETTLE_MS,
	SANDBOX_PREVIEW_SYNC_DEBOUNCE_MS,
	type SandboxTask,
} from "../lib/constants";
import { useSandboxWorkspace } from "../stores/sandbox-workspace";

const viteEnv = (
	import.meta as unknown as { env: Record<string, string | undefined> }
).env.VITE_SANDBOX_VITE_ENABLED;
const viteSandboxEnabled = viteEnv === "true" || viteEnv === "1";

const MOCK_SRCDOC = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Preview</title></head><body style="font-family:system-ui;padding:1rem"><p>Mock preview — set VITE_SANDBOX_VITE_ENABLED=true and start Docker playground.</p></body></html>`;

type UseSandboxPreviewParams = {
	task: SandboxTask | null;
	enabled: boolean;
};

type UseSandboxPreviewResult = {
	html: string | null;
	previewUrl: string | null;
	isBuilding: boolean;
	isUpdatingPreview: boolean;
	error: string | null;
	triggerNow: () => void;
};

const DEBOUNCE_MS = SANDBOX_PREVIEW_SYNC_DEBOUNCE_MS;
const HMR_SETTLE_MS = SANDBOX_PREVIEW_HMR_SETTLE_MS;
const TRAILING_SLASH_RE = /\/?$/;

const previewPublicOrigin = (): string => {
	if (import.meta.env.PROD && typeof window !== "undefined") {
		return window.location.origin;
	}
	return env.VITE_SERVER_URL.replace(TRAILING_SLASH_RE, "");
};

const buildStaticInitialFiles = (task: SandboxTask): Record<string, string> => {
	const o = { ...task.starterFiles };
	for (const t of task.tests) {
		o[t.testFilePath] = t.testCode;
	}
	return o;
};

export const useSandboxPreview = (
	params: UseSandboxPreviewParams
): UseSandboxPreviewResult => {
	const { enabled, task } = params;
	const files = useSandboxWorkspace((s) => s.files);
	const setViteSessionId = useSandboxWorkspace((s) => s.setViteSessionId);
	const viteSessionId = useSandboxWorkspace((s) => s.viteSessionId);

	const [html, setHtml] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isBuilding, setIsBuilding] = useState(false);
	const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sessionIdRef = useRef<string | null>(null);
	const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const syncInFlightRef = useRef(false);
	const lastSyncedByPathRef = useRef<Record<string, string>>({});
	const filesRef = useRef(files);
	filesRef.current = files;

	const staticInitial = useMemo(
		() => (task ? buildStaticInitialFiles(task) : null),
		[task]
	);

	useEffect(() => {
		if (!(viteSandboxEnabled && enabled && task && staticInitial)) {
			setViteSessionId(null);
			setPreviewUrl(null);
			setError(null);
			if (sessionIdRef.current) {
				const sid = sessionIdRef.current;
				sessionIdRef.current = null;
				client.playground
					.destroySession({ sessionId: sid })
					.catch(() => undefined);
			}
			return;
		}

		let cancelled = false;
		setIsBuilding(true);
		setError(null);

		const runSession = async () => {
			try {
				const framework = task.frameworkId.includes("vue") ? "vue" : "react";
				const created = await client.playground.createSession({
					framework,
					initialFiles: staticInitial,
				});
				const { sessionId: sid, previewGateToken } = created;
				if (cancelled) {
					await client.playground
						.destroySession({ sessionId: sid })
						.catch(() => undefined);
					return;
				}
				sessionIdRef.current = sid;
				setViteSessionId(sid);
				const preview = new URL(
					`/preview/${sid}/`,
					`${previewPublicOrigin()}/`
				);
				preview.searchParams.set("g", previewGateToken);
				setPreviewUrl(preview.toString());
				setHtml(null);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				setError(msg);
				setPreviewUrl(null);
				setViteSessionId(null);
			} finally {
				if (!cancelled) {
					setIsBuilding(false);
				}
			}
		};
		runSession().catch(() => undefined);

		return () => {
			cancelled = true;
			const sid = sessionIdRef.current;
			sessionIdRef.current = null;
			if (sid) {
				client.playground
					.destroySession({ sessionId: sid })
					.catch(() => undefined);
			}
		};
	}, [task?.id, enabled, staticInitial, setViteSessionId, task]);

	const editableFilesDigest = useMemo(() => {
		const parts: string[] = [];
		for (const [path, entry] of Object.entries(files)) {
			if (!entry.readOnly) {
				parts.push(`${path}\0${entry.code}`);
			}
		}
		parts.sort();
		return parts.join("\x01");
	}, [files]);

	const syncFilesToContainer = useCallback(async () => {
		const sid = sessionIdRef.current;
		if (!(sid && viteSandboxEnabled && enabled)) {
			return false;
		}
		let didWrite = false;
		for (const [path, entry] of Object.entries(filesRef.current)) {
			if (entry.readOnly) {
				continue;
			}
			if (lastSyncedByPathRef.current[path] === entry.code) {
				continue;
			}
			try {
				await client.playground.writeFile({
					sessionId: sid,
					path,
					content: entry.code,
				});
				lastSyncedByPathRef.current[path] = entry.code;
				didWrite = true;
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				setError(msg);
			}
		}
		return didWrite;
	}, [enabled]);

	const hasUnsyncedChanges = useCallback(() => {
		for (const [path, entry] of Object.entries(filesRef.current)) {
			if (entry.readOnly) {
				continue;
			}
			if (lastSyncedByPathRef.current[path] !== entry.code) {
				return true;
			}
		}
		return false;
	}, []);

	const clearSettleTimeout = useCallback(() => {
		if (settleTimeoutRef.current) {
			clearTimeout(settleTimeoutRef.current);
			settleTimeoutRef.current = null;
		}
	}, []);

	const scheduleUpdatingClear = useCallback(() => {
		clearSettleTimeout();
		settleTimeoutRef.current = setTimeout(() => {
			if (!(syncInFlightRef.current || pendingRef.current)) {
				setIsUpdatingPreview(false);
			}
		}, HMR_SETTLE_MS);
	}, [clearSettleTimeout]);

	const runSync = useCallback(async () => {
		const sid = sessionIdRef.current;
		if (!(sid && viteSandboxEnabled && enabled && hasUnsyncedChanges())) {
			return;
		}
		syncInFlightRef.current = true;
		setIsUpdatingPreview(true);
		try {
			await syncFilesToContainer();
		} finally {
			syncInFlightRef.current = false;
			scheduleUpdatingClear();
		}
	}, [
		enabled,
		hasUnsyncedChanges,
		scheduleUpdatingClear,
		syncFilesToContainer,
	]);

	useEffect(() => {
		if (!(viteSandboxEnabled && enabled && viteSessionId)) {
			setIsUpdatingPreview(false);
			return;
		}
		if (pendingRef.current) {
			clearTimeout(pendingRef.current);
		}
		pendingRef.current = setTimeout(() => {
			pendingRef.current = null;
			runSync().catch(() => undefined);
		}, DEBOUNCE_MS);
		return () => {
			if (pendingRef.current) {
				clearTimeout(pendingRef.current);
				pendingRef.current = null;
			}
		};
	}, [editableFilesDigest, enabled, viteSessionId]);

	useEffect(() => {
		return () => {
			if (pendingRef.current) {
				clearTimeout(pendingRef.current);
			}
			clearSettleTimeout();
		};
	}, [clearSettleTimeout]);

	useEffect(() => {
		if (viteSandboxEnabled || !enabled) {
			return;
		}
		setError(null);
		setPreviewUrl(null);
		setViteSessionId(null);
		setHtml(MOCK_SRCDOC);
	}, [enabled, setViteSessionId]);

	const triggerNow = useCallback(() => {
		if (viteSandboxEnabled) {
			if (pendingRef.current) {
				clearTimeout(pendingRef.current);
				pendingRef.current = null;
			}
			runSync().catch(() => undefined);
			return;
		}
		setHtml(MOCK_SRCDOC);
	}, [runSync]);

	return {
		html,
		previewUrl,
		isBuilding,
		isUpdatingPreview,
		error,
		triggerNow,
	};
};
