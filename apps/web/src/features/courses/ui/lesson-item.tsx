import type { LessonItem as LessonItemData } from "@ctl/api/routers/courses/validation";
import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { CheckCircle2, Loader2, Lock, PlayCircle } from "lucide-react";

type Props = {
	lesson: LessonItemData;
	index: number;
	isLast: boolean;
	onComplete: (lessonId: string) => void;
	isCompleting: boolean;
	isEnrolled: boolean;
};

const LessonStatus = ({
	lesson,
	isEnrolled,
	index,
}: {
	lesson: LessonItemData;
	isEnrolled: boolean;
	index: number;
}) => {
	if (lesson.isCompleted) {
		return (
			<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/40">
				<CheckCircle2 className="size-5 text-emerald-500" />
			</div>
		);
	}

	if (lesson.isAccessible) {
		return (
			<div className="flex size-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/40">
				<PlayCircle className="size-5 text-primary" />
			</div>
		);
	}

	if (!isEnrolled) {
		return (
			<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/60">
				<span className="font-semibold text-muted-foreground/60 text-sm">
					{index + 1}
				</span>
			</div>
		);
	}

	return (
		<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/60">
			<Lock className="size-4 text-muted-foreground/50" />
		</div>
	);
};

export const LessonItem = ({
	lesson,
	index,
	isLast,
	onComplete,
	isCompleting,
	isEnrolled,
}: Props) => {
	const getStateClass = () => {
		if (lesson.isCompleted) {
			return "border-emerald-500/25 bg-emerald-500/5";
		}
		if (lesson.isAccessible) {
			return "border-primary/30 bg-primary/5";
		}
		return "border-border/40 bg-card/50";
	};
	const stateClass = getStateClass();

	return (
		<div
			className="fade-in slide-in-from-left-4 flex animate-in gap-4 fill-mode-backwards duration-500"
			style={{ animationDelay: `${index * 80}ms` }}
		>
			{/* Timeline track */}
			<div className="flex flex-col items-center">
				<LessonStatus index={index} isEnrolled={isEnrolled} lesson={lesson} />
				{!isLast && (
					<div
						className={cn(
							"mt-1 min-h-8 w-px flex-1",
							lesson.isCompleted ? "bg-emerald-500/30" : "bg-border/40"
						)}
					/>
				)}
			</div>

			{/* Lesson card */}
			<div
				className={cn(
					"mb-4 flex-1 rounded-2xl border p-5 transition-all duration-300",
					stateClass,
					lesson.isAccessible && !lesson.isCompleted
						? "hover:-translate-y-0.5 hover:shadow-black/5 hover:shadow-lg"
						: ""
				)}
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2">
							<span className="font-mono text-muted-foreground/60 text-xs">
								{String(index + 1).padStart(2, "0")}
							</span>
							{lesson.isCompleted && (
								<span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-600 text-xs dark:text-emerald-400">
									Completed
								</span>
							)}
							{lesson.isAccessible && !lesson.isCompleted && (
								<span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
									Available
								</span>
							)}
						</div>
						<h3
							className={cn(
								"font-semibold text-base leading-snug",
								lesson.isAccessible || lesson.isCompleted || isEnrolled
									? "text-foreground"
									: "text-muted-foreground/70"
							)}
						>
							{lesson.title}
						</h3>
						<p
							className={cn(
								"text-sm leading-relaxed",
								lesson.isAccessible || lesson.isCompleted
									? "text-muted-foreground"
									: "text-muted-foreground/50"
							)}
						>
							{lesson.description}
						</p>
					</div>

					{/* Action */}
					{lesson.isAccessible && !lesson.isCompleted && isEnrolled && (
						<Button
							className="shrink-0 gap-1.5"
							disabled={isCompleting}
							onClick={() => onComplete(lesson.id)}
							size="sm"
							variant="default"
						>
							{isCompleting ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<CheckCircle2 className="size-3.5" />
							)}
							{isCompleting ? "Saving…" : "Complete"}
						</Button>
					)}

					{!(lesson.isAccessible || lesson.isCompleted) && isEnrolled && (
						<div className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 text-muted-foreground/50 text-xs">
							<Lock className="size-3" />
							Locked
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
