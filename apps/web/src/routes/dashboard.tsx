import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { DashboardView } from "@/views/dashboard";

export const Route = createFileRoute("/dashboard")({
	component: DashboardView,
	beforeLoad: async () => {
		const session = await getUser();
		return { session };
	},
	loader: ({ context }) => {
		if (!context.session) {
			throw redirect({
				to: "/auth/sign-in",
			});
		}
	},
});
