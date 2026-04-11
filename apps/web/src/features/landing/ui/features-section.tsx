import { cn } from "@ctl/ui/lib/utils";

import { LANDING_FEATURE_ITEMS } from "../lib/constants";
import { SectionLabel } from "./section-label";

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
				{LANDING_FEATURE_ITEMS.map((feature) => {
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
