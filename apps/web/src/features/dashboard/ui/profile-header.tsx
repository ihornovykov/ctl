import type { ProfileOutput } from "@ctl/api/routers/dashboard/validation";
import { Avatar, AvatarFallback, AvatarImage } from "@ctl/ui/components/avatar";
import { Badge } from "@ctl/ui/components/badge";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { CalendarDays, Mail, Trophy } from "lucide-react";

import { getInitials } from "@/shared/lib";

import { formatDashboardMemberSince } from "../lib/utils";

type Props = {
	user: ProfileOutput["user"];
	stats: ProfileOutput["stats"];
};

export const ProfileHeader = ({ user, stats }: Props) => {
	const initials = getInitials(user.name || user.email);

	return (
		<div className="relative -mt-14 overflow-hidden border-border/50 border-b pt-14">
			{/* Layered background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-linear-to-br from-primary/12 via-primary/4 to-transparent" />
				<div className="absolute top-0 left-0 size-[700px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-primary/10 blur-[120px]" />
				<div className="absolute top-0 right-0 size-[400px] translate-x-1/4 -translate-y-1/4 rounded-full bg-primary/6 blur-[100px]" />
				{/* Subtle dot grid overlay */}
				<div
					className="absolute inset-0 opacity-30"
					style={{
						backgroundImage:
							"radial-gradient(circle, hsl(var(--border) / 0.8) 1px, transparent 1px)",
						backgroundSize: "24px 24px",
					}}
				/>
				{/* Fade out dot grid */}
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, hsl(var(--background) / 0.7) 100%)",
					}}
				/>
				<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />
			</div>

			<div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
				<div
					className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
					style={{ animationDelay: "0ms" }}
				>
					<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
						{/* Avatar with glow ring */}
						<div className="relative shrink-0">
							<div className="absolute -inset-2 rounded-full bg-linear-to-br from-primary/50 to-primary/10 opacity-60 blur-md" />
							<div className="absolute -inset-0.5 rounded-full bg-linear-to-br from-primary/40 to-primary/5" />
							<Avatar className="relative size-20 ring-2 ring-primary/25 ring-offset-2 ring-offset-background sm:size-24">
								{user.image && <AvatarImage alt={user.name} src={user.image} />}
								<AvatarFallback className="font-bold text-2xl">
									{initials}
								</AvatarFallback>
							</Avatar>
						</div>

						<div className="flex flex-col gap-2.5">
							<div className="flex flex-wrap items-center gap-2.5">
								<h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
									{user.name}
								</h1>
								{stats.coursesCompleted > 0 && (
									<Badge
										className="gap-1.5 border-primary/30 bg-primary/10 text-primary text-xs"
										variant="outline"
									>
										<Trophy className="size-3" />
										{stats.coursesCompleted === 1
											? "1 Course Completed"
											: `${stats.coursesCompleted} Courses Completed`}
									</Badge>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
								<span className="flex items-center gap-1.5">
									<Mail className="size-3.5" />
									{user.email}
								</span>
								<span className="flex items-center gap-1.5">
									<CalendarDays className="size-3.5" />
									Member since{" "}
									{formatDashboardMemberSince(new Date(user.createdAt))}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const ProfileHeaderSkeleton = () => (
	<div className="relative -mt-14 overflow-hidden border-border/50 border-b pt-14">
		<div className="pointer-events-none absolute inset-0">
			<div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/4 to-transparent" />
		</div>
		<div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
			<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
				<Skeleton className="size-20 rounded-full sm:size-24" />
				<div className="flex flex-col gap-3">
					<Skeleton className="h-9 w-52" />
					<Skeleton className="h-4 w-64" />
				</div>
			</div>
		</div>
	</div>
);
