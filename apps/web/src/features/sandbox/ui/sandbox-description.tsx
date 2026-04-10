import { cn } from "@ctl/ui/lib/utils";
import { CheckCircle2, Cpu, Lightbulb, Star } from "lucide-react";
import { match, P } from "ts-pattern";
import { MarkdownRenderer } from "@/shared/ui";
import type { SandboxSubmissionOutput } from "../lib/sandbox-types";

type DescriptionProps = {
	description: string;
};

export const SandboxDescription = ({ description }: DescriptionProps) => (
	<div className="h-full overflow-y-auto p-4 pt-0">
		<MarkdownRenderer content={description} />
	</div>
);

type FeedbackProps = {
	submission: SandboxSubmissionOutput;
	criteria: Array<{ id: string; name: string; maxScore: number }>;
};

export const SandboxAiFeedback = ({ submission, criteria }: FeedbackProps) => {
	const { aiFeedback, score, maxScore } = submission;

	if (!aiFeedback) {
		return null;
	}

	const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

	return (
		<div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
			<div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-3">
				<div className="flex items-center gap-2">
					<Cpu className="size-4 text-primary" />
					<span className="font-semibold text-sm">AI Score</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Star className="size-4 fill-amber-400 text-amber-400" />
					<span className="font-bold text-lg tabular-nums">
						{score}/{maxScore}
					</span>
					<span className="text-muted-foreground text-xs">({pct}%)</span>
				</div>
			</div>

			{aiFeedback.criteriaScores.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Criteria Breakdown
					</p>
					{aiFeedback.criteriaScores.map((cs) => {
						const criterion = criteria.find((c) => c.id === cs.criteriaId);
						const scorePct =
							cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0;
						return (
							<div
								className="rounded-md border border-border/40 bg-background p-3"
								key={cs.criteriaId}
							>
								<div className="mb-1.5 flex items-center justify-between">
									<span className="font-medium text-sm">
										{criterion?.name ?? cs.criteriaId}
									</span>
									<span
										className={cn(
											"font-semibold text-sm tabular-nums",
											match(scorePct)
												.with(P.number.gte(80), () => "text-emerald-500")
												.with(P.number.gte(50), () => "text-amber-500")
												.otherwise(() => "text-rose-500")
										)}
									>
										{cs.score}/{cs.maxScore}
									</span>
								</div>
								{cs.comment && (
									<p className="text-muted-foreground text-xs leading-relaxed">
										{cs.comment}
									</p>
								)}
							</div>
						);
					})}
				</div>
			)}

			{aiFeedback.mainPoints.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
						<CheckCircle2 className="size-3.5 text-emerald-500" />
						What you did well
					</p>
					<ul className="flex flex-col gap-1.5">
						{aiFeedback.mainPoints.map((point) => (
							<li className="flex gap-2 text-sm leading-relaxed" key={point}>
								<span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
								{point}
							</li>
						))}
					</ul>
				</div>
			)}

			{aiFeedback.improvements.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
						<Lightbulb className="size-3.5 text-amber-500" />
						Improvements
					</p>
					<ul className="flex flex-col gap-1.5">
						{aiFeedback.improvements.map((point) => (
							<li className="flex gap-2 text-sm leading-relaxed" key={point}>
								<span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
								{point}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
