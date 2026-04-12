import type {
	CourseDetail,
	LessonItem,
} from "@ctl/api/routers/courses/validation";
import { ScrollArea } from "@ctl/ui/components/scroll-area";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2, Lock, Play } from "lucide-react";
import { range } from "@/shared/lib";

type Props = {
	course: CourseDetail | null;
	lessonSlug: string;
};

const SIDEBAR_SKELETON_ROW_COUNT = 8;

const LessonNavItem = ({
	item,
	courseSlug,
	isActive,
}: {
	item: LessonItem;
	courseSlug: string;
	isActive: boolean;
}) => {
	const isClickable = item.isAccessible || item.isCompleted;

	const inner = (
		<div
			className={cn(
				"group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150",
				isActive &&
					"bg-primary/10 ring-1 ring-primary/20 ring-inset dark:bg-primary/15",
				!isActive && isClickable && "hover:bg-muted/70",
				!(isActive || isClickable) && "cursor-not-allowed opacity-40"
			)}
		>
			<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
				{item.isCompleted && (
					<CheckCircle2 className="size-3.5 text-emerald-500" />
				)}
				{!item.isCompleted && item.isAccessible && (
					<Play
						className={cn(
							"size-3 fill-current",
							isActive ? "text-primary" : "text-muted-foreground/60"
						)}
					/>
				)}
				{!(item.isCompleted || item.isAccessible) && (
					<Lock className="size-3 text-muted-foreground/40" />
				)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span
					className={cn(
						"truncate text-sm leading-snug",
						isActive && "font-semibold text-primary",
						!isActive &&
							(item.isCompleted || item.isAccessible) &&
							"font-medium text-foreground",
						!(isActive || item.isCompleted || item.isAccessible) &&
							"font-medium text-muted-foreground/50"
					)}
				>
					{item.title}
				</span>
				<span className="font-mono text-[10px] text-muted-foreground/40">
					{String(item.sortOrder).padStart(2, "0")}
				</span>
			</div>
		</div>
	);

	if (!isClickable) {
		return inner;
	}

	return (
		<Link
			params={{ slug: courseSlug, lessonSlug: item.slug }}
			to="/courses/$slug/lessons/$lessonSlug"
		>
			{inner}
		</Link>
	);
};

const SidebarSkeleton = () => (
	<aside className="flex h-full w-80 shrink-0 flex-col border-border/40 border-r bg-background">
		<div className="flex flex-col gap-3 border-border/50 border-b p-5">
			<Skeleton className="h-4 w-24" />
			<div className="flex items-center gap-3">
				<Skeleton className="size-10 rounded-xl" />
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-3 w-28" />
				</div>
			</div>
			<Skeleton className="h-2 w-full rounded-full" />
		</div>
		<div className="flex flex-col gap-1 p-3">
			{range(SIDEBAR_SKELETON_ROW_COUNT).map((i) => (
				<Skeleton className="h-12 w-full rounded-xl" key={i} />
			))}
		</div>
	</aside>
);

export const LessonSidebar = ({ course, lessonSlug }: Props) => {
	if (!course) {
		return <SidebarSkeleton />;
	}

	const progressPct =
		course.totalLessons > 0
			? Math.round((course.completedLessons / course.totalLessons) * 100)
			: 0;

	return (
		<aside className="flex h-full w-80 shrink-0 flex-col border-border/40 border-r bg-background">
			<div className="flex flex-col gap-4 border-border/40 border-b p-5">
				<Link
					className="flex w-fit items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
					params={{ slug: course.slug }}
					to="/courses/$slug"
				>
					<ArrowLeft className="size-3.5" />
					All lessons
				</Link>

				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
						<BookOpen className="size-5 text-primary" />
					</div>
					<div className="flex min-w-0 flex-col gap-1">
						<h2 className="line-clamp-2 font-bold text-base leading-snug tracking-tight">
							{course.title}
						</h2>
						<p className="text-muted-foreground text-xs">
							{course.completedLessons} of {course.totalLessons} lessons done
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-xs">Progress</span>
						<span className="font-semibold text-foreground text-xs">
							{progressPct}%
						</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
							style={{ width: `${progressPct}%` }}
						/>
					</div>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="flex flex-col gap-0.5 p-3">
					{course.lessons.map((item) => (
						<LessonNavItem
							courseSlug={course.slug}
							isActive={item.slug === lessonSlug}
							item={item}
							key={item.id}
						/>
					))}
				</div>
			</ScrollArea>
		</aside>
	);
};
