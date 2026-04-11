import { create } from "zustand";
import type { SandboxSubmissionOutput } from "../lib/constants";

export type SandboxActiveTab = "overview" | "preview" | "console" | "results";

export type SandboxFileEntry = {
	code: string;
	readOnly: boolean;
};

type ClientTestResult = {
	title: string;
	passed: boolean;
	error?: string;
};

type State = {
	activeTab: SandboxActiveTab;
	isSubmitting: boolean;
	isTestingAll: boolean;
	testResults: ClientTestResult[];
	submission: SandboxSubmissionOutput | null;
	files: Record<string, SandboxFileEntry>;
	activeFile: string;
	viteSessionId: string | null;
	consoleOutput: string;
	consoleError: string;
	consoleExitCode: number | null;
};

type Actions = {
	setActiveTab: (tab: SandboxActiveTab) => void;
	setSubmitting: (submitting: boolean) => void;
	setTestingAll: (value: boolean) => void;
	setTestResults: (results: ClientTestResult[]) => void;
	setSubmission: (submission: SandboxSubmissionOutput) => void;
	setFiles: (
		files: Record<string, SandboxFileEntry>,
		activeFile: string
	) => void;
	updateFile: (path: string, code: string) => void;
	setActiveFile: (path: string) => void;
	setViteSessionId: (sessionId: string | null) => void;
	appendPlaygroundConsoleChunk: (
		stream: "stdout" | "stderr",
		chunk: string
	) => void;
	clearConsole: () => void;
	reset: (existingSubmission?: SandboxSubmissionOutput | null) => void;
};

export const useSandboxWorkspace = create<State & Actions>((set) => ({
	activeTab: "preview",
	isSubmitting: false,
	isTestingAll: false,
	testResults: [],
	submission: null,
	files: {},
	activeFile: "",
	viteSessionId: null,
	consoleOutput: "",
	consoleError: "",
	consoleExitCode: null,

	setActiveTab: (activeTab) => set({ activeTab }),
	setSubmitting: (isSubmitting) => set({ isSubmitting }),
	setTestingAll: (isTestingAll) => set({ isTestingAll }),

	setTestResults: (testResults) => set({ testResults }),

	setSubmission: (submission) => set({ submission }),

	setFiles: (files, activeFile) => set({ files, activeFile }),

	updateFile: (path, code) =>
		set((s) => {
			const existing = s.files[path];
			if (!existing || existing.readOnly) {
				return s;
			}
			return {
				files: {
					...s.files,
					[path]: { ...existing, code },
				},
			};
		}),

	setActiveFile: (activeFile) => set({ activeFile }),

	setViteSessionId: (viteSessionId) => set({ viteSessionId }),

	appendPlaygroundConsoleChunk: (stream, chunk) =>
		set((s) => {
			const maxChars = 400_000;
			const next =
				stream === "stderr" ? s.consoleError + chunk : s.consoleOutput + chunk;
			const trimmed = next.length > maxChars ? next.slice(-maxChars) : next;
			return stream === "stderr"
				? { consoleError: trimmed }
				: { consoleOutput: trimmed };
		}),

	clearConsole: () =>
		set({
			consoleOutput: "",
			consoleError: "",
			consoleExitCode: null,
		}),

	reset: (existingSubmission) =>
		set({
			activeTab: "preview",
			isSubmitting: false,
			isTestingAll: false,
			testResults: [],
			submission: existingSubmission ?? null,
			viteSessionId: null,
			consoleOutput: "",
			consoleError: "",
			consoleExitCode: null,
		}),
}));
