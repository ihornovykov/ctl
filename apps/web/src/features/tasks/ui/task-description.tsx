import { BookOpen } from "lucide-react";

import { MarkdownRenderer } from "@/shared/ui";

type Props = {
	description: string;
};

export const TaskDescription = ({ description }: Props) => (
	<div className="flex h-full flex-col overflow-hidden">
		<div className="flex items-center gap-2.5 border-border/40 border-b px-5 py-3">
			<BookOpen className="size-4 text-muted-foreground" />
			<span className="font-semibold text-foreground text-sm">Overview</span>
		</div>
		<div className="flex-1 overflow-y-auto px-5 py-5">
			<MarkdownRenderer content={description} />
		</div>
	</div>
);
