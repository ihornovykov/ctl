import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";

export const Footer = () => (
	<footer className="border-border/40 border-t py-8">
		<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
			<Link className="flex items-center gap-2" to="/">
				<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
					<Code2 className="h-3.5 w-3.5 text-primary-foreground" />
				</div>
				<span className="font-semibold text-sm">CodeLearn</span>
			</Link>
			<p className="text-muted-foreground text-xs">
				&copy; {new Date().getFullYear()} CodeLearn. All rights reserved.
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
