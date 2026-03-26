import { cn } from "@ctl/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Code2 } from "lucide-react";

import { UserMenu } from "@/features/auth";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
	{ to: "/courses", label: "Courses" },
	{ to: "/dashboard", label: "Dashboard" },
] as const;

export const Header = () => {
	const { location } = useRouterState();
	const isLanding = location.pathname === "/";

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-border/40 border-b backdrop-blur-md",
				isLanding ? "bg-background/60" : "bg-background/90"
			)}
		>
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
				<Link className="flex items-center gap-2" to="/">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
						<Code2 className="h-4 w-4 text-primary-foreground" />
					</div>
					<span className="font-semibold tracking-tight">CodeLearn</span>
				</Link>

				<nav className="flex items-center gap-1">
					{NAV_LINKS.map(({ to, label }) => (
						<Link
							className={cn(
								"rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
								"text-muted-foreground hover:bg-accent hover:text-foreground"
							)}
							key={to}
							to={to}
						>
							{label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<ThemeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};
