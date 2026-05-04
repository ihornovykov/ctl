import { Skeleton } from "@ctl/ui/components/skeleton";
import { range } from "@/shared/lib";
import { useCourses } from "../hooks/use-courses";
import { COURSE_LIST_SECTION_HEADING_CLASS } from "../lib/constants";
import {
	COURSE_CATEGORY_TITLES,
	groupCoursesByCategory,
} from "../lib/course-categories";
import { CourseCard } from "./course-card";

const COURSE_LIST_SKELETON_COUNT = 6;

const CourseCardSkeleton = () => (
	<div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
		<Skeleton className="h-40 w-full rounded-none" />
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
				{range(COURSE_LIST_SKELETON_COUNT).map((i) => (
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

	const sections = groupCoursesByCategory(courses);

	return (
		<div className="space-y-16">
			{sections.map((section, sectionIndex) => (
				<section
					className={
						sectionIndex > 0 ? "border-border/30 border-t pt-16" : undefined
					}
					key={section.id}
				>
					<h2 className={COURSE_LIST_SECTION_HEADING_CLASS}>
						{
							COURSE_CATEGORY_TITLES[
								section.id as keyof typeof COURSE_CATEGORY_TITLES
							]
						}
					</h2>
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{section.courses.map((course, i) => (
							<CourseCard
								course={course}
								index={sectionIndex * 100 + i}
								key={course.id}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
};
