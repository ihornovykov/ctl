import type { LucideIcon } from "lucide-react";
import { BookOpen, GraduationCap, Zap } from "lucide-react";

export const FRAMEWORK_LANGUAGE_IDS = new Set(["react", "vue"]);

export const COURSE_LIST_SECTION_HEADING_CLASS =
	"mb-6 font-semibold text-muted-foreground text-md uppercase tracking-widest";

export const COURSE_CARD_DIFFICULTY_LABEL: Record<string, string> = {
	beginner: "Beginner",
	intermediate: "Intermediate",
	advanced: "Advanced",
};

export const COURSE_CARD_DIFFICULTY_CLASS: Record<string, string> = {
	beginner:
		"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
	intermediate:
		"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
	advanced:
		"bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25",
};

export type CourseCardLanguageAccent = {
	from: string;
	via: string;
	ring: string;
	glow: string;
};

export const COURSE_CARD_LANG_ACCENT: Record<string, CourseCardLanguageAccent> =
	{
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
		react: {
			from: "from-sky-500/20",
			via: "via-cyan-400/10",
			ring: "group-hover:ring-sky-500/40",
			glow: "bg-sky-500/20",
		},
		vue: {
			from: "from-emerald-500/20",
			via: "via-green-400/10",
			ring: "group-hover:ring-emerald-500/40",
			glow: "bg-emerald-500/20",
		},
	};

export const COURSE_CARD_DEFAULT_ACCENT: CourseCardLanguageAccent = {
	from: "from-primary/20",
	via: "via-primary/10",
	ring: "group-hover:ring-primary/40",
	glow: "bg-primary/20",
};

export const COURSE_DETAIL_DIFFICULTY_CONFIG: Record<
	string,
	{ label: string; className: string; icon: LucideIcon }
> = {
	beginner: {
		label: "Beginner",
		className:
			"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
		icon: BookOpen,
	},
	intermediate: {
		label: "Intermediate",
		className:
			"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
		icon: Zap,
	},
	advanced: {
		label: "Advanced",
		className:
			"bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
		icon: GraduationCap,
	},
};

export type CourseDetailLanguageAccent = {
	from: string;
	via: string;
	glow: string;
	progressColor: string;
	ring: string;
};

export const COURSE_DETAIL_LANG_ACCENT: Record<
	string,
	CourseDetailLanguageAccent
> = {
	javascript: {
		from: "from-amber-400/25",
		via: "via-yellow-300/15",
		glow: "bg-amber-400/30",
		progressColor: "bg-amber-400",
		ring: "ring-amber-400/20",
	},
	typescript: {
		from: "from-blue-500/25",
		via: "via-sky-400/15",
		glow: "bg-blue-500/30",
		progressColor: "bg-blue-500",
		ring: "ring-blue-500/20",
	},
	go: {
		from: "from-cyan-400/25",
		via: "via-teal-300/15",
		glow: "bg-cyan-400/30",
		progressColor: "bg-cyan-400",
		ring: "ring-cyan-400/20",
	},
	python: {
		from: "from-green-400/25",
		via: "via-lime-300/15",
		glow: "bg-green-400/30",
		progressColor: "bg-green-400",
		ring: "ring-green-400/20",
	},
	c: {
		from: "from-slate-400/25",
		via: "via-zinc-300/15",
		glow: "bg-slate-400/30",
		progressColor: "bg-slate-400",
		ring: "ring-slate-400/20",
	},
	cpp: {
		from: "from-violet-500/25",
		via: "via-purple-400/15",
		glow: "bg-violet-500/30",
		progressColor: "bg-violet-500",
		ring: "ring-violet-500/20",
	},
	react: {
		from: "from-sky-500/25",
		via: "via-cyan-400/15",
		glow: "bg-sky-500/30",
		progressColor: "bg-sky-500",
		ring: "ring-sky-500/20",
	},
	vue: {
		from: "from-emerald-500/25",
		via: "via-green-400/15",
		glow: "bg-emerald-500/30",
		progressColor: "bg-emerald-500",
		ring: "ring-emerald-500/20",
	},
};

export const COURSE_DETAIL_DEFAULT_ACCENT: CourseDetailLanguageAccent = {
	from: "from-primary/25",
	via: "via-primary/15",
	glow: "bg-primary/30",
	progressColor: "bg-primary",
	ring: "ring-primary/20",
};
