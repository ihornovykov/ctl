import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ChevronRight,
	FlaskConical,
	Loader2,
	Play,
	Send,
} from "lucide-react";

const LANGUAGE_DISPLAY: Record<string, { label: string; color: string }> = {
	javascript: {
		label: "JS",
		color:
			"bg-yellow-400/15 text-yellow-600 dark:text-yellow-300 border border-yellow-400/20",
	},
	typescript: {
		label: "TS",
		color:
			"bg-blue-400/15 text-blue-600 dark:text-blue-300 border border-blue-400/20",
	},
	python: {
		label: "PY",
		color:
			"bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/20",
	},
	go: {
		label: "Go",
		color:
			"bg-sky-400/15 text-sky-600 dark:text-sky-300 border border-sky-400/20",
	},
	c: {
		label: "C",
		color:
			"bg-zinc-400/15 text-zinc-600 dark:text-zinc-300 border border-zinc-400/20",
	},
	cpp: {
		label: "C++",
		color:
			"bg-indigo-400/15 text-indigo-600 dark:text-indigo-300 border border-indigo-400/20",
	},
};

type Props = {
	courseSlug: string;
	lessonSlug: string;
	languageId: string;
	isReadOnly: boolean;
	isRunning: boolean;
	isTestingAll: boolean;
	isSubmitting: boolean;
	onRun: () => void;
	onRunTests: () => void;
	onSubmit: () => void;
};

export const TaskToolbar = ({
	courseSlug,
	lessonSlug,
	languageId,
	isReadOnly,
	isRunning,
	isTestingAll,
	isSubmitting,
	onRun,
	onRunTests,
	onSubmit,
}: Props) => {
	const lang = LANGUAGE_DISPLAY[languageId] ?? {
		label: languageId.toUpperCase(),
		color: "bg-muted text-muted-foreground border border-border",
	};
	const isWorking = isRunning || isTestingAll || isSubmitting;

	return (
		<div className="flex h-14 shrink-0 items-center gap-4 border-border/40 border-b bg-background px-5">
			<Link
				className="flex items-center gap-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
				params={{ slug: courseSlug, lessonSlug }}
				to="/courses/$slug/lessons/$lessonSlug"
			>
				<ArrowLeft className="size-4" />
				Back
			</Link>

			<div className="h-5 w-px bg-border/50" />

			<span
				className={cn(
					"rounded-md px-2.5 py-1 font-mono font-semibold text-xs tracking-wide",
					lang.color
				)}
			>
				{lang.label}
			</span>

			<div className="ml-auto flex items-center gap-2.5">
				{isReadOnly ? (
					<Link
						className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground text-sm transition-opacity hover:opacity-90"
						params={{ slug: courseSlug, lessonSlug }}
						to="/courses/$slug/lessons/$lessonSlug"
					>
						Next Lesson
						<ChevronRight className="size-4" />
					</Link>
				) : (
					<>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isWorking}
							onClick={onRun}
							size="sm"
							variant="outline"
						>
							{isRunning ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Play className="size-4" />
							)}
							Run
						</Button>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isWorking}
							onClick={onRunTests}
							size="sm"
							variant="outline"
						>
							{isTestingAll ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<FlaskConical className="size-4" />
							)}
							Test
						</Button>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isWorking}
							onClick={onSubmit}
							size="sm"
						>
							{isSubmitting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Send className="size-4" />
							)}
							Submit
						</Button>
					</>
				)}
			</div>
		</div>
	);
};
