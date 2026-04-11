export const DASHBOARD_SHORT_MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

export const DASHBOARD_ENROLLMENT_DIFFICULTY_CONFIG: Record<
	string,
	{ label: string; className: string }
> = {
	beginner: {
		label: "Beginner",
		className:
			"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
	},
	intermediate: {
		label: "Intermediate",
		className:
			"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
	},
	advanced: {
		label: "Advanced",
		className:
			"bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
	},
};

export const DASHBOARD_ENROLLMENT_LANG_PROGRESS_COLOR: Record<string, string> =
	{
		javascript: "bg-amber-400",
		typescript: "bg-blue-500",
		go: "bg-cyan-400",
		python: "bg-green-400",
		c: "bg-slate-400",
		cpp: "bg-violet-500",
		react: "bg-sky-500",
		vue: "bg-emerald-500",
	};

export const DASHBOARD_CHART_LANG_COLOR: Record<string, string> = {
	javascript: "#f59e0b",
	typescript: "#3b82f6",
	go: "#06b6d4",
	python: "#22c55e",
	c: "#94a3b8",
	cpp: "#8b5cf6",
	react: "#0ea5e9",
	vue: "#10b981",
};

export const DASHBOARD_CHART_DEFAULT_COLOR = "#0891b2";
