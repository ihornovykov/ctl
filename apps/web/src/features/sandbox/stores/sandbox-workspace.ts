import { create } from "zustand";
import type { SandboxSubmissionOutput } from "../lib/sandbox-types";

export type SandboxActiveTab = "overview" | "preview" | "results";

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

	setActiveTab: (activeTab) => set({ activeTab }),
	setSubmitting: (isSubmitting) => set({ isSubmitting }),
	setTestingAll: (isTestingAll) => set({ isTestingAll }),

	setTestResults: (testResults) => set({ testResults }),

	setSubmission: (submission) =>
		set({
			submission,
			activeTab: "overview",
		}),

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

	reset: (existingSubmission) =>
		set({
			activeTab: "preview",
			isSubmitting: false,
			isTestingAll: false,
			testResults: [],
			submission: existingSubmission ?? null,
			viteSessionId: null,
		}),
}));
