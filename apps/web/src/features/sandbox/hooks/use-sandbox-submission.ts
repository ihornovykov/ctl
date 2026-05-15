import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/shared/api";
import { client } from "@/shared/api/orpc";
import { randomId } from "@/shared/lib/random-id";

import type {
	SandboxSubmissionOutput,
	SandboxSubmitOutput,
} from "../lib/constants";
import { useSandboxWorkspace } from "../stores/sandbox-workspace";

type ClientTestResult = {
	title: string;
	passed: boolean;
	error?: string;
};

const viteEnv = (
	import.meta as unknown as { env: Record<string, string | undefined> }
).env.VITE_SANDBOX_VITE_ENABLED;
const viteSandboxEnabled = viteEnv === "true" || viteEnv === "1";

const buildMockSubmission = (
	files: Record<string, string>,
	testResults: ClientTestResult[]
): SandboxSubmissionOutput => {
	const testsPassed = testResults.every((r) => r.passed);
	const maxScore = 10;
	return {
		id: randomId(),
		files,
		testsPassed,
		score: testsPassed ? maxScore : 0,
		maxScore,
		aiFeedback: null,
		submittedAt: new Date(),
	};
};

export const useSandboxSubmit = (lessonId: string) => {
	const queryClient = useQueryClient();
	const setSubmitting = useSandboxWorkspace((s) => s.setSubmitting);
	const setSubmission = useSandboxWorkspace((s) => s.setSubmission);

	return useMutation({
		mutationFn: async (params: {
			sandboxTaskId: string;
			files: Record<string, string>;
			testResults: ClientTestResult[];
		}): Promise<SandboxSubmitOutput> => {
			if (viteSandboxEnabled) {
				const out = await client.tasks.submitSandbox({
					taskId: params.sandboxTaskId,
					files: params.files,
					testResults: params.testResults,
				});
				return {
					submission: {
						...out.submission,
						files: out.submission.files ?? params.files,
					},
				};
			}
			return {
				submission: buildMockSubmission(params.files, params.testResults),
			};
		},

		onMutate: () => setSubmitting(true),

		onSuccess: ({ submission }) => {
			setSubmission(submission);
			queryClient.invalidateQueries({
				queryKey: orpc.tasks.getSandboxByLessonId.key({
					input: { lessonId },
				}),
			});
		},

		onSettled: () => setSubmitting(false),
	});
};
