import "./markdown-body.css";

import { cn } from "@ctl/ui/lib/utils";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./code-block";

type Props = {
	content: string;
	className?: string;
};

const LANG_RE = /language-(\w+)/;

const extractText = (node: ReactNode): string => {
	if (typeof node === "string") {
		return node;
	}
	if (Array.isArray(node)) {
		return node.map(extractText).join("");
	}
	if (node && typeof node === "object" && "props" in node) {
		const el = node as ReactElement<{ children?: ReactNode }>;
		return extractText(el.props?.children);
	}
	return "";
};

type CodeProps = ComponentProps<"code"> & { className?: string };

const Pre = ({ children }: ComponentProps<"pre">) => {
	const child = children as ReactElement<CodeProps> | undefined;
	const childClass = child?.props?.className ?? "";
	const langMatch = childClass.match(LANG_RE);

	if (langMatch) {
		const lang = langMatch[1];
		const code = extractText(child?.props?.children).trimEnd();
		return <CodeBlock code={code} lang={lang} />;
	}

	return (
		<pre className="my-6 overflow-x-auto rounded-xl border border-border/60 bg-muted/60 p-5 font-mono text-sm leading-6">
			{children}
		</pre>
	);
};

const Code = ({ children, className, ...props }: CodeProps) => {
	if (className?.match(LANG_RE)) {
		return (
			<code className={className} {...props}>
				{children}
			</code>
		);
	}
	return (
		<code
			className="rounded-md border border-border/60 bg-muted/70 px-1.5 py-0.5 font-mono text-[0.875em] text-foreground"
			{...props}
		>
			{children}
		</code>
	);
};

export const MarkdownRenderer = ({ content, className }: Props) => (
	<div className={cn("markdown-body", className)}>
		<ReactMarkdown
			components={{ pre: Pre, code: Code }}
			remarkPlugins={[remarkGfm]}
		>
			{content}
		</ReactMarkdown>
	</div>
);
