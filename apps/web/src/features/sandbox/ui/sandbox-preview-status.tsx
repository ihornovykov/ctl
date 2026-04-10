import { cn } from "@ctl/ui/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";

type Props = {
	isBuilding: boolean;
	error: string | null;
};

export const SandboxPreviewStatus = ({ isBuilding, error }: Props) => {
	if (error) {
		return (
			<div
				className={cn(
					"pointer-events-none absolute inset-x-0 bottom-0 z-10",
					"border-destructive/30 border-t bg-destructive/10 px-3 py-2 backdrop-blur-sm"
				)}
			>
				<p className="flex items-center gap-2 text-destructive text-xs">
					<AlertCircle aria-hidden className="size-3.5 shrink-0" />
					<span className="min-w-0 truncate leading-snug">{error}</span>
				</p>
			</div>
		);
	}

	if (isBuilding) {
		return (
			<div
				className={cn(
					"pointer-events-none absolute inset-x-0 bottom-0 z-10",
					"border-border/60 border-t bg-background/95 px-3 py-2 backdrop-blur-sm"
				)}
			>
				<p className="flex min-w-0 items-center gap-2 font-mono text-muted-foreground text-xs">
					<Loader2
						aria-hidden
						className="size-3.5 shrink-0 animate-spin text-primary"
					/>
					<span className="min-w-0 truncate">Building preview…</span>
				</p>
			</div>
		);
	}

	return null;
};
