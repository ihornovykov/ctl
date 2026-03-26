import { Skeleton } from "@ctl/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@ctl/ui/components/tabs";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useEffect } from "react";

import { useLesson } from "@/features/courses";
import {
	AiFeedbackPanel,
	CodeEditor,
	ConsoleOutput,
	TaskDescription,
	TaskToolbar,
	TestResults,
	useRunCode,
	useRunTests,
	useSubmit,
	useTask,
	useTaskWorkspace,
} from "@/features/tasks";

type Props = {
	courseSlug: string;
	lessonSlug: string;
};

const TaskWorkspaceSkeleton = () => (
	<div className="flex h-[calc(100vh-3.5rem)] flex-col">
		<div className="flex h-12 items-center gap-3 border-border/50 border-b px-4">
			<Skeleton className="h-4 w-28" />
			<div className="h-4 w-px bg-border/60" />
			<Skeleton className="h-5 w-20 rounded-full" />
			<div className="ml-auto flex gap-2">
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-20" />
			</div>
		</div>
		<div className="flex flex-1 overflow-hidden">
			<div className="flex-1 border-border/50 border-r">
				<Skeleton className="h-full w-full rounded-none" />
			</div>
			<div className="flex w-[42%] flex-col">
				<Skeleton className="h-10 w-full rounded-none" />
				<Skeleton className="flex-1 rounded-none" />
			</div>
		</div>
	</div>
);

type WorkspaceInnerProps = Props & { lessonId: string };

const WorkspaceInner = ({
	courseSlug,
	lessonSlug,
	lessonId,
}: WorkspaceInnerProps) => {
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
	const submitTask = useSubmit(lessonId);

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
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
					<BookOpen className="size-7 text-muted-foreground/50" />
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-xl">Task not found</h2>
					<p className="text-muted-foreground text-sm">
						This task doesn't exist or isn't accessible yet.
					</p>
				</div>
				<Link
					className="text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground"
					params={{ slug: courseSlug, lessonSlug }}
					to="/courses/$slug/lessons/$lessonSlug"
				>
					Back to lesson
				</Link>
			</div>
		);
	}

	const { task } = data;
	const currentSubmission = submission ?? data.submission;
	const isReadOnly = !!currentSubmission?.testsPassed;

	const onRun = () => runCode.mutate({ taskId: task.id, code });
	const onRunTests = () => runTests.mutate({ taskId: task.id, code });
	const onSubmit = () => submitTask.mutate({ taskId: task.id, code });

	return (
		<div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
			<TaskToolbar
				courseSlug={courseSlug}
				isReadOnly={isReadOnly}
				isRunning={isRunning}
				isSubmitting={isSubmitting}
				isTestingAll={isTestingAll}
				languageId={task.languageId}
				lessonSlug={lessonSlug}
				onRun={onRun}
				onRunTests={onRunTests}
				onSubmit={onSubmit}
			/>

			<div className="flex flex-1 overflow-hidden">
				<div className="flex w-[58%] flex-col border-border/50 border-r">
					<CodeEditor
						code={code}
						languageId={task.languageId}
						onChange={setCode}
						readOnly={isReadOnly}
					/>
				</div>

				<div className="flex w-[42%] flex-col overflow-hidden">
					<Tabs
						className="flex h-full flex-col"
						onValueChange={(v) =>
							setActiveTab(v as "overview" | "console" | "results")
						}
						value={activeTab}
					>
						<TabsList className="h-10 w-full justify-start rounded-none border-border/50 border-b bg-muted/30 px-2">
							<TabsTrigger
								className="rounded-sm text-xs data-[state=active]:bg-background"
								value="overview"
							>
								Overview
							</TabsTrigger>
							<TabsTrigger
								className="rounded-sm text-xs data-[state=active]:bg-background"
								value="console"
							>
								Console
							</TabsTrigger>
							<TabsTrigger
								className="rounded-sm text-xs data-[state=active]:bg-background"
								value="results"
							>
								Results
							</TabsTrigger>
						</TabsList>

						<div className="flex flex-1 flex-col overflow-hidden">
							{activeTab === "overview" && (
								<TaskDescription description={task.description} />
							)}
							{activeTab === "console" && (
								<ConsoleOutput stderr={consoleError} stdout={consoleOutput} />
							)}
							{activeTab === "results" && (
								<div className="flex flex-1 flex-col overflow-hidden">
									{currentSubmission?.aiFeedback ? (
										<AiFeedbackPanel
											criteria={task.criteria}
											feedback={currentSubmission.aiFeedback}
										/>
									) : (
										<TestResults results={testResults} />
									)}
								</div>
							)}
						</div>
					</Tabs>
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
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
					<BookOpen className="size-7 text-muted-foreground/50" />
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-xl">Lesson not found</h2>
					<p className="text-muted-foreground text-sm">
						This lesson doesn't exist or isn't accessible yet.
					</p>
				</div>
				<Link
					className="text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground"
					params={{ slug: courseSlug }}
					to="/courses/$slug"
				>
					Back to course
				</Link>
			</div>
		);
	}

	return (
		<WorkspaceInner
			courseSlug={courseSlug}
			lessonId={lesson.id}
			lessonSlug={lessonSlug}
		/>
	);
};
