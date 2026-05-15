export const randomId = (): string => {
	try {
		const fn = globalThis.crypto?.randomUUID;
		if (typeof fn === "function") {
			const id = fn.call(globalThis.crypto);
			if (typeof id === "string" && id.length > 0) {
				return id;
			}
		}
	} catch {
		// Chromium: randomUUID requires a secure context (HTTPS). Public HTTP IP deploys hit this.
	}
	return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
};
