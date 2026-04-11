import { and, db, eq, submission, task } from "@ctl/db";
import { env } from "@ctl/env/server";
import { nanoid } from "nanoid";

import type { SubmissionOutput } from "../routers/tasks/validation";
import { createGradeStream } from "./ai-grader";
import { runTests } from "./code-runner";

type TaskRow = {
	id: string;
	lessonId: string;
	description: string;
	starterCode: string;
	solutionCode: string;
	languageId: string;
	tests: Array<{
		id: string;
		title: string;
		testCode: string;
		sortOrder: number;
	}>;
	criteria: Array<{
		id: string;
		name: string;
		description: string;
		maxScore: number;
		sortOrder: number;
	}>;
};

type GradeEvent =
	| { type: "running_tests" }
	| {
			type: "tests_complete";
			passed: number;
			total: number;
			results: { title: string; passed: boolean; error?: string }[];
	  }
	| {
			type: "tests_failed";
			results: { title: string; passed: boolean; error?: string }[];
	  }
	| { type: "grading_start" }
	| { type: "reasoning"; text: string }
	| { type: "partial_feedback"; feedback: unknown }
	| {
			type: "done";
			submission: SubmissionOutput;
			testResults: { title: string; passed: boolean; error?: string }[];
	  }
	| { type: "error"; message: string };

const mapSubmission = (row: {
	id: string;
	code: string;
	testsPassed: boolean;
	score: number;
	maxScore: number;
	aiFeedback: unknown;
	submittedAt: Date;
}): SubmissionOutput => ({
	id: row.id,
	code: row.code,
	files: null,
	testsPassed: row.testsPassed,
	score: row.score,
	maxScore: row.maxScore,
	aiFeedback: (row.aiFeedback as SubmissionOutput["aiFeedback"]) ?? null,
	submittedAt: row.submittedAt,
});

export async function* streamGrade(input: {
	taskId: string;
	code: string;
	userId: string;
}): AsyncGenerator<GradeEvent> {
	const { taskId, code, userId } = input;

	const taskRow = (await db.query.task.findFirst({
		where: eq(task.id, taskId),
		with: {
			tests: {
				orderBy: (t, { asc }) => asc(t.sortOrder),
			},
			criteria: {
				orderBy: (c, { asc }) => asc(c.sortOrder),
			},
		},
	})) as TaskRow | undefined;

	if (!taskRow) {
		yield { type: "error", message: "Task not found" };
		return;
	}

	yield { type: "running_tests" };

	const testResults = await runTests(
		taskRow.languageId,
		code,
		taskRow.tests.map((t) => ({ title: t.title, testCode: t.testCode }))
	);

	const allPassed = testResults.every((r) => r.passed);
	const passed = testResults.filter((r) => r.passed).length;

	if (allPassed) {
		yield {
			type: "tests_complete",
			passed,
			total: testResults.length,
			results: testResults,
		};
	} else {
		yield { type: "tests_failed", results: testResults };
		return;
	}

	const maxScore = taskRow.criteria.reduce((sum, c) => sum + c.maxScore, 0);
	let aiFeedback: SubmissionOutput["aiFeedback"] = null;
	let score = 0;

	if (allPassed && taskRow.criteria.length > 0) {
		yield { type: "grading_start" };

		const { events, getResult } = createGradeStream(
			{
				languageId: taskRow.languageId,
				taskDescription: taskRow.description,
				solutionCode: taskRow.solutionCode,
				studentCode: code,
				criteria: taskRow.criteria,
			},
			env.GOOGLE_GENERATIVE_AI_API_KEY
		);

		for await (const event of events) {
			yield event;
		}

		aiFeedback = (await getResult()) as SubmissionOutput["aiFeedback"];
		score = aiFeedback ? aiFeedback.totalScore : 0;
	}

	const existing = await db.query.submission.findFirst({
		where: and(
			eq(submission.userId, userId),
			eq(submission.taskId, taskRow.id)
		),
	});

	let submissionRow: typeof existing;

	if (existing) {
		await db
			.update(submission)
			.set({
				code,
				testsPassed: allPassed,
				score,
				maxScore,
				aiFeedback,
				submittedAt: new Date(),
			})
			.where(eq(submission.id, existing.id));
		submissionRow = await db.query.submission.findFirst({
			where: eq(submission.id, existing.id),
		});
	} else {
		const id = nanoid();
		await db.insert(submission).values({
			id,
			userId,
			taskId: taskRow.id,
			code,
			languageId: taskRow.languageId,
			testsPassed: allPassed,
			score,
			maxScore,
			aiFeedback,
			submittedAt: new Date(),
		});
		submissionRow = await db.query.submission.findFirst({
			where: eq(submission.id, id),
		});
	}

	if (!submissionRow) {
		yield { type: "error", message: "Failed to save submission" };
		return;
	}

	yield { type: "done", submission: mapSubmission(submissionRow), testResults };
}
