import { cn } from "@ctl/ui/lib/utils";
import { AlertCircle, CheckCircle2, Terminal } from "lucide-react";

type Props = {
	stdout: string;
	stderr: string;
	exitCode?: number | null;
};

export const ConsoleOutput = ({ stdout, stderr, exitCode = null }: Props) => {
	const hasOutput = stdout || stderr;
	const hasError = exitCode !== null && exitCode !== 0;

	if (!hasOutput && exitCode === null) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
				<div className="flex size-12 items-center justify-center rounded-xl bg-muted/60">
					<Terminal className="size-5 text-muted-foreground/40" />
				</div>
				<div>
					<p className="font-semibold text-foreground text-sm">No output yet</p>
					<p className="mt-1 text-muted-foreground text-xs">
						Run your code to see output here
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{exitCode !== null && (
				<div className="flex items-center gap-2.5 border-border/40 border-b px-5 py-3">
					{hasError ? (
						<AlertCircle className="size-4 text-destructive" />
					) : (
						<CheckCircle2 className="size-4 text-emerald-500" />
					)}
					<span
						className={cn(
							"font-semibold text-sm",
							hasError
								? "text-destructive"
								: "text-emerald-600 dark:text-emerald-400"
						)}
					>
						{hasError ? `Exited with code ${exitCode}` : "Exited successfully"}
					</span>
				</div>
			)}

			<div className="flex-1 overflow-y-auto bg-zinc-950 p-5 font-mono text-sm dark:bg-zinc-950">
				{stdout && (
					<pre className="whitespace-pre-wrap break-all text-zinc-100 leading-relaxed">
						{stdout}
					</pre>
				)}
				{stderr && (
					<pre className="mt-3 whitespace-pre-wrap break-all text-red-400 leading-relaxed">
						{stderr}
					</pre>
				)}
			</div>
		</div>
	);
};
