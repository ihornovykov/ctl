import type { SandboxFileEntry } from "../stores/sandbox-workspace";

type SandboxTaskConfig = {
	starterFiles: Record<string, string>;
	entryFile: string;
	readOnlyFiles: string[];
	tests: Array<{
		testFilePath: string;
		testCode: string;
	}>;
};

export const buildSandboxFiles = (
	task: SandboxTaskConfig,
	savedFiles?: Record<string, string> | null
): Record<string, SandboxFileEntry> => {
	const result: Record<string, SandboxFileEntry> = {};

	for (const [filePath, code] of Object.entries(task.starterFiles)) {
		result[filePath] = {
			code: savedFiles?.[filePath] ?? code,
			readOnly: task.readOnlyFiles.includes(filePath),
		};
	}

	for (const test of task.tests) {
		result[test.testFilePath] = {
			code: test.testCode,
			readOnly: true,
		};
	}

	return result;
};

export const PROGRESS_STORAGE_KEY = (sandboxTaskId: string) =>
	`sandbox-progress:${sandboxTaskId}`;

export const loadSavedFiles = (
	sandboxTaskId: string
): Record<string, string> | null => {
	try {
		const raw = localStorage.getItem(PROGRESS_STORAGE_KEY(sandboxTaskId));
		return raw ? (JSON.parse(raw) as Record<string, string>) : null;
	} catch {
		return null;
	}
};

export const saveFiles = (
	sandboxTaskId: string,
	files: Record<string, string>
) => {
	try {
		localStorage.setItem(
			PROGRESS_STORAGE_KEY(sandboxTaskId),
			JSON.stringify(files)
		);
	} catch {
		// localStorage unavailable
	}
};

export const clearSavedFiles = (sandboxTaskId: string) => {
	try {
		localStorage.removeItem(PROGRESS_STORAGE_KEY(sandboxTaskId));
	} catch {
		// localStorage unavailable
	}
};
