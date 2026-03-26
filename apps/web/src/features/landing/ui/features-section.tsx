import { cn } from "@ctl/ui/lib/utils";
import { Brain, FlaskConical, Globe, Layers, Zap } from "lucide-react";

import { SectionLabel } from "./section-label";

const FEATURES = [
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

export const FeaturesSection = () => (
	<section className="py-20">
		<div className="mx-auto max-w-6xl px-4 sm:px-6">
			<SectionLabel>Features</SectionLabel>
			<h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl">
				Everything you need to level up
			</h2>
			<p className="mt-4 max-w-xl text-muted-foreground">
				A complete learning loop — read, code, test, get AI feedback, repeat.
			</p>

			<div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map((feature) => {
					const Icon = feature.icon;
					return (
						<div
							className="group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-6 transition-all duration-200 hover:border-border hover:bg-card"
							key={feature.title}
						>
							<div
								className={cn(
									"flex h-10 w-10 items-center justify-center rounded-lg",
									feature.accentBg
								)}
							>
								<Icon className={cn("h-5 w-5", feature.accent)} />
							</div>
							<div className="flex flex-col gap-2">
								<h3 className="font-semibold">{feature.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	</section>
);
