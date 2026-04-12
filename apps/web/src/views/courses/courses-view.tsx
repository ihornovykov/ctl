import { CourseList } from "@/features/courses";

export const CoursesView = () => (
	<div className="min-h-svh">
		<div className="relative overflow-hidden border-border/50 border-b py-16 md:py-20">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 left-1/4 size-96 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
				<div className="absolute top-0 right-1/4 size-80 translate-x-1/2 rounded-full bg-violet-500/6 blur-3xl" />
				<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
			</div>

			<div className="relative mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<div className="mb-4 inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 font-medium text-muted-foreground text-xs tracking-wide">
						Phase 1 — 6 courses available
					</div>
					<h1 className="font-bold text-4xl tracking-tight md:text-5xl">
						Explore Courses
					</h1>
					<p className="mt-4 max-w-lg text-lg text-muted-foreground leading-relaxed">
						Hands-on programming courses with real coding tasks, automated
						testing, and AI-powered feedback.
					</p>
				</div>
			</div>
		</div>

		<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
			<CourseList />
		</div>
	</div>
);
