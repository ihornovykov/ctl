import { Skeleton } from "@ctl/ui/components/skeleton";
import { cn } from "@ctl/ui/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Cpu, TerminalSquare, TestTube } from "lucide-react";
import { useEffect } from "react";
import { match } from "ts-pattern";

import { useCompleteLesson, useLesson } from "@/features/courses";
import {
	AiFeedbackPanel,
	ChainOfThought,
	CodeEditor,
	ConsoleOutput,
	TaskDescription,
	TaskToolbar,
	TestResults,
	useRunCode,
	useRunTests,
	useSubmitStream,
	useTask,
	useTaskWorkspace,
} from "@/features/tasks";

type Props = {
	courseSlug: string;
	lessonSlug: string;
};

const TABS = [
	{ id: "overview", label: "Overview", icon: BookOpen },
	{ id: "console", label: "Console", icon: TerminalSquare },
	{ id: "results", label: "Results", icon: TestTube },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TaskWorkspaceSkeleton = () => (
	<div className="flex h-[calc(100vh-3.5rem)] flex-col bg-muted/10">
		<div className="flex h-14 items-center gap-4 border-border/40 border-b bg-background px-5">
			<Skeleton className="h-4 w-16" />
			<div className="h-5 w-px bg-border/50" />
			<Skeleton className="h-6 w-10 rounded-md" />
			<div className="ml-auto flex gap-2.5">
				<Skeleton className="h-9 w-16 rounded-lg" />
				<Skeleton className="h-9 w-16 rounded-lg" />
				<Skeleton className="h-9 w-20 rounded-lg" />
			</div>
		</div>
		<div className="flex flex-1 gap-3 overflow-hidden p-3 pt-2">
			<Skeleton className="flex-1 rounded-xl" />
			<div className="flex w-[42%] flex-col gap-0 overflow-hidden rounded-xl border border-border/40">
				<div className="flex h-11 items-center gap-2 border-border/40 border-b bg-background px-4">
					{[80, 72, 68].map((w) => (
						<Skeleton className="h-4 rounded-md" key={w} style={{ width: w }} />
					))}
				</div>
				<Skeleton className="flex-1 rounded-none" />
			</div>
		</div>
	</div>
);

const ErrorState = ({
	title,
	description,
	backLink,
}: {
	title: string;
	description: string;
	backLink: React.ReactNode;
}) => (
	<div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
		<div className="flex size-16 items-center justify-center rounded-2xl border border-border/40 bg-muted/30">
			<BookOpen className="size-7 text-muted-foreground/50" />
		</div>
		<div className="flex flex-col gap-2">
			<h2 className="font-semibold text-xl tracking-tight">{title}</h2>
			<p className="text-muted-foreground text-sm">{description}</p>
		</div>
		{backLink}
	</div>
);

type WorkspaceInnerProps = Props & {
	lessonId: string;
	isLessonCompleted: boolean;
	nextLessonSlug: string | null;
};

const WorkspaceInner = ({
	courseSlug,
	lessonSlug,
	lessonId,
	isLessonCompleted,
	nextLessonSlug,
}: WorkspaceInnerProps) => {
	const navigate = useNavigate();
	const { mutate: completeLesson, isPending: isCompletingLesson } =
		useCompleteLesson(courseSlug, lessonSlug);

	const onNextLesson = () => {
		const destination = nextLessonSlug
			? ({
					to: "/courses/$slug/lessons/$lessonSlug",
					params: { slug: courseSlug, lessonSlug: nextLessonSlug },
				} as const)
			: ({ to: "/courses/$slug", params: { slug: courseSlug } } as const);

		if (isLessonCompleted) {
			navigate(destination);
		} else {
			completeLesson(lessonId, { onSuccess: () => navigate(destination) });
		}
	};

	const { data, isPending, isError } = useTask(lessonId);
	const {
		code,
		activeTab,
		isRunning,
		isTestingAll,
		isSubmitting,
		consoleOutput,
		consoleError,
		testResults,
		submission,
		setCode,
		setActiveTab,
		reset,
	} = useTaskWorkspace();

	const runCode = useRunCode(data?.task.languageId ?? "javascript");
	const runTests = useRunTests();
	const {
		submit: submitStream,
		steps: gradeSteps,
		isStreaming,
	} = useSubmitStream(lessonId);

	useEffect(() => {
		if (!data) {
			return;
		}
		reset(data.task.starterCode, data.submission ?? null);
	}, [data, reset]);

	if (isPending) {
		return <TaskWorkspaceSkeleton />;
	}

	if (isError || !data) {
		return (
			<ErrorState
				backLink={
					<Link
						className="font-medium text-muted-foreground text-sm underline-offset-4 transition-colors hover:text-foreground hover:underline"
						params={{ slug: courseSlug, lessonSlug }}
						to="/courses/$slug/lessons/$lessonSlug"
					>
						Back to lesson
					</Link>
				}
				description="This task doesn't exist or isn't accessible yet."
				title="Task not found"
			/>
		);
	}

	const { task } = data;
	const currentSubmission = submission ?? data.submission;
	const isReadOnly = !!currentSubmission?.testsPassed;
	const hasAiFeedback = !!currentSubmission?.aiFeedback;
	const allTestsPassed =
		testResults.length > 0 && testResults.every((r) => r.passed);

	const onRun = () => runCode.mutate({ taskId: task.id, code });
	const onRunTests = () => runTests.mutate({ taskId: task.id, code });
	const onSubmit = () => {
		setActiveTab("results");
		submitStream({ taskId: task.id, code });
	};

	return (
		<div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-muted/10">
			<TaskToolbar
				allTestsPassed={allTestsPassed}
				courseSlug={courseSlug}
				isCompletingLesson={isCompletingLesson}
				isReadOnly={isReadOnly}
				isRunning={isRunning}
				isSubmitting={isSubmitting}
				isTestingAll={isTestingAll}
				languageId={task.languageId}
				lessonSlug={lessonSlug}
				onNextLesson={onNextLesson}
				onRun={onRun}
				onRunTests={onRunTests}
				onSubmit={onSubmit}
			/>

			<div className="flex flex-1 gap-3 overflow-hidden p-3 pt-2">
				{/* Editor card */}
				<div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm">
					<CodeEditor
						code={code}
						languageId={task.languageId}
						onChange={setCode}
						readOnly={isReadOnly}
					/>
				</div>

				{/* Right panel card */}
				<div className="flex w-[42%] min-w-0 flex-col overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm">
					{/* Tab bar */}
					<div className="flex h-11 shrink-0 items-center border-border/40 border-b px-2">
						{TABS.map(({ id, label, icon: Icon }) => {
							const isActive = activeTab === id;
							const showBadge =
								id === "results" && (testResults.length > 0 || hasAiFeedback);
							return (
								<button
									className={cn(
										"relative flex h-full items-center gap-1.5 border-b-2 px-3 font-medium text-sm transition-colors",
										isActive
											? "border-primary text-foreground"
											: "border-transparent text-muted-foreground hover:text-foreground"
									)}
									key={id}
									onClick={() => setActiveTab(id as TabId)}
									type="button"
								>
									<Icon className="size-3.5" />
									{label}
									{showBadge && (
										<span
											className={cn(
												"size-1.5 rounded-full",
												hasAiFeedback && id === "results"
													? "bg-primary"
													: "bg-sky-500"
											)}
										/>
									)}
								</button>
							);
						})}

						{hasAiFeedback && (
							<div className="ml-auto flex items-center gap-1.5 px-2">
								<Cpu className="size-3.5 text-primary" />
								<span className="font-semibold text-primary text-xs">
									AI Graded
								</span>
							</div>
						)}
					</div>

					{/* Panel content */}
					<div className="flex flex-1 flex-col overflow-hidden">
						{activeTab === "overview" && (
							<TaskDescription description={task.description} />
						)}
						{activeTab === "console" && (
							<ConsoleOutput stderr={consoleError} stdout={consoleOutput} />
						)}
						{activeTab === "results" && (
							<div className="flex flex-1 flex-col overflow-hidden">
								{match({
									streaming: isStreaming && gradeSteps.length > 0,
									feedback: currentSubmission?.aiFeedback ?? null,
								})
									.with({ streaming: true }, () => (
										<ChainOfThought steps={gradeSteps} />
									))
									.when(
										(s) => s.feedback !== null,
										(s) => (
											<AiFeedbackPanel
												criteria={task.criteria}
												// biome-ignore lint/style/noNonNullAssertion: guarded by .when()
												feedback={s.feedback!}
											/>
										)
									)
									.otherwise(() => (
										<TestResults results={testResults} />
									))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export const TaskWorkspaceView = ({ courseSlug, lessonSlug }: Props) => {
	const {
		data: lesson,
		isPending,
		isError,
	} = useLesson(courseSlug, lessonSlug);

	if (isPending) {
		return <TaskWorkspaceSkeleton />;
	}

	if (isError || !lesson) {
		return (
			<ErrorState
				backLink={
					<Link
						className="font-medium text-muted-foreground text-sm underline-offset-4 transition-colors hover:text-foreground hover:underline"
						params={{ slug: courseSlug }}
						to="/courses/$slug"
					>
						Back to course
					</Link>
				}
				description="This lesson doesn't exist or isn't accessible yet."
				title="Lesson not found"
			/>
		);
	}

	return (
		<WorkspaceInner
			courseSlug={courseSlug}
			isLessonCompleted={lesson.isCompleted}
			lessonId={lesson.id}
			lessonSlug={lessonSlug}
			nextLessonSlug={lesson.nextLesson?.slug ?? null}
		/>
	);
};
