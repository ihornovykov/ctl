import type { CourseDetail } from "@ctl/api/routers/courses/validation";
import { Badge } from "@ctl/ui/components/badge";
import { Button, buttonVariants } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	CheckCircle2,
	Clock,
	GraduationCap,
	Loader2,
	Zap,
} from "lucide-react";

import { CertificateDownloadButton } from "@/features/certificate";

const DIFFICULTY_CONFIG: Record<
	string,
	{ label: string; className: string; icon: typeof Zap }
> = {
	beginner: {
		label: "Beginner",
		className:
			"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
		icon: BookOpen,
	},
	intermediate: {
		label: "Intermediate",
		className:
			"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
		icon: Zap,
	},
	advanced: {
		label: "Advanced",
		className:
			"bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
		icon: GraduationCap,
	},
};

const LANG_ACCENT: Record<
	string,
	{
		from: string;
		via: string;
		glow: string;
		progressColor: string;
		ring: string;
	}
> = {
	javascript: {
		from: "from-amber-400/25",
		via: "via-yellow-300/15",
		glow: "bg-amber-400/30",
		progressColor: "bg-amber-400",
		ring: "ring-amber-400/20",
	},
	typescript: {
		from: "from-blue-500/25",
		via: "via-sky-400/15",
		glow: "bg-blue-500/30",
		progressColor: "bg-blue-500",
		ring: "ring-blue-500/20",
	},
	go: {
		from: "from-cyan-400/25",
		via: "via-teal-300/15",
		glow: "bg-cyan-400/30",
		progressColor: "bg-cyan-400",
		ring: "ring-cyan-400/20",
	},
	python: {
		from: "from-green-400/25",
		via: "via-lime-300/15",
		glow: "bg-green-400/30",
		progressColor: "bg-green-400",
		ring: "ring-green-400/20",
	},
	c: {
		from: "from-slate-400/25",
		via: "via-zinc-300/15",
		glow: "bg-slate-400/30",
		progressColor: "bg-slate-400",
		ring: "ring-slate-400/20",
	},
	cpp: {
		from: "from-violet-500/25",
		via: "via-purple-400/15",
		glow: "bg-violet-500/30",
		progressColor: "bg-violet-500",
		ring: "ring-violet-500/20",
	},
};

const DEFAULT_ACCENT = {
	from: "from-primary/25",
	via: "via-primary/15",
	glow: "bg-primary/30",
	progressColor: "bg-primary",
	ring: "ring-primary/20",
};

type Props = {
	course: CourseDetail;
	onEnroll: () => void;
	isEnrolling: boolean;
};

export const CourseDetailHeader = ({
	course,
	onEnroll,
	isEnrolling,
}: Props) => {
	const accent = LANG_ACCENT[course.language.id] ?? DEFAULT_ACCENT;
	const difficultyConfig =
		DIFFICULTY_CONFIG[course.difficulty] ?? DIFFICULTY_CONFIG.beginner;
	const DifficultyIcon = difficultyConfig.icon;
	const progressPct =
		course.totalLessons > 0
			? Math.round((course.completedLessons / course.totalLessons) * 100)
			: 0;

	return (
		<div className="relative -mt-14 flex flex-col items-center justify-center overflow-hidden border-border/50 border-b">
			<div className="pointer-events-none absolute inset-0">
				<div
					className={cn(
						"absolute inset-0 bg-linear-to-br",
						accent.from,
						accent.via,
						"to-transparent"
					)}
				/>
				<div
					className={cn(
						"absolute top-0 left-1/3 size-[700px] -translate-x-1/2 rounded-full opacity-35 blur-[140px]",
						accent.glow
					)}
				/>
				<div
					className={cn(
						"absolute top-0 right-0 size-[500px] rounded-full opacity-20 blur-[120px]",
						accent.glow
					)}
				/>
				<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />
			</div>

			<div className="relative mx-auto w-full max-w-6xl px-4 py-30">
				<div
					className="fade-in mb-10 animate-in fill-mode-backwards duration-300"
					style={{ animationDelay: "0ms" }}
				>
					<Link
						className={buttonVariants({ variant: "outline" })}
						to="/courses"
					>
						<ArrowLeft className="size-3.5" />
						All courses
					</Link>
				</div>

				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
					<div
						className="fade-in slide-in-from-bottom-6 flex flex-1 animate-in flex-col gap-6 fill-mode-backwards duration-500"
						style={{ animationDelay: "0ms" }}
					>
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								className={cn(
									"border font-medium text-xs",
									difficultyConfig.className
								)}
								variant="outline"
							>
								<DifficultyIcon className="mr-1.5 size-3" />
								{difficultyConfig.label}
							</Badge>
							<Badge
								className="border border-border/60 bg-muted/50 font-medium text-muted-foreground text-xs"
								variant="outline"
							>
								<Clock className="mr-1.5 size-3" />
								{course.estimatedHours}h estimated
							</Badge>
							<Badge
								className="border border-border/60 bg-muted/50 font-medium text-muted-foreground text-xs"
								variant="outline"
							>
								<BookOpen className="mr-1.5 size-3" />
								{course.totalLessons} lessons
							</Badge>
						</div>

						<h1 className="font-bold text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
							{course.title}
						</h1>

						<p className="max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
							{course.shortDescription}
						</p>

						{course.isEnrolled ? (
							<div className="flex max-w-sm flex-col gap-3">
								<div className="flex items-center justify-between text-sm">
									<span className="flex items-center gap-2 font-medium text-foreground">
										<CheckCircle2 className="size-4 text-emerald-500" />
										Enrolled
									</span>
									<span className="text-muted-foreground">
										{course.completedLessons}/{course.totalLessons} lessons
									</span>
								</div>
								<div className="relative h-2 overflow-hidden rounded-full bg-muted">
									<div
										className={cn(
											"h-full rounded-full transition-all duration-700 ease-out",
											accent.progressColor
										)}
										style={{ width: `${progressPct}%` }}
									/>
								</div>
								<p className="text-muted-foreground text-xs">
									{progressPct}% complete
								</p>
								{course.completedLessons === course.totalLessons &&
									course.totalLessons > 0 && (
										<div className="pt-1">
											<CertificateDownloadButton
												courseSlug={course.slug}
												variant="outline"
											/>
										</div>
									)}
							</div>
						) : (
							<div className="flex flex-col gap-3">
								<Button
									className="w-fit gap-2 px-8 text-base"
									disabled={isEnrolling}
									onClick={onEnroll}
									size="lg"
								>
									{isEnrolling ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<GraduationCap className="size-4" />
									)}
									{isEnrolling ? "Enrolling…" : "Enroll for free"}
								</Button>
								<p className="text-muted-foreground text-xs">
									Free access · Progress tracked automatically
								</p>
							</div>
						)}
					</div>

					<div
						className="fade-in slide-in-from-bottom-6 animate-in fill-mode-backwards duration-500"
						style={{ animationDelay: "120ms" }}
					>
						<div
							className={cn(
								"flex h-52 w-52 shrink-0 items-center justify-center rounded-3xl border border-border/60",
								"bg-card/80 ring-1 backdrop-blur-sm",
								accent.ring,
								"shadow-2xl shadow-black/10"
							)}
						>
							<div className="relative flex items-center justify-center">
								<div
									className={cn(
										"absolute size-32 rounded-full opacity-50 blur-3xl",
										accent.glow
									)}
								/>
								{course.language.icon ? (
									<img
										alt={course.language.name}
										className="relative z-10 size-24 drop-shadow-xl"
										src={course.language.icon}
									/>
								) : (
									<span className="relative z-10 font-bold text-6xl text-foreground/60">
										{course.language.name[0]}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
