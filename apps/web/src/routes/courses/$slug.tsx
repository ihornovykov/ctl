import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getUser } from "@/shared/lib";

export const Route = createFileRoute("/courses/$slug")({
	beforeLoad: async () => {
		const session = await getUser();
		if (!session) {
			throw redirect({ to: "/auth/sign-in" });
		}
		return { session };
	},
	component: () => <Outlet />,
});
