import { z } from "zod";

export const getByLessonIdInput = z.object({ lessonId: z.string() });

export const runCodeInput = z.object({
	taskId: z.string(),
	code: z.string(),
	languageId: z.string(),
});

export const runTestsInput = z.object({
	taskId: z.string(),
	code: z.string(),
});

export const submitInput = z.object({
	taskId: z.string(),
	code: z.string(),
});

export const testResultSchema = z.object({
	title: z.string(),
	passed: z.boolean(),
	error: z.string().optional(),
});

export const criteriaScoreSchema = z.object({
	criteriaId: z.string(),
	score: z.number(),
	maxScore: z.number(),
	comment: z.string(),
});

export const aiFeedbackSchema = z.object({
	totalScore: z.number(),
	maxScore: z.number(),
	mainPoints: z.array(z.string()),
	improvements: z.array(z.string()),
	criteriaScores: z.array(criteriaScoreSchema),
});

export const gradingCriteriaSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	maxScore: z.number(),
	sortOrder: z.number(),
});

export const taskSchema = z.object({
	id: z.string(),
	lessonId: z.string(),
	description: z.string(),
	starterCode: z.string(),
	languageId: z.string(),
	testsCount: z.number(),
	criteria: z.array(gradingCriteriaSchema),
});

export const submissionSchema = z.object({
	id: z.string(),
	code: z.string(),
	files: z.record(z.string(), z.string()).nullable(),
	testsPassed: z.boolean(),
	score: z.number(),
	maxScore: z.number(),
	aiFeedback: aiFeedbackSchema.nullable(),
	submittedAt: z.date(),
});

export const taskWithSubmissionSchema = z.object({
	task: taskSchema,
	submission: submissionSchema.nullable(),
});

export const runCodeOutputSchema = z.object({
	stdout: z.string(),
	stderr: z.string(),
	exitCode: z.number(),
});

export const runTestsOutputSchema = z.array(testResultSchema);

export const submitOutputSchema = z.object({
	submission: submissionSchema,
	testResults: z.array(testResultSchema),
});

export const gradeStreamEventSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("running_tests") }),
	z.object({
		type: z.literal("tests_complete"),
		passed: z.number(),
		total: z.number(),
		results: z.array(testResultSchema),
	}),
	z.object({
		type: z.literal("tests_failed"),
		results: z.array(testResultSchema),
	}),
	z.object({ type: z.literal("grading_start") }),
	z.object({ type: z.literal("partial_feedback"), feedback: z.unknown() }),
	z.object({
		type: z.literal("done"),
		submission: submissionSchema,
		testResults: z.array(testResultSchema),
	}),
	z.object({ type: z.literal("error"), message: z.string() }),
]);

export type GradeStreamEvent = z.infer<typeof gradeStreamEventSchema>;

const sandboxFrameworkSchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string().nullable(),
	sandpackTemplate: z.string(),
	defaultDependencies: z.record(z.string(), z.string()),
	defaultDevDependencies: z.record(z.string(), z.string()),
});

const sandboxTestSchema = z.object({
	id: z.string(),
	title: z.string(),
	testFilePath: z.string(),
	testCode: z.string(),
	sortOrder: z.number(),
});

export const sandboxTaskOutputSchema = z.object({
	id: z.string(),
	lessonId: z.string(),
	frameworkId: z.string(),
	description: z.string(),
	starterFiles: z.record(z.string(), z.string()),
	dependencies: z.record(z.string(), z.string()),
	entryFile: z.string(),
	readOnlyFiles: z.array(z.string()),
	tests: z.array(sandboxTestSchema),
	criteria: z.array(gradingCriteriaSchema),
	framework: sandboxFrameworkSchema,
});

export const sandboxSubmissionOutputSchema = z.object({
	id: z.string(),
	code: z.string(),
	files: z.record(z.string(), z.string()),
	testsPassed: z.boolean(),
	score: z.number(),
	maxScore: z.number(),
	aiFeedback: aiFeedbackSchema.nullable(),
	submittedAt: z.date(),
});

export const sandboxLessonTaskOutputSchema = z.object({
	kind: z.literal("sandbox"),
	task: sandboxTaskOutputSchema,
	submission: sandboxSubmissionOutputSchema.nullable(),
});

export const submitSandboxInputSchema = z.object({
	taskId: z.string(),
	files: z.record(z.string(), z.string()),
	testResults: z.array(testResultSchema),
});

export type SandboxLessonTaskOutput = z.infer<
	typeof sandboxLessonTaskOutputSchema
>;
export type SubmitSandboxInput = z.infer<typeof submitSandboxInputSchema>;

export type GetByLessonIdInput = z.infer<typeof getByLessonIdInput>;
export type RunCodeInput = z.infer<typeof runCodeInput>;
export type RunTestsInput = z.infer<typeof runTestsInput>;
export type SubmitInput = z.infer<typeof submitInput>;
export type TestResult = z.infer<typeof testResultSchema>;
export type AiFeedback = z.infer<typeof aiFeedbackSchema>;
export type TaskWithSubmission = z.infer<typeof taskWithSubmissionSchema>;
export type SubmissionOutput = z.infer<typeof submissionSchema>;
export type RunCodeOutput = z.infer<typeof runCodeOutputSchema>;
