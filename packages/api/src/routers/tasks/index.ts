import { and, db, eq, submission, task } from "@ctl/db";
import { env } from "@ctl/env/server";
import { ORPCError } from "@orpc/server";
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
	type SandboxLessonTaskOutput,
	type SubmissionOutput,
	type SubmitInput,
	type SubmitSandboxInput,
	sandboxLessonTaskOutputSchema,
	submitInput,
	submitOutputSchema,
	submitSandboxInputSchema,
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
	starterFiles?: Record<string, string> | null;
	entryFile?: string | null;
	readOnlyFiles?: string[] | null;
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
	language?: {
		id: string;
		name: string;
		icon: string | null;
	} | null;
};

const mapSubmission = (row: {
	id: string;
	code: string;
	sandboxFiles?: Record<string, string> | null;
	testsPassed: boolean;
	score: number;
	maxScore: number;
	aiFeedback: unknown;
	submittedAt: Date;
}): SubmissionOutput => ({
	id: row.id,
	code: row.code,
	files: row.sandboxFiles ?? null,
	testsPassed: row.testsPassed,
	score: row.score,
	maxScore: row.maxScore,
	aiFeedback: (row.aiFeedback as SubmissionOutput["aiFeedback"]) ?? null,
	submittedAt: row.submittedAt,
});

const buildSandboxFramework = (
	languageId: string,
	name: string,
	icon: string | null
) => {
	if (languageId === "vue") {
		return {
			id: "vue-playground",
			name,
			icon,
			sandpackTemplate: "vue-ts",
			defaultDependencies: { vue: "^3.5.13" } as Record<string, string>,
			defaultDevDependencies: {
				typescript: "~5.6.2",
				vite: "^6.0.3",
				"vue-tsc": "^2.1.10",
			} as Record<string, string>,
		};
	}
	return {
		id: "react-playground",
		name,
		icon,
		sandpackTemplate: "react-ts",
		defaultDependencies: {
			react: "^19.0.0",
			"react-dom": "^19.0.0",
		} as Record<string, string>,
		defaultDevDependencies: {
			typescript: "~5.6.2",
			vite: "^6.0.3",
			"@types/react": "^19.0.0",
			"@types/react-dom": "^19.0.0",
		} as Record<string, string>,
	};
};

const defaultSandboxTestPath = (languageId: string): string =>
	languageId === "vue" ? "/src/App.test.ts" : "/src/App.test.tsx";

const defaultSandboxEntryFile = (languageId: string): string =>
	languageId === "vue" ? "/src/App.vue" : "/src/App.tsx";

const defaultReadOnlyForSandbox = (languageId: string): string[] =>
	languageId === "vue" ? ["/src/main.ts"] : ["/src/main.tsx"];

const mapSandboxSubmissionRow = (row: {
	id: string;
	code: string;
	sandboxFiles?: Record<string, string> | null;
	testsPassed: boolean;
	score: number;
	maxScore: number;
	aiFeedback: unknown;
	submittedAt: Date;
}): SandboxLessonTaskOutput["submission"] => ({
	id: row.id,
	code: row.code,
	files: row.sandboxFiles ?? {},
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
						orderBy: (c, { asc }) => asc(c.sortOrder),
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

	getSandboxByLessonId: protectedProcedure
		.input(getByLessonIdInput)
		.output(sandboxLessonTaskOutputSchema)
		.handler(async ({ input, context }): Promise<SandboxLessonTaskOutput> => {
			const userId = context.session.user.id;
			const taskRow = (await db.query.task.findFirst({
				where: eq(task.lessonId, input.lessonId),
				with: {
					tests: { orderBy: (t, { asc }) => asc(t.sortOrder) },
					criteria: { orderBy: (c, { asc }) => asc(c.sortOrder) },
					language: { columns: { id: true, name: true, icon: true } },
				},
			})) as TaskRow | undefined;

			if (!taskRow?.starterFiles) {
				throw new ORPCError("NOT_FOUND", { message: "Sandbox task not found" });
			}

			const lang = taskRow.language;
			const langName = lang?.name ?? taskRow.languageId;
			const langIcon = lang?.icon ?? null;
			const framework = buildSandboxFramework(
				taskRow.languageId,
				langName,
				langIcon
			);
			const entryFile =
				taskRow.entryFile ?? defaultSandboxEntryFile(taskRow.languageId);
			const readOnlyFiles =
				taskRow.readOnlyFiles ?? defaultReadOnlyForSandbox(taskRow.languageId);
			const testPath = defaultSandboxTestPath(taskRow.languageId);
			const mergedTestCode = [...taskRow.tests]
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.map((t) => t.testCode)
				.join("\n\n");
			const testsOut =
				taskRow.tests.length === 0
					? []
					: [
							{
								id: taskRow.tests[0]?.id ?? "sandbox-test",
								title: taskRow.tests.map((t) => t.title).join(" · ") || "Tests",
								testFilePath: testPath,
								testCode: mergedTestCode,
								sortOrder: 0,
							},
						];

			const existingSubmission = await db.query.submission.findFirst({
				where: and(
					eq(submission.userId, userId),
					eq(submission.taskId, taskRow.id)
				),
			});

			return {
				kind: "sandbox",
				task: {
					id: taskRow.id,
					lessonId: taskRow.lessonId,
					frameworkId: framework.id,
					description: taskRow.description,
					starterFiles: taskRow.starterFiles,
					dependencies: framework.defaultDependencies,
					entryFile,
					readOnlyFiles,
					tests: testsOut,
					criteria: taskRow.criteria.map((c) => ({
						id: c.id,
						name: c.name,
						description: c.description,
						maxScore: c.maxScore,
						sortOrder: c.sortOrder,
					})),
					framework,
				},
				submission: existingSubmission
					? mapSandboxSubmissionRow(existingSubmission)
					: null,
			};
		}),

	submitSandbox: protectedProcedure
		.input(submitSandboxInputSchema)
		.output(submitOutputSchema)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			const { taskId, files, testResults } = input as SubmitSandboxInput;

			const taskRow = (await db.query.task.findFirst({
				where: eq(task.id, taskId),
				with: {
					criteria: { orderBy: (c, { asc }) => asc(c.sortOrder) },
				},
			})) as TaskRow | undefined;

			if (!taskRow?.starterFiles) {
				throw new ORPCError("BAD_REQUEST", { message: "Not a sandbox task" });
			}

			const allPassed = testResults.every((r) => r.passed);
			const maxScore = taskRow.criteria.reduce((s, c) => s + c.maxScore, 0);
			const entry =
				taskRow.entryFile ?? defaultSandboxEntryFile(taskRow.languageId);
			const code = files[entry] ?? "";

			const studentCode = JSON.stringify(
				Object.fromEntries(
					Object.keys(files)
						.sort()
						.map((k) => [k, files[k]])
				)
			);

			let aiFeedback: SubmissionOutput["aiFeedback"] = null;
			let score = 0;

			if (allPassed && taskRow.criteria.length > 0) {
				aiFeedback = await gradeSubmission(
					{
						languageId: taskRow.languageId,
						taskDescription: taskRow.description,
						solutionCode: taskRow.solutionCode,
						studentCode,
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
						sandboxFiles: files,
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
					sandboxFiles: files,
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
						orderBy: (t, { asc }) => asc(t.sortOrder),
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
						orderBy: (t, { asc }) => asc(t.sortOrder),
					},
					criteria: {
						orderBy: (c, { asc }) => asc(c.sortOrder),
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
