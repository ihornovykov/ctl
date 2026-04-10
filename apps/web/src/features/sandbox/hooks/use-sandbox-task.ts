import { useQuery } from "@tanstack/react-query";

import {
	getMockSandboxLessonTask,
	mockSandboxTaskQueryKey,
} from "../lib/mock-sandbox-task";

export const useSandboxTask = (lessonId: string) =>
	useQuery({
		queryKey: mockSandboxTaskQueryKey(lessonId),
		queryFn: () => Promise.resolve(getMockSandboxLessonTask(lessonId)),
	});
