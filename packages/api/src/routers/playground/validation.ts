import { z } from "zod";

export const playgroundFrameworkSchema = z.enum(["react", "vue"]);

export const createSessionInputSchema = z.object({
	framework: playgroundFrameworkSchema,
	initialFiles: z.record(z.string(), z.string()).optional(),
});

export const playgroundSessionIdInputSchema = z.object({
	sessionId: z.string(),
});

export const writeFileInputSchema = z.object({
	sessionId: z.string(),
	path: z.string(),
	content: z.string(),
});

export const playgroundLogEventSchema = z.object({
	stream: z.enum(["stdout", "stderr"]),
	chunk: z.string(),
});

export const createSessionOutputSchema = z.object({
	sessionId: z.string(),
	hostPort: z.number(),
	previewGateToken: z.string(),
});

export const runTestsOutputSchema = z.array(
	z.object({
		title: z.string(),
		passed: z.boolean(),
		error: z.string().optional(),
	})
);

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type PlaygroundLogEvent = z.infer<typeof playgroundLogEventSchema>;
