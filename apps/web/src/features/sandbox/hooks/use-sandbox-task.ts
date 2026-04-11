import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useSandboxTask = (lessonId: string) =>
	useQuery({
		...orpc.tasks.getSandboxByLessonId.queryOptions({
			input: { lessonId },
		}),
	});
