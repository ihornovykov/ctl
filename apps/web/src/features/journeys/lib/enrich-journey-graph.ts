import type { Edge, Node } from "@xyflow/react";

type CourseStats = {
	totalLessons: number;
	completedLessons: number;
	isGloballyComplete: boolean;
};

export type JourneyGraphNodeInput = {
	id: string;
	type: string;
	position: { x: number; y: number };
	data: Record<string, unknown>;
};

export type JourneyGraphEdgeInput = {
	id: string;
	source: string;
	target: string;
	type?: string;
};

type NodeProgressRow = {
	nodeId: string;
	status: "locked" | "active" | "completed" | "skipped";
	chosenCourseId: string | null;
};

type EnrichParams = {
	nodes: JourneyGraphNodeInput[];
	edges: JourneyGraphEdgeInput[];
	nodeProgress: NodeProgressRow[];
	courseStats: Record<string, CourseStats>;
	courseSlugById: Map<string, string>;
	courseIconById: Map<string, string | null>;
	journeyId: string;
	mode: "roadmap" | "builder";
};

const findChoiceSelection = (
	nodes: JourneyGraphNodeInput[],
	progress: NodeProgressRow[]
): { groupId: string; chosenCourseId: string } | null => {
	for (const n of nodes) {
		if (n.type !== "journeyChoice") {
			continue;
		}
		const row = progress.find((p) => p.nodeId === n.id);
		if (row?.status === "completed" && row.chosenCourseId) {
			const gid =
				typeof n.data.choiceGroupId === "string" ? n.data.choiceGroupId : null;
			if (gid) {
				return { groupId: gid, chosenCourseId: row.chosenCourseId };
			}
		}
	}
	return null;
};

const nonEmptyString = (v: unknown): string | undefined =>
	typeof v === "string" && v.length > 0 ? v : undefined;

const resolveDisplayIconUrl = (
	courseId: string | undefined,
	courseIconById: Map<string, string | null>,
	nodeData: Record<string, unknown>
): string | undefined => {
	const fromMap = courseId ? courseIconById.get(courseId) : undefined;
	const mapped = nonEmptyString(fromMap);
	if (mapped) {
		return mapped;
	}
	return nonEmptyString(nodeData.displayIconUrl);
};

const isBranchDimmed = (
	selection: { groupId: string; chosenCourseId: string } | null,
	n: JourneyGraphNodeInput,
	choiceGroupId: string | undefined,
	courseId: string | undefined
): boolean =>
	Boolean(
		selection &&
			n.type === "journeyCourse" &&
			choiceGroupId &&
			choiceGroupId === selection.groupId &&
			courseId &&
			courseId !== selection.chosenCourseId
	);

const enrichOneNode = (
	n: JourneyGraphNodeInput,
	ctx: {
		selection: ReturnType<typeof findChoiceSelection>;
		nodeProgress: NodeProgressRow[];
		courseStats: Record<string, CourseStats>;
		courseSlugById: Map<string, string>;
		courseIconById: Map<string, string | null>;
		journeyId: string;
		mode: "roadmap" | "builder";
	}
): Node => {
	const courseId =
		typeof n.data.courseId === "string" ? n.data.courseId : undefined;
	const stats = courseId ? ctx.courseStats[courseId] : undefined;
	const slug = courseId ? ctx.courseSlugById.get(courseId) : undefined;
	const progressRow = ctx.nodeProgress.find((p) => p.nodeId === n.id);
	const choiceGroupId =
		typeof n.data.choiceGroupId === "string" ? n.data.choiceGroupId : undefined;
	const displayIconUrl = resolveDisplayIconUrl(
		courseId,
		ctx.courseIconById,
		n.data
	);
	const branchDimmed = isBranchDimmed(
		ctx.selection,
		n,
		choiceGroupId,
		courseId
	);

	return {
		...n,
		data: {
			...n.data,
			journeyId: ctx.journeyId,
			mode: ctx.mode,
			courseStats: stats,
			courseSlug: slug,
			displayIconUrl,
			progressStatus: progressRow?.status,
			chosenCourseId: progressRow?.chosenCourseId ?? null,
			branchDimmed,
		},
	};
};

export const enrichJourneyGraph = ({
	nodes,
	edges,
	nodeProgress,
	courseStats,
	courseSlugById,
	courseIconById,
	journeyId,
	mode,
}: EnrichParams): { nodes: Node[]; edges: Edge[] } => {
	const selection = findChoiceSelection(nodes, nodeProgress);

	const flowNodes: Node[] = nodes.map((n) =>
		enrichOneNode(n, {
			selection,
			nodeProgress,
			courseStats,
			courseSlugById,
			courseIconById,
			journeyId,
			mode,
		})
	);

	const flowEdges: Edge[] = edges.map((e) => ({
		id: e.id,
		source: e.source,
		target: e.target,
		type: e.type ?? "journeySpine",
	}));

	return { nodes: flowNodes, edges: flowEdges };
};
