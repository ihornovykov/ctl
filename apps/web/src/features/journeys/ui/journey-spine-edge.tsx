import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";

export const JourneySpineEdge = ({
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
			interactionWidth={16}
			path={path}
			style={{
				stroke: "var(--primary)",
				strokeWidth: 2.5,
			}}
		/>
	);
};
