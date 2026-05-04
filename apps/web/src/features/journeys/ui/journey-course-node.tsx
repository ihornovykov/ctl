import { Badge } from "@ctl/ui/components/badge";
import { Button, buttonVariants } from "@ctl/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@ctl/ui/components/card";
import { Progress } from "@ctl/ui/components/progress";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { BookOpen, Check, SkipForward } from "lucide-react";

import { client, orpc } from "@/shared/api";
import { queryClient } from "@/shared/api/orpc";

type CourseStats = {
	totalLessons: number;
	completedLessons: number;
	isGloballyComplete: boolean;
};

type Data = {
	label: string;
	kind?: string;
	courseId?: string;
	courseSlug?: string;
	displayIconUrl?: string;
	journeyId?: string;
	mode?: string;
	courseStats?: CourseStats;
	progressStatus?: string;
	branchDimmed?: boolean;
};

const invalidateJourney = (journeyId: string) => {
	queryClient.invalidateQueries({
		queryKey: orpc.journeys.getById.key({
			input: { journeyId },
		}),
	});
};

export const JourneyCourseNode = ({ id, data, selected }: NodeProps) => {
	const d = data as Data;
	const isRoadmap = d.mode === "roadmap";
	const isBuilder = d.mode === "builder";
	const stats = d.courseStats;
	const pct =
		stats && stats.totalLessons > 0
			? Math.round((stats.completedLessons / stats.totalLessons) * 100)
			: 0;
	const journeyId = d.journeyId ?? "";
	const slug = d.courseSlug;

	const onSkipPress = async () => {
		if (!journeyId) {
			return;
		}
		await client.journeys.setNodeProgress({
			journeyId,
			nodeId: id,
			status: "skipped",
		});
		invalidateJourney(journeyId);
	};

	const onMarkDonePress = async () => {
		if (!journeyId) {
			return;
		}
		await client.journeys.setNodeProgress({
			journeyId,
			nodeId: id,
			status: "completed",
		});
		invalidateJourney(journeyId);
	};

	return (
		<Card
			className={cn(
				"min-w-[220px] max-w-[260px] overflow-visible border-2 transition-opacity",
				d.branchDimmed && "opacity-35",
				selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
			)}
		>
			<Handle
				className="nodrag nopan !z-30 !size-4 !border-2 !border-border !bg-background !shadow-sm !pointer-events-auto"
				position={Position.Top}
				type="target"
			/>
			<CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
				<div className="flex flex-col gap-1">
					<span className="font-medium text-sm leading-tight">{d.label}</span>
					{stats?.isGloballyComplete ? (
						<Badge className="w-fit gap-1" variant="outline">
							<Check className="size-3" />
							Done elsewhere
						</Badge>
					) : null}
				</div>
				{d.displayIconUrl ? (
					<img
						alt=""
						className="size-8 shrink-0 rounded-md border border-border/60 bg-background object-contain p-0.5"
						height={32}
						src={d.displayIconUrl}
						width={32}
					/>
				) : (
					<BookOpen className="size-4 shrink-0 text-muted-foreground" />
				)}
			</CardHeader>
			{stats && stats.totalLessons > 0 ? (
				<CardContent className="pb-2">
					<div className="flex flex-col gap-1">
						<div className="flex justify-between text-muted-foreground text-xs">
							<span>Progress</span>
							<span>
								{stats.completedLessons}/{stats.totalLessons}
							</span>
						</div>
						<Progress value={pct} />
					</div>
				</CardContent>
			) : null}
			{isRoadmap && slug ? (
				<CardFooter className="flex flex-col gap-2 pt-0">
					<Link
						className={cn(
							buttonVariants({ size: "sm", variant: "default" }),
							"w-full"
						)}
						params={{ slug }}
						to="/courses/$slug"
					>
						Open course
					</Link>
					<div className="flex w-full flex-wrap gap-2">
						{stats?.isGloballyComplete &&
						d.progressStatus !== "skipped" &&
						d.progressStatus !== "completed" ? (
							<Button
								className="flex-1"
								onClick={onSkipPress}
								size="sm"
								type="button"
								variant="secondary"
							>
								<SkipForward className="size-3.5" />
								Skip on path
							</Button>
						) : null}
						{d.progressStatus === "completed" ? null : (
							<Button
								className="flex-1"
								onClick={onMarkDonePress}
								size="sm"
								type="button"
								variant="outline"
							>
								Mark step done
							</Button>
						)}
					</div>
				</CardFooter>
			) : null}
			{isBuilder ? (
				<CardFooter className="text-muted-foreground text-xs">
					{slug ? (
						<Link
							className="underline-offset-2 hover:underline"
							params={{ slug }}
							to="/courses/$slug"
						>
							Preview course
						</Link>
					) : (
						<span>Attach a course from the palette</span>
					)}
				</CardFooter>
			) : null}
			<Handle
				className="nodrag nopan !z-30 !size-4 !border-2 !border-border !bg-background !shadow-sm !pointer-events-auto"
				position={Position.Bottom}
				type="source"
			/>
		</Card>
	);
};
