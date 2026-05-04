import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";

export const JourneyBranchEdge = ({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps) => {
	const [path] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});
	return (
		<BaseEdge
			interactionWidth={14}
			path={path}
			style={{
				stroke: "color-mix(in oklch, var(--primary) 65%, transparent)",
				strokeDasharray: "6 4",
				strokeWidth: 2,
			}}
		/>
	);
};
