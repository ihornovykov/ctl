import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { CoursesView } from "@/views/courses";

export const Route = createFileRoute("/courses/")({
	component: CoursesView,
	beforeLoad: async () => {
		const session = await getUser();
		if (!session) {
			throw redirect({ to: "/auth/sign-in" });
		}
		return { session };
	},
});
