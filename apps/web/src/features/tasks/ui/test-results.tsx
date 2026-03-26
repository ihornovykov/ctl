import type { TestResult } from "@ctl/api/routers/tasks/validation";
import { cn } from "@ctl/ui/lib/utils";
import { AlertCircle, CheckCircle2, FlaskConical, XCircle } from "lucide-react";

type Props = {
	results: TestResult[];
};

export const TestResults = ({ results }: Props) => {
	if (results.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
				<div className="flex size-12 items-center justify-center rounded-full bg-muted/50">
					<FlaskConical className="size-5 text-muted-foreground/40" />
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">
						No tests run yet
					</p>
					<p className="mt-0.5 text-muted-foreground/60 text-xs">
						Submit your solution to run all tests
					</p>
				</div>
			</div>
		);
	}

	const passed = results.filter((r) => r.passed).length;
	const total = results.length;
	const allPassed = passed === total;

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			<div className="border-border/40 border-b bg-muted/20 px-4 py-2.5">
				<div className="flex items-center gap-2">
					{allPassed ? (
						<CheckCircle2 className="size-3.5 text-emerald-500" />
					) : (
						<XCircle className="size-3.5 text-destructive" />
					)}
					<span
						className={cn(
							"font-medium font-mono text-xs",
							allPassed
								? "text-emerald-600 dark:text-emerald-400"
								: "text-destructive"
						)}
					>
						{passed}/{total} tests passed
					</span>
				</div>
			</div>

			<div className="flex-1 divide-y divide-border/30 overflow-y-auto">
				{results.map((result, i) => (
					<div
						className={cn(
							"px-4 py-3 transition-colors",
							result.passed
								? "bg-emerald-500/5 hover:bg-emerald-500/10"
								: "bg-destructive/5 hover:bg-destructive/10"
						)}
						key={i}
					>
						<div className="flex items-start gap-3">
							<div className="mt-0.5 shrink-0">
								{result.passed ? (
									<CheckCircle2 className="size-4 text-emerald-500" />
								) : (
									<XCircle className="size-4 text-destructive" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-medium text-foreground text-sm leading-snug">
									{result.title}
								</p>
								{result.error && !result.passed && (
									<div className="mt-2 flex items-start gap-1.5 rounded-md bg-destructive/10 px-3 py-2">
										<AlertCircle className="mt-0.5 size-3 shrink-0 text-destructive" />
										<pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-destructive text-xs leading-relaxed">
											{result.error}
										</pre>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
