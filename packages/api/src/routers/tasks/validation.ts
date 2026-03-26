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

export type GetByLessonIdInput = z.infer<typeof getByLessonIdInput>;
export type RunCodeInput = z.infer<typeof runCodeInput>;
export type RunTestsInput = z.infer<typeof runTestsInput>;
export type SubmitInput = z.infer<typeof submitInput>;
export type TestResult = z.infer<typeof testResultSchema>;
export type AiFeedback = z.infer<typeof aiFeedbackSchema>;
export type TaskWithSubmission = z.infer<typeof taskWithSubmissionSchema>;
export type SubmissionOutput = z.infer<typeof submissionSchema>;
export type RunCodeOutput = z.infer<typeof runCodeOutputSchema>;
