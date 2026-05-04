import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { JourneysListView } from "@/views/journeys";

export const Route = createFileRoute("/journeys/")({
	component: JourneysListView,
	beforeLoad: async () => {
		const session = await getUser();
		return { session };
	},
	loader: ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/auth/sign-in" });
		}
	},
});
