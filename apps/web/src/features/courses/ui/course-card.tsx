import type { CourseListItem } from "@ctl/api/routers/courses/validation";
import { Badge } from "@ctl/ui/components/badge";
import { cn } from "@ctl/ui/lib/utils";
import { ChevronRight, Clock } from "lucide-react";

const DIFFICULTY_LABEL: Record<string, string> = {
	beginner: "Beginner",
	intermediate: "Intermediate",
	advanced: "Advanced",
};

const DIFFICULTY_CLASS: Record<string, string> = {
	beginner:
		"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
	intermediate:
		"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
	advanced:
		"bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25",
};

const LANG_ACCENT: Record<
	string,
	{ from: string; via: string; ring: string; glow: string }
> = {
	javascript: {
		from: "from-amber-400/20",
		via: "via-yellow-300/10",
		ring: "group-hover:ring-amber-400/40",
		glow: "bg-amber-400/20",
	},
	typescript: {
		from: "from-blue-500/20",
		via: "via-sky-400/10",
		ring: "group-hover:ring-blue-500/40",
		glow: "bg-blue-500/20",
	},
	go: {
		from: "from-cyan-400/20",
		via: "via-teal-300/10",
		ring: "group-hover:ring-cyan-400/40",
		glow: "bg-cyan-400/20",
	},
	python: {
		from: "from-green-400/20",
		via: "via-lime-300/10",
		ring: "group-hover:ring-green-400/40",
		glow: "bg-green-400/20",
	},
	c: {
		from: "from-slate-400/20",
		via: "via-zinc-300/10",
		ring: "group-hover:ring-slate-400/40",
		glow: "bg-slate-400/20",
	},
	cpp: {
		from: "from-violet-500/20",
		via: "via-purple-400/10",
		ring: "group-hover:ring-violet-500/40",
		glow: "bg-violet-500/20",
	},
};

const DEFAULT_ACCENT = {
	from: "from-primary/20",
	via: "via-primary/10",
	ring: "group-hover:ring-primary/40",
	glow: "bg-primary/20",
};

type Props = {
	course: CourseListItem;
	index?: number;
};

export const CourseCard = ({ course, index = 0 }: Props) => {
	const accent = LANG_ACCENT[course.language.id] ?? DEFAULT_ACCENT;

	return (
		<div
			className={cn(
				"group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60",
				"bg-card transition-all duration-300",
				"hover:-translate-y-1 hover:border-border hover:shadow-black/10 hover:shadow-xl",
				"ring-1 ring-transparent",
				accent.ring,
				"fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
			)}
			style={{ animationDelay: `${index * 80}ms` }}
		>
			{/* Gradient header zone */}
			<div
				className={cn(
					"relative flex h-36 items-center justify-center overflow-hidden",
					`bg-linear-to-br ${accent.from} ${accent.via} to-transparent`
				)}
			>
				{/* Glow blob */}
				<div
					className={cn(
						"absolute size-32 rounded-full opacity-60 blur-3xl",
						accent.glow
					)}
				/>
				{/* Language icon */}
				{course.language.icon ? (
					<img
						alt={course.language.name}
						className="relative z-10 size-16 drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
						src={course.language.icon}
					/>
				) : (
					<span className="relative z-10 font-bold text-4xl text-foreground/60">
						{course.language.name[0]}
					</span>
				)}
			</div>

			{/* Body */}
			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex items-start justify-between gap-2">
					<h3 className="font-semibold text-base leading-snug tracking-tight">
						{course.title}
					</h3>
					<ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
				</div>

				<p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
					{course.shortDescription}
				</p>

				<div className="mt-auto flex items-center justify-between pt-2">
					<Badge
						className={cn(
							"border font-medium text-xs",
							DIFFICULTY_CLASS[course.difficulty] ?? DIFFICULTY_CLASS.beginner
						)}
						variant="outline"
					>
						{DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
					</Badge>

					<span className="flex items-center gap-1 text-muted-foreground text-xs">
						<Clock className="size-3" />
						{course.estimatedHours}h
					</span>
				</div>
			</div>
		</div>
	);
};
