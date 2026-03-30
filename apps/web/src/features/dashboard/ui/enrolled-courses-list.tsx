import type { EnrollmentSummary } from "@ctl/api/routers/dashboard/validation";
import { Badge } from "@ctl/ui/components/badge";
import { buttonVariants } from "@ctl/ui/components/button";
import { Card } from "@ctl/ui/components/card";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

const LANG_PROGRESS_COLOR: Record<string, string> = {
	javascript: "bg-amber-400",
	typescript: "bg-blue-500",
	go: "bg-cyan-400",
	python: "bg-green-400",
	c: "bg-slate-400",
	cpp: "bg-violet-500",
};

const DIFFICULTY_CONFIG: Record<string, { label: string; className: string }> =
	{
		beginner: {
			label: "Beginner",
			className:
				"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
		},
		intermediate: {
			label: "Intermediate",
			className:
				"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
		},
		advanced: {
			label: "Advanced",
			className:
				"bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
		},
	};

type Props = {
	enrollments: EnrollmentSummary[];
};

export const EnrolledCoursesList = ({ enrollments }: Props) => {
	const inProgress = enrollments.filter((e) => !e.isCompleted);

	if (inProgress.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-6 py-12 text-center">
				<div className="flex size-12 items-center justify-center rounded-full bg-muted">
					<BookOpen className="size-5 text-muted-foreground" />
				</div>
				<p className="font-medium text-sm">No courses in progress</p>
				<p className="text-muted-foreground text-xs">
					Browse the catalog and enroll to start learning
				</p>
				<Link
					className={buttonVariants({ variant: "outline", size: "sm" })}
					to="/courses"
				>
					Browse courses
				</Link>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{inProgress.map((enrollment, i) => {
				const progressPct =
					enrollment.totalLessons > 0
						? Math.round(
								(enrollment.completedLessons / enrollment.totalLessons) * 100
							)
						: 0;
				const progressColor =
					LANG_PROGRESS_COLOR[enrollment.languageId] ?? "bg-primary";
				const difficultyConfig =
					DIFFICULTY_CONFIG[enrollment.difficulty] ??
					DIFFICULTY_CONFIG.beginner;

				return (
					<div
						className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
						key={enrollment.courseId}
						style={{ animationDelay: `${i * 60}ms` }}
					>
						<Card className="group flex flex-col gap-4 border-border/60 p-5 transition-all hover:border-primary/30 hover:shadow-sm">
							<div className="flex items-start gap-4">
								<div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
									{enrollment.languageIcon ? (
										<img
											alt={enrollment.languageName}
											className="size-7"
											src={enrollment.languageIcon}
										/>
									) : (
										<span className="font-bold text-lg text-muted-foreground">
											{enrollment.languageName[0]}
										</span>
									)}
								</div>

								<div className="flex min-w-0 flex-1 flex-col gap-1.5">
									<h3 className="font-semibold leading-snug">
										{enrollment.courseTitle}
									</h3>
									<div className="flex flex-wrap items-center gap-1.5">
										<Badge
											className={`border text-xs ${difficultyConfig.className}`}
											variant="outline"
										>
											{difficultyConfig.label}
										</Badge>
										<Badge
											className="border border-border/60 bg-muted/50 text-muted-foreground text-xs"
											variant="outline"
										>
											<Clock className="mr-1 size-3" />
											{enrollment.estimatedHours}h
										</Badge>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">
										{enrollment.completedLessons}/{enrollment.totalLessons}{" "}
										lessons
									</span>
									<span className="font-medium text-foreground">
										{progressPct}%
									</span>
								</div>
								<div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
									<div
										className={cn(
											"h-full rounded-full transition-all duration-700 ease-out",
											progressColor
										)}
										style={{ width: `${progressPct}%` }}
									/>
								</div>
							</div>

							<Link
								className={cn(
									buttonVariants({ variant: "outline", size: "sm" }),
									"w-full"
								)}
								params={{ slug: enrollment.courseSlug }}
								to="/courses/$slug"
							>
								Continue learning
								<ArrowRight className="size-3.5" />
							</Link>
						</Card>
					</div>
				);
			})}
		</div>
	);
};
