import { cn } from "@ctl/ui/lib/utils";
import { Cpu, Loader2 } from "lucide-react";

import {
	CHAIN_OF_THOUGHT_STEP_ICON_CLASS,
	CHAIN_OF_THOUGHT_STEP_META,
	CHAIN_OF_THOUGHT_STEP_TEXT_CLASS,
	type ChainStep,
} from "../lib/constants";

export type { ChainStep, ChainStepStatus } from "../lib/constants";

type Props = {
	steps: ChainStep[];
};

const StepRow = ({ step, isLast }: { step: ChainStep; isLast: boolean }) => {
	const meta = CHAIN_OF_THOUGHT_STEP_META[step.id];
	const Icon = meta.icon;
	const label = meta.label(step);

	return (
		<div className="flex gap-3">
			<div className="relative flex flex-col items-center">
				<div
					className={cn(
						"flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60",
						step.status === "active" && "bg-primary/10"
					)}
				>
					{step.status === "active" ? (
						<Loader2
							className={cn(
								"size-3.5 animate-spin",
								CHAIN_OF_THOUGHT_STEP_ICON_CLASS.active
							)}
						/>
					) : (
						<Icon
							className={cn(
								"size-3.5",
								CHAIN_OF_THOUGHT_STEP_ICON_CLASS[step.status]
							)}
						/>
					)}
				</div>
				{!isLast && <div className="mt-1 w-px flex-1 bg-border/50" />}
			</div>

			<div
				className={cn(
					"pt-1 pb-4 text-sm leading-snug",
					CHAIN_OF_THOUGHT_STEP_TEXT_CLASS[step.status]
				)}
			>
				{label}
			</div>
		</div>
	);
};

export const ChainOfThought = ({ steps }: Props) => (
	<div className="flex flex-1 flex-col overflow-y-auto px-5 py-5">
		<div className="mb-5 flex items-center gap-2">
			<Cpu className="size-4 text-primary" />
			<span className="font-semibold text-foreground text-sm">
				Processing submission
			</span>
		</div>

		<div className="flex flex-col">
			{steps.map((step, i) => (
				<StepRow isLast={i === steps.length - 1} key={step.id} step={step} />
			))}
		</div>
	</div>
);
