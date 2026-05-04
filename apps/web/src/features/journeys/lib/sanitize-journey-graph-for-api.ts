import type { Edge, Node } from "@xyflow/react";

type ApiNodeData = {
	kind: "milestone" | "course" | "choice";
	label: string;
	courseId?: string;
	courseSlug?: string;
	choiceGroupId?: string;
};

export const sanitizeJourneyGraphForApi = (params: {
	nodes: Node[];
	edges: Edge[];
}) => {
	const nodes = params.nodes.map((n) => {
		const raw = n.data as Record<string, unknown>;
		const kind = raw.kind;
		if (kind !== "milestone" && kind !== "course" && kind !== "choice") {
			throw new Error(`Invalid node kind for ${n.id}`);
		}
		const label = typeof raw.label === "string" ? raw.label : "";
		const data: ApiNodeData = { kind, label };
		if (typeof raw.courseId === "string" && raw.courseId.length > 0) {
			data.courseId = raw.courseId;
		}
		if (typeof raw.courseSlug === "string" && raw.courseSlug.length > 0) {
			data.courseSlug = raw.courseSlug;
		}
		if (typeof raw.choiceGroupId === "string" && raw.choiceGroupId.length > 0) {
			data.choiceGroupId = raw.choiceGroupId;
		}
		return {
			id: n.id,
			type: n.type ?? "journeyCourse",
			position: n.position,
			data,
		};
	});

	const edges = params.edges.map((e) => ({
		id: e.id,
		source: e.source,
		target: e.target,
		type: e.type ?? "journeySpine",
	}));

	return { nodes, edges };
};
