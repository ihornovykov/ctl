import type {
	SubmissionOutput,
	TestResult,
} from "@ctl/api/routers/tasks/validation";
import { create } from "zustand";

export type ActiveTab = "overview" | "console" | "results";

type State = {
	code: string;
	activeTab: ActiveTab;
	isRunning: boolean;
	isTestingAll: boolean;
	isSubmitting: boolean;
	consoleOutput: string;
	consoleError: string;
	consoleExitCode: number | null;
	testResults: TestResult[];
	submission: SubmissionOutput | null;
};

type Actions = {
	setCode: (code: string) => void;
	setActiveTab: (tab: ActiveTab) => void;
	setRunning: (running: boolean) => void;
	setTestingAll: (testing: boolean) => void;
	setSubmitting: (submitting: boolean) => void;
	setConsoleOutput: (stdout: string, stderr: string, exitCode: number) => void;
	setTestResults: (results: TestResult[]) => void;
	setSubmission: (submission: SubmissionOutput) => void;
	reset: (
		starterCode: string,
		existingSubmission?: SubmissionOutput | null
	) => void;
};

export const useTaskWorkspace = create<State & Actions>((set) => ({
	code: "",
	activeTab: "overview",
	isRunning: false,
	isTestingAll: false,
	isSubmitting: false,
	consoleOutput: "",
	consoleError: "",
	consoleExitCode: null,
	testResults: [],
	submission: null,

	setCode: (code) => set({ code }),
	setActiveTab: (tab) => set({ activeTab: tab }),
	setRunning: (isRunning) => set({ isRunning }),
	setTestingAll: (isTestingAll) => set({ isTestingAll }),
	setSubmitting: (isSubmitting) => set({ isSubmitting }),

	setConsoleOutput: (stdout, stderr, exitCode) =>
		set({
			consoleOutput: stdout,
			consoleError: stderr,
			consoleExitCode: exitCode,
			activeTab: "console",
		}),

	setTestResults: (results) =>
		set({
			testResults: results,
			activeTab: "results",
		}),

	setSubmission: (sub) => set({ submission: sub }),

	reset: (starterCode, existingSubmission) =>
		set({
			code: existingSubmission?.code ?? starterCode,
			activeTab: existingSubmission?.aiFeedback ? "results" : "overview",
			isRunning: false,
			isTestingAll: false,
			isSubmitting: false,
			consoleOutput: "",
			consoleError: "",
			consoleExitCode: null,
			testResults: [],
			submission: existingSubmission ?? null,
		}),
}));
