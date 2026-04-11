import { cn } from "@ctl/ui/lib/utils";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { useTheme } from "@/shared/providers";

import "@/features/sandbox/ui/sandbox-code-editor.css";
import {
	SANDBOX_EDITOR_FONT_WEIGHT,
	SANDBOX_EDITOR_LEADING_SLASHES,
	SANDBOX_EDITOR_SURFACE,
} from "@/features/sandbox/lib/constants";
import {
	applySandboxEditorTheme,
	getSandboxMonaco,
	type SandboxMonaco,
} from "@/features/sandbox/lib/utils";

import { TASK_CODE_EDITOR_LANGUAGE_TO_EXT } from "@/features/tasks/lib/constants";

type Props = {
	code: string;
	onChange?: (value: string) => void;
	languageId: string;
	readOnly?: boolean;
	modelPath?: string;
	syncValueFromProps?: boolean;
};

const useResolvedTheme = () => {
	const { theme } = useTheme();
	const [isDark, setIsDark] = useState(
		() =>
			theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches)
	);

	useEffect(() => {
		if (theme !== "system") {
			setIsDark(theme === "dark");
			return;
		}
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		setIsDark(mql.matches);
		const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [theme]);

	return isDark;
};

type EditorInstance = ReturnType<SandboxMonaco["editor"]["create"]>;

const TaskMonacoPane = ({
	code,
	languageId,
	onChange,
	readOnly = false,
	modelPath,
	isDark,
	syncFromProps,
}: Props & { isDark: boolean; syncFromProps: boolean }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<EditorInstance | null>(null);
	const codeRef = useRef(code);
	codeRef.current = code;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const readOnlyRef = useRef(readOnly);
	readOnlyRef.current = readOnly;

	const [isLoading, setIsLoading] = useState(true);

	const defaultPath = `task/solution.${TASK_CODE_EDITOR_LANGUAGE_TO_EXT[languageId] ?? "txt"}`;
	const pathPart = (modelPath ?? defaultPath)
		.replace(SANDBOX_EDITOR_LEADING_SLASHES, "")
		.replace(/\\/g, "/");
	const filePath = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;

	useEffect(() => {
		let alive = true;
		getSandboxMonaco().then((m) => {
			if (alive) {
				applySandboxEditorTheme(m, isDark);
			}
		});
		return () => {
			alive = false;
		};
	}, [isDark]);

	useEffect(() => {
		editorRef.current?.updateOptions({
			readOnly: !!readOnly,
			fontWeight: SANDBOX_EDITOR_FONT_WEIGHT,
			cursorBlinking: readOnly ? "solid" : "blink",
			renderLineHighlight: readOnly ? "none" : "line",
		});
	}, [readOnly]);

	useEffect(() => {
		const ed = editorRef.current;
		if (!(ed && syncFromProps)) {
			return;
		}
		if (ed.getValue() !== code) {
			ed.setValue(code);
		}
	}, [code, syncFromProps]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) {
			return;
		}

		let disposed = false;
		let contentSub: { dispose: () => void } | undefined;
		let ro: ResizeObserver | undefined;
		let model: ReturnType<SandboxMonaco["editor"]["createModel"]> | null = null;
		let editor: EditorInstance | null = null;

		setIsLoading(true);

		(async () => {
			const monaco = await getSandboxMonaco();
			if (disposed || !containerRef.current) {
				return;
			}

			applySandboxEditorTheme(monaco, isDark);

			const uri = monaco.Uri.parse(`file://${filePath}`);

			const initialCode = codeRef.current;
			model = monaco.editor.createModel(initialCode, languageId, uri);
			editor = monaco.editor.create(containerRef.current, {
				model,
				readOnly: !!readOnly,
				fontSize: 13.5,
				fontWeight: SANDBOX_EDITOR_FONT_WEIGHT,
				fontFamily:
					"'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace",
				fontLigatures: true,
				lineNumbers: "on",
				minimap: { enabled: false },
				scrollBeyondLastLine: false,
				wordWrap: "on",
				tabSize: 2,
				renderLineHighlight: readOnly ? "none" : "line",
				cursorBlinking: readOnly ? "solid" : "blink",
				smoothScrolling: true,
				padding: { top: 16, bottom: 16 },
				scrollbar: {
					verticalScrollbarSize: 6,
					horizontalScrollbarSize: 6,
				},
				overviewRulerBorder: false,
				renderWhitespace: "none",
				fixedOverflowWidgets: true,
			});

			editorRef.current = editor;
			const latest = codeRef.current;
			if (editor.getValue() !== latest) {
				editor.setValue(latest);
			}
			setIsLoading(false);

			const ed = editor;
			contentSub = ed.onDidChangeModelContent(() => {
				if (!readOnlyRef.current && onChangeRef.current) {
					onChangeRef.current(ed.getValue());
				}
			});

			ro = new ResizeObserver(() => ed.layout());
			ro.observe(el);
		})();

		return () => {
			disposed = true;
			setIsLoading(true);
			ro?.disconnect();
			contentSub?.dispose();
			model?.dispose();
			editor?.dispose();
			editorRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={cn(
				"relative h-full min-h-0 w-full",
				isDark && "sandbox-monaco-editor--dark"
			)}
			ref={containerRef}
		>
			{isLoading ? (
				<div
					aria-hidden
					className={cn("absolute inset-0 z-10", !isDark && "bg-background/80")}
					style={
						isDark
							? ({
									backgroundColor: `${SANDBOX_EDITOR_SURFACE}e0`,
								} satisfies CSSProperties)
							: undefined
					}
				/>
			) : null}
		</div>
	);
};

const filePathForKey = (modelPath: string | undefined, languageId: string) => {
	const defaultPath = `task/solution.${TASK_CODE_EDITOR_LANGUAGE_TO_EXT[languageId] ?? "txt"}`;
	return (modelPath ?? defaultPath).replace(SANDBOX_EDITOR_LEADING_SLASHES, "");
};

export const CodeEditor = ({
	code,
	onChange,
	languageId,
	readOnly = false,
	modelPath,
	syncValueFromProps = true,
}: Props) => {
	const isDark = useResolvedTheme();
	const syncFromProps = readOnly || syncValueFromProps;
	const paneKey = `${languageId}:${filePathForKey(modelPath, languageId)}`;

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{readOnly ? (
				<div className="flex items-center gap-2 border-border/50 border-b bg-amber-500/5 px-4 py-1.5">
					<div className="size-1.5 rounded-full bg-amber-500" />
					<span className="text-amber-600 text-xs dark:text-amber-400">
						Read-only — submission locked
					</span>
				</div>
			) : null}
			<div className="min-h-0 flex-1 overflow-hidden">
				<TaskMonacoPane
					code={code}
					isDark={isDark}
					key={paneKey}
					languageId={languageId}
					modelPath={modelPath}
					onChange={onChange}
					readOnly={readOnly}
					syncFromProps={syncFromProps}
				/>
			</div>
		</div>
	);
};
