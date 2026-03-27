import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { LessonContent, useLesson } from "@/features/courses";

type Props = {
	courseSlug: string;
	lessonSlug: string;
};

export const LessonView = ({ courseSlug, lessonSlug }: Props) => {
	const {
		data: lesson,
		isPending,
		isError,
	} = useLesson(courseSlug, lessonSlug);

	if (isPending) {
		return null;
	}

	if (isError || !lesson) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
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

	return <LessonContent courseSlug={courseSlug} lesson={lesson} />;
};
