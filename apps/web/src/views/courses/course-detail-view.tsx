import { Skeleton } from "@ctl/ui/components/skeleton";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import {
	CourseDetailHeader,
	LessonList,
	LessonListSkeleton,
	useCourse,
	useEnroll,
} from "@/features/courses";

type Props = {
	slug: string;
};

const CourseDetailSkeleton = () => (
	<div className="min-h-svh">
		<div className="relative -mt-14 flex min-h-svh flex-col items-center justify-center overflow-x-hidden border-border/50 border-b">
			<div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-14 sm:px-6 md:pt-36 md:pb-20">
				<Skeleton className="mb-10 h-4 w-24" />
				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
					<div className="flex flex-1 flex-col gap-6">
						<div className="flex gap-2">
							<Skeleton className="h-6 w-24 rounded-full" />
							<Skeleton className="h-6 w-28 rounded-full" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
						<Skeleton className="h-14 w-3/4" />
						<Skeleton className="h-20 w-full max-w-xl" />
						<Skeleton className="h-11 w-40 rounded-xl" />
					</div>
					<Skeleton className="h-52 w-52 rounded-3xl" />
				</div>
			</div>
		</div>

		<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
			<div className="mb-8 flex items-center gap-3">
				<div className="h-px flex-1 bg-border/50" />
				<Skeleton className="h-8 w-44 rounded-full" />
				<div className="h-px flex-1 bg-border/50" />
			</div>
			<LessonListSkeleton />
		</div>
	</div>
);

export const CourseDetailView = ({ slug }: Props) => {
	const { data: course, isPending, isError } = useCourse(slug);
	const { mutate: enroll, isPending: isEnrolling } = useEnroll(slug);

	if (isPending) {
		return <CourseDetailSkeleton />;
	}

	if (isError || !course) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
					<BookOpen className="size-7 text-muted-foreground/50" />
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-xl">Course not found</h2>
					<p className="text-muted-foreground text-sm">
						This course doesn't exist or isn't available.
					</p>
				</div>
				<Link
					className="text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground"
					to="/courses"
				>
					Browse all courses
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-svh">
			<CourseDetailHeader
				course={course}
				isEnrolling={isEnrolling}
				onEnroll={() => enroll(course.id)}
			/>

			<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
				<LessonList course={course} />
			</div>
		</div>
	);
};
