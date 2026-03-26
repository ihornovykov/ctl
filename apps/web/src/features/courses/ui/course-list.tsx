import { Skeleton } from "@ctl/ui/components/skeleton";

import { useCourses } from "../hooks/use-courses";
import { CourseCard } from "./course-card";

const CourseCardSkeleton = () => (
	<div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
		<Skeleton className="h-36 w-full rounded-none" />
		<div className="flex flex-col gap-3 p-5">
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-5/6" />
			<div className="mt-2 flex justify-between">
				<Skeleton className="h-5 w-20" />
				<Skeleton className="h-4 w-12" />
			</div>
		</div>
	</div>
);

export const CourseList = () => {
	const { data: courses, isPending } = useCourses();

	if (isPending) {
		return (
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
					<CourseCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (!courses?.length) {
		return (
			<div className="flex flex-col items-center gap-2 py-24 text-center">
				<p className="font-medium text-foreground">No courses yet</p>
				<p className="text-muted-foreground text-sm">
					Check back soon — more courses are being added.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{courses.map((course, i) => (
				<CourseCard course={course} index={i} key={course.id} />
			))}
		</div>
	);
};
