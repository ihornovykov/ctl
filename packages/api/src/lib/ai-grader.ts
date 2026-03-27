import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

const aiFeedbackSchema = z.object({
	totalScore: z.number(),
	maxScore: z.number(),
	mainPoints: z.array(z.string()),
	improvements: z.array(z.string()),
	criteriaScores: z.array(
		z.object({
			criteriaId: z.string(),
			score: z.number(),
			maxScore: z.number(),
			comment: z.string(),
		})
	),
});

export type AiFeedback = z.infer<typeof aiFeedbackSchema>;

type GradingCriteria = {
	id: string;
	name: string;
	description: string;
	maxScore: number;
};

type GradeSubmissionInput = {
	languageId: string;
	taskDescription: string;
	solutionCode: string;
	studentCode: string;
	criteria: GradingCriteria[];
};

export type GradeAiEvent = { type: "partial_feedback"; feedback: unknown };

export const createGradeStream = (
	input: GradeSubmissionInput,
	apiKey: string
) => {
	const google = createGoogleGenerativeAI({ apiKey });

	const criteriaList = input.criteria
		.map((c) => `- ${c.name} (max ${c.maxScore} points): ${c.description}`)
		.join("\n");

	const prompt = `You are an expert code reviewer grading a student's programming submission.

**Language:** ${input.languageId}

**Task Description:**
${input.taskDescription}

**Reference Solution:**
\`\`\`${input.languageId}
${input.solutionCode}
\`\`\`

**Student's Code:**
\`\`\`${input.languageId}
${input.studentCode}
\`\`\`

**Grading Criteria:**
${criteriaList}

Grade the student's code against each criterion. Be constructive and specific.`;

	const result = streamObject({
		model: google("gemini-2.5-flash"),
		schema: aiFeedbackSchema,
		prompt,
		system:
			"You are a helpful coding instructor. Provide fair, constructive, and specific feedback. Score each criterion honestly based on the student's code quality.",
	});

	async function* events(): AsyncGenerator<GradeAiEvent> {
		for await (const event of result.fullStream) {
			if (event.type === "object") {
				yield { type: "partial_feedback", feedback: event.object };
			}
		}
	}

	return { events: events(), getResult: () => result.object };
};

export const gradeSubmission = async (
	input: GradeSubmissionInput,
	apiKey: string
): Promise<AiFeedback> => {
	const google = createGoogleGenerativeAI({ apiKey });

	const criteriaList = input.criteria
		.map((c) => `- ${c.name} (max ${c.maxScore} points): ${c.description}`)
		.join("\n");

	const prompt = `You are an expert code reviewer grading a student's programming submission.

**Language:** ${input.languageId}

**Task Description:**
${input.taskDescription}

**Reference Solution:**
\`\`\`${input.languageId}
${input.solutionCode}
\`\`\`

**Student's Code:**
\`\`\`${input.languageId}
${input.studentCode}
\`\`\`

**Grading Criteria:**
${criteriaList}

Grade the student's code against each criterion. Be constructive and specific. If the code is correct but could be improved, acknowledge what they did well before suggesting improvements.`;

	const { object } = await generateObject({
		model: google("gemini-2.5-flash"),
		schema: aiFeedbackSchema,
		prompt,
		system:
			"You are a helpful coding instructor. Provide fair, constructive, and specific feedback. Score each criterion honestly based on the student's code quality.",
	});

	return object;
};
