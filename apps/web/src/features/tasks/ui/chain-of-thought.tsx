import { cn } from "@ctl/ui/lib/utils";
import {
	CheckCircle2,
	Cpu,
	FlaskConical,
	Loader2,
	XCircle,
} from "lucide-react";

export type ChainStepStatus = "pending" | "active" | "complete" | "error";

export type ChainStep =
	| { id: "running_tests"; status: ChainStepStatus }
	| {
			id: "tests_complete";
			status: ChainStepStatus;
			passed: number;
			total: number;
	  }
	| {
			id: "tests_failed";
			status: ChainStepStatus;
			passed: number;
			total: number;
	  }
	| { id: "grading_start"; status: ChainStepStatus }
	| { id: "grading_done"; status: ChainStepStatus };

type Props = {
	steps: ChainStep[];
};

const STEP_META: Record<
	ChainStep["id"],
	{ icon: React.ElementType; label: (step: ChainStep) => string }
> = {
	running_tests: {
		icon: FlaskConical,
		label: () => "Running tests…",
	},
	tests_complete: {
		icon: CheckCircle2,
		label: (s) => {
			const step = s as Extract<ChainStep, { id: "tests_complete" }>;
			return `${step.passed}/${step.total} tests passed`;
		},
	},
	tests_failed: {
		icon: XCircle,
		label: (s) => {
			const step = s as Extract<ChainStep, { id: "tests_failed" }>;
			return `${step.passed}/${step.total} tests passed — fix failing tests`;
		},
	},
	grading_start: {
		icon: Cpu,
		label: () => "Reviewing your code with AI…",
	},
	grading_done: {
		icon: Cpu,
		label: () => "AI review complete",
	},
};

const stepIconColor: Record<ChainStepStatus, string> = {
	pending: "text-muted-foreground/30",
	active: "text-primary",
	complete: "text-emerald-500",
	error: "text-destructive",
};

const stepTextColor: Record<ChainStepStatus, string> = {
	pending: "text-muted-foreground/40",
	active: "text-foreground",
	complete: "text-foreground",
	error: "text-destructive",
};

const StepRow = ({ step, isLast }: { step: ChainStep; isLast: boolean }) => {
	const meta = STEP_META[step.id];
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
							className={cn("size-3.5 animate-spin", stepIconColor.active)}
						/>
					) : (
						<Icon className={cn("size-3.5", stepIconColor[step.status])} />
					)}
				</div>
				{!isLast && <div className="mt-1 w-px flex-1 bg-border/50" />}
			</div>

			<div
				className={cn(
					"pt-1 pb-4 text-sm leading-snug",
					stepTextColor[step.status]
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
