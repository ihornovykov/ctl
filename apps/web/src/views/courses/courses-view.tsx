import { CourseList, useCourses } from "@/features/courses";

export const CoursesView = () => {
	const { data: courses } = useCourses();
	const count = courses?.length;
	const countLabel =
		count === undefined
			? "Loading courses…"
			: `${count} ${count === 1 ? "course" : "courses"} available`;

	return (
		<div className="min-h-svh">
			{/* Hero */}
			<div className="relative overflow-hidden border-border/50 border-b">
				{/* Dot grid background */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 opacity-50"
					style={{
						backgroundImage:
							"radial-gradient(circle, hsl(var(--border) / 0.8) 1px, transparent 1px)",
						backgroundSize: "28px 28px",
					}}
				/>
				{/* Gradient overlays */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute inset-0 bg-linear-to-b from-background/20 via-background/60 to-background" />
					<div className="absolute top-0 left-1/4 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[80px]" />
					<div className="absolute top-0 right-1/4 size-72 translate-x-1/2 rounded-full bg-violet-500/8 blur-[60px]" />
					<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
				</div>

				<div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
					<div className="max-w-2xl">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 font-medium text-muted-foreground text-xs tracking-wide backdrop-blur-sm">
							<span className="size-1.5 rounded-full bg-primary/70" />
							Phase 1 — {countLabel}
						</div>
						<h1 className="font-bold text-4xl leading-[1.08] tracking-tight md:text-[3.5rem]">
							Explore Courses
						</h1>
						<p className="mt-5 max-w-lg text-base text-muted-foreground leading-relaxed md:text-lg">
							Hands-on programming courses with real coding tasks, automated
							testing, and AI-powered feedback.
						</p>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<CourseList />
			</div>
		</div>
	);
};
