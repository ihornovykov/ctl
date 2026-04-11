import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";
import { SettingsView } from "@/views/settings";

export const Route = createFileRoute("/settings")({
	component: SettingsView,
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
