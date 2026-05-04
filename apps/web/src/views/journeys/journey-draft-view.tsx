import type { CourseListItem } from "@ctl/api/routers/courses/validation";
import { Button } from "@ctl/ui/components/button";
import { Input } from "@ctl/ui/components/input";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Edge, Node } from "@xyflow/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCourses } from "@/features/courses/hooks/use-courses";
import {
	CoursePalette,
	createControlledFlowHandlers,
	createCourseNode,
	DEFAULT_EMPTY_JOURNEY_GRAPH,
	enrichJourneyGraph,
	JourneyFlowCanvas,
	type JourneyGraphEdgeInput,
	type JourneyGraphNodeInput,
	sanitizeJourneyGraphForApi,
} from "@/features/journeys";
import { client, orpc, queryClient } from "@/shared/api";
import {
	type JourneyDraftSnapshot,
	useJourneyDraftStore,
} from "@/shared/stores/journey-draft-store";

const EMPTY_COURSE_LIST: CourseListItem[] = [];

export const startEmptyJourneyDraft = (title: string) => {
	const graph: JourneyDraftSnapshot["graph"] = {
		nodes: DEFAULT_EMPTY_JOURNEY_GRAPH.nodes.map((n) => ({
			...n,
			data: { ...n.data },
		})),
		edges: DEFAULT_EMPTY_JOURNEY_GRAPH.edges.map((e) => ({ ...e })),
	};
	useJourneyDraftStore.getState().setDraft({
		presetId: null,
		title: title.trim() || "My journey",
		graph,
	});
};

export const JourneyDraftView = () => {
	const navigate = useNavigate();
	const draft = useJourneyDraftStore((s) => s.draft);
	const patchGraph = useJourneyDraftStore((s) => s.patchGraph);
	const patchTitle = useJourneyDraftStore((s) => s.patchTitle);
	const clearDraft = useJourneyDraftStore((s) => s.clearDraft);

	const { data: coursesData, isPending: coursesPending } = useCourses();
	const courses = coursesData ?? EMPTY_COURSE_LIST;

	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [isSaving, setIsSaving] = useState(false);

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

	useEffect(() => {
		if (draft) {
			return;
		}
		const t = setTimeout(() => {
			if (!useJourneyDraftStore.getState().draft) {
				navigate({ to: "/journeys" });
			}
		}, 250);
		return () => clearTimeout(t);
	}, [draft, navigate]);

	const coursesReady = !coursesPending && coursesData !== undefined;
	const hasDraft = draft != null;

	useEffect(() => {
		if (!(coursesReady && hasDraft)) {
			return;
		}
		const snap = useJourneyDraftStore.getState().draft;
		if (!snap) {
			return;
		}
		const enriched = enrichJourneyGraph({
			nodes: snap.graph.nodes as JourneyGraphNodeInput[],
			edges: snap.graph.edges as JourneyGraphEdgeInput[],
			nodeProgress: [],
			courseStats: {},
			courseSlugById,
			courseIconById,
			journeyId: "draft",
			mode: "builder",
		});
		setNodes(enriched.nodes);
		setEdges(enriched.edges);
	}, [coursesReady, hasDraft, courseSlugById, courseIconById]);

	useEffect(() => {
		if (!draft) {
			return;
		}
		const graph = sanitizeJourneyGraphForApi({ nodes, edges });
		const t = setTimeout(() => {
			patchGraph(graph);
		}, 400);
		return () => clearTimeout(t);
	}, [nodes, edges, draft, patchGraph]);

	const onAddCourse = useCallback(
		(course: {
			id: string;
			title: string;
			slug: string;
			icon?: string | null;
		}) => {
			setNodes((prev) => [...prev, createCourseNode(course, prev.length)]);
		},
		[]
	);

	const onCommit = useCallback(async () => {
		const snap = useJourneyDraftStore.getState().draft;
		if (!snap) {
			return;
		}
		setIsSaving(true);
		try {
			const graph = sanitizeJourneyGraphForApi({ nodes, edges });
			const created = await client.journeys.commitJourneyPlan({
				title: snap.title.trim() || "My journey",
				presetId: snap.presetId,
				graph,
			});
			clearDraft();
			await queryClient.invalidateQueries({
				queryKey: orpc.journeys.listMine.key(),
			});
			await navigate({
				to: "/journeys/$journeyId",
				params: { journeyId: created.id },
			});
		} finally {
			setIsSaving(false);
		}
	}, [clearDraft, navigate, nodes, edges]);

	const onDiscard = useCallback(() => {
		clearDraft();
		navigate({ to: "/journeys" });
	}, [clearDraft, navigate]);

	if (!draft && coursesPending) {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="relative flex flex-1 flex-col p-4">
					<Skeleton className="absolute top-4 left-4 z-10 h-16 w-72 rounded-xl" />
					<Skeleton className="min-h-0 flex-1 rounded-none" />
				</div>
			</div>
		);
	}

	if (!draft) {
		return null;
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
					<CoursePalette
						className="pointer-events-auto max-h-full"
						courses={courses}
						onAddCourse={onAddCourse}
					/>

					<div className="pointer-events-auto flex max-w-[min(100%,30rem)] flex-col gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 shadow-lg ring-1 ring-white/4 backdrop-blur-xl dark:bg-card/70">
						<Link
							className="group inline-flex w-fit items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
							to="/journeys"
						>
							<ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
							All journeys
						</Link>
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center gap-2 text-muted-foreground text-xs tracking-wider">
								<Sparkles className="size-3" />
								<span>Journey name</span>
							</div>
							<Input
								className="h-11 border-border/60 bg-background/70 font-semibold text-base shadow-none"
								onChange={(e) => patchTitle(e.target.value)}
								placeholder="Name your learning path"
								value={draft.title}
							/>
						</div>
						<div className="rounded-xl border border-primary/15 bg-primary/6 px-3 py-2.5">
							<p className="text-muted-foreground text-xs leading-relaxed">
								<span className="font-medium text-foreground/90">
									Local draft.
								</span>{" "}
								It stays on this device until you save. After saving, the graph
								is locked and cannot be rearranged.
							</p>
						</div>
						<div className="pointer-events-auto mt-1 flex flex-wrap items-center gap-1 self-end rounded-lg">
							<Button
								className="px-4"
								disabled={isSaving}
								onClick={onDiscard}
								size="sm"
								type="button"
								variant="ghost"
							>
								Discard
							</Button>
							<Button
								className="px-4 shadow-sm"
								disabled={isSaving}
								onClick={onCommit}
								size="sm"
								type="button"
							>
								{isSaving ? "Saving…" : "Save plan"}
							</Button>
						</div>
					</div>
				</div>

				<div className="relative min-h-0 flex-1">
					{coursesPending ? (
						<div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
							Loading courses…
						</div>
					) : (
						<JourneyFlowCanvas
							className="absolute inset-0"
							edges={edges}
							nodes={nodes}
							onEdgesChange={onEdgesChange}
							onNodesChange={onNodesChange}
							readOnly={false}
							setEdges={setEdges}
						/>
					)}
				</div>
			</motion.div>
		</div>
	);
};
