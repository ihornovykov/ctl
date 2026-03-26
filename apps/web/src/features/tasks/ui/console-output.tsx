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
				<div className="flex size-12 items-center justify-center rounded-full bg-muted/50">
					<Terminal className="size-5 text-muted-foreground/40" />
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">
						No output yet
					</p>
					<p className="mt-0.5 text-muted-foreground/60 text-xs">
						Run your code to see output here
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{exitCode !== null && (
				<div className="border-border/40 border-b bg-muted/20 px-4 py-2.5">
					<div className="flex items-center gap-2">
						{hasError ? (
							<AlertCircle className="size-3.5 text-destructive" />
						) : (
							<CheckCircle2 className="size-3.5 text-emerald-500" />
						)}
						<span
							className={cn(
								"font-mono text-xs",
								hasError
									? "text-destructive"
									: "text-emerald-600 dark:text-emerald-400"
							)}
						>
							{hasError ? `Exit code ${exitCode}` : "Exited successfully"}
						</span>
					</div>
				</div>
			)}

			<div className="flex-1 overflow-y-auto bg-zinc-950 p-4 font-mono text-xs">
				{stdout && (
					<pre className="whitespace-pre-wrap break-all text-zinc-100 leading-relaxed">
						{stdout}
					</pre>
				)}
				{stderr && (
					<pre className="mt-2 whitespace-pre-wrap break-all text-red-400 leading-relaxed">
						{stderr}
					</pre>
				)}
			</div>
		</div>
	);
};
