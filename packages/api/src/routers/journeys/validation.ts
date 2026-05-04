import { z } from "zod";

export const journeyNodeDataSchema = z
	.object({
		kind: z.enum(["milestone", "course", "choice"]),
		label: z.string(),
		courseId: z.string().optional(),
		courseSlug: z.string().optional(),
		choiceGroupId: z.string().optional(),
	})
	.passthrough();

export const journeyNodeSchema = z
	.object({
		id: z.string(),
		type: z.string(),
		position: z.object({ x: z.number(), y: z.number() }),
		data: journeyNodeDataSchema,
	})
	.passthrough();

export const journeyEdgeSchema = z
	.object({
		id: z.string(),
		source: z.string(),
		target: z.string(),
		type: z.string().optional(),
	})
	.passthrough();

export const journeyGraphSchema = z.object({
	nodes: z.array(journeyNodeSchema),
	edges: z.array(journeyEdgeSchema),
});

export type JourneyGraph = z.infer<typeof journeyGraphSchema>;
export type JourneyGraphNode = z.infer<typeof journeyNodeSchema>;

export const journeyPresetMetaSchema = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string(),
	description: z.string(),
});

export type JourneyPresetMeta = z.infer<typeof journeyPresetMetaSchema>;

export const journeyListItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	presetId: z.string().nullable(),
	updatedAt: z.date(),
});

export type JourneyListItem = z.infer<typeof journeyListItemSchema>;

export const journeyNodeProgressSchema = z.object({
	nodeId: z.string(),
	status: z.enum(["locked", "active", "completed", "skipped"]),
	chosenCourseId: z.string().nullable(),
});

export type JourneyNodeProgress = z.infer<typeof journeyNodeProgressSchema>;

export const courseCompletionStatsSchema = z.object({
	totalLessons: z.number(),
	completedLessons: z.number(),
	isGloballyComplete: z.boolean(),
});

export type CourseCompletionStats = z.infer<typeof courseCompletionStatsSchema>;

export const journeyDetailSchema = z.object({
	id: z.string(),
	title: z.string(),
	presetId: z.string().nullable(),
	graphLocked: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
	graph: journeyGraphSchema,
	nodeProgress: z.array(journeyNodeProgressSchema),
	courseStats: z.record(z.string(), courseCompletionStatsSchema),
});

export type JourneyDetailOutput = z.infer<typeof journeyDetailSchema>;

export const createEmptyInput = z.object({
	title: z.string().min(1).max(200),
});

export const createFromPresetInput = z.object({
	presetSlug: z.string().min(1),
	title: z.string().min(1).max(200).optional(),
});

export const presetSlugInput = z.object({
	presetSlug: z.string().min(1),
});

export const presetGraphForDraftOutput = z.object({
	presetId: z.string(),
	defaultTitle: z.string(),
	graph: journeyGraphSchema,
});

export const commitJourneyPlanInput = z.object({
	title: z.string().min(1).max(200),
	presetId: z.string().nullable().optional(),
	graph: journeyGraphSchema,
});

export const journeyIdInput = z.object({
	journeyId: z.string().min(1),
});

export const updateGraphInput = z.object({
	journeyId: z.string().min(1),
	graph: journeyGraphSchema,
});

export const setNodeProgressInput = z.object({
	journeyId: z.string().min(1),
	nodeId: z.string().min(1),
	status: z.enum(["locked", "active", "completed", "skipped"]),
	chosenCourseId: z.string().nullable().optional(),
});
