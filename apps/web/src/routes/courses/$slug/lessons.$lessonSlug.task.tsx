import { createFileRoute } from "@tanstack/react-router";

import { TaskWorkspaceView } from "@/views/courses";

export const Route = createFileRoute("/courses/$slug/lessons/$lessonSlug/task")(
	{
		component: TaskPage,
	}
);

function TaskPage() {
	const { slug, lessonSlug } = Route.useParams();
	return <TaskWorkspaceView courseSlug={slug} lessonSlug={lessonSlug} />;
}
