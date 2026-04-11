import type { TestResult } from "@ctl/api/routers/tasks/validation";
import { init } from "modern-monaco";

import type { SandboxFileEntry } from "../stores/sandbox-workspace";
import {
	MOCK_SANDBOX_LESSON_KEYS,
	SANDBOX_JSX_LIB,
	SANDBOX_MONACO_LANGS,
	SANDBOX_MONACO_THEME_DARK,
	SANDBOX_MONACO_THEME_DARK_FALLBACK,
	SANDBOX_MONACO_THEME_LIGHT,
	SANDBOX_MONACO_THEME_LIGHT_FALLBACK,
	SANDBOX_TREE_ROOT_ID,
	type SandboxLessonTask,
	type SandboxTask,
	type SandboxTreeItemData,
} from "./constants";

type SandpackConsoleLogEntry = {
	method?: string;
	data?: unknown[];
};

type SandpackLeafTest = {
	name: string;
	status: string;
	errors: Array<{ message?: string }>;
};

type SandpackSpecBlock = {
	tests?: Record<string, SandpackLeafTest>;
	describes?: Record<string, SandpackSpecBlock>;
	error?: unknown;
};

type SandboxTaskConfig = {
	starterFiles: Record<string, string>;
	entryFile: string;
	readOnlyFiles: string[];
	tests: Array<{
		testFilePath: string;
		testCode: string;
	}>;
};

type TsDefaults = {
	getCompilerOptions: () => object;
	setCompilerOptions: (opts: object) => void;
	setDiagnosticsOptions: (opts: object) => void;
	addExtraLib: (content: string, filePath?: string) => { dispose: () => void };
};

type TsApi = {
	typescriptDefaults: TsDefaults;
	javascriptDefaults: TsDefaults;
	JsxEmit: Record<string, number>;
};

const dirKey = (dirPath: string) => `dir:${dirPath}`;

const inferLeafType = (fileName: string): SandboxTreeItemData["type"] => {
	if (fileName.endsWith(".tsx")) {
		return "tsx";
	}
	if (fileName.endsWith(".jsx")) {
		return "jsx";
	}
	if (fileName.endsWith(".ts")) {
		return "ts";
	}
	if (fileName.endsWith(".js")) {
		return "js";
	}
	if (fileName.endsWith(".css") || fileName.endsWith(".scss")) {
		return "css";
	}
	if (fileName.endsWith(".json")) {
		return "json";
	}
	if (fileName.endsWith(".md")) {
		return "md";
	}
	if (fileName.endsWith(".html")) {
		return "html";
	}
	return "config";
};

const sortChildIds = (
	items: Record<string, SandboxTreeItemData>,
	ids: string[]
): string[] =>
	[...ids].sort((a, b) => {
		const aFolder = a.startsWith("dir:");
		const bFolder = b.startsWith("dir:");
		if (aFolder !== bFolder) {
			return aFolder ? -1 : 1;
		}
		const na = items[a]?.name ?? a;
		const nb = items[b]?.name ?? b;
		return na.localeCompare(nb);
	});

const sortTreeRecursive = (
	items: Record<string, SandboxTreeItemData>,
	id: string
) => {
	const node = items[id];
	if (!node?.children) {
		return;
	}
	node.children = sortChildIds(items, node.children);
	for (const c of node.children) {
		if (c.startsWith("dir:")) {
			sortTreeRecursive(items, c);
		}
	}
};

export const buildSandboxTreeItems = (
	files: Record<string, unknown>
): {
	items: Record<string, SandboxTreeItemData>;
	rootId: string;
} => {
	const items: Record<string, SandboxTreeItemData> = {
		[SANDBOX_TREE_ROOT_ID]: {
			name: "workspace",
			children: [],
			type: "folder",
		},
	};

	const ensureDir = (dirPath: string): string => {
		const id = dirKey(dirPath);
		if (items[id]) {
			return id;
		}

		const name = dirPath.includes("/")
			? (dirPath.split("/").pop() ?? dirPath)
			: dirPath;
		items[id] = { name, children: [], type: "folder" };

		const parentPath = dirPath.split("/").slice(0, -1).join("/");
		if (parentPath) {
			const pid = ensureDir(parentPath);
			const parent = items[pid];
			parent.children ??= [];
			parent.children.push(id);
		} else {
			const root = items[SANDBOX_TREE_ROOT_ID];
			root.children ??= [];
			root.children.push(id);
		}
		return id;
	};

	const sortedPaths = Object.keys(files).sort((a, b) => {
		const aIsNested = a.includes("/", 1);
		const bIsNested = b.includes("/", 1);
		if (aIsNested !== bIsNested) {
			return aIsNested ? -1 : 1;
		}
		return a.localeCompare(b);
	});

	for (const path of sortedPaths) {
		const norm = path.startsWith("/") ? path.slice(1) : path;
		const parts = norm.split("/").filter(Boolean);
		const fileName = parts.at(-1) ?? path;
		const dirPath = parts.slice(0, -1).join("/");

		items[path] = {
			name: fileName,
			type: inferLeafType(fileName),
			filePath: path,
		};

		if (dirPath) {
			const pid = ensureDir(dirPath);
			const parent = items[pid];
			parent.children ??= [];
			parent.children.push(path);
		} else {
			const root = items[SANDBOX_TREE_ROOT_ID];
			root.children ??= [];
			root.children.push(path);
		}
	}

	sortTreeRecursive(items, SANDBOX_TREE_ROOT_ID);

	return { items, rootId: SANDBOX_TREE_ROOT_ID };
};

export const listSandboxDirIds = (
	items: Record<string, SandboxTreeItemData>
): string[] => Object.keys(items).filter((k) => k.startsWith("dir:"));

export const getSandboxShikiGrammarId = (path: string): string => {
	const lower = path.toLowerCase();
	if (lower.endsWith(".vue")) {
		return "vue";
	}
	if (lower.endsWith(".tsx")) {
		return "tsx";
	}
	if (lower.endsWith(".jsx")) {
		return "jsx";
	}
	if (
		lower.endsWith(".ts") ||
		lower.endsWith(".mts") ||
		lower.endsWith(".cts")
	) {
		return "typescript";
	}
	if (
		lower.endsWith(".js") ||
		lower.endsWith(".mjs") ||
		lower.endsWith(".cjs")
	) {
		return "javascript";
	}
	if (lower.endsWith(".scss") || lower.endsWith(".sass")) {
		return "scss";
	}
	if (lower.endsWith(".css")) {
		return "css";
	}
	if (lower.endsWith(".jsonc")) {
		return "jsonc";
	}
	if (lower.endsWith(".json")) {
		return "json";
	}
	if (lower.endsWith(".html")) {
		return "html";
	}
	if (lower.endsWith(".mdx")) {
		return "mdx";
	}
	if (lower.endsWith(".md")) {
		return "markdown";
	}
	return "typescript";
};

export const getMonacoLanguage = (path: string): string => {
	if (path.endsWith(".tsx") || path.endsWith(".ts")) {
		return "typescript";
	}
	if (path.endsWith(".jsx") || path.endsWith(".js")) {
		return "javascript";
	}
	if (path.endsWith(".css") || path.endsWith(".scss")) {
		return "css";
	}
	if (path.endsWith(".json")) {
		return "json";
	}
	if (path.endsWith(".html")) {
		return "html";
	}
	if (path.endsWith(".md")) {
		return "markdown";
	}
	return "typescript";
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

const collectLeafTests = (block: SandpackSpecBlock): SandpackLeafTest[] => {
	const direct = Object.values(block.tests ?? {});
	const nested = Object.values(block.describes ?? {}).flatMap((d) =>
		collectLeafTests(d)
	);
	return [...direct, ...nested];
};

const formatTestError = (test: SandpackLeafTest) => {
	const parts = test.errors.map((e) => e.message).filter(Boolean);
	const label = test.name;
	return parts.length > 0 ? `${label}\n${parts.join("\n")}` : label;
};

const specFileErrorMessage = (error: unknown): string => {
	if (typeof error === "string") {
		return error;
	}
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return "Test file error";
};

export const mapSandpackSpecsToTestResults = (
	specs: Record<string, SandpackSpecBlock>,
	orderedTests: Array<{ title: string; testFilePath: string }>
): TestResult[] =>
	orderedTests.map(({ title, testFilePath }) => {
		const spec = specs[testFilePath];
		if (!spec) {
			return {
				title,
				passed: false,
				error: "No results for this test file.",
			};
		}
		if (spec.error != null) {
			return {
				title,
				passed: false,
				error: specFileErrorMessage(spec.error),
			};
		}
		const tests = collectLeafTests(spec);
		if (tests.length === 0) {
			return {
				title,
				passed: false,
				error: "No tests found in file.",
			};
		}
		const failing = tests.filter((t) => t.status === "fail");
		const unfinished = tests.filter(
			(t) => t.status === "idle" || t.status === "running"
		);
		if (failing.length > 0) {
			return {
				title,
				passed: false,
				error: failing.map(formatTestError).join("\n\n"),
			};
		}
		if (unfinished.length > 0) {
			return {
				title,
				passed: false,
				error: "Some tests did not finish.",
			};
		}
		return { title, passed: true };
	});

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

export const sandboxProgressStorageKey = (sandboxTaskId: string) =>
	`sandbox-progress:${sandboxTaskId}`;

export const loadSavedSandboxFiles = (
	sandboxTaskId: string
): Record<string, string> | null => {
	try {
		const raw = localStorage.getItem(sandboxProgressStorageKey(sandboxTaskId));
		return raw ? (JSON.parse(raw) as Record<string, string>) : null;
	} catch {
		return null;
	}
};

export const saveSandboxFiles = (
	sandboxTaskId: string,
	files: Record<string, string>
) => {
	try {
		localStorage.setItem(
			sandboxProgressStorageKey(sandboxTaskId),
			JSON.stringify(files)
		);
	} catch {
		return;
	}
};

export const clearSavedSandboxFiles = (sandboxTaskId: string) => {
	try {
		localStorage.removeItem(sandboxProgressStorageKey(sandboxTaskId));
	} catch {
		return;
	}
};

export const PROGRESS_STORAGE_KEY = sandboxProgressStorageKey;
export const loadSavedFiles = loadSavedSandboxFiles;
export const saveFiles = saveSandboxFiles;
export const clearSavedFiles = clearSavedSandboxFiles;

export type SandboxMonaco = Awaited<ReturnType<typeof init>>;

export const applySandboxEditorTheme = (
	monaco: SandboxMonaco,
	isDark: boolean
) => {
	const preferred = isDark
		? SANDBOX_MONACO_THEME_DARK
		: SANDBOX_MONACO_THEME_LIGHT;
	const fallback = isDark
		? SANDBOX_MONACO_THEME_DARK_FALLBACK
		: SANDBOX_MONACO_THEME_LIGHT_FALLBACK;
	try {
		monaco.editor.setTheme(preferred);
	} catch {
		monaco.editor.setTheme(fallback);
	}
};

let monacoSingleton: SandboxMonaco | null = null;
let monacoPromise: Promise<SandboxMonaco> | null = null;

const lspConfig = {
	typescript: {
		compilerOptions: {
			jsx: 4,
			allowJs: true,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			strict: false,
			skipLibCheck: true,
			noUnusedLocals: false,
			noUnusedParameters: false,
		},
		diagnosticsOptions: {
			validate: false,
		},
	},
} as const;

const patchBuiltinTsWorker = (monaco: SandboxMonaco) => {
	const langsApi = monaco.languages as { typescript?: TsApi };
	const ts = langsApi.typescript;
	if (!ts) {
		return;
	}

	const jsxEmit = ts.JsxEmit?.ReactJSX ?? 4;

	const base = ts.typescriptDefaults.getCompilerOptions() as Record<
		string,
		unknown
	>;
	const { jsx: _, ...rest } = base;
	const opts = {
		...rest,
		jsx: jsxEmit,
		allowJs: true,
		allowSyntheticDefaultImports: true,
		esModuleInterop: true,
		strict: false,
		skipLibCheck: true,
		allowNonTsExtensions: true,
		noUnusedLocals: false,
		noUnusedParameters: false,
	};

	ts.typescriptDefaults.setCompilerOptions(opts);
	ts.javascriptDefaults.setCompilerOptions(opts);

	const noErrors = {
		noSemanticValidation: true,
		noSyntaxValidation: true,
		noSuggestionDiagnostics: true,
	};
	ts.typescriptDefaults.setDiagnosticsOptions(noErrors);
	ts.javascriptDefaults.setDiagnosticsOptions(noErrors);

	ts.typescriptDefaults.addExtraLib(SANDBOX_JSX_LIB, "file:///jsx-shim.d.ts");
	ts.javascriptDefaults.addExtraLib(
		SANDBOX_JSX_LIB,
		"file:///jsx-shim-js.d.ts"
	);
};

const finalizeMonaco = (m: SandboxMonaco): SandboxMonaco => {
	monacoSingleton = m;
	patchBuiltinTsWorker(m);
	return m;
};

export const getSandboxMonaco = (): Promise<SandboxMonaco> => {
	if (monacoSingleton) {
		return Promise.resolve(monacoSingleton);
	}
	if (!monacoPromise) {
		monacoPromise = init({
			defaultTheme: SANDBOX_MONACO_THEME_DARK,
			themes: [
				SANDBOX_MONACO_THEME_DARK,
				SANDBOX_MONACO_THEME_LIGHT,
				SANDBOX_MONACO_THEME_DARK_FALLBACK,
				SANDBOX_MONACO_THEME_LIGHT_FALLBACK,
			],
			langs: [...SANDBOX_MONACO_LANGS],
			lsp: lspConfig,
		})
			.then(finalizeMonaco)
			.catch(() =>
				init({
					defaultTheme: SANDBOX_MONACO_THEME_DARK_FALLBACK,
					themes: [
						SANDBOX_MONACO_THEME_DARK_FALLBACK,
						SANDBOX_MONACO_THEME_LIGHT_FALLBACK,
					],
					langs: [...SANDBOX_MONACO_LANGS],
					lsp: lspConfig,
				}).then(finalizeMonaco)
			);
	}
	return monacoPromise;
};

export const mockSandboxTaskQueryKey = (lessonId: string) =>
	["mock-sandbox-task", lessonId] as const;

export const isMockSandboxLesson = (
	courseSlug: string,
	lessonSlug: string
): boolean => MOCK_SANDBOX_LESSON_KEYS.includes(`${courseSlug}/${lessonSlug}`);

const mockFramework: SandboxTask["framework"] = {
	id: "fw-react",
	name: "React",
	icon: null,
	sandpackTemplate: "react-ts",
	defaultDependencies: {
		react: "^19.0.0",
		"react-dom": "^19.0.0",
	},
	defaultDevDependencies: {
		typescript: "^5.6.0",
		"@types/react": "^19.0.0",
		"@types/react-dom": "^19.0.0",
	},
};

const buildMockTask = (lessonId: string): SandboxTask => ({
	id: `mock-sandbox-task-${lessonId}`,
	lessonId,
	frameworkId: mockFramework.id,
	description: `## Mock sandbox task

Edit \`src/App.tsx\` and use **Preview** to see changes. Tests and submit are mocked locally.`,
	starterFiles: {
		"/src/App.tsx": `export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Mock sandbox</h1>
      <p>Edit this file — preview uses a static placeholder in mock mode.</p>
    </main>
  );
}
`,
		"/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
`,
	},
	dependencies: {
		...mockFramework.defaultDependencies,
	},
	entryFile: "/src/App.tsx",
	readOnlyFiles: ["/src/main.tsx"],
	tests: [
		{
			id: "mock-test-1",
			title: "App renders",
			testFilePath: "/src/App.test.tsx",
			testCode: "// mock",
			sortOrder: 0,
		},
	],
	criteria: [
		{
			id: "mock-c1",
			name: "Structure",
			description: "Component structure",
			maxScore: 10,
			sortOrder: 0,
		},
	],
	framework: mockFramework,
});

export const getMockSandboxLessonTask = (
	lessonId: string
): SandboxLessonTask => ({
	kind: "sandbox",
	task: buildMockTask(lessonId),
	submission: null,
});
