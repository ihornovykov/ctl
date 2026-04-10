import { useCallback, useEffect, useRef, useState } from "react";

import { useSandboxWorkspace } from "../stores/sandbox-workspace";

const viteEnv = (
	import.meta as unknown as { env: Record<string, string | undefined> }
).env.VITE_SANDBOX_VITE_ENABLED;
const viteEnabled = viteEnv === "true" || viteEnv === "1";

const MOCK_SRCDOC = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Preview</title></head><body style="font-family:system-ui;padding:1rem"><p>Mock preview — backend sandbox is disabled. Enable Vite sandbox later for a live dev server.</p></body></html>`;

type UseSandboxPreviewParams = {
	sandboxTaskId: string;
	enabled: boolean;
	taskDefinitionKey: string;
	submissionFilesKey: string;
};

type UseSandboxPreviewResult = {
	html: string | null;
	previewUrl: string | null;
	isBuilding: boolean;
	error: string | null;
	triggerNow: () => void;
};

const DEBOUNCE_MS = 500;

export const useSandboxPreview = (
	params: UseSandboxPreviewParams
): UseSandboxPreviewResult => {
	const { enabled } = params;
	const files = useSandboxWorkspace((s) => s.files);
	const setViteSessionId = useSandboxWorkspace((s) => s.setViteSessionId);

	const [html, setHtml] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isBuilding, setIsBuilding] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setViteSessionId(null);
		setPreviewUrl(null);
		if (viteEnabled && enabled) {
			setError(
				"Live Vite preview requires the sandbox backend (disabled in mock mode)."
			);
			setHtml(null);
			return;
		}
		setError(null);
	}, [enabled, setViteSessionId]);

	const applyMockSrcdoc = useCallback(() => {
		setIsBuilding(true);
		setError(null);
		setPreviewUrl(null);
		setHtml(MOCK_SRCDOC);
		setIsBuilding(false);
	}, []);

	useEffect(() => {
		if (viteEnabled || !enabled) {
			return;
		}

		if (pendingRef.current) {
			clearTimeout(pendingRef.current);
		}
		pendingRef.current = setTimeout(applyMockSrcdoc, DEBOUNCE_MS);

		return () => {
			if (pendingRef.current) {
				clearTimeout(pendingRef.current);
			}
		};
	}, [files, applyMockSrcdoc, enabled]);

	useEffect(() => {
		return () => {
			if (pendingRef.current) {
				clearTimeout(pendingRef.current);
			}
		};
	}, []);

	const triggerNow = useCallback(() => {
		if (viteEnabled) {
			setError(
				"Live Vite preview requires the sandbox backend (disabled in mock mode)."
			);
			return;
		}
		if (pendingRef.current) {
			clearTimeout(pendingRef.current);
		}
		applyMockSrcdoc();
	}, [applyMockSrcdoc]);

	return { html, previewUrl, isBuilding, error, triggerNow };
};
