import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	getMockSandboxLessonTask,
	mockSandboxTaskQueryKey,
} from "../lib/mock-sandbox-task";
import type {
	SandboxSubmissionOutput,
	SandboxSubmitOutput,
} from "../lib/sandbox-types";
import { useSandboxWorkspace } from "../stores/sandbox-workspace";

type ClientTestResult = {
	title: string;
	passed: boolean;
	error?: string;
};

const buildMockSubmission = (
	files: Record<string, string>,
	testResults: ClientTestResult[]
): SandboxSubmissionOutput => {
	const testsPassed = testResults.every((r) => r.passed);
	const maxScore = 10;
	return {
		id: crypto.randomUUID(),
		files,
		testsPassed,
		score: testsPassed ? maxScore : 0,
		maxScore,
		aiFeedback: null,
		submittedAt: new Date(),
	};
};

const mockSubmit = (params: {
	sandboxTaskId: string;
	files: Record<string, string>;
	testResults: ClientTestResult[];
}): SandboxSubmitOutput => ({
	submission: buildMockSubmission(params.files, params.testResults),
});

export const useSandboxSubmit = (lessonId: string) => {
	const queryClient = useQueryClient();
	const setSubmitting = useSandboxWorkspace((s) => s.setSubmitting);
	const setSubmission = useSandboxWorkspace((s) => s.setSubmission);

	return useMutation({
		mutationFn: (params: {
			sandboxTaskId: string;
			files: Record<string, string>;
			testResults: ClientTestResult[];
		}) => Promise.resolve(mockSubmit(params)),

		onMutate: () => setSubmitting(true),

		onSuccess: ({ submission }) => {
			setSubmission(submission);
			queryClient.setQueryData(mockSandboxTaskQueryKey(lessonId), {
				...getMockSandboxLessonTask(lessonId),
				submission,
			});
		},

		onSettled: () => setSubmitting(false),
	});
};
