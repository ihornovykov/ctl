import { cn } from "@ctl/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
	code: string;
	lang?: string;
	className?: string;
};

const LIGHT_THEME = "github-light";
const DARK_THEME = "github-dark";

const useCopyToClipboard = (text: string, timeout = 2000) => {
	const [copied, setCopied] = useState(false);

	const copy = () => {
		if (!navigator.clipboard) {
			return;
		}
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), timeout);
		});
	};

	return { copied, copy };
};

const useShikiHighlight = (code: string, lang: string) => {
	const [html, setHtml] = useState<string | null>(null);
	const cancelRef = useRef(false);

	useEffect(() => {
		cancelRef.current = false;
		setHtml(null);

		const run = async () => {
			try {
				const { codeToHtml } = await import("shiki");
				const result = await codeToHtml(code, {
					lang,
					themes: { light: LIGHT_THEME, dark: DARK_THEME },
				});
				if (!cancelRef.current) {
					setHtml(result);
				}
			} catch {
				if (!cancelRef.current) {
					setHtml(null);
				}
			}
		};

		run();
		return () => {
			cancelRef.current = true;
		};
	}, [code, lang]);

	return html;
};

const LANG_LABELS: Record<string, string> = {
	js: "JavaScript",
	javascript: "JavaScript",
	ts: "TypeScript",
	typescript: "TypeScript",
	jsx: "JSX",
	tsx: "TSX",
	py: "Python",
	python: "Python",
	go: "Go",
	rs: "Rust",
	rust: "Rust",
	cpp: "C++",
	c: "C",
	cs: "C#",
	java: "Java",
	rb: "Ruby",
	ruby: "Ruby",
	sh: "Shell",
	bash: "Bash",
	zsh: "Zsh",
	fish: "Fish",
	html: "HTML",
	css: "CSS",
	scss: "SCSS",
	json: "JSON",
	yaml: "YAML",
	yml: "YAML",
	toml: "TOML",
	md: "Markdown",
	mdx: "MDX",
	sql: "SQL",
	graphql: "GraphQL",
	docker: "Dockerfile",
	dockerfile: "Dockerfile",
	xml: "XML",
	swift: "Swift",
	kotlin: "Kotlin",
	php: "PHP",
	r: "R",
};

export const CodeBlock = ({ code, lang = "text", className }: Props) => {
	const html = useShikiHighlight(code, lang);
	const { copied, copy } = useCopyToClipboard(code);
	const label = LANG_LABELS[lang.toLowerCase()] ?? lang.toUpperCase();

	return (
		<div
			className={cn(
				"group relative my-6 overflow-hidden rounded-xl border border-border/60 shadow-sm",
				className
			)}
		>
			<div className="flex items-center justify-between border-border/60 border-b bg-[#f6f8fa] px-4 py-2 dark:bg-[#161b22]">
				<span className="font-mono text-[11px] text-foreground/40 uppercase tracking-wider">
					{label}
				</span>
				<button
					className={cn(
						"flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] transition-all duration-200",
						"text-foreground/40 hover:bg-black/8 hover:text-foreground/70",
						"dark:hover:bg-white/10 dark:hover:text-white/70",
						copied && "text-emerald-600 dark:text-emerald-400"
					)}
					onClick={copy}
					type="button"
				>
					{copied ? (
						<CheckIcon className="size-3.5" />
					) : (
						<CopyIcon className="size-3.5" />
					)}
					{copied ? "Copied!" : "Copy"}
				</button>
			</div>

			<div
				className={cn(
					"overflow-x-auto bg-[#f6f8fa] text-sm dark:bg-[#0d1117]",
					"[&_pre]:m-0 [&_pre]:rounded-none [&_pre]:border-0 [&_pre]:p-5 [&_pre]:leading-6",
					"[&_.shiki]:bg-transparent!",
					"dark:[&_.shiki]:text-(--shiki-dark)!",
					"dark:[&_.shiki_span]:text-(--shiki-dark)!"
				)}
			>
				{html ? (
					<div dangerouslySetInnerHTML={{ __html: html }} />
				) : (
					<pre className="m-0 overflow-x-auto p-5">
						<code className="font-mono text-foreground/80 text-sm leading-6">
							{code}
						</code>
					</pre>
				)}
			</div>
		</div>
	);
};
