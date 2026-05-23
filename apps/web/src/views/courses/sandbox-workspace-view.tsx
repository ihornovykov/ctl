import { Skeleton } from "@ctl/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useCompleteLesson, useLesson } from "@/features/courses";
import {
	SANDBOX_MAIN_SPLIT_HANDLE_PX,
	SandboxWorkspace,
	useSandboxSubmit,
	useSandboxTask,
	useSandboxWorkspace,
} from "@/features/sandbox";

type Props = {
	courseSlug: string;
	lessonSlug: string;
};

const SandboxWorkspaceSkeleton = () => (
	<div className="flex h-full min-h-0 w-full flex-col bg-muted/10">
		<div className="flex h-14 items-center gap-4 border-border/40 border-b bg-background px-5">
			<Skeleton className="h-4 w-16" />
			<div className="h-5 w-px bg-border/50" />
			<Skeleton className="h-6 w-14 rounded-md" />
			<div className="ml-auto flex gap-2.5">
				<Skeleton className="h-9 w-24 rounded-lg" />
				<Skeleton className="h-9 w-20 rounded-lg" />
			</div>
		</div>
		<div
			className="grid min-h-0 flex-1 grid-rows-1 gap-x-2 overflow-hidden px-3 pt-2 pb-3"
			style={{
				gridTemplateColumns: `minmax(0,1fr) ${SANDBOX_MAIN_SPLIT_HANDLE_PX}px minmax(0,1fr)`,
			}}
		>
			<div className="flex min-h-0 min-w-0 overflow-hidden rounded-xl border border-border/40">
				<Skeleton className="w-48 shrink-0 rounded-none rounded-l-xl border-border/40 border-r" />
				<Skeleton className="min-h-0 min-w-0 flex-1 rounded-none rounded-r-xl" />
			</div>
			<div className="flex justify-center self-stretch bg-transparent">
				<Skeleton className="my-3 w-px shrink-0 rounded-full" />
			</div>
			<div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border/40">
				<div className="flex h-11 shrink-0 items-center gap-2 border-border/40 border-b bg-background px-4">
					{[80, 64, 56, 72].map((w) => (
						<Skeleton className="h-4 rounded-md" key={w} style={{ width: w }} />
					))}
				</div>
				<Skeleton className="min-h-0 flex-1 rounded-none" />
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
	<div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 px-4 text-center">
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

type InnerProps = Props & {
	lessonId: string;
	isLessonCompleted: boolean;
	nextLessonSlug: string | null;
};

const SandboxWorkspaceInner = ({
	courseSlug,
	lessonSlug,
	lessonId,
	isLessonCompleted,
	nextLessonSlug,
}: InnerProps) => {
	const navigate = useNavigate();
	const { mutate: completeLesson, isPending: isCompletingLesson } =
		useCompleteLesson(courseSlug, lessonSlug);

	const { data, isPending, isError } = useSandboxTask(lessonId);
	const reset = useSandboxWorkspace((s) => s.reset);
	const submitMutation = useSandboxSubmit(lessonId);

	const workspaceResetKey = useMemo(() => {
		if (!data || data.kind !== "sandbox") {
			return null;
		}
		const at = data.submission?.submittedAt;
		return `${lessonId}:${data.task.id}:${at == null ? "none" : String(at)}`;
	}, [lessonId, data]);

	const dataRef = useRef(data);
	dataRef.current = data;

	useEffect(() => {
		if (!workspaceResetKey) {
			return;
		}
		const d = dataRef.current;
		if (!d || d.kind !== "sandbox") {
			return;
		}
		reset(d.submission ?? null);
	}, [workspaceResetKey, reset]);

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

	if (isPending) {
		return <SandboxWorkspaceSkeleton />;
	}

	if (isError || !data || data.kind !== "sandbox") {
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
				description="This sandbox task doesn't exist or isn't accessible yet."
				title="Task not found"
			/>
		);
	}

	const { task, submission } = data;

	const onSubmit = (
		files: Record<string, string>,
		testResults: Array<{ title: string; passed: boolean; error?: string }>
	) => {
		submitMutation.mutate({ sandboxTaskId: task.id, files, testResults });
	};

	return (
		<div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
			<SandboxWorkspace
				courseSlug={courseSlug}
				existingSubmission={submission}
				isCompletingLesson={isCompletingLesson}
				lessonSlug={lessonSlug}
				onNextLesson={onNextLesson}
				onSubmit={onSubmit}
				task={task}
			/>
		</div>
	);
};

export const SandboxWorkspaceView = ({ courseSlug, lessonSlug }: Props) => {
	const {
		data: lesson,
		isPending,
		isError,
	} = useLesson(courseSlug, lessonSlug);

	if (isPending) {
		return <SandboxWorkspaceSkeleton />;
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
		<SandboxWorkspaceInner
			courseSlug={courseSlug}
			isLessonCompleted={lesson.isCompleted}
			lessonId={lesson.id}
			lessonSlug={lessonSlug}
			nextLessonSlug={lesson.nextLesson?.slug ?? null}
		/>
	);
};
