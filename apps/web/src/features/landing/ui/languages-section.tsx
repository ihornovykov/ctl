import { cn } from "@ctl/ui/lib/utils";

import { SectionLabel } from "./section-label";

const LANGUAGES = [
	{ name: "JavaScript", src: "/icons/languages/javascript.svg", wide: false },
	{ name: "TypeScript", src: "/icons/languages/typescript.svg", wide: false },
	{ name: "Python", src: "/icons/languages/python.svg", wide: false },
	{ name: "Go", src: "/icons/languages/go.svg", wide: true },
	{ name: "C", src: "/icons/languages/c.svg", wide: false },
	{ name: "C++", src: "/icons/languages/cplusplus.svg", wide: false },
] as const;

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

			<div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
				{LANGUAGES.map(({ name, src, wide }) => (
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
		</div>
	</section>
);
