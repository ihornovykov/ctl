import { Avatar, AvatarFallback, AvatarImage } from "@ctl/ui/components/avatar";
import { Button } from "@ctl/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ctl/ui/components/dropdown-menu";
import { Skeleton } from "@ctl/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { authClient, getInitials } from "@/shared/lib";

export const UserMenu = () => {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex items-center gap-0 md:gap-2">
				<Skeleton className="size-6 shrink-0 rounded-full" />
				<Skeleton className="hidden h-4 w-20 md:block" />
			</div>
		);
	}

	if (!session) {
		return (
			<Link to="/auth/sign-in">
				<Button variant="outline">Sign In</Button>
			</Link>
		);
	}

	const { user } = session;
	const initials = getInitials(user.name || user.email);

	const handleProfileClick = () => {
		navigate({ to: "/dashboard" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						aria-label={`Account menu (${user.name ?? user.email})`}
						className="flex items-center gap-0 rounded-full p-0.5 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:gap-2 md:rounded-md md:px-2 md:py-1.5"
						type="button"
					/>
				}
			>
				<Avatar size="sm">
					{user.image && (
						<AvatarImage alt={user.name ?? user.email} src={user.image} />
					)}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<span className="hidden max-w-28 truncate font-medium md:inline-block">
					{user.name}
				</span>
				<ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground md:block" />
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-auto min-w-60">
				<div className="flex items-center gap-3 px-3 py-2.5">
					<Avatar>
						{user.image && (
							<AvatarImage alt={user.name ?? user.email} src={user.image} />
						)}
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="truncate font-medium text-sm leading-none">
							{user.name}
						</span>
						<span className="truncate text-muted-foreground text-xs leading-none">
							{user.email}
						</span>
					</div>
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem onClick={handleProfileClick}>
						<User />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
						<Settings />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => navigate({ to: "/" }),
							},
						});
					}}
					variant="destructive"
				>
					<LogOut />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
