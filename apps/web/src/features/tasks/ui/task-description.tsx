import { MarkdownRenderer } from "@/shared/ui";

type Props = {
	description: string;
};

export const TaskDescription = ({ description }: Props) => (
	<div className="flex h-full flex-col overflow-hidden">
		<div className="flex-1 overflow-y-auto px-5 pb-5">
			<MarkdownRenderer content={description} />
		</div>
	</div>
);
