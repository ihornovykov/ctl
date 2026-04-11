import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	FlaskConical,
	LockKeyhole,
	Play,
	Send,
} from "lucide-react";

import { dialogs } from "@/shared/stores";

import { TASK_TOOLBAR_LANGUAGE_DISPLAY } from "../lib/constants";

type Props = {
	courseSlug: string;
	lessonSlug: string;
	languageId: string;
	isReadOnly: boolean;
	isRunning: boolean;
	isTestingAll: boolean;
	isSubmitting: boolean;
	isCompletingLesson: boolean;
	allTestsPassed: boolean;
	onRun: () => void;
	onRunTests: () => void;
	onSubmit: () => void;
	onNextLesson: () => void;
};

export const TaskToolbar = ({
	courseSlug,
	lessonSlug,
	languageId,
	isReadOnly,
	isRunning,
	isTestingAll,
	isSubmitting,
	isCompletingLesson,
	allTestsPassed,
	onRun,
	onRunTests,
	onSubmit,
	onNextLesson,
}: Props) => {
	const lang = TASK_TOOLBAR_LANGUAGE_DISPLAY[languageId] ?? {
		label: languageId.toUpperCase(),
		color: "bg-muted text-muted-foreground border border-border",
	};
	const isWorking = isRunning || isTestingAll || isSubmitting;

	const onSubmitClick = () => {
		dialogs.open({
			title: "Submit your solution?",
			titleIcon: <LockKeyhole className="text-amber-500" />,
			description:
				"Once submitted, your code will be locked and sent for grading. You won't be able to make any further changes.",
			buttons: [
				{
					text: "Cancel",
					variant: "secondary",
					onClick: () => dialogs.close(),
				},
				{
					text: "Submit",
					icon: <Send className="size-4" />,
					loading: isSubmitting,
					variant: "primary",
					onClick: () => {
						dialogs.close();
						onSubmit();
					},
				},
			],
		});
	};

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
					<Button
						className="h-9 gap-2 text-sm"
						icon={<ArrowRight className="size-4" />}
						loading={isCompletingLesson}
						onClick={onNextLesson}
						size="sm"
						variant="outline"
					>
						Next Lesson
					</Button>
				) : (
					<>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isWorking}
							icon={<Play className="size-4" />}
							loading={isRunning}
							onClick={onRun}
							size="sm"
							variant="outline"
						>
							Run
						</Button>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isWorking}
							icon={<FlaskConical className="size-4" />}
							loading={isTestingAll}
							onClick={onRunTests}
							size="sm"
							variant="outline"
						>
							Test
						</Button>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isWorking || !allTestsPassed}
							icon={<Send className="size-4" />}
							loading={isSubmitting}
							onClick={onSubmitClick}
							size="sm"
						>
							Submit
						</Button>
					</>
				)}
			</div>
		</div>
	);
};
