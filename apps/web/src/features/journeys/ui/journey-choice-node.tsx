import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@ctl/ui/components/card";
import { RadioGroup, RadioGroupItem } from "@ctl/ui/components/radio-group";
import { cn } from "@ctl/ui/lib/utils";
import { Handle, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { useEffect, useState } from "react";

import { client, orpc } from "@/shared/api";
import { queryClient } from "@/shared/api/orpc";

type Data = {
	label: string;
	choiceGroupId?: string;
	journeyId?: string;
	mode?: string;
	progressStatus?: string;
	chosenCourseId?: string | null;
};

type BranchData = {
	label?: string;
	courseId?: string;
	choiceGroupId?: string;
	displayIconUrl?: string;
};

export const JourneyChoiceNode = ({ id, data, selected }: NodeProps) => {
	const d = data as Data;
	const { getNodes } = useReactFlow();
	const journeyId = d.journeyId ?? "";
	const isRoadmap = d.mode === "roadmap";
	const isResolved =
		d.progressStatus === "completed" && Boolean(d.chosenCourseId);
	const groupId = d.choiceGroupId ?? "frontend-framework";
	const [optimisticCourseId, setOptimisticCourseId] = useState<string | null>(
		null
	);

	useEffect(() => {
		if (isResolved) {
			setOptimisticCourseId(null);
		}
	}, [isResolved]);

	const branchOptions = getNodes().filter((n) => {
		const nd = n.data as BranchData;
		return (
			n.type === "journeyCourse" &&
			nd.choiceGroupId === groupId &&
			Boolean(nd.courseId)
		);
	});

	const onPick = async (courseId: string) => {
		if (!journeyId) {
			return;
		}
		await client.journeys.setNodeProgress({
			journeyId,
			nodeId: id,
			status: "completed",
			chosenCourseId: courseId,
		});
		queryClient.invalidateQueries({
			queryKey: orpc.journeys.getById.key({ input: { journeyId } }),
		});
	};

	const chosenLabel = branchOptions.find((n) => {
		const nd = n.data as BranchData;
		return nd.courseId === d.chosenCourseId;
	});

	const radioValue = d.chosenCourseId ?? optimisticCourseId ?? "";

	return (
		<Card
			className={cn(
				"min-w-[280px] max-w-md overflow-visible border-2 border-primary/50 border-dashed bg-card/95 backdrop-blur-sm",
				selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
			)}
		>
			<Handle
				className="nodrag nopan !z-30 !size-4 !border-2 !border-primary/40 !bg-background !shadow-sm !pointer-events-auto"
				position={Position.Top}
				type="target"
			/>
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
					<GitBranch className="size-4 text-primary" />
				</div>
				<span className="font-medium text-sm">{d.label}</span>
			</CardHeader>
			{isRoadmap && !isResolved ? (
				<CardContent className="pt-0">
					<p className="mb-3 text-muted-foreground text-xs">
						Pick one path — the other branch dims once you choose.
					</p>
					<div className="rounded-xl border border-border/80 bg-muted/35 p-1.5">
						<RadioGroup
							className="flex flex-col gap-0.5"
							onValueChange={(value) => {
								if (!value) {
									return;
								}
								setOptimisticCourseId(value);
								onPick(value).catch(() => undefined);
							}}
							value={radioValue}
						>
							{branchOptions.map((n) => {
								const nd = n.data as BranchData;
								const cid = nd.courseId ?? "";
								const itemId = `choice-${id}-${cid}`;
								const isSelected = radioValue === cid;
								return (
									<label
										className={cn(
											"flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors",
											"hover:bg-background/75",
											isSelected && "border-primary/25 bg-background shadow-sm"
										)}
										htmlFor={itemId}
										key={n.id}
									>
										<RadioGroupItem
											className="shrink-0"
											id={itemId}
											value={cid}
										/>
										{nd.displayIconUrl ? (
											<span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background p-1 shadow-xs">
												<img
													alt=""
													className="size-6 object-contain"
													height={24}
													src={nd.displayIconUrl}
													width={24}
												/>
											</span>
										) : (
											<span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted font-medium text-muted-foreground text-xs">
												?
											</span>
										)}
										<span className="min-w-0 flex-1 text-left font-medium text-sm leading-snug">
											{nd.label ?? "Option"}
										</span>
									</label>
								);
							})}
						</RadioGroup>
					</div>
				</CardContent>
			) : null}
			{isRoadmap && isResolved ? (
				<CardContent className="pt-0">
					<div className="rounded-xl border border-border/80 bg-muted/35 p-4">
						<p className="font-medium text-foreground text-sm">
							{(chosenLabel?.data as BranchData)?.label ?? "Choice saved"}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Follow the highlighted branch on the map.
						</p>
					</div>
				</CardContent>
			) : null}
			{isRoadmap ? null : (
				<CardFooter className="pt-0">
					<div className="w-full rounded-xl border border-muted-foreground/35 border-dashed bg-muted/20 p-4 text-muted-foreground text-xs leading-relaxed">
						Connect framework course nodes below. After you save the journey,
						learners choose a framework using the radio list above.
					</div>
				</CardFooter>
			)}
			<Handle
				className="nodrag nopan !z-30 !size-4 !border-2 !border-primary/40 !bg-background !shadow-sm !pointer-events-auto"
				position={Position.Bottom}
				type="source"
			/>
		</Card>
	);
};
