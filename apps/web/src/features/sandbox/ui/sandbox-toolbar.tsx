import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	FlaskConical,
	LockKeyhole,
	Send,
} from "lucide-react";

import { dialogs } from "@/shared/stores";

import { SANDBOX_TOOLBAR_FRAMEWORK_DISPLAY } from "../lib/constants";

type Props = {
	courseSlug: string;
	lessonSlug: string;
	frameworkName: string;
	isReadOnly: boolean;
	isSubmitting: boolean;
	isTestingAll: boolean;
	isCompletingLesson: boolean;
	allTestsPassed: boolean;
	onSubmit: () => void;
	onNextLesson: () => void;
	onRunTests: () => void;
};

export const SandboxToolbar = ({
	courseSlug,
	lessonSlug,
	frameworkName,
	isReadOnly,
	isSubmitting,
	isTestingAll,
	isCompletingLesson,
	allTestsPassed,
	onSubmit,
	onNextLesson,
	onRunTests,
}: Props) => {
	const frameworkKey = frameworkName.toLowerCase();
	const badge = SANDBOX_TOOLBAR_FRAMEWORK_DISPLAY[frameworkKey] ?? {
		label: frameworkName,
		color: "bg-muted text-muted-foreground border border-border",
	};

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
					badge.color
				)}
			>
				{badge.label}
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
							disabled={isSubmitting}
							icon={<FlaskConical className="size-4" />}
							loading={isTestingAll}
							onClick={onRunTests}
							size="sm"
							variant="outline"
						>
							Run Tests
						</Button>
						<Button
							className="h-9 gap-2 text-sm"
							disabled={isSubmitting || !allTestsPassed}
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
