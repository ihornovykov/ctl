import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { JourneyDetailView } from "@/views/journeys";

export const Route = createFileRoute("/journeys/$journeyId")({
	component: () => {
		const { journeyId } = Route.useParams();
		return <JourneyDetailView journeyId={journeyId} />;
	},
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
