import { Code2, Sparkles, Terminal } from "lucide-react";
import { Fragment } from "react";

import { SectionLabel } from "./section-label";

const STEPS = [
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

export const HowItWorksSection = () => (
	<section className="border-border/40 border-t bg-card/20 py-20">
		<div className="mx-auto max-w-6xl px-4 sm:px-6">
			<SectionLabel>How it works</SectionLabel>
			<h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl">
				Three steps to better code
			</h2>

			<div className="mt-12">
				{/* Desktop: icon row with connectors between circles */}
				<div className="mb-6 hidden items-center sm:flex">
					{STEPS.map((step, index) => {
						const Icon = step.icon;
						return (
							<Fragment key={step.number}>
								<div className="flex shrink-0 items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
										<Icon className="h-4 w-4 text-primary" />
									</div>
									<span className="font-bold font-mono text-3xl text-muted-foreground/30">
										{step.number}
									</span>
								</div>
								{index < STEPS.length - 1 && (
									<div className="mx-4 flex-1 border-border/40 border-t border-dashed" />
								)}
							</Fragment>
						);
					})}
				</div>

				{/* Cards */}
				<div className="grid gap-4 sm:grid-cols-3">
					{STEPS.map((step) => {
						const Icon = step.icon;
						return (
							<div
								className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-5"
								key={step.number}
							>
								{/* Mobile only: icon + number inside card */}
								<div className="mb-1 flex items-center gap-3 sm:hidden">
									<div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
										<Icon className="h-3.5 w-3.5 text-primary" />
									</div>
									<span className="font-bold font-mono text-2xl text-muted-foreground/30">
										{step.number}
									</span>
								</div>
								<h3 className="font-semibold">{step.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{step.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	</section>
);
