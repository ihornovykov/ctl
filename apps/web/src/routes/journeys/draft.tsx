import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { JourneyDraftView } from "@/views/journeys";

export const Route = createFileRoute("/journeys/draft")({
	component: JourneyDraftView,
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
