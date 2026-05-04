import { cn } from "@ctl/ui/lib/utils";
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	BackgroundVariant,
	type Connection,
	ConnectionLineType,
	type Edge,
	type EdgeChange,
	type Node,
	type NodeChange,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./journey-flow-overrides.css";
import { useCallback, useMemo } from "react";

import { JourneyBranchEdge } from "./journey-branch-edge";
import { JourneyChoiceNode } from "./journey-choice-node";
import { JourneyCourseNode } from "./journey-course-node";
import { JourneyMilestoneNode } from "./journey-milestone-node";
import { JourneySpineEdge } from "./journey-spine-edge";

type Props = {
	nodes: Node[];
	edges: Edge[];
	readOnly: boolean;
	className?: string;
	onGraphDirty?: (isDirty: boolean) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
};

export const JourneyFlowCanvas = ({
	nodes,
	edges,
	readOnly,
	className,
	onGraphDirty,
	onNodesChange,
	onEdgesChange,
	setEdges,
}: Props) => {
	const nodeTypes = useMemo(
		() => ({
			journeyMilestone: JourneyMilestoneNode,
			journeyCourse: JourneyCourseNode,
			journeyChoice: JourneyChoiceNode,
		}),
		[]
	);

	const edgeTypes = useMemo(
		() => ({
			journeySpine: JourneySpineEdge,
			journeyBranch: JourneyBranchEdge,
		}),
		[]
	);

	const handleNodesChange = useCallback(
		(changes: NodeChange[]) => {
			const hasMeaningfulMove = changes.some(
				(c) => c.type === "position" && c.dragging === false
			);
			if (hasMeaningfulMove && !readOnly) {
				onGraphDirty?.(true);
			}
			onNodesChange(changes);
		},
		[onNodesChange, onGraphDirty, readOnly]
	);

	const handleEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			if (!readOnly && changes.length > 0) {
				onGraphDirty?.(true);
			}
			onEdgesChange(changes);
		},
		[onEdgesChange, onGraphDirty, readOnly]
	);

	const isValidConnection = useCallback(
		(c: Connection | Edge) => {
			if (readOnly) {
				return false;
			}
			if (c.source === c.target) {
				return false;
			}
			const dup = edges.some(
				(e) => e.source === c.source && e.target === c.target
			);
			if (dup) {
				return false;
			}
			return true;
		},
		[readOnly, edges]
	);

	const onConnect = useCallback(
		(params: Connection) => {
			setEdges((eds) =>
				addEdge(
					{
						...params,
						id: `e-${params.source}-${params.target}`,
						type: "journeyBranch",
					},
					eds
				)
			);
			onGraphDirty?.(true);
		},
		[setEdges, onGraphDirty]
	);

	return (
		<div className={cn("journey-flow-shell h-full w-full", className)}>
			<ReactFlow
				connectionLineType={ConnectionLineType.SmoothStep}
				connectionRadius={28}
				deleteKeyCode={readOnly ? null : "Delete"}
				edges={edges}
				edgesReconnectable={!readOnly}
				edgeTypes={edgeTypes}
				elementsSelectable
				fitView
				fitViewOptions={{ padding: 0.25, maxZoom: 1.35 }}
				isValidConnection={isValidConnection}
				nodes={nodes}
				nodesConnectable={!readOnly}
				nodesDraggable={!readOnly}
				nodeTypes={nodeTypes}
				onConnect={readOnly ? undefined : onConnect}
				onEdgesChange={handleEdgesChange}
				onNodesChange={handleNodesChange}
				proOptions={{ hideAttribution: true }}
			>
				<Background
					className="opacity-[0.35] dark:opacity-25"
					gap={20}
					variant={BackgroundVariant.Dots}
				/>
			</ReactFlow>
		</div>
	);
};

export const createControlledFlowHandlers = (params: {
	setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
	setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}) => {
	const onNodesChange = (changes: NodeChange[]) => {
		params.setNodes((nds) => applyNodeChanges(changes, nds));
	};
	const onEdgesChange = (changes: EdgeChange[]) => {
		params.setEdges((eds) => applyEdgeChanges(changes, eds));
	};
	return { onNodesChange, onEdgesChange };
};
