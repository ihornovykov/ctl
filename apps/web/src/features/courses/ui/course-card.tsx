import type { CourseListItem } from "@ctl/api/routers/courses/validation";
import { Badge } from "@ctl/ui/components/badge";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock } from "lucide-react";
import { LANGUAGE_ICON_SRC } from "@/shared/constants";

import {
	COURSE_CARD_DEFAULT_ACCENT,
	COURSE_CARD_DIFFICULTY_CLASS,
	COURSE_CARD_DIFFICULTY_LABEL,
	COURSE_CARD_LANG_ACCENT,
} from "../lib/constants";

type Props = {
	course: CourseListItem;
	index?: number;
};

export const CourseCard = ({ course, index = 0 }: Props) => {
	const accent =
		COURSE_CARD_LANG_ACCENT[course.language.id] ?? COURSE_CARD_DEFAULT_ACCENT;
	const iconSrc =
		LANGUAGE_ICON_SRC[course.language.id] ?? course.language.icon ?? null;

	return (
		<Link
			className={cn(
				"group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60",
				"bg-card transition-all duration-300",
				"hover:-translate-y-1 hover:border-border hover:shadow-black/10 hover:shadow-xl",
				"ring-1 ring-transparent",
				accent.ring,
				"fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
			)}
			params={{ slug: course.slug }}
			style={{ animationDelay: `${index * 80}ms` }}
			to="/courses/$slug"
		>
			<div
				className={cn(
					"relative flex h-36 items-center justify-center overflow-hidden",
					`bg-linear-to-br ${accent.from} ${accent.via} to-transparent`
				)}
			>
				<div
					className={cn(
						"absolute size-32 rounded-full opacity-60 blur-3xl",
						accent.glow
					)}
				/>
				{iconSrc ? (
					<img
						alt={course.language.name}
						className="relative z-10 size-16 drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
						src={iconSrc}
					/>
				) : (
					<span className="relative z-10 font-bold text-4xl text-foreground/60">
						{course.language.name[0]}
					</span>
				)}
			</div>

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
							COURSE_CARD_DIFFICULTY_CLASS[course.difficulty] ??
								COURSE_CARD_DIFFICULTY_CLASS.beginner
						)}
						variant="outline"
					>
						{COURSE_CARD_DIFFICULTY_LABEL[course.difficulty] ??
							course.difficulty}
					</Badge>

					<span className="flex items-center gap-1 text-muted-foreground text-xs">
						<Clock className="size-3" />
						{course.estimatedHours}h
					</span>
				</div>
			</div>
		</Link>
	);
};
