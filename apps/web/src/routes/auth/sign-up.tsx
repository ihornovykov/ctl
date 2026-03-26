import { createFileRoute } from "@tanstack/react-router";

import { SignUpView } from "@/views/auth";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpView,
});
