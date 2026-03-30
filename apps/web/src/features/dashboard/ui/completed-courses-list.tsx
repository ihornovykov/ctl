import type { EnrollmentSummary } from "@ctl/api/routers/dashboard/validation";
import { Badge } from "@ctl/ui/components/badge";
import { Card } from "@ctl/ui/components/card";
import { Award, BookOpen, CheckCircle2, Clock } from "lucide-react";

import { CertificateDownloadButton } from "@/features/certificate";

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const formatDate = (d: Date) => {
	const date = new Date(d);
	return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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

export const CompletedCoursesList = ({ enrollments }: Props) => {
	const completed = enrollments.filter((e) => e.isCompleted);

	if (completed.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-6 py-12 text-center">
				<div className="flex size-12 items-center justify-center rounded-full bg-muted">
					<Award className="size-5 text-muted-foreground" />
				</div>
				<p className="font-medium text-sm">No completed courses yet</p>
				<p className="text-muted-foreground text-xs">
					Finish all lessons in a course to earn your certificate
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{completed.map((enrollment, i) => {
				const difficultyConfig =
					DIFFICULTY_CONFIG[enrollment.difficulty] ??
					DIFFICULTY_CONFIG.beginner;

				return (
					<div
						className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
						key={enrollment.courseId}
						style={{ animationDelay: `${i * 60}ms` }}
					>
						<Card className="group flex flex-col gap-4 border-border/60 p-5 transition-all hover:border-emerald-500/30 hover:shadow-sm">
							<div className="flex items-start gap-4">
								<div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 ring-1 ring-white/5 ring-inset">
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
									<div className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
										<CheckCircle2 className="size-2.5 text-white" />
									</div>
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
										<Badge
											className="border border-border/60 bg-muted/50 text-muted-foreground text-xs"
											variant="outline"
										>
											<BookOpen className="mr-1 size-3" />
											{enrollment.totalLessons} lessons
										</Badge>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between gap-3 border-border/40 border-t pt-3">
								<div className="flex flex-col gap-0.5">
									<span className="text-muted-foreground text-xs">
										Completed
									</span>
									<span className="font-medium text-sm">
										{enrollment.completedAt
											? formatDate(enrollment.completedAt)
											: "—"}
									</span>
								</div>

								<CertificateDownloadButton
									courseSlug={enrollment.courseSlug}
									size="sm"
									variant="outline"
								/>
							</div>
						</Card>
					</div>
				);
			})}
		</div>
	);
};
