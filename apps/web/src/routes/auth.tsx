import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center bg-zinc-50 p-6 md:p-10 dark:bg-zinc-950">
			{/* Atmospheric top glow — subtle in light, vivid in dark */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-linear-to-b from-primary/6 to-transparent dark:from-primary/20" />
			<div className="relative w-full max-w-sm md:max-w-4xl">
				<Outlet />
			</div>
		</div>
	);
}
