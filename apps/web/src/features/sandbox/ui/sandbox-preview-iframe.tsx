import { cn } from "@ctl/ui/lib/utils";
import type { CSSProperties } from "react";

type Props = {
	html: string | null;
	previewSrc?: string | null;
	className?: string;
	style?: CSSProperties;
};

export const SandboxPreviewIframe = ({
	html,
	previewSrc,
	className,
	style,
}: Props) => {
	const useRemote = Boolean(previewSrc);

	return (
		<div
			className={cn("relative min-h-0 min-w-0 flex-1", className)}
			style={style}
		>
			<iframe
				className="block size-full min-h-[200px] border-0 bg-white dark:bg-neutral-950"
				sandbox="allow-scripts"
				src={useRemote ? (previewSrc ?? undefined) : undefined}
				srcDoc={useRemote ? undefined : (html ?? "")}
				title="Sandbox Preview"
			/>
		</div>
	);
};
