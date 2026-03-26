import { createFileRoute } from "@tanstack/react-router";

import { LandingView } from "@/views/landing";

export const Route = createFileRoute("/")({
	component: LandingView,
});
