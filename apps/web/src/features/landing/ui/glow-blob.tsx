import { cn } from "@ctl/ui/lib/utils";

export const GlowBlob = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"pointer-events-none absolute h-[600px] w-[600px] rounded-full",
			"bg-[radial-gradient(circle,oklch(0.52_0.105_223.128/0.15)_0%,transparent_70%)]",
			className
		)}
	/>
);
