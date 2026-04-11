import { useEffect } from "react";

import { client } from "@/shared/api/orpc";

import { useSandboxWorkspace } from "../stores/sandbox-workspace";

type Params = {
	sessionId: string | null;
	enabled: boolean;
};

export const useSandboxPlaygroundLogs = ({ sessionId, enabled }: Params) => {
	const appendPlaygroundConsoleChunk = useSandboxWorkspace(
		(s) => s.appendPlaygroundConsoleChunk
	);
	const clearConsole = useSandboxWorkspace((s) => s.clearConsole);

	useEffect(() => {
		if (!(sessionId && enabled)) {
			return;
		}
		clearConsole();
		const ac = new AbortController();
		const consume = async () => {
			try {
				const iterator = await client.playground.subscribePlaygroundLogs(
					{ sessionId },
					{ signal: ac.signal }
				);
				for await (const ev of iterator) {
					appendPlaygroundConsoleChunk(ev.stream, ev.chunk);
				}
			} catch {
				return;
			}
		};
		consume().catch(() => undefined);
		return () => ac.abort();
	}, [sessionId, enabled, appendPlaygroundConsoleChunk, clearConsole]);
};
