import type { CourseListItem } from "@ctl/api/routers/courses/validation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@ctl/ui/components/alert-dialog";
import { Button, buttonVariants } from "@ctl/ui/components/button";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { cn } from "@ctl/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Edge, Node } from "@xyflow/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useCourses } from "@/features/courses/hooks/use-courses";
import {
	createControlledFlowHandlers,
	enrichJourneyGraph,
	JourneyFlowCanvas,
	type JourneyGraphEdgeInput,
	type JourneyGraphNodeInput,
	sanitizeJourneyGraphForApi,
} from "@/features/journeys";
import { client, orpc, queryClient } from "@/shared/api";

type Props = {
	journeyId: string;
};

const EMPTY_COURSE_LIST: CourseListItem[] = [];

export const JourneyDetailView = ({ journeyId }: Props) => {
	const navigate = useNavigate();
	const { data, isPending, isError, error, refetch } = useQuery(
		orpc.journeys.getById.queryOptions({ input: { journeyId } })
	);
	const { data: coursesData } = useCourses();
	const courses = coursesData ?? EMPTY_COURSE_LIST;

	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [dirty, setDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const { onNodesChange, onEdgesChange } = useMemo(
		() => createControlledFlowHandlers({ setNodes, setEdges }),
		[]
	);

	const courseSlugById = useMemo(
		() => new Map(courses.map((c) => [c.id, c.slug])),
		[courses]
	);

	const courseIconById = useMemo(() => {
		const m = new Map<string, string | null>();
		for (const c of courses) {
			m.set(c.id, c.icon);
		}
		return m;
	}, [courses]);

	const readOnly = data?.graphLocked ?? true;
	const enrichMode = readOnly ? "roadmap" : "builder";

	useEffect(() => {
		if (!data) {
			return;
		}
		const enriched = enrichJourneyGraph({
			nodes: data.graph.nodes as JourneyGraphNodeInput[],
			edges: data.graph.edges as JourneyGraphEdgeInput[],
			nodeProgress: data.nodeProgress,
			courseStats: data.courseStats,
			courseSlugById,
			courseIconById,
			journeyId: data.id,
			mode: enrichMode,
		});
		setNodes(enriched.nodes);
		setEdges(enriched.edges);
		setDirty(false);
	}, [data, courseSlugById, courseIconById, enrichMode]);

	const onSaveLayout = useCallback(async () => {
		if (!data) {
			return;
		}
		setIsSaving(true);
		try {
			const graph = sanitizeJourneyGraphForApi({ nodes, edges });
			await client.journeys.updateGraph({
				journeyId: data.id,
				graph,
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.journeys.getById.key({
					input: { journeyId: data.id },
				}),
			});
			setDirty(false);
		} finally {
			setIsSaving(false);
		}
	}, [data, nodes, edges]);

	const onDelete = useCallback(async () => {
		if (!data) {
			return;
		}
		setIsDeleting(true);
		try {
			await client.journeys.deleteJourney({ journeyId: data.id });
			await queryClient.invalidateQueries({
				queryKey: orpc.journeys.listMine.key(),
			});
			setDeleteOpen(false);
			await navigate({ to: "/journeys" });
		} finally {
			setIsDeleting(false);
		}
	}, [data, navigate]);

	if (isPending) {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="relative flex flex-1 flex-col p-4">
					<Skeleton className="absolute top-4 left-4 z-10 h-16 w-72 rounded-xl" />
					<Skeleton className="min-h-0 flex-1 rounded-none" />
				</div>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 text-center">
				<p className="text-muted-foreground">
					{error instanceof Error ? error.message : "Could not load journey."}
				</p>
				<Button onClick={() => refetch()} type="button" variant="secondary">
					Retry
				</Button>
				<Link
					className={cn(buttonVariants({ variant: "outline" }))}
					to="/journeys"
				>
					Back to journeys
				</Link>
			</div>
		);
	}

	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.08),transparent_55%),linear-gradient(180deg,hsl(var(--muted)/0.35),transparent_40%)]"
			/>
			<motion.div
				animate={{ opacity: 1 }}
				className="relative flex min-h-0 flex-1 flex-col"
				initial={{ opacity: 0 }}
				transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="pointer-events-none absolute top-4 right-4 left-4 z-20 flex flex-wrap items-start justify-between gap-3">
					<div className="pointer-events-auto flex max-w-[min(100%,28rem)] flex-col gap-1 rounded-xl border border-border/60 bg-card/85 px-4 py-3 shadow-sm backdrop-blur-md">
						<Link
							className="text-muted-foreground text-xs hover:underline"
							to="/journeys"
						>
							← All journeys
						</Link>
						<h1 className="font-semibold text-xl tracking-tight sm:text-2xl">
							{data.title}
						</h1>
						{readOnly ? (
							<p className="text-muted-foreground text-xs">
								Plan saved — layout and connections are fixed. Track progress on
								the map.
							</p>
						) : null}
					</div>
					<div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/85 px-3 py-2 shadow-sm backdrop-blur-md">
						{readOnly ? null : (
							<Button
								disabled={!dirty || isSaving}
								onClick={onSaveLayout}
								size="sm"
								type="button"
							>
								{isSaving ? "Saving…" : "Save layout"}
							</Button>
						)}
						<Button
							onClick={() => setDeleteOpen(true)}
							size="sm"
							type="button"
							variant="destructive"
						>
							Delete
						</Button>
					</div>
				</div>

				<AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this journey?</AlertDialogTitle>
							<AlertDialogDescription>
								This removes the journey and your progress on it. This cannot be
								undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={isDeleting} type="button">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								disabled={isDeleting}
								onClick={() => {
									onDelete().catch(() => undefined);
								}}
								type="button"
								variant="destructive"
							>
								{isDeleting ? "Deleting…" : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<div className="relative min-h-0 flex-1">
					<JourneyFlowCanvas
						className="absolute inset-0"
						edges={edges}
						nodes={nodes}
						onEdgesChange={onEdgesChange}
						onGraphDirty={setDirty}
						onNodesChange={onNodesChange}
						readOnly={readOnly}
						setEdges={setEdges}
					/>
				</div>
			</motion.div>
		</div>
	);
};
