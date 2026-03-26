import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client, orpc } from "@/shared/api";
import { useTaskWorkspace } from "../stores/task-workspace";

export const useSubmit = (lessonId: string) => {
	const queryClient = useQueryClient();
	const { setSubmitting, setSubmission, setTestResults } = useTaskWorkspace();

	return useMutation({
		mutationFn: (variables: { taskId: string; code: string }) =>
			client.tasks.submit(variables),
		onMutate: () => setSubmitting(true),
		onSuccess: (data) => {
			setSubmission(data.submission);
			setTestResults(data.testResults);

			if (!data.submission.testsPassed) {
				toast.error("Some tests failed", {
					description: "Fix the failing tests and try again.",
				});
			} else if (data.submission.aiFeedback) {
				toast.success("Submission graded!", {
					description: `Score: ${data.submission.score}/${data.submission.maxScore}`,
				});
			}

			queryClient.invalidateQueries({
				queryKey: orpc.tasks.getByLessonId.key({ input: { lessonId } }),
			});
		},
		onError: () => {
			toast.error("Submission failed. Please try again.");
		},
		onSettled: () => setSubmitting(false),
	});
};
