import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client, orpc } from "@/shared/api";

export const useCompleteLesson = (courseSlug: string, lessonSlug?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (lessonId: string) =>
			client.courses.completeLesson({ lessonId }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.courses.getBySlug.key({ input: { slug: courseSlug } }),
			});
			if (lessonSlug) {
				queryClient.invalidateQueries({
					queryKey: orpc.courses.getLessonBySlug.key({
						input: { courseSlug, lessonSlug },
					}),
				});
			}
		},
	});
};
