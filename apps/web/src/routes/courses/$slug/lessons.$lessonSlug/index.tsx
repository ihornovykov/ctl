import { createFileRoute } from "@tanstack/react-router";

import { LessonView } from "@/views/courses";

export const Route = createFileRoute("/courses/$slug/lessons/$lessonSlug/")({
	component: LessonPage,
});

function LessonPage() {
	const { slug, lessonSlug } = Route.useParams();
	return <LessonView courseSlug={slug} lessonSlug={lessonSlug} />;
}
