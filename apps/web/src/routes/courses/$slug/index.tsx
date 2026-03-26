import { createFileRoute } from "@tanstack/react-router";

import { CourseDetailView } from "@/views/courses";

export const Route = createFileRoute("/courses/$slug/")({
	component: CourseDetailPage,
});

function CourseDetailPage() {
	const { slug } = Route.useParams();
	return <CourseDetailView slug={slug} />;
}
