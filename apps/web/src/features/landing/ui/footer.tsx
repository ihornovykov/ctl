import { Link } from "@tanstack/react-router";

import { PROJECT_NAME } from "@/shared/constants";
import { ProjectLogo } from "@/shared/ui/project-logo";

export const Footer = () => (
	<footer className="border-border/40 border-t py-8">
		<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
			<Link className="flex items-center gap-2" to="/">
				<ProjectLogo />
			</Link>
			<p className="text-muted-foreground text-xs">
				&copy; {new Date().getFullYear()} {PROJECT_NAME}. All rights reserved.
			</p>
			<div className="flex items-center gap-4 text-muted-foreground text-xs">
				<Link
					className="transition-colors hover:text-foreground"
					to={"/courses" as never}
				>
					Courses
				</Link>
				<Link
					className="transition-colors hover:text-foreground"
					to="/dashboard"
				>
					Dashboard
				</Link>
			</div>
		</div>
	</footer>
);
