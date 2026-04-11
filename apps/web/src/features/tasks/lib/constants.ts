import { CheckCircle2, Cpu, FlaskConical, XCircle } from "lucide-react";
import type { ElementType } from "react";

export const TASK_CODE_EDITOR_LANGUAGE_TO_EXT: Record<string, string> = {
	javascript: "js",
	typescript: "ts",
	tsx: "tsx",
	jsx: "jsx",
	python: "py",
	go: "go",
	c: "c",
	cpp: "cpp",
};

export const TASK_TOOLBAR_LANGUAGE_DISPLAY: Record<
	string,
	{ label: string; color: string }
> = {
	javascript: {
		label: "JS",
		color:
			"bg-yellow-400/15 text-yellow-600 dark:text-yellow-300 border border-yellow-400/20",
	},
	typescript: {
		label: "TS",
		color:
			"bg-blue-400/15 text-blue-600 dark:text-blue-300 border border-blue-400/20",
	},
	python: {
		label: "PY",
		color:
			"bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/20",
	},
	go: {
		label: "Go",
		color:
			"bg-sky-400/15 text-sky-600 dark:text-sky-300 border border-sky-400/20",
	},
	c: {
		label: "C",
		color:
			"bg-zinc-400/15 text-zinc-600 dark:text-zinc-300 border border-zinc-400/20",
	},
	cpp: {
		label: "C++",
		color:
			"bg-indigo-400/15 text-indigo-600 dark:text-indigo-300 border border-indigo-400/20",
	},
};

type TaskLanguageConfig = {
	monacoLanguage: string;
	label: string;
};

const taskLanguageConfigs: Record<string, TaskLanguageConfig> = {
	javascript: { monacoLanguage: "javascript", label: "JavaScript" },
	typescript: { monacoLanguage: "typescript", label: "TypeScript" },
	python: { monacoLanguage: "python", label: "Python" },
	go: { monacoLanguage: "go", label: "Go" },
	c: { monacoLanguage: "c", label: "C" },
	cpp: { monacoLanguage: "cpp", label: "C++" },
};

export const getTaskLanguageConfig = (languageId: string): TaskLanguageConfig =>
	taskLanguageConfigs[languageId] ?? {
		monacoLanguage: "plaintext",
		label: languageId,
	};

export type ChainStepStatus = "pending" | "active" | "complete" | "error";

export type ChainStep =
	| { id: "running_tests"; status: ChainStepStatus }
	| {
			id: "tests_complete";
			status: ChainStepStatus;
			passed: number;
			total: number;
	  }
	| {
			id: "tests_failed";
			status: ChainStepStatus;
			passed: number;
			total: number;
	  }
	| { id: "grading_start"; status: ChainStepStatus }
	| { id: "grading_done"; status: ChainStepStatus };

export const CHAIN_OF_THOUGHT_STEP_META: Record<
	ChainStep["id"],
	{ icon: ElementType; label: (step: ChainStep) => string }
> = {
	running_tests: {
		icon: FlaskConical,
		label: () => "Running tests…",
	},
	tests_complete: {
		icon: CheckCircle2,
		label: (s) => {
			const step = s as Extract<ChainStep, { id: "tests_complete" }>;
			return `${step.passed}/${step.total} tests passed`;
		},
	},
	tests_failed: {
		icon: XCircle,
		label: (s) => {
			const step = s as Extract<ChainStep, { id: "tests_failed" }>;
			return `${step.passed}/${step.total} tests passed — fix failing tests`;
		},
	},
	grading_start: {
		icon: Cpu,
		label: () => "Reviewing your code with AI…",
	},
	grading_done: {
		icon: Cpu,
		label: () => "AI review complete",
	},
};

export const CHAIN_OF_THOUGHT_STEP_ICON_CLASS: Record<ChainStepStatus, string> =
	{
		pending: "text-muted-foreground/30",
		active: "text-primary",
		complete: "text-emerald-500",
		error: "text-destructive",
	};

export const CHAIN_OF_THOUGHT_STEP_TEXT_CLASS: Record<ChainStepStatus, string> =
	{
		pending: "text-muted-foreground/40",
		active: "text-foreground",
		complete: "text-foreground",
		error: "text-destructive",
	};
