import { cn } from "@ctl/ui/lib/utils";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useTheme } from "@/shared/providers";

import "./sandbox-code-editor.css";
import {
	SANDBOX_EDITOR_FONT_WEIGHT,
	SANDBOX_EDITOR_LEADING_SLASHES,
	SANDBOX_EDITOR_SURFACE,
} from "../lib/constants";
import {
	applySandboxEditorTheme,
	getSandboxMonaco,
	type SandboxMonaco,
} from "../lib/utils";

type Props = {
	code: string;
	modelPath: string;
	onChange?: (value: string) => void;
	onSave?: (value: string) => void;
	readOnly?: boolean;
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

const SandboxMonacoPane = ({
	code,
	modelPath,
	onChange,
	onSave,
	readOnly = false,
	isDark,
}: Props & { isDark: boolean }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<EditorInstance | null>(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const onSaveRef = useRef(onSave);
	onSaveRef.current = onSave;
	const readOnlyRef = useRef(readOnly);
	readOnlyRef.current = readOnly;
	const codeRef = useRef(code);
	codeRef.current = code;
	const isDarkRef = useRef(isDark);
	isDarkRef.current = isDark;

	const [isLoading, setIsLoading] = useState(true);

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
		if (!(ed && readOnly)) {
			return;
		}
		const next = code;
		if (ed.getValue() !== next) {
			ed.setValue(next);
		}
	}, [code, readOnly]);

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

			applySandboxEditorTheme(monaco, isDarkRef.current);

			const pathPart = modelPath
				.replace(SANDBOX_EDITOR_LEADING_SLASHES, "")
				.replace(/\\/g, "/");
			const filePath = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
			const uri = monaco.Uri.parse(`file://${filePath}`);

			model = monaco.editor.createModel(codeRef.current, undefined, uri);
			editor = monaco.editor.create(containerRef.current, {
				model,
				readOnly: !!readOnlyRef.current,
				fontSize: 14,
				fontWeight: SANDBOX_EDITOR_FONT_WEIGHT,
				fontFamily:
					"'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace",
				fontLigatures: true,
				lineNumbers: "on",
				minimap: { enabled: false },
				scrollBeyondLastLine: false,
				wordWrap: "on",
				tabSize: 2,
				renderLineHighlight: readOnlyRef.current ? "none" : "line",
				cursorBlinking: readOnlyRef.current ? "solid" : "blink",
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
			setIsLoading(false);

			const ed = editor;
			contentSub = ed.onDidChangeModelContent(() => {
				if (!readOnlyRef.current && onChangeRef.current) {
					onChangeRef.current(ed.getValue());
				}
			});

			ed.onKeyDown((e) => {
				const isSaveChord =
					e.keyCode === monaco.KeyCode.KeyS && (e.metaKey || e.ctrlKey);
				if (!isSaveChord) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				if (readOnlyRef.current) {
					return;
				}
				const next = ed.getValue();
				onChangeRef.current?.(next);
				onSaveRef.current?.(next);
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
	}, [modelPath]);

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

export const SandboxCodeEditor = ({
	code,
	modelPath,
	onChange,
	onSave,
	readOnly = false,
}: Props) => {
	const isDark = useResolvedTheme();

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{readOnly ? (
				<div className="flex items-center gap-2 border-border/50 border-b bg-amber-500/5 px-4 py-1.5">
					<div className="size-1.5 rounded-full bg-amber-500" />
					<span className="text-amber-600 text-xs dark:text-amber-400">
						Read-only
					</span>
				</div>
			) : null}
			<div className="min-h-0 flex-1 overflow-hidden">
				<SandboxMonacoPane
					code={code}
					isDark={isDark}
					key={modelPath}
					modelPath={modelPath}
					onChange={onChange}
					onSave={readOnly ? undefined : onSave}
					readOnly={readOnly}
				/>
			</div>
		</div>
	);
};
