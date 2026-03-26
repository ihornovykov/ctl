import { Button } from "@ctl/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ctl/ui/components/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import type { Theme } from "@/shared/lib";
import { useTheme } from "@/shared/providers";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
];

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	const ICON_MAP: Record<string, typeof Sun> = {
		dark: Moon,
		light: Sun,
		system: Monitor,
	};
	const CurrentIcon = ICON_MAP[theme] ?? Monitor;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button aria-label="Toggle theme" size="icon" variant="ghost" />
				}
			>
				<CurrentIcon className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
					<DropdownMenuItem
						className={theme === value ? "bg-accent" : ""}
						key={value}
						onClick={() => setTheme(value)}
					>
						<Icon className="mr-2 h-4 w-4" />
						{label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
