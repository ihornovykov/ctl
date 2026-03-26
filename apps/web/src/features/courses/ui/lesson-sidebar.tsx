import type { LessonDetail } from "@ctl/api/routers/courses/validation";
import { buttonVariants } from "@ctl/ui/components/button";
import { ScrollArea } from "@ctl/ui/components/scroll-area";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	CheckCircle2,
	Lock,
	PlayCircle,
} from "lucide-react";

type Props = {
	lesson: LessonDetail;
};

const LessonNavItem = ({
	item,
	courseSlug,
	isActive,
}: {
	item: LessonDetail["course"]["lessons"][number];
	courseSlug: string;
	isActive: boolean;
}) => {
	const icon = (() => {
		if (item.isCompleted) {
			return <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />;
		}
		if (item.isAccessible) {
			return (
				<PlayCircle
					className={cn(
						"size-4 shrink-0",
						isActive ? "text-primary" : "text-primary/70"
					)}
				/>
			);
		}
		return <Lock className="size-4 shrink-0 text-muted-foreground/40" />;
	})();

	const isClickable = item.isAccessible || item.isCompleted;

	const containerClass = cn(
		"group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
		isActive && "bg-primary/10 ring-1 ring-primary/20",
		!isActive && isClickable && "cursor-pointer hover:bg-muted/60",
		!(isActive || isClickable) && "cursor-not-allowed opacity-50"
	);

	const titleClass = cn(
		"truncate font-medium text-sm leading-snug",
		isActive && "text-primary",
		!isActive && item.isCompleted && "text-foreground",
		!(isActive || item.isCompleted) &&
			item.isAccessible &&
			"text-foreground/90",
		!(isActive || item.isCompleted || item.isAccessible) &&
			"text-muted-foreground/60"
	);

	const content = (
		<div className={containerClass}>
			<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
				{icon}
			</div>
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className={titleClass}>{item.title}</span>
				<span className="font-mono text-[10px] text-muted-foreground/50">
					{String(item.sortOrder).padStart(2, "0")}
				</span>
			</div>
		</div>
	);

	if (!isClickable) {
		return content;
	}

	return (
		<Link
			params={{ slug: courseSlug, lessonSlug: item.slug }}
			to="/courses/$slug/lessons/$lessonSlug"
		>
			{content}
		</Link>
	);
};

export const LessonSidebar = ({ lesson }: Props) => {
	const { course } = lesson;
	const progressPct =
		course.totalLessons > 0
			? Math.round((course.completedLessons / course.totalLessons) * 100)
			: 0;

	return (
		<aside className="flex h-full w-72 shrink-0 flex-col border-border/50 border-r bg-card/50">
			{/* Course header */}
			<div className="flex flex-col gap-3 border-border/50 border-b p-4">
				<Link
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"w-fit justify-start gap-2 px-2 text-muted-foreground"
					)}
					params={{ slug: course.slug }}
					to="/courses/$slug"
				>
					<ArrowLeft className="size-3.5" />
					Back to course
				</Link>
				<div className="flex flex-col gap-1">
					<h2 className="line-clamp-2 font-semibold text-sm leading-snug">
						{course.title}
					</h2>
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<BookOpen className="size-3" />
						{course.completedLessons} / {course.totalLessons} completed
					</div>
				</div>
				{/* Progress bar */}
				<div className="h-1.5 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
						style={{ width: `${progressPct}%` }}
					/>
				</div>
			</div>

			{/* Lesson list */}
			<ScrollArea className="flex-1">
				<div className="flex flex-col gap-0.5 p-3">
					{course.lessons.map((item) => (
						<LessonNavItem
							courseSlug={course.slug}
							isActive={item.slug === lesson.slug}
							item={item}
							key={item.id}
						/>
					))}
				</div>
			</ScrollArea>
		</aside>
	);
};
