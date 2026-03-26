import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useTask = (lessonId: string) =>
	useQuery(
		orpc.tasks.getByLessonId.queryOptions({
			input: { lessonId },
		})
	);
