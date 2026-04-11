import {
	Brain,
	Code2,
	FlaskConical,
	Globe,
	Layers,
	Sparkles,
	Terminal,
	Zap,
} from "lucide-react";

export const LANDING_TECH_TILE_LANGUAGES = [
	{ name: "JavaScript", src: "/icons/languages/javascript.svg", wide: false },
	{ name: "TypeScript", src: "/icons/languages/typescript.svg", wide: false },
	{ name: "Python", src: "/icons/languages/python.svg", wide: false },
	{ name: "Go", src: "/icons/languages/go.svg", wide: false },
	{ name: "C", src: "/icons/languages/c.svg", wide: false },
	{ name: "C++", src: "/icons/languages/cplusplus.svg", wide: false },
] as const;

export const LANDING_TECH_TILE_FRAMEWORKS = [
	{ name: "React", src: "/icons/languages/react.svg", wide: false },
	{ name: "Vue", src: "/icons/languages/vue.svg", wide: false },
] as const;

export type LandingTechTile =
	| (typeof LANDING_TECH_TILE_LANGUAGES)[number]
	| (typeof LANDING_TECH_TILE_FRAMEWORKS)[number];

export const LANDING_FEATURE_ITEMS = [
	{
		icon: Brain,
		title: "AI Code Review",
		description:
			"Submit your solution and get an instant AI analysis — what's good, what to improve, and a score based on predefined criteria stored per task.",
		accent: "text-purple-400",
		accentBg: "bg-purple-400/10",
	},
	{
		icon: FlaskConical,
		title: "Auto-tests",
		description:
			"Every task has automated tests. Run them before submitting — submit is only unlocked when all tests pass.",
		accent: "text-green-400",
		accentBg: "bg-green-400/10",
	},
	{
		icon: Zap,
		title: "Instant execution",
		description:
			"Run your code in a sandboxed environment directly in the browser. See stdout/stderr results immediately.",
		accent: "text-yellow-400",
		accentBg: "bg-yellow-400/10",
	},
	{
		icon: Layers,
		title: "Structured curriculum",
		description:
			"Courses are broken into topics with reading material and hands-on tasks. Progress is tracked automatically.",
		accent: "text-blue-400",
		accentBg: "bg-blue-400/10",
	},
	{
		icon: Globe,
		title: "Multi-language",
		description:
			"Switch between languages seamlessly. The platform is designed to grow — new languages can be added without code changes.",
		accent: "text-cyan-400",
		accentBg: "bg-cyan-400/10",
	},
] as const;

export const LANDING_HOW_IT_WORKS_STEPS = [
	{
		number: "01",
		icon: Code2,
		title: "Pick a course",
		description:
			"Browse courses by language. Each course has structured topics with reading material and coding tasks.",
	},
	{
		number: "02",
		icon: Terminal,
		title: "Solve tasks",
		description:
			"Write code in the built-in editor. Run it, fix it, then run auto-tests until everything passes.",
	},
	{
		number: "03",
		icon: Sparkles,
		title: "Get AI feedback",
		description:
			"Submit your passing solution. AI reviews your code, highlights strengths, suggests improvements, and assigns a score.",
	},
] as const;
