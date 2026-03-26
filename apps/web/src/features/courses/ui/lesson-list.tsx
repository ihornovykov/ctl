import type { CourseDetail } from "@ctl/api/routers/courses/validation";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { BookOpen, Lock } from "lucide-react";

import { useCompleteLesson } from "../hooks/use-complete-lesson";
import { LessonItem } from "./lesson-item";

type Props = {
	course: CourseDetail;
};

export const LessonListSkeleton = () => (
	<div className="flex flex-col gap-0">
		{Array.from({ length: 5 }).map((_, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
			<div className="flex gap-4" key={i}>
				<div className="flex flex-col items-center">
					<Skeleton className="size-10 rounded-full" />
					{i < 4 && <Skeleton className="mt-1 min-h-8 w-px flex-1" />}
				</div>
				<div className="mb-4 flex-1 rounded-2xl border border-border/40 bg-card/50 p-5">
					<Skeleton className="mb-2 h-3 w-10" />
					<Skeleton className="mb-2 h-5 w-2/3" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="mt-1 h-4 w-4/5" />
				</div>
			</div>
		))}
	</div>
);

export const LessonList = ({ course }: Props) => {
	const {
		mutate: completeLesson,
		isPending,
		variables,
	} = useCompleteLesson(course.slug);

	if (course.lessons.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 py-20 text-center">
				<BookOpen className="size-10 text-muted-foreground/30" />
				<p className="font-medium text-muted-foreground">
					No lessons available yet
				</p>
			</div>
		);
	}

	return (
		<div>
			{/* Section header */}
			<div className="mb-8 flex items-center gap-3">
				<div className="h-px flex-1 bg-border/50" />
				<div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5">
					{course.isEnrolled ? (
						<>
							<BookOpen className="size-3.5 text-muted-foreground" />
							<span className="font-medium text-muted-foreground text-sm">
								{course.completedLessons} of {course.totalLessons} completed
							</span>
						</>
					) : (
						<>
							<Lock className="size-3.5 text-muted-foreground" />
							<span className="font-medium text-muted-foreground text-sm">
								Enroll to start learning
							</span>
						</>
					)}
				</div>
				<div className="h-px flex-1 bg-border/50" />
			</div>

			{/* Lesson timeline */}
			<div>
				{course.lessons.map((lesson, index) => (
					<LessonItem
						index={index}
						isCompleting={isPending && variables === lesson.id}
						isEnrolled={course.isEnrolled}
						isLast={index === course.lessons.length - 1}
						key={lesson.id}
						lesson={lesson}
						onComplete={(id) => completeLesson(id)}
					/>
				))}
			</div>
		</div>
	);
};
