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
		label: "JavaScript",
		color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
	},
	typescript: {
		label: "TypeScript",
		color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
	},
	python: {
		label: "Python",
		color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
	},
	go: { label: "Go", color: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
	c: { label: "C", color: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
	cpp: {
		label: "C++",
		color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
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
		label: languageId,
		color: "bg-muted text-muted-foreground",
	};
	const isWorking = isRunning || isTestingAll || isSubmitting;

	return (
		<div className="flex h-12 shrink-0 items-center gap-3 border-border/50 border-b bg-background/95 px-4 backdrop-blur-sm">
			<Link
				className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
				params={{ slug: courseSlug, lessonSlug }}
				to="/courses/$slug/lessons/$lessonSlug"
			>
				<ArrowLeft className="size-3.5" />
				Back
			</Link>

			<div className="h-4 w-px bg-border/60" />

			<span
				className={cn(
					"rounded-full px-2.5 py-0.5 font-medium font-mono text-xs",
					lang.color
				)}
			>
				{lang.label}
			</span>

			<div className="ml-auto flex items-center gap-2">
				{isReadOnly ? (
					<Link
						className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 font-medium text-primary-foreground text-xs transition-opacity hover:opacity-90"
						params={{ slug: courseSlug, lessonSlug }}
						to="/courses/$slug/lessons/$lessonSlug"
					>
						Next Lesson
						<ChevronRight className="size-3.5" />
					</Link>
				) : (
					<>
						<Button
							className="h-8 gap-1.5 text-xs"
							disabled={isWorking}
							onClick={onRun}
							size="sm"
							variant="outline"
						>
							{isRunning ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<Play className="size-3.5" />
							)}
							Run
						</Button>
						<Button
							className="h-8 gap-1.5 text-xs"
							disabled={isWorking}
							onClick={onRunTests}
							size="sm"
							variant="outline"
						>
							{isTestingAll ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<FlaskConical className="size-3.5" />
							)}
							Test
						</Button>
						<Button
							className="h-8 gap-1.5 text-xs"
							disabled={isWorking}
							onClick={onSubmit}
							size="sm"
						>
							{isSubmitting ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<Send className="size-3.5" />
							)}
							Submit
						</Button>
					</>
				)}
			</div>
		</div>
	);
};
