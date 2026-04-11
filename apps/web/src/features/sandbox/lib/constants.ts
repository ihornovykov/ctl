import { BookOpen, Eye, TerminalSquare, TestTube } from "lucide-react";

export type SandboxTest = {
	id: string;
	title: string;
	testFilePath: string;
	testCode: string;
	sortOrder: number;
};

export type SandboxGradingCriterion = {
	id: string;
	name: string;
	description: string;
	maxScore: number;
	sortOrder: number;
};

export type SandboxFramework = {
	id: string;
	name: string;
	icon: string | null;
	sandpackTemplate: string;
	defaultDependencies: Record<string, string>;
	defaultDevDependencies: Record<string, string>;
};

export type SandboxTask = {
	id: string;
	lessonId: string;
	frameworkId: string;
	description: string;
	starterFiles: Record<string, string>;
	dependencies: Record<string, string>;
	entryFile: string;
	readOnlyFiles: string[];
	tests: SandboxTest[];
	criteria: SandboxGradingCriterion[];
	framework: SandboxFramework;
};

export type SandboxAiFeedback = {
	totalScore: number;
	maxScore: number;
	mainPoints: string[];
	improvements: string[];
	criteriaScores: Array<{
		criteriaId: string;
		score: number;
		maxScore: number;
		comment: string;
	}>;
};

export type SandboxSubmissionOutput = {
	id: string;
	files: Record<string, string>;
	testsPassed: boolean;
	score: number;
	maxScore: number;
	aiFeedback: SandboxAiFeedback | null;
	submittedAt: Date;
};

export type SandboxLessonTask = {
	kind: "sandbox";
	task: SandboxTask;
	submission: SandboxSubmissionOutput | null;
};

export type SandboxRunTestsOutput = {
	results: Array<{ title: string; passed: boolean; error?: string }>;
};

export type SandboxSubmitOutput = {
	submission: SandboxSubmissionOutput;
};

export const SANDBOX_TREE_ROOT_ID = "__sandbox_root__";

export type SandboxTreeLeafType =
	| "folder"
	| "ts"
	| "tsx"
	| "jsx"
	| "js"
	| "vue"
	| "test"
	| "css"
	| "json"
	| "md"
	| "html"
	| "config";

export const SANDBOX_TREE_ICON = {
	folder: "/icons/catppuccin/_folder.svg",
	folderOpen: "/icons/catppuccin/_folder_open.svg",
	ts: "/icons/catppuccin/typescript.svg",
	tsx: "/icons/catppuccin/typescript-react.svg",
	js: "/icons/catppuccin/javascript.svg",
	jsx: "/icons/catppuccin/javascript-react.svg",
	vue: "/icons/catppuccin/vue.svg",
	test: "/icons/catppuccin/vitest.svg",
	json: "/icons/catppuccin/json.svg",
	css: "/icons/catppuccin/css.svg",
	html: "/icons/catppuccin/html.svg",
	md: "/icons/catppuccin/markdown.svg",
	config: "/icons/catppuccin/_file.svg",
} as const;

export type SandboxTreeItemData = {
	name: string;
	children?: string[];
	type?: SandboxTreeLeafType;
	filePath?: string;
};

export const SANDBOX_MONACO_THEME_DARK = "one-dark-pro" as const;
export const SANDBOX_MONACO_THEME_LIGHT = "one-light" as const;
export const SANDBOX_MONACO_THEME_DARK_FALLBACK = "github-dark" as const;
export const SANDBOX_MONACO_THEME_LIGHT_FALLBACK = "github-light" as const;

export const SANDBOX_MONACO_LANGS = [
	"typescript",
	"javascript",
	"tsx",
	"jsx",
	"vue",
	"vue-html",
	"css",
	"scss",
	"sass",
	"json",
	"jsonc",
	"html",
	"markdown",
	"mdx",
	"python",
	"go",
	"c",
	"cpp",
] as const;

export const SANDBOX_JSX_LIB = `declare namespace JSX {
	interface IntrinsicElements { [elemName: string]: Record<string, unknown>; }
	type Element = unknown;
}
`;

export const SANDBOX_EDITOR_LEADING_SLASHES = /^\/+/;
export const SANDBOX_EDITOR_SURFACE = "#15191d";
export const SANDBOX_EDITOR_FONT_WEIGHT = "500";

export const SANDBOX_WORKSPACE_AUTO_SAVE_DELAY_MS = 1000;

export const SANDBOX_WORKSPACE_RIGHT_TABS = [
	{ id: "overview" as const, label: "Overview", icon: BookOpen },
	{ id: "preview" as const, label: "Preview", icon: Eye },
	{ id: "console" as const, label: "Console", icon: TerminalSquare },
	{ id: "results" as const, label: "Results", icon: TestTube },
] as const;

export const SANDBOX_TOOLBAR_FRAMEWORK_DISPLAY: Record<
	string,
	{ label: string; color: string }
> = {
	react: {
		label: "React",
		color:
			"bg-sky-400/15 text-sky-600 dark:text-sky-300 border border-sky-400/20",
	},
	vue: {
		label: "Vue",
		color:
			"bg-emerald-400/15 text-emerald-600 dark:text-emerald-300 border border-emerald-400/20",
	},
	svelte: {
		label: "Svelte",
		color:
			"bg-orange-400/15 text-orange-600 dark:text-orange-300 border border-orange-400/20",
	},
};

export const MOCK_SANDBOX_LESSON_KEYS: readonly string[] = [];
