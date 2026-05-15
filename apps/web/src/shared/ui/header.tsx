import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { IconBook2, IconLayoutDashboard, IconMenu2 } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { UserMenu } from "@/features/auth";
import { sheets } from "@/shared/stores";
import { ProjectLogo } from "@/shared/ui/project-logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
	{ to: "/courses", label: "Courses", icon: IconBook2 },
	{ to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
] as const;

const linkClassName = cn(
	"rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
	"text-muted-foreground hover:bg-accent hover:text-foreground"
);

const openMobileNav = () => {
	sheets.open({
		title: "Navigate",
		content: (
			<nav className="flex flex-col gap-1 px-4 py-4">
				{NAV_LINKS.map(({ to, label, icon: Icon }) => (
					<Link
						className={cn(
							"flex items-center gap-3 rounded-xl px-3 py-3 font-medium text-base transition-colors",
							"text-foreground hover:bg-accent/80 active:scale-[0.99]"
						)}
						key={to}
						onClick={() => sheets.close()}
						to={to}
					>
						<span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground shadow-inner">
							<Icon className="size-5" stroke={1.75} />
						</span>
						<span className="flex flex-col gap-0.5">
							<span>{label}</span>
							<span className="font-normal text-muted-foreground text-xs">
								{to === "/courses"
									? "Browse learning paths"
									: "Your progress & stats"}
							</span>
						</span>
					</Link>
				))}
			</nav>
		),
	});
};

export const Header = () => {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-border/40 border-b bg-background/60 backdrop-blur-md"
			)}
		>
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
				<Link className="flex items-center gap-2" to="/">
					<ProjectLogo />
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					{NAV_LINKS.map(({ to, label }) => (
						<Link className={linkClassName} key={to} to={to}>
							{label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<Button
						aria-label="Open navigation menu"
						className="md:hidden"
						onClick={openMobileNav}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<IconMenu2 className="size-5" />
					</Button>
					<ThemeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};
