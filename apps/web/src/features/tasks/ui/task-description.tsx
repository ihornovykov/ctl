import { BookOpen } from "lucide-react";

import { MarkdownRenderer } from "@/shared/ui";

type Props = {
	description: string;
};

export const TaskDescription = ({ description }: Props) => (
	<div className="flex h-full flex-col overflow-hidden">
		<div className="border-border/40 border-b bg-muted/20 px-4 py-2.5">
			<div className="flex items-center gap-2">
				<BookOpen className="size-3.5 text-muted-foreground" />
				<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
					Overview
				</span>
			</div>
		</div>
		<div className="flex-1 overflow-y-auto px-5 py-4">
			<MarkdownRenderer content={description} />
		</div>
	</div>
);
