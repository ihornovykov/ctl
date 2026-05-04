import type {
	JourneyGraphEdgeInput,
	JourneyGraphNodeInput,
} from "./enrich-journey-graph";

export const DEFAULT_EMPTY_JOURNEY_GRAPH: {
	nodes: JourneyGraphNodeInput[];
	edges: JourneyGraphEdgeInput[];
} = {
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
