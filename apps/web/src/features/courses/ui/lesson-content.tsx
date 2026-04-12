import type { LessonDetail } from "@ctl/api/routers/courses/validation";
import { buttonVariants } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	ChevronRight,
	Code2,
	Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MarkdownRenderer } from "@/shared/ui";

import { useCompleteLesson } from "../hooks/use-complete-lesson";

type Props = {
	lesson: LessonDetail;
	courseSlug: string;
};

const ReadingProgressBar = ({
	containerRef,
}: {
	containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const onScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = container;
			const scrollable = scrollHeight - clientHeight;
			setProgress(scrollable > 0 ? (scrollTop / scrollable) * 100 : 0);
		};

		container.addEventListener("scroll", onScroll, { passive: true });
		return () => container.removeEventListener("scroll", onScroll);
	}, [containerRef]);

	return (
		<div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-border/40">
			<div
				className="h-full bg-primary transition-all duration-150 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
};

export const LessonContent = ({ lesson, courseSlug }: Props) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const completedRef = useRef(false);

	const { mutate: completeLesson, isPending: isCompleting } = useCompleteLesson(
		courseSlug,
		lesson.slug
	);

	const lessonIndex = lesson.course.lessons.findIndex(
		(l) => l.slug === lesson.slug
	);
	const totalLessons = lesson.course.totalLessons;

	useEffect(() => {
		completedRef.current = false;
		if (!lesson.id) {
			return;
		}
	}, [lesson.id]);

	useEffect(() => {
		if (lesson.hasTask || lesson.isCompleted) {
			return;
		}

		const sentinel = sentinelRef.current;
		if (!sentinel) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !completedRef.current) {
					completedRef.current = true;
					completeLesson(lesson.id, {
						onSuccess: () => {
							toast.success("Lesson completed!", {
								description: lesson.nextLesson
									? `Up next: ${lesson.nextLesson.title}`
									: "You've finished all lessons in this course!",
								icon: <CheckCircle2 className="size-4 text-emerald-500" />,
							});
						},
					});
				}
			},
			{ threshold: 0.8 }
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [
		lesson.hasTask,
		lesson.isCompleted,
		lesson.id,
		lesson.nextLesson,
		completeLesson,
	]);

	return (
		<div className="relative flex flex-1 flex-col overflow-hidden">
			<ReadingProgressBar containerRef={scrollRef} />

			<div className="flex-1 overflow-y-auto" ref={scrollRef}>
				<div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
					<div
						className="fade-in slide-in-from-bottom-4 mb-10 animate-in fill-mode-backwards duration-500"
						style={{ animationDelay: "0ms" }}
					>
						<div className="mb-4 flex items-center gap-2">
							<span className="rounded-full border border-border/60 bg-muted/60 px-3 py-1 font-mono text-muted-foreground text-xs">
								Lesson {lessonIndex + 1} of {totalLessons}
							</span>
							{lesson.isCompleted && (
								<span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-medium text-emerald-600 text-xs dark:text-emerald-400">
									<CheckCircle2 className="size-3" />
									Completed
								</span>
							)}
						</div>

						<h1 className="mb-3 font-bold text-3xl text-foreground leading-tight tracking-tight md:text-4xl">
							{lesson.title}
						</h1>

						<p className="text-base text-muted-foreground leading-relaxed">
							{lesson.description}
						</p>

						<div className="mt-6 h-px bg-border/50" />
					</div>

					<div
						className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
						style={{ animationDelay: "80ms" }}
					>
						<MarkdownRenderer content={lesson.content} />
					</div>

					<div
						className="fade-in slide-in-from-bottom-4 mt-12 animate-in fill-mode-backwards duration-500"
						style={{ animationDelay: "160ms" }}
					>
						{lesson.hasTask ? (
							<TaskCallout
								courseSlug={courseSlug}
								isCompleted={lesson.isCompleted}
								lessonSlug={lesson.slug}
							/>
						) : (
							<ScrollSentinel
								isCompleted={lesson.isCompleted}
								isCompleting={isCompleting}
								ref={sentinelRef}
							/>
						)}

						<LessonNavigation courseSlug={courseSlug} lesson={lesson} />
					</div>
				</div>
			</div>
		</div>
	);
};

type TaskCalloutProps = {
	courseSlug: string;
	lessonSlug: string;
	isCompleted: boolean;
};

const TaskCallout = ({
	courseSlug,
	lessonSlug,
	isCompleted,
}: TaskCalloutProps) => (
	<div
		className={cn(
			"mb-8 overflow-hidden rounded-2xl border transition-colors duration-300",
			isCompleted
				? "border-emerald-500/30 bg-emerald-500/5"
				: "border-primary/30 bg-primary/5"
		)}
	>
		<div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-4">
				<div
					className={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
						isCompleted ? "bg-emerald-500/15" : "bg-primary/15"
					)}
				>
					{isCompleted ? (
						<CheckCircle2 className="size-5 text-emerald-500" />
					) : (
						<Code2 className="size-5 text-primary" />
					)}
				</div>
				<div>
					<h3 className="font-semibold text-foreground text-sm">
						{isCompleted ? "Task completed!" : "Ready to practice?"}
					</h3>
					<p className="mt-1 text-muted-foreground text-sm">
						{isCompleted
							? "Great job! You've successfully completed the coding task for this lesson."
							: "This lesson has a coding task. Put your knowledge to the test and get AI-powered feedback on your solution."}
					</p>
				</div>
			</div>
			<Link
				className={cn(
					buttonVariants({
						size: "lg",
						variant: isCompleted ? "outline" : "default",
					}),
					"shrink-0 gap-2"
				)}
				params={{ slug: courseSlug, lessonSlug }}
				to="/courses/$slug/lessons/$lessonSlug/task"
			>
				{isCompleted ? (
					<>
						<CheckCircle2 className="size-4 text-emerald-500" />
						View Solution
					</>
				) : (
					<>
						Start Task
						<ChevronRight className="size-4" />
					</>
				)}
			</Link>
		</div>
	</div>
);

const SentinelInner = ({
	isCompleted,
	isCompleting,
}: {
	isCompleted: boolean;
	isCompleting: boolean;
}) => {
	if (isCompleting) {
		return (
			<>
				<Loader2 className="size-6 animate-spin text-primary" />
				<p className="text-muted-foreground text-sm">Marking as completed…</p>
			</>
		);
	}
	if (isCompleted) {
		return (
			<>
				<div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
					<CheckCircle2 className="size-6 text-emerald-500" />
				</div>
				<div>
					<p className="font-semibold text-emerald-600 dark:text-emerald-400">
						Lesson completed!
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Great job — you can continue to the next lesson.
					</p>
				</div>
			</>
		);
	}
	return (
		<>
			<div className="flex size-12 items-center justify-center rounded-full bg-muted/60">
				<CheckCircle2 className="size-6 text-muted-foreground/30" />
			</div>
			<div>
				<p className="font-medium text-foreground/70 text-sm">Keep reading…</p>
				<p className="mt-1 text-muted-foreground text-xs">
					Lesson will be marked complete when you reach the end.
				</p>
			</div>
		</>
	);
};

const ScrollSentinel = ({
	isCompleted,
	isCompleting,
	ref,
}: {
	isCompleted: boolean;
	isCompleting: boolean;
	ref: React.RefObject<HTMLDivElement | null>;
}) => (
	<div
		className={cn(
			"mb-8 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center transition-all duration-500",
			isCompleted
				? "border-emerald-500/30 bg-emerald-500/5"
				: "border-border/50 bg-muted/20"
		)}
		ref={ref}
	>
		<SentinelInner isCompleted={isCompleted} isCompleting={isCompleting} />
	</div>
);

const LessonNavigation = ({
	lesson,
	courseSlug,
}: {
	lesson: LessonDetail;
	courseSlug: string;
}) => (
	<div className="flex items-center justify-between gap-4 border-border/40 border-t pt-6">
		{lesson.prevLesson ? (
			<Link
				className={cn(
					"group flex items-center gap-3 rounded-xl border border-border/50 bg-card/80 p-4 transition-all duration-200",
					"max-w-[48%] flex-1 hover:border-border hover:shadow-black/5 hover:shadow-md"
				)}
				params={{ slug: courseSlug, lessonSlug: lesson.prevLesson.slug }}
				to="/courses/$slug/lessons/$lessonSlug"
			>
				<ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-0.5" />
				<div className="min-w-0">
					<p className="text-muted-foreground text-xs">Previous</p>
					<p className="truncate font-medium text-foreground text-sm">
						{lesson.prevLesson.title}
					</p>
				</div>
			</Link>
		) : (
			<div className="flex-1" />
		)}

		{lesson.nextLesson ? (
			<Link
				className={cn(
					"group flex items-center justify-end gap-3 rounded-xl border border-border/50 bg-card/80 p-4 transition-all duration-200",
					"max-w-[48%] flex-1 hover:border-border hover:shadow-black/5 hover:shadow-md",
					!lesson.isCompleted && "pointer-events-none opacity-50"
				)}
				params={{ slug: courseSlug, lessonSlug: lesson.nextLesson.slug }}
				to="/courses/$slug/lessons/$lessonSlug"
			>
				<div className="min-w-0 text-right">
					<p className="text-muted-foreground text-xs">Next</p>
					<p className="truncate font-medium text-foreground text-sm">
						{lesson.nextLesson.title}
					</p>
				</div>
				<ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
			</Link>
		) : (
			<div className="flex-1" />
		)}
	</div>
);
