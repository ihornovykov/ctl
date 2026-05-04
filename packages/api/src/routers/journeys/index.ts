import {
	and,
	db,
	eq,
	journeyPreset,
	userJourney,
	userJourneyNodeProgress,
} from "@ctl/db";
import { ORPCError } from "@orpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../../index";
import {
	buildCourseCompletionMap,
	extractCourseIdsFromGraph,
	resolveCourseSlugsInGraph,
	verifyCourseIdsExist,
} from "./utils";
import {
	commitJourneyPlanInput,
	createEmptyInput,
	createFromPresetInput,
	type JourneyDetailOutput,
	type JourneyGraph,
	type JourneyListItem,
	type JourneyPresetMeta,
	journeyDetailSchema,
	journeyGraphSchema,
	journeyIdInput,
	journeyListItemSchema,
	journeyPresetMetaSchema,
	presetGraphForDraftOutput,
	presetSlugInput,
	setNodeProgressInput,
	updateGraphInput,
} from "./validation";

const defaultEmptyGraph: JourneyGraph = {
	nodes: [
		{
			id: "n-root",
			type: "journeyMilestone",
			position: { x: 280, y: 48 },
			data: { kind: "milestone", label: "Start here" },
		},
	],
	edges: [],
};

const assertJourneyOwner = async (journeyId: string, userId: string) => {
	const row = await db.query.userJourney.findFirst({
		where: and(eq(userJourney.id, journeyId), eq(userJourney.userId, userId)),
		columns: { id: true },
	});
	if (!row) {
		throw new ORPCError("NOT_FOUND", { message: "Journey not found" });
	}
};

const loadJourneyDetail = async (
	journeyId: string,
	userId: string
): Promise<JourneyDetailOutput> => {
	const row = await db.query.userJourney.findFirst({
		where: and(eq(userJourney.id, journeyId), eq(userJourney.userId, userId)),
		with: {
			nodeProgress: true,
		},
	});

	if (!row) {
		throw new ORPCError("NOT_FOUND", { message: "Journey not found" });
	}

	const parsedGraph = journeyGraphSchema.parse(row.graphJson);
	const courseIds = extractCourseIdsFromGraph(parsedGraph);
	const courseStats = await buildCourseCompletionMap(userId, courseIds);

	const nodeProgress = row.nodeProgress.map((p) => ({
		nodeId: p.nodeId,
		status: p.status as JourneyDetailOutput["nodeProgress"][number]["status"],
		chosenCourseId: p.chosenCourseId,
	}));

	return journeyDetailSchema.parse({
		id: row.id,
		title: row.title,
		presetId: row.presetId,
		graphLocked: row.graphLocked,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		graph: parsedGraph,
		nodeProgress,
		courseStats,
	});
};

const upsertNodeProgress = async (input: {
	journeyId: string;
	nodeId: string;
	status: string;
	chosenCourseId: string | null;
}) => {
	const existing = await db.query.userJourneyNodeProgress.findFirst({
		where: and(
			eq(userJourneyNodeProgress.journeyId, input.journeyId),
			eq(userJourneyNodeProgress.nodeId, input.nodeId)
		),
		columns: { id: true },
	});

	if (existing) {
		await db
			.update(userJourneyNodeProgress)
			.set({
				status: input.status,
				chosenCourseId: input.chosenCourseId,
				updatedAt: new Date(),
			})
			.where(eq(userJourneyNodeProgress.id, existing.id));
	} else {
		await db.insert(userJourneyNodeProgress).values({
			id: nanoid(),
			journeyId: input.journeyId,
			nodeId: input.nodeId,
			status: input.status,
			chosenCourseId: input.chosenCourseId,
		});
	}
};

export const journeysRouter = {
	listPresets: publicProcedure
		.output(journeyPresetMetaSchema.array())
		.handler(async (): Promise<JourneyPresetMeta[]> => {
			const rows = await db.query.journeyPreset.findMany({
				columns: {
					id: true,
					slug: true,
					title: true,
					description: true,
				},
				orderBy: (p, { asc }) => asc(p.title),
			});
			return rows.map((r) => journeyPresetMetaSchema.parse(r));
		}),

	listMine: protectedProcedure
		.output(journeyListItemSchema.array())
		.handler(async ({ context }): Promise<JourneyListItem[]> => {
			const userId = context.session.user.id;
			const rows = await db.query.userJourney.findMany({
				where: eq(userJourney.userId, userId),
				columns: {
					id: true,
					title: true,
					presetId: true,
					updatedAt: true,
				},
				orderBy: (j, { desc }) => desc(j.updatedAt),
			});
			return rows.map((r) => journeyListItemSchema.parse(r));
		}),

	getById: protectedProcedure
		.input(journeyIdInput)
		.output(journeyDetailSchema)
		.handler(
			async ({ input, context }): Promise<JourneyDetailOutput> =>
				loadJourneyDetail(input.journeyId, context.session.user.id)
		),

	createEmpty: protectedProcedure
		.input(createEmptyInput)
		.output(journeyDetailSchema)
		.handler(async ({ input, context }): Promise<JourneyDetailOutput> => {
			const userId = context.session.user.id;
			const id = nanoid();
			await db.insert(userJourney).values({
				id,
				userId,
				presetId: null,
				title: input.title,
				graphJson: defaultEmptyGraph,
				graphLocked: false,
			});
			return loadJourneyDetail(id, userId);
		}),

	createFromPreset: protectedProcedure
		.input(createFromPresetInput)
		.output(journeyDetailSchema)
		.handler(async ({ input, context }): Promise<JourneyDetailOutput> => {
			const userId = context.session.user.id;
			const preset = await db.query.journeyPreset.findFirst({
				where: eq(journeyPreset.slug, input.presetSlug),
			});

			if (!preset) {
				throw new ORPCError("NOT_FOUND", { message: "Preset not found" });
			}

			const rawGraph = journeyGraphSchema.parse(preset.graphJson);
			let resolved: JourneyGraph;
			try {
				resolved = await resolveCourseSlugsInGraph(rawGraph);
			} catch (e) {
				const message = e instanceof Error ? e.message : "Invalid preset graph";
				throw new ORPCError("BAD_REQUEST", { message });
			}

			const id = nanoid();
			const title = input.title ?? preset.title;
			await db.insert(userJourney).values({
				id,
				userId,
				presetId: preset.id,
				title,
				graphJson: resolved,
				graphLocked: false,
			});
			return loadJourneyDetail(id, userId);
		}),

	getPresetGraph: protectedProcedure
		.input(presetSlugInput)
		.output(presetGraphForDraftOutput)
		.handler(async ({ input }) => {
			const preset = await db.query.journeyPreset.findFirst({
				where: eq(journeyPreset.slug, input.presetSlug),
			});
			if (!preset) {
				throw new ORPCError("NOT_FOUND", { message: "Preset not found" });
			}
			const rawGraph = journeyGraphSchema.parse(preset.graphJson);
			let resolved: JourneyGraph;
			try {
				resolved = await resolveCourseSlugsInGraph(rawGraph);
			} catch (e) {
				const message = e instanceof Error ? e.message : "Invalid preset graph";
				throw new ORPCError("BAD_REQUEST", { message });
			}
			return presetGraphForDraftOutput.parse({
				presetId: preset.id,
				defaultTitle: preset.title,
				graph: resolved,
			});
		}),

	commitJourneyPlan: protectedProcedure
		.input(commitJourneyPlanInput)
		.output(journeyDetailSchema)
		.handler(async ({ input, context }): Promise<JourneyDetailOutput> => {
			const userId = context.session.user.id;
			let graph = journeyGraphSchema.parse(input.graph);
			try {
				graph = await resolveCourseSlugsInGraph(graph);
			} catch (e) {
				const message = e instanceof Error ? e.message : "Invalid graph";
				throw new ORPCError("BAD_REQUEST", { message });
			}
			const courseIds = extractCourseIdsFromGraph(graph);
			try {
				await verifyCourseIdsExist(courseIds);
			} catch (e) {
				const message = e instanceof Error ? e.message : "Invalid courses";
				throw new ORPCError("BAD_REQUEST", { message });
			}
			const id = nanoid();
			await db.insert(userJourney).values({
				id,
				userId,
				presetId: input.presetId ?? null,
				title: input.title.trim(),
				graphJson: graph,
				graphLocked: true,
			});
			return loadJourneyDetail(id, userId);
		}),

	deleteJourney: protectedProcedure
		.input(journeyIdInput)
		.output(z.void())
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			await assertJourneyOwner(input.journeyId, userId);
			await db
				.delete(userJourney)
				.where(
					and(
						eq(userJourney.id, input.journeyId),
						eq(userJourney.userId, userId)
					)
				);
		}),

	updateGraph: protectedProcedure
		.input(updateGraphInput)
		.output(journeyDetailSchema)
		.handler(async ({ input, context }): Promise<JourneyDetailOutput> => {
			const userId = context.session.user.id;
			const row = await db.query.userJourney.findFirst({
				where: and(
					eq(userJourney.id, input.journeyId),
					eq(userJourney.userId, userId)
				),
				columns: { id: true, graphLocked: true },
			});
			if (!row) {
				throw new ORPCError("NOT_FOUND", { message: "Journey not found" });
			}
			if (row.graphLocked) {
				throw new ORPCError("FORBIDDEN", {
					message: "This journey plan cannot be edited",
				});
			}

			const graph = journeyGraphSchema.parse(input.graph);
			const courseIds = extractCourseIdsFromGraph(graph);
			try {
				await verifyCourseIdsExist(courseIds);
			} catch (e) {
				const message = e instanceof Error ? e.message : "Invalid courses";
				throw new ORPCError("BAD_REQUEST", { message });
			}

			await db
				.update(userJourney)
				.set({
					graphJson: graph,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(userJourney.id, input.journeyId),
						eq(userJourney.userId, userId)
					)
				);

			return loadJourneyDetail(input.journeyId, userId);
		}),

	setNodeProgress: protectedProcedure
		.input(setNodeProgressInput)
		.output(journeyDetailSchema)
		.handler(async ({ input, context }): Promise<JourneyDetailOutput> => {
			const userId = context.session.user.id;
			await assertJourneyOwner(input.journeyId, userId);

			await upsertNodeProgress({
				journeyId: input.journeyId,
				nodeId: input.nodeId,
				status: input.status,
				chosenCourseId: input.chosenCourseId ?? null,
			});

			return loadJourneyDetail(input.journeyId, userId);
		}),
};
