import { Sheet, SheetContent, SheetTrigger } from "@ctl/ui/components/sheet";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { Link } from "@tanstack/react-router";
import { BookOpen, Menu } from "lucide-react";
import { useState } from "react";

import { LessonContent, LessonSidebar, useLesson } from "@/features/courses";

type Props = {
	courseSlug: string;
	lessonSlug: string;
};

const LessonViewSkeleton = () => (
	<div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
		<aside className="hidden w-80 shrink-0 border-border/40 border-r bg-background lg:flex lg:flex-col">
			<div className="flex flex-col gap-3 border-border/50 border-b p-4">
				<Skeleton className="h-8 w-28" />
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-4 w-36" />
				<Skeleton className="h-1.5 w-full rounded-full" />
			</div>
			<div className="flex flex-col gap-1 p-3">
				{Array.from({ length: 8 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
					<Skeleton className="h-12 w-full rounded-xl" key={i} />
				))}
			</div>
		</aside>

		<div className="flex-1 overflow-y-auto">
			<div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
				<div className="mb-10">
					<Skeleton className="mb-4 h-6 w-32 rounded-full" />
					<Skeleton className="mb-3 h-10 w-3/4" />
					<Skeleton className="h-5 w-full max-w-lg" />
					<Skeleton className="mt-2 h-5 w-4/5 max-w-lg" />
					<div className="mt-6 h-px bg-border/50" />
				</div>
				<div className="flex flex-col gap-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
					<Skeleton className="mt-2 h-36 w-full rounded-xl" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>
		</div>
	</div>
);

export const LessonView = ({ courseSlug, lessonSlug }: Props) => {
	const {
		data: lesson,
		isPending,
		isError,
	} = useLesson(courseSlug, lessonSlug);
	const [mobileOpen, setMobileOpen] = useState(false);

	if (isPending) {
		return <LessonViewSkeleton />;
	}

	if (isError || !lesson) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
					<BookOpen className="size-7 text-muted-foreground/50" />
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-xl">Lesson not found</h2>
					<p className="text-muted-foreground text-sm">
						This lesson doesn't exist or isn't accessible yet.
					</p>
				</div>
				<Link
					className="text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground"
					params={{ slug: courseSlug }}
					to="/courses/$slug"
				>
					Back to course
				</Link>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
			<div className="hidden lg:flex">
				<LessonSidebar lesson={lesson} />
			</div>

			<Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
				<SheetTrigger className="absolute top-20 left-4 z-20 flex size-9 items-center justify-center rounded-md border border-border bg-background shadow-xs hover:bg-muted lg:hidden">
					<Menu className="size-4" />
				</SheetTrigger>
				<SheetContent className="w-80 p-0" side="left">
					<LessonSidebar lesson={lesson} />
				</SheetContent>
			</Sheet>

			<LessonContent courseSlug={courseSlug} lesson={lesson} />
		</div>
	);
};
