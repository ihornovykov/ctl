import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useLesson = (courseSlug: string, lessonSlug: string) =>
	useQuery(
		orpc.courses.getLessonBySlug.queryOptions({
			input: { courseSlug, lessonSlug },
		})
	);
