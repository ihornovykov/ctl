type SandpackConsoleLogEntry = {
	method?: string;
	data?: unknown[];
};

export const formatSandpackConsoleLogs = (
	logs: unknown
): {
	stdout: string;
	stderr: string;
} => {
	if (!Array.isArray(logs)) {
		return { stdout: "", stderr: "" };
	}
	const out: string[] = [];
	const err: string[] = [];

	for (const entry of logs as SandpackConsoleLogEntry[]) {
		if (entry.method === "clear") {
			out.length = 0;
			err.length = 0;
			continue;
		}
		const data = entry.data;
		const line = Array.isArray(data)
			? data
					.map((d) => (typeof d === "string" ? d : JSON.stringify(d)))
					.join(" ")
			: "";
		if (!line) {
			continue;
		}
		if (entry.method === "error" || entry.method === "warn") {
			err.push(line);
		} else {
			out.push(line);
		}
	}

	return { stdout: out.join("\n"), stderr: err.join("\n") };
};
