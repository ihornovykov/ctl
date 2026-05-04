import { Input } from "@ctl/ui/components/input";
import { ScrollArea } from "@ctl/ui/components/scroll-area";
import { cn } from "@ctl/ui/lib/utils";
import type { Node } from "@xyflow/react";
import { BookOpen, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

type CourseItem = {
	id: string;
	title: string;
	slug: string;
	icon?: string | null;
	category?: string;
};

type Props = {
	courses: CourseItem[];
	className?: string;
	onAddCourse: (course: CourseItem) => void;
};

export const CoursePalette = ({ courses, className, onAddCourse }: Props) => {
	const [query, setQuery] = useState("");
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return courses;
		}
		return courses.filter(
			(c) =>
				c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
		);
	}, [courses, query]);

	const byCategory = useMemo(() => {
		const m = new Map<string, CourseItem[]>();
		for (const c of filtered) {
			const key = (c.category?.trim() || "Courses").replace(/\s+/g, " ");
			const list = m.get(key) ?? [];
			list.push(c);
			m.set(key, list);
		}
		return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [filtered]);

	return (
		<div
			className={cn(
				"flex max-h-[min(72vh,640px)] w-full max-w-xs flex-col gap-3 overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-1 shadow-lg ring-1 ring-white/4 backdrop-blur-xl dark:bg-card/70",
				className
			)}
		>
			<div className="flex flex-col gap-0.5 px-3 pt-3 pb-1">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<BookOpen className="size-4" />
						</div>
						<div className="flex flex-col leading-tight">
							<p className="font-semibold text-sm tracking-tight">
								Add courses
							</p>
							<p className="text-[0.65rem] text-muted-foreground tracking-wider">
								Drag onto canvas or tap
							</p>
						</div>
					</div>
					<span className="rounded-full bg-muted/80 px-2 py-0.5 font-medium text-[0.65rem] text-muted-foreground tabular-nums">
						{filtered.length}
					</span>
				</div>
			</div>
			<div className="px-3">
				<div className="relative">
					<Search
						aria-hidden
						className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						className="h-9 border-border/60 bg-background/60 pr-3 pl-8 text-sm shadow-none"
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search courses…"
						value={query}
					/>
				</div>
			</div>
			<ScrollArea className="min-h-0 flex-1 px-2 pb-2">
				<div className="flex flex-col gap-3 pr-1">
					{byCategory.map(([category, items]) => (
						<div className="flex flex-col gap-1" key={category}>
							<p className="px-1.5 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wider">
								{category}
							</p>
							<ul className="flex flex-col gap-0.5">
								{items.map((c) => (
									<li key={c.id}>
										<button
											className={cn(
												"group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition-colors",
												"hover:border-border/60 hover:bg-muted/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
											)}
											onClick={() => onAddCourse(c)}
											type="button"
										>
											<span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80">
												{c.icon ? (
													<img
														alt=""
														className="size-5 object-contain"
														height={20}
														src={c.icon}
														width={20}
													/>
												) : (
													<BookOpen className="size-3.5 text-muted-foreground" />
												)}
											</span>
											<span className="min-w-0 flex-1 truncate text-left text-xs leading-snug">
												{c.title}
											</span>
											<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary opacity-80 transition-opacity group-hover:opacity-100">
												<Plus className="size-3.5" />
											</span>
										</button>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};

export const createCourseNode = (course: CourseItem, index: number): Node => ({
	id: `n-${crypto.randomUUID()}`,
	type: "journeyCourse",
	position: { x: 220 + (index % 4) * 32, y: 100 + index * 36 },
	data: {
		kind: "course",
		label: course.title,
		courseId: course.id,
		courseSlug: course.slug,
		...(typeof course.icon === "string" && course.icon.length > 0
			? { displayIconUrl: course.icon }
			: {}),
	},
});
