import { init } from "modern-monaco";

export const SANDBOX_MONACO_THEME_DARK = "one-dark-pro" as const;
export const SANDBOX_MONACO_THEME_LIGHT = "one-light" as const;
export const SANDBOX_MONACO_THEME_DARK_FALLBACK = "github-dark" as const;
export const SANDBOX_MONACO_THEME_LIGHT_FALLBACK = "github-light" as const;

const langs = [
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
			langs: [...langs],
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
					langs: [...langs],
					lsp: lspConfig,
				}).then(finalizeMonaco)
			);
	}
	return monacoPromise;
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

const SANDBOX_JSX_LIB = `declare namespace JSX {
	interface IntrinsicElements { [elemName: string]: Record<string, unknown>; }
	type Element = unknown;
}
`;

// Patch the built-in TypeScript language worker if it exists (monaco-editor-core
// may include it). This is a belt-and-suspenders measure on top of the lsp config.
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
