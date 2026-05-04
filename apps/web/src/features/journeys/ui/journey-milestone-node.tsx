import { Badge } from "@ctl/ui/components/badge";
import { cn } from "@ctl/ui/lib/utils";
import { Handle, type NodeProps, Position } from "@xyflow/react";

type Data = {
	label: string;
	mode?: string;
	progressStatus?: string;
};

export const JourneyMilestoneNode = ({ data, selected }: NodeProps) => {
	const d = data as Data;
	const isRoadmap = d.mode === "roadmap";

	return (
		<div
			className={cn(
				"relative min-w-[200px] rounded-lg border-2 border-amber-950/25 bg-amber-100 px-4 py-3 text-center font-semibold text-amber-950 shadow-[3px_3px_0_0_color-mix(in_oklch,var(--foreground)_8%,transparent)] dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-50",
				selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
			)}
		>
			<Handle
				className="nodrag nopan !z-30 !size-4 !border-2 !border-amber-900/30 !bg-background !pointer-events-auto dark:!border-amber-400/40 shadow-sm"
				position={Position.Top}
				type="target"
			/>
			<span className="text-sm tracking-tight">{d.label}</span>
			{isRoadmap && d.progressStatus === "completed" ? (
				<Badge className="absolute -top-2 -right-2" variant="secondary">
					Done
				</Badge>
			) : null}
			<Handle
				className="nodrag nopan !z-30 !size-4 !border-2 !border-amber-900/30 !bg-background !pointer-events-auto dark:!border-amber-400/40 shadow-sm"
				position={Position.Bottom}
				type="source"
			/>
		</div>
	);
};
