import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { CourseDetailView } from "@/views/courses";

export const Route = createFileRoute("/courses/$slug")({
	component: CourseDetailPage,
	beforeLoad: async () => {
		const session = await getUser();
		if (!session) {
			throw redirect({ to: "/auth/sign-in" });
		}
		return { session };
	},
});

function CourseDetailPage() {
	const { slug } = Route.useParams();
	return <CourseDetailView slug={slug} />;
}
