import { Sheet, SheetContent, SheetTrigger } from "@ctl/ui/components/sheet";
import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { LessonSidebar, useCourse } from "@/features/courses";

export const Route = createFileRoute("/courses/$slug/lessons/$lessonSlug")({
	component: LessonLayout,
});

function LessonLayout() {
	const { slug, lessonSlug } = Route.useParams();
	const { data: course } = useCourse(slug);
	const [mobileOpen, setMobileOpen] = useState(false);
	const isTask = useMatch({
		from: "/courses/$slug/lessons/$lessonSlug/task",
		shouldThrow: false,
	});

	return (
		<div className="flex h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden">
			{!isTask && (
				<>
					<div className="hidden lg:flex">
						<LessonSidebar course={course ?? null} lessonSlug={lessonSlug} />
					</div>

					<Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
						<SheetTrigger className="absolute top-20 left-4 z-20 flex size-9 items-center justify-center rounded-md border border-border bg-background shadow-xs hover:bg-muted lg:hidden">
							<Menu className="size-4" />
						</SheetTrigger>
						<SheetContent className="w-80 p-0" side="left">
							<LessonSidebar course={course ?? null} lessonSlug={lessonSlug} />
						</SheetContent>
					</Sheet>
				</>
			)}

			<div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
				<Outlet />
			</div>
		</div>
	);
}
