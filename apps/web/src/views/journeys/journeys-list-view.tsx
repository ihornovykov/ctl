import { Badge } from "@ctl/ui/components/badge";
import { Button } from "@ctl/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ctl/ui/components/dialog";
import { Input } from "@ctl/ui/components/input";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, MapPinned, Plus, Route } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { match } from "ts-pattern";

import { useJourneyPresets, useJourneysList } from "@/features/journeys";
import { client } from "@/shared/api";
import {
	type JourneyDraftSnapshot,
	useJourneyDraftStore,
} from "@/shared/stores/journey-draft-store";
import { startEmptyJourneyDraft } from "./journey-draft-view";

type YourJourneyRow = {
	id: string;
	title: string;
	updatedAt: Date;
	presetId: string | null;
};

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

const stagger = (i: number) => ({
	initial: { opacity: 0, y: 14 },
	animate: { opacity: 1, y: 0 },
	transition: {
		duration: 0.38,
		delay: i * 0.06,
		ease: [0.22, 1, 0.36, 1] as const,
	},
});

type PresetCardProps = {
	title: string;
	description: string;
	slug: string;
	index: number;
	creating: boolean;
	onStart: (slug: string) => void;
};

const PresetCard = ({
	title,
	description,
	slug,
	index,
	creating,
	onStart,
}: PresetCardProps) => (
	<motion.div {...stagger(index + 2)}>
		<div className="group relative flex items-start gap-5 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_4px_24px_-6px_color-mix(in_oklch,var(--primary)_20%,transparent)]">
			<div className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-primary opacity-60 transition-opacity group-hover:opacity-100" />

			<div className="mt-0.5 ml-3 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted">
				<Route className="size-5 text-primary" />
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div>
					<h3 className="font-semibold text-base leading-snug">{title}</h3>
					<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
						{description}
					</p>
				</div>
				<div>
					<Button
						className="h-8 rounded-lg px-3 text-xs"
						disabled={creating}
						onClick={() => onStart(slug)}
						size="sm"
						type="button"
						variant="secondary"
					>
						{creating ? "Starting…" : "Use this preset →"}
					</Button>
				</div>
			</div>
		</div>
	</motion.div>
);

type JourneyRowProps = {
	journey: YourJourneyRow;
	index: number;
};

const JourneyRow = ({ journey: j, index }: JourneyRowProps) => (
	<motion.li {...stagger(index + 2)}>
		<Link
			className="block focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			params={{ journeyId: j.id }}
			to="/journeys/$journeyId"
		>
			<div className="group flex items-center gap-4 rounded-xl border border-transparent bg-muted/40 px-4 py-3.5 transition-all duration-200 hover:border-border/70 hover:bg-card hover:shadow-sm">
				<div className="flex size-5 shrink-0 items-center justify-center">
					<div className="size-2 rounded-full bg-primary ring-[3px] ring-primary/20 transition-all group-hover:ring-primary/35" />
				</div>

				<span className="min-w-0 flex-1 truncate font-medium text-sm">
					{j.title}
				</span>

				<span className="hidden shrink-0 text-muted-foreground text-xs sm:block">
					{fmt.format(new Date(j.updatedAt))}
				</span>

				<Badge className="hidden shrink-0 text-xs sm:flex" variant="secondary">
					{j.presetId ? "Preset" : "Custom"}
				</Badge>

				<ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
			</div>
		</Link>
	</motion.li>
);

const ChapterLabel = ({ num, label }: { num: string; label: string }) => (
	<div className="flex items-baseline gap-3 border-border/40 border-b pb-3">
		<span className="select-none font-mono text-[11px] text-muted-foreground/40 tabular-nums">
			{num}
		</span>
		<span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
			{label}
		</span>
	</div>
);

export const JourneysListView = () => {
	const navigate = useNavigate();
	const { data: mine, isPending: minePending } = useJourneysList();
	const { data: presets, isPending: presetsPending } = useJourneyPresets();
	const [title, setTitle] = useState("");
	const [open, setOpen] = useState(false);
	const [creating, setCreating] = useState(false);

	const onCreateEmpty = async () => {
		const t = title.trim() || "My journey";
		setCreating(true);
		try {
			startEmptyJourneyDraft(t);
			setOpen(false);
			setTitle("");
			await navigate({ to: "/journeys/draft" });
		} finally {
			setCreating(false);
		}
	};

	const onFromPreset = async (slug: string) => {
		setCreating(true);
		try {
			const res = await client.journeys.getPresetGraph({ presetSlug: slug });
			const graph: JourneyDraftSnapshot["graph"] = {
				nodes: res.graph.nodes.map((n) => ({
					...n,
					data: { ...(n.data as Record<string, unknown>) },
				})),
				edges: res.graph.edges.map((e) => ({ ...e })),
			};
			useJourneyDraftStore.getState().setDraft({
				presetId: res.presetId,
				title: res.defaultTitle,
				graph,
			});
			await navigate({ to: "/journeys/draft" });
		} finally {
			setCreating(false);
		}
	};

	const count = mine?.length ?? 0;

	const presetsSectionState = (() => {
		if (presetsPending) {
			return "pending" as const;
		}
		if ((presets?.length ?? 0) > 0) {
			return "grid" as const;
		}
		return "empty" as const;
	})();

	const mineSectionState = (() => {
		if (minePending) {
			return "pending" as const;
		}
		if ((mine?.length ?? 0) > 0) {
			return "list" as const;
		}
		return "empty" as const;
	})();

	return (
		<div className="flex flex-1 flex-col">
			<div className="relative overflow-hidden border-border/50 border-b bg-background">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
						backgroundSize: "60px 60px",
						opacity: 0.25,
						maskImage:
							"radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)",
					}}
				/>

				<div
					aria-hidden
					className="pointer-events-none absolute top-0 left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-full blur-[100px]"
					style={{
						background: "color-mix(in oklch, var(--primary) 8%, transparent)",
					}}
				/>

				<div className="relative mx-auto max-w-6xl px-4 sm:px-6">
					<div className="flex items-center justify-between border-border/30 border-b py-3">
						<span className="select-none font-mono text-muted-foreground/50 text-xs uppercase tracking-widest">
							codelearn / journeys
						</span>
						<Button
							className="h-8 gap-1.5 rounded-lg px-3 text-xs"
							onClick={() => setOpen(true)}
							size="sm"
							type="button"
						>
							<Plus className="size-3.5" />
							New journey
						</Button>
					</div>

					<div className="flex flex-col gap-8 pt-10 pb-14 sm:flex-row sm:items-end sm:justify-between sm:pt-14 sm:pb-16">
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-col gap-4"
							initial={{ opacity: 0, y: 16 }}
							transition={{
								duration: 0.5,
								ease: [0.22, 1, 0.36, 1] as const,
							}}
						>
							<div className="flex items-center gap-2.5">
								<div className="flex size-6 items-center justify-center rounded-md bg-primary">
									<MapPinned className="size-3.5 text-primary-foreground" />
								</div>
								<span className="font-medium text-muted-foreground text-xs tracking-wide">
									Paths & Roadmaps
								</span>
							</div>

							<h1 className="font-black text-[clamp(2rem,5vw,3.75rem)] leading-[0.95] tracking-tight">
								Learning
								<br />
								<span className="text-primary">Journeys</span>
							</h1>

							<p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
								Build structured paths through courses, or start from a curated
								preset and track every step of your progress.
							</p>
						</motion.div>

						<motion.div
							animate={{ opacity: 1 }}
							className="hidden select-none flex-col items-end sm:flex"
							initial={{ opacity: 0 }}
							transition={{ duration: 0.6, delay: 0.15 }}
						>
							<div
								className="font-black tabular-nums leading-none"
								style={{
									fontSize: "clamp(4rem, 9vw, 7rem)",
									color: "color-mix(in oklch, var(--border) 90%, transparent)",
								}}
							>
								{String(count).padStart(2, "0")}
							</div>
							<span className="font-mono text-[11px] text-muted-foreground/40 uppercase tracking-widest">
								saved paths
							</span>
						</motion.div>
					</div>
				</div>
			</div>

			<div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
				<div className="flex flex-col gap-14">
					<section className="flex flex-col gap-5">
						<motion.div {...stagger(0)}>
							<ChapterLabel label="Preset roadmaps" num="01" />
						</motion.div>

						{match(presetsSectionState)
							.with("pending", () => (
								<div className="grid gap-4 sm:grid-cols-2">
									<Skeleton className="h-36 rounded-2xl" />
									<Skeleton className="h-36 rounded-2xl" />
								</div>
							))
							.with("grid", () => (
								<div className="grid gap-4 sm:grid-cols-2">
									{(presets ?? []).map((p, i) => (
										<PresetCard
											creating={creating}
											description={p.description}
											index={i}
											key={p.id}
											onStart={onFromPreset}
											slug={p.slug}
											title={p.title}
										/>
									))}
								</div>
							))
							.with("empty", () => (
								<p className="text-muted-foreground text-sm">
									No presets available.
								</p>
							))
							.exhaustive()}
					</section>

					<section className="flex flex-col gap-5">
						<motion.div {...stagger(0)}>
							<ChapterLabel label="Your paths" num="02" />
						</motion.div>

						{match(mineSectionState)
							.with("pending", () => (
								<div className="flex flex-col gap-2">
									<Skeleton className="h-12 rounded-xl" />
									<Skeleton className="h-12 rounded-xl" />
									<Skeleton className="h-12 rounded-xl" />
								</div>
							))
							.with("list", () => (
								<ul className="flex flex-col gap-1.5">
									{(mine ?? []).map((j, i) => (
										<JourneyRow index={i} journey={j} key={j.id} />
									))}
								</ul>
							))
							.with("empty", () => (
								<motion.div {...stagger(2)}>
									<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 border-dashed py-14 text-center">
										<div className="flex size-12 items-center justify-center rounded-full border-2 border-border/50 border-dashed">
											<MapPinned className="size-5 text-muted-foreground/50" />
										</div>
										<div className="flex flex-col gap-1">
											<p className="font-medium text-sm">No paths yet</p>
											<p className="text-muted-foreground text-xs">
												Create one above or start from a preset.
											</p>
										</div>
									</div>
								</motion.div>
							))
							.exhaustive()}
					</section>
				</div>
			</div>

			<Dialog onOpenChange={setOpen} open={open}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Name your journey</DialogTitle>
					</DialogHeader>
					<Input
						onChange={(e) => setTitle(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								onCreateEmpty();
							}
						}}
						placeholder="e.g. My 2026 frontend plan"
						value={title}
					/>
					<DialogFooter>
						<Button disabled={creating} onClick={onCreateEmpty} type="button">
							{creating ? "Creating…" : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
