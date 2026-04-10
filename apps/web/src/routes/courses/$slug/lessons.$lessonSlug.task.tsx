import { createFileRoute } from "@tanstack/react-router";

import { useLesson } from "@/features/courses";
import { isMockSandboxLesson } from "@/features/sandbox";
import { SandboxWorkspaceView, TaskWorkspaceView } from "@/views/courses";

export const Route = createFileRoute("/courses/$slug/lessons/$lessonSlug/task")(
	{
		component: TaskPage,
	}
);

function TaskPage() {
	const { slug, lessonSlug } = Route.useParams();
	return <TaskWorkspaceRouter courseSlug={slug} lessonSlug={lessonSlug} />;
}

type Props = {
	courseSlug: string;
	lessonSlug: string;
};

const TaskWorkspaceRouter = ({ courseSlug, lessonSlug }: Props) => {
	const { data: lesson, isPending: lessonPending } = useLesson(
		courseSlug,
		lessonSlug
	);

	if (lessonPending || !lesson) {
		return (
			<TaskWorkspaceView courseSlug={courseSlug} lessonSlug={lessonSlug} />
		);
	}

	if (isMockSandboxLesson(courseSlug, lessonSlug)) {
		return (
			<SandboxWorkspaceView courseSlug={courseSlug} lessonSlug={lessonSlug} />
		);
	}

	return <TaskWorkspaceView courseSlug={courseSlug} lessonSlug={lessonSlug} />;
};
