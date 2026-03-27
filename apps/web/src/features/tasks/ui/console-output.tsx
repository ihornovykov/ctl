import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import Ansi from "ansi-to-react";
import {
	AlertCircle,
	CheckCircle2,
	CheckIcon,
	CopyIcon,
	Terminal,
} from "lucide-react";
import {
	createContext,
	type HTMLAttributes,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

type TerminalContextValue = {
	output: string;
	isStreaming: boolean;
	exitCode: number | null;
};

const TerminalCtx = createContext<TerminalContextValue>({
	output: "",
	isStreaming: false,
	exitCode: null,
});

const TerminalChrome = ({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex shrink-0 items-center justify-between border-zinc-200 border-b bg-zinc-100 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950",
			className
		)}
		{...props}
	>
		{children}
	</div>
);

const TerminalTitle = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400",
			className
		)}
		{...props}
	>
		<Terminal className="size-3.5" />
		<span>Terminal</span>
	</div>
);

const TerminalExitStatus = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => {
	const { exitCode } = useContext(TerminalCtx);

	if (exitCode === null) {
		return null;
	}

	const isError = exitCode !== 0;

	return (
		<div className={cn("flex items-center gap-1.5", className)} {...props}>
			{isError ? (
				<AlertCircle className="size-3.5 text-red-400" />
			) : (
				<CheckCircle2 className="size-3.5 text-emerald-400" />
			)}
			<span
				className={cn(
					"font-mono text-xs",
					isError ? "text-red-400" : "text-emerald-400"
				)}
			>
				{isError ? `exit ${exitCode}` : "success"}
			</span>
		</div>
	);
};

const TerminalCopyButton = ({
	className,
	...props
}: HTMLAttributes<HTMLButtonElement>) => {
	const [copied, setCopied] = useState(false);
	const { output } = useContext(TerminalCtx);

	const onCopy = async () => {
		await navigator.clipboard.writeText(output);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const Icon = copied ? CheckIcon : CopyIcon;

	return (
		<Button
			className={cn(
				"size-7 shrink-0 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
				className
			)}
			onClick={onCopy}
			size="icon"
			variant="ghost"
			{...(props as React.ComponentProps<typeof Button>)}
		>
			<Icon size={13} />
		</Button>
	);
};

const TerminalContent = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => {
	const { output, isStreaming } = useContext(TerminalCtx);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.scrollTop = ref.current.scrollHeight;
		}
	}, [output]);

	return (
		<div
			className={cn(
				"flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed",
				className
			)}
			ref={ref}
			{...props}
		>
			<pre className="wrap-break-word whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">
				<Ansi>{output}</Ansi>
				{isStreaming && (
					<span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-zinc-800 dark:bg-zinc-100" />
				)}
			</pre>
		</div>
	);
};

type Props = {
	stdout: string;
	stderr: string;
	exitCode?: number | null;
	isStreaming?: boolean;
};

export const ConsoleOutput = ({
	stdout,
	stderr,
	exitCode = null,
	isStreaming = false,
}: Props) => {
	const hasOutput = stdout || stderr;

	const combined = [stdout, stderr ? `\x1b[31m${stderr}\x1b[0m` : ""]
		.filter(Boolean)
		.join("\n");

	if (!hasOutput && exitCode === null && !isStreaming) {
		return (
			<TerminalCtx.Provider
				value={{ output: "", isStreaming: false, exitCode: null }}
			>
				<div className="flex h-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
					<TerminalChrome>
						<TerminalTitle />
					</TerminalChrome>
					<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
						<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80">
							<Terminal className="size-4 text-zinc-500 dark:text-zinc-500" />
						</div>
						<div>
							<p className="font-semibold text-sm text-zinc-600 dark:text-zinc-300">
								No output yet
							</p>
							<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
								Run your code to see output here
							</p>
						</div>
					</div>
				</div>
			</TerminalCtx.Provider>
		);
	}

	return (
		<TerminalCtx.Provider value={{ output: combined, isStreaming, exitCode }}>
			<div className="flex h-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
				<TerminalChrome>
					<TerminalTitle />
					<div className="flex items-center gap-1">
						<TerminalExitStatus />
						<TerminalCopyButton />
					</div>
				</TerminalChrome>
				<TerminalContent />
			</div>
		</TerminalCtx.Provider>
	);
};
