import type { CourseListItem } from "@ctl/api/routers/courses/validation";
import { Badge } from "@ctl/ui/components/badge";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
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
		LANGUAGE_ICON_SRC[course.language.id] ??
		course.icon ??
		course.language.icon;

	return (
		<Link
			className={cn(
				"group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/50",
				"bg-card transition-all duration-300",
				"hover:-translate-y-1.5 hover:border-border hover:shadow-black/8 hover:shadow-xl",
				"ring-1 ring-transparent",
				accent.ring,
				"fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
			)}
			params={{ slug: course.slug }}
			style={{ animationDelay: `${index * 10}ms` }}
			to="/courses/$slug"
		>
			{/* Card header with language icon */}
			<div
				className={cn(
					"relative flex h-40 items-center justify-center overflow-hidden",
					`bg-linear-to-br ${accent.from} ${accent.via} to-transparent`
				)}
			>
				{/* Ambient glow blob */}
				<div
					className={cn(
						"absolute size-36 rounded-full opacity-50 blur-3xl transition-opacity duration-300 group-hover:opacity-75",
						accent.glow
					)}
				/>
				{/* Top-right subtle corner accent */}
				<div
					className={cn(
						"absolute top-0 right-0 size-24 rounded-full opacity-20 blur-2xl",
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

				{/* Arrow icon top right */}
				<div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
					<ArrowUpRight className="size-4 text-foreground/50" />
				</div>
			</div>

			{/* Card body */}
			<div className="flex flex-1 flex-col gap-3 p-5">
				<h3 className="font-semibold text-base leading-snug tracking-tight">
					{course.title}
				</h3>

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
