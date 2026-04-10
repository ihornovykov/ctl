import type {
	GradeStreamEvent,
	SubmissionOutput,
} from "@ctl/api/routers/tasks/validation";
import { env } from "@ctl/env/web";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/shared/api";
import { useTaskWorkspace } from "../stores/task-workspace";
import type { ChainStep } from "../ui/chain-of-thought";

const parseSSE = (chunk: string): GradeStreamEvent[] => {
	const events: GradeStreamEvent[] = [];
	for (const line of chunk.split("\n")) {
		if (line.startsWith("data: ")) {
			try {
				events.push(JSON.parse(line.slice(6)) as GradeStreamEvent);
			} catch {
				// ignore malformed lines
			}
		}
	}
	return events;
};

type Handlers = {
	addStep: (step: ChainStep) => void;
	setTestResults: (
		results: { title: string; passed: boolean; error?: string }[]
	) => void;
	setSubmission: (submission: SubmissionOutput) => void;
	onDone: (event: Extract<GradeStreamEvent, { type: "done" }>) => void;
};

const dispatchEvent = (event: GradeStreamEvent, h: Handlers) => {
	switch (event.type) {
		case "running_tests":
			h.addStep({ id: "running_tests", status: "active" });
			break;
		case "tests_complete":
			h.addStep({ id: "running_tests", status: "complete" });
			h.addStep({
				id: "tests_complete",
				status: "complete",
				passed: event.passed,
				total: event.total,
			});
			h.setTestResults(event.results);
			break;
		case "tests_failed":
			h.addStep({ id: "running_tests", status: "complete" });
			h.addStep({
				id: "tests_failed",
				status: "error",
				passed: event.results.filter((r) => r.passed).length,
				total: event.results.length,
			});
			h.setTestResults(event.results);
			toast.error("Some tests failed", {
				description: "Fix the failing tests and try again.",
			});
			break;
		case "grading_start":
		case "partial_feedback":
			h.addStep({ id: "grading_start", status: "active" });
			break;
		case "done":
			h.addStep({ id: "grading_start", status: "complete" });
			h.addStep({ id: "grading_done", status: "complete" });
			h.onDone(event);
			break;
		case "error":
			toast.error(`Submission error: ${event.message}`);
			break;
		default:
			break;
	}
};

async function* readGradeStream(
	body: ReadableStream<Uint8Array>
): AsyncGenerator<GradeStreamEvent> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		buffer += decoder.decode(value, { stream: true });
		const chunks = buffer.split("\n\n");
		buffer = chunks.pop() ?? "";
		for (const chunk of chunks) {
			for (const event of parseSSE(chunk)) {
				yield event;
			}
		}
	}

	for (const event of parseSSE(buffer)) {
		yield event;
	}
}

export const useSubmitStream = (lessonId: string) => {
	const queryClient = useQueryClient();
	const { setSubmitting, setSubmission, setTestResults } = useTaskWorkspace();

	const [steps, setSteps] = useState<ChainStep[]>([]);
	const [isStreaming, setIsStreaming] = useState(false);

	const addStep = useCallback((step: ChainStep) => {
		setSteps((prev) => {
			const idx = prev.findIndex((s) => s.id === step.id);
			return idx >= 0
				? prev.map((s, i) => (i === idx ? step : s))
				: [...prev, step];
		});
	}, []);

	const submit = useCallback(
		async (input: { taskId: string; code: string }) => {
			setIsStreaming(true);
			setSubmitting(true);
			setSteps([]);

			const handlers: Handlers = {
				addStep,
				setTestResults,
				setSubmission,
				onDone: (event) => {
					setSubmission(event.submission);
					if (event.submission.aiFeedback) {
						toast.success("Submission graded!", {
							description: `Score: ${event.submission.score}/${event.submission.maxScore}`,
						});
					}
					queryClient.invalidateQueries({
						queryKey: orpc.tasks.getByLessonId.key({
							input: { lessonId },
						}),
					});
				},
			};

			try {
				const response = await fetch(
					`${env.VITE_SERVER_URL}/api/tasks/grade-stream`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify(input),
					}
				);

				if (!(response.ok && response.body)) {
					throw new Error("Stream request failed");
				}

				for await (const event of readGradeStream(response.body)) {
					dispatchEvent(event, handlers);
				}
			} catch {
				toast.error("Submission failed. Please try again.");
			} finally {
				setIsStreaming(false);
				setSubmitting(false);
			}
		},
		[
			lessonId,
			queryClient,
			addStep,
			setSubmitting,
			setSubmission,
			setTestResults,
		]
	);

	return { submit, steps, isStreaming };
};
