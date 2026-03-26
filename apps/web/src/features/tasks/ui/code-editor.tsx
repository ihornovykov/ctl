import MonacoEditor, { type BeforeMount } from "@monaco-editor/react";
import { useEffect, useState } from "react";

import { useTheme } from "@/shared/providers";

import { githubDarkTheme, githubLightTheme } from "../lib/editor-themes";

const THEME_DARK = "github-dark";
const THEME_LIGHT = "github-light";

const handleBeforeMount: BeforeMount = (monaco) => {
	monaco.editor.defineTheme(THEME_DARK, githubDarkTheme);
	monaco.editor.defineTheme(THEME_LIGHT, githubLightTheme);
};

type Props = {
	code: string;
	onChange?: (value: string) => void;
	languageId: string;
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

export const CodeEditor = ({
	code,
	onChange,
	languageId,
	readOnly = false,
}: Props) => {
	const isDark = useResolvedTheme();
	const theme = isDark ? THEME_DARK : THEME_LIGHT;

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{readOnly && (
				<div className="flex items-center gap-2 border-border/50 border-b bg-amber-500/5 px-4 py-1.5">
					<div className="size-1.5 rounded-full bg-amber-500" />
					<span className="text-amber-600 text-xs dark:text-amber-400">
						Read-only — submission locked
					</span>
				</div>
			)}
			<div className="flex-1 overflow-hidden">
				<MonacoEditor
					beforeMount={handleBeforeMount}
					height="100%"
					language={languageId}
					onChange={(val) => {
						if (!readOnly && onChange) {
							onChange(val ?? "");
						}
					}}
					options={{
						fontSize: 13.5,
						fontFamily:
							"'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace",
						fontLigatures: true,
						lineNumbers: "on",
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						wordWrap: "on",
						tabSize: 2,
						readOnly,
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
					}}
					theme={theme}
					value={code}
				/>
			</div>
		</div>
	);
};
