import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useTask = (lessonId: string, options?: { enabled?: boolean }) =>
	useQuery({
		...orpc.tasks.getByLessonId.queryOptions({
			input: { lessonId },
		}),
		enabled: options?.enabled ?? true,
	});
