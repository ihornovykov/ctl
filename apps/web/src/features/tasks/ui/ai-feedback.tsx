import type { AiFeedback } from "@ctl/api/routers/tasks/validation";
import { cn } from "@ctl/ui/lib/utils";
import { CheckCircle2, Cpu, Lightbulb, Star, TrendingUp } from "lucide-react";

type CriteriaItem = {
	id: string;
	name: string;
	description: string;
	maxScore: number;
	sortOrder: number;
};

type Props = {
	feedback: AiFeedback;
	criteria: CriteriaItem[];
};

const ScoreBadge = ({
	score,
	maxScore,
}: {
	score: number;
	maxScore: number;
}) => {
	const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
	const color =
		pct >= 80
			? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
			: pct >= 60
				? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
				: "text-destructive bg-destructive/10";

	return (
		<span
			className={cn(
				"rounded-full px-2 py-0.5 font-mono font-semibold text-xs",
				color
			)}
		>
			{score}/{maxScore}
		</span>
	);
};

export const AiFeedbackPanel = ({ feedback, criteria }: Props) => {
	const pct =
		feedback.maxScore > 0
			? Math.round((feedback.totalScore / feedback.maxScore) * 100)
			: 0;

	const scoreColor =
		pct >= 80
			? "text-emerald-500"
			: pct >= 60
				? "text-amber-500"
				: "text-destructive";

	const scoreRingColor =
		pct >= 80
			? "stroke-emerald-500"
			: pct >= 60
				? "stroke-amber-500"
				: "stroke-destructive";

	return (
		<div className="flex flex-1 flex-col overflow-y-auto">
			{/* Score hero */}
			<div className="border-border/40 border-b bg-gradient-to-br from-muted/40 to-background px-5 py-6">
				<div className="flex items-center gap-5">
					<div className="relative size-[72px] shrink-0">
						<svg className="size-full -rotate-90" viewBox="0 0 72 72">
							<circle
								className="text-border/30"
								cx="36"
								cy="36"
								fill="none"
								r="30"
								stroke="currentColor"
								strokeWidth="5"
							/>
							<circle
								className={cn("transition-all duration-700", scoreRingColor)}
								cx="36"
								cy="36"
								fill="none"
								r="30"
								strokeDasharray={`${2 * Math.PI * 30}`}
								strokeDashoffset={`${2 * Math.PI * 30 * (1 - pct / 100)}`}
								strokeLinecap="round"
								strokeWidth="5"
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span
								className={cn(
									"font-bold text-xl tabular-nums leading-none",
									scoreColor
								)}
							>
								{feedback.totalScore}
							</span>
							<span className="text-muted-foreground text-xs leading-none">
								/{feedback.maxScore}
							</span>
						</div>
					</div>

					<div>
						<div className="flex items-center gap-2">
							<Cpu className="size-3.5 text-muted-foreground" />
							<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
								AI Review
							</span>
						</div>
						<p
							className={cn("mt-1 font-bold text-2xl tabular-nums", scoreColor)}
						>
							{pct}%
						</p>
						<p className="text-muted-foreground text-xs">
							{pct >= 90
								? "Excellent work!"
								: pct >= 70
									? "Good solution"
									: pct >= 50
										? "Needs improvement"
										: "Keep practicing"}
						</p>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-5 px-5 py-4">
				{/* Criteria breakdown */}
				{feedback.criteriaScores.length > 0 && (
					<section>
						<div className="mb-3 flex items-center gap-2">
							<Star className="size-3.5 text-primary" />
							<h3 className="font-semibold text-foreground text-sm">
								Criteria Scores
							</h3>
						</div>
						<div className="space-y-3">
							{feedback.criteriaScores.map((cs) => {
								const criterionInfo = criteria.find(
									(c) => c.id === cs.criteriaId
								);
								const barPct =
									cs.maxScore > 0 ? (cs.score / cs.maxScore) * 100 : 0;

								return (
									<div
										className="rounded-lg border border-border/40 bg-card/60 p-3"
										key={cs.criteriaId}
									>
										<div className="mb-1.5 flex items-center justify-between gap-2">
											<p className="font-medium text-foreground text-xs">
												{criterionInfo?.name ?? cs.criteriaId}
											</p>
											<ScoreBadge maxScore={cs.maxScore} score={cs.score} />
										</div>
										<div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted/60">
											<div
												className={cn(
													"h-full rounded-full transition-all duration-700",
													barPct >= 80
														? "bg-emerald-500"
														: barPct >= 60
															? "bg-amber-500"
															: "bg-destructive"
												)}
												style={{ width: `${barPct}%` }}
											/>
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
					</section>
				)}

				{/* Main points */}
				{feedback.mainPoints.length > 0 && (
					<section>
						<div className="mb-3 flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-500" />
							<h3 className="font-semibold text-foreground text-sm">
								What you did well
							</h3>
						</div>
						<ul className="space-y-2">
							{feedback.mainPoints.map((point, i) => (
								<li className="flex items-start gap-2.5" key={i}>
									<div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
									<p className="text-foreground/80 text-sm leading-relaxed">
										{point}
									</p>
								</li>
							))}
						</ul>
					</section>
				)}

				{/* Improvements */}
				{feedback.improvements.length > 0 && (
					<section>
						<div className="mb-3 flex items-center gap-2">
							<TrendingUp className="size-3.5 text-primary" />
							<h3 className="font-semibold text-foreground text-sm">
								How to improve
							</h3>
						</div>
						<ul className="space-y-2">
							{feedback.improvements.map((point, i) => (
								<li className="flex items-start gap-2.5" key={i}>
									<Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
									<p className="text-foreground/80 text-sm leading-relaxed">
										{point}
									</p>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</div>
	);
};
