import { cn } from "@ctl/ui/lib/utils";

import {
	LANDING_TECH_TILE_FRAMEWORKS,
	LANDING_TECH_TILE_LANGUAGES,
	type LandingTechTile,
} from "../lib/constants";
import { SectionLabel } from "./section-label";

const TechTileGrid = ({
	items,
	className,
}: {
	items: readonly LandingTechTile[];
	className: string;
}) => (
	<div className={className}>
		{items.map(({ name, src, wide }) => (
			<div
				className="group flex cursor-default flex-col items-center gap-3 rounded-xl border border-border/30 bg-card/30 p-5 transition-all duration-200 hover:scale-105 hover:border-border/60 hover:bg-card/60 hover:shadow-lg"
				key={name}
			>
				<div className="flex h-12 w-full items-center justify-center">
					<img
						alt={name}
						className={cn(
							"max-h-10 object-contain",
							wide ? "h-7 w-auto" : "h-10 w-10"
						)}
						src={src}
					/>
				</div>
				<span className="font-medium text-sm">{name}</span>
			</div>
		))}
	</div>
);

export const LanguagesSection = () => (
	<section className="border-border/40 border-t bg-card/20 py-20">
		<div className="mx-auto max-w-6xl px-4 sm:px-6">
			<SectionLabel>Languages</SectionLabel>
			<h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl">
				Pick your language, start coding
			</h2>
			<p className="mt-4 max-w-xl text-muted-foreground">
				All courses are built around a specific language. More languages are
				added regularly — the list grows with the platform.
			</p>

			<TechTileGrid
				className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
				items={LANDING_TECH_TILE_LANGUAGES}
			/>

			<div className="mt-20">
				<SectionLabel>Frameworks</SectionLabel>
				<h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl">
					Real projects in the browser
				</h2>
				<p className="mt-4 max-w-xl text-muted-foreground">
					Work in live sandboxes with hot reload, tests, and preview — the same
					tooling you use on real products.
				</p>
				<TechTileGrid
					className="mx-auto mt-12 grid max-w-lg grid-cols-2 gap-4 sm:max-w-xl"
					items={LANDING_TECH_TILE_FRAMEWORKS}
				/>
			</div>
		</div>
	</section>
);
