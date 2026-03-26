import { db, submission, task } from "@ctl/db";
import { env } from "@ctl/env/server";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { protectedProcedure } from "../../index";
import { gradeSubmission } from "../../lib/ai-grader";
import { executeCode, runTests } from "../../lib/code-runner";
import {
	type GetByLessonIdInput,
	getByLessonIdInput,
	type RunCodeInput,
	type RunTestsInput,
	runCodeInput,
	runCodeOutputSchema,
	runTestsInput,
	runTestsOutputSchema,
	type SubmissionOutput,
	type SubmitInput,
	submitInput,
	submitOutputSchema,
	type TaskWithSubmission,
	taskWithSubmissionSchema,
} from "./validation";

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
	testsPassed: row.testsPassed,
	score: row.score,
	maxScore: row.maxScore,
	aiFeedback: (row.aiFeedback as SubmissionOutput["aiFeedback"]) ?? null,
	submittedAt: row.submittedAt,
});

export const tasksRouter = {
	getByLessonId: protectedProcedure
		.input(getByLessonIdInput)
		.output(taskWithSubmissionSchema)
		.handler(async ({ input, context }): Promise<TaskWithSubmission> => {
			const userId = context.session.user.id;
			const { lessonId } = input as GetByLessonIdInput;

			const taskRow = (await db.query.task.findFirst({
				where: eq(task.lessonId, lessonId),
				with: {
					tests: { columns: { id: true } },
					criteria: {
						orderBy: (
							c: { sortOrder: number },
							{ asc }: { asc: (col: unknown) => unknown }
						) => asc(c.sortOrder),
					},
				},
			})) as TaskRow | undefined;

			if (!taskRow) {
				throw new ORPCError("NOT_FOUND", { message: "Task not found" });
			}

			const existingSubmission = await db.query.submission.findFirst({
				where: and(
					eq(submission.userId, userId),
					eq(submission.taskId, taskRow.id)
				),
			});

			return {
				task: {
					id: taskRow.id,
					lessonId: taskRow.lessonId,
					description: taskRow.description,
					starterCode: taskRow.starterCode,
					languageId: taskRow.languageId,
					testsCount: taskRow.tests.length,
					criteria: taskRow.criteria.map((c) => ({
						id: c.id,
						name: c.name,
						description: c.description,
						maxScore: c.maxScore,
						sortOrder: c.sortOrder,
					})),
				},
				submission: existingSubmission
					? mapSubmission(existingSubmission)
					: null,
			};
		}),

	run: protectedProcedure
		.input(runCodeInput)
		.output(runCodeOutputSchema)
		.handler(async ({ input }) => {
			const { code, languageId } = input as RunCodeInput;

			try {
				const result = await executeCode(languageId, code);
				console.log(result);
				return {
					stdout: result.stdout,
					stderr: result.stderr,
					exitCode: result.exitCode,
				};
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				if (msg.includes("ENOENT") && msg.includes("docker.sock")) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message:
							"Docker is not running. Please start Docker Desktop and try again.",
					});
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: msg });
			}
		}),

	runTests: protectedProcedure
		.input(runTestsInput)
		.output(runTestsOutputSchema)
		.handler(async ({ input }) => {
			const { taskId, code } = input as RunTestsInput;

			const taskRow = (await db.query.task.findFirst({
				where: eq(task.id, taskId),
				with: {
					tests: {
						orderBy: (
							t: { sortOrder: number },
							{ asc }: { asc: (col: unknown) => unknown }
						) => asc(t.sortOrder),
					},
				},
			})) as TaskRow | undefined;

			if (!taskRow) {
				throw new ORPCError("NOT_FOUND", { message: "Task not found" });
			}

			try {
				return await runTests(
					taskRow.languageId,
					code,
					taskRow.tests.map((t) => ({ title: t.title, testCode: t.testCode }))
				);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				if (msg.includes("ENOENT") && msg.includes("docker.sock")) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message:
							"Docker is not running. Please start Docker Desktop and try again.",
					});
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: msg });
			}
		}),

	submit: protectedProcedure
		.input(submitInput)
		.output(submitOutputSchema)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			const { taskId, code } = input as SubmitInput;

			const taskRow = (await db.query.task.findFirst({
				where: eq(task.id, taskId),
				with: {
					tests: {
						orderBy: (
							t: { sortOrder: number },
							{ asc }: { asc: (col: unknown) => unknown }
						) => asc(t.sortOrder),
					},
					criteria: {
						orderBy: (
							c: { sortOrder: number },
							{ asc }: { asc: (col: unknown) => unknown }
						) => asc(c.sortOrder),
					},
				},
			})) as TaskRow | undefined;

			if (!taskRow) {
				throw new ORPCError("NOT_FOUND", { message: "Task not found" });
			}

			const testResults = await runTests(
				taskRow.languageId,
				code,
				taskRow.tests.map((t) => ({ title: t.title, testCode: t.testCode }))
			);

			const allPassed = testResults.every((r) => r.passed);
			const maxScore = taskRow.criteria.reduce((sum, c) => sum + c.maxScore, 0);

			let aiFeedback: SubmissionOutput["aiFeedback"] = null;
			let score = 0;

			if (allPassed && taskRow.criteria.length > 0) {
				aiFeedback = await gradeSubmission(
					{
						languageId: taskRow.languageId,
						taskDescription: taskRow.description,
						solutionCode: taskRow.solutionCode,
						studentCode: code,
						criteria: taskRow.criteria,
					},
					env.GOOGLE_GENERATIVE_AI_API_KEY
				);
				score = Math.round(aiFeedback.totalScore);
			}

			const existingSubmission = await db.query.submission.findFirst({
				where: and(
					eq(submission.userId, userId),
					eq(submission.taskId, taskRow.id)
				),
			});

			let submissionRow: typeof existingSubmission;

			if (existingSubmission) {
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
					.where(eq(submission.id, existingSubmission.id));

				submissionRow = await db.query.submission.findFirst({
					where: eq(submission.id, existingSubmission.id),
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
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to retrieve submission",
				});
			}

			return {
				submission: mapSubmission(submissionRow),
				testResults,
			};
		}),
};
