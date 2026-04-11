import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { Cpu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConsoleOutput, TestResults } from "@/features/tasks";
import { useSandboxMainSplit } from "../hooks/use-sandbox-main-split";
import { useSandboxPlaygroundLogs } from "../hooks/use-sandbox-playground-logs";
import { useSandboxPreview } from "../hooks/use-sandbox-preview";
import { useSandboxRunTests } from "../hooks/use-sandbox-run-tests";
import {
	SANDBOX_WORKSPACE_AUTO_SAVE_DELAY_MS,
	SANDBOX_WORKSPACE_RIGHT_TABS,
	type SandboxSubmissionOutput,
	type SandboxTask,
} from "../lib/constants";
import {
	buildSandboxFiles,
	buildSandboxTreeItems,
	loadSavedFiles,
	saveFiles,
} from "../lib/utils";
import {
	type SandboxActiveTab,
	useSandboxWorkspace,
} from "../stores/sandbox-workspace";
import { SandboxCodeEditor } from "./sandbox-code-editor";
import { SandboxAiFeedback, SandboxDescription } from "./sandbox-description";
import { SandboxFileTree } from "./sandbox-file-tree";
import { SandboxPreviewIframe } from "./sandbox-preview-iframe";
import { SandboxPreviewStatus } from "./sandbox-preview-status";
import { SandboxToolbar } from "./sandbox-toolbar";
import "./sandbox-workspace.css";

type SandboxPreviewPanelProps = {
	html: string | null;
	previewUrl: string | null;
	error: string | null;
	isBuilding: boolean;
};

const SandboxPreviewPanel = ({
	html,
	previewUrl,
	error,
	isBuilding,
}: SandboxPreviewPanelProps) => (
	<div className="relative z-0 flex min-h-0 w-full min-w-0 flex-1 flex-col">
		<SandboxPreviewIframe html={html} previewSrc={previewUrl} />
		<SandboxPreviewStatus error={error} isBuilding={isBuilding} />
	</div>
);

type SandboxRightTabsBarProps = {
	activeTab: SandboxActiveTab;
	setActiveTab: (tab: SandboxActiveTab) => void;
	testResults: Array<{ title: string; passed: boolean; error?: string }>;
	hasAiFeedback: boolean;
	hasConsoleText: boolean;
	showConsoleTab: boolean;
};

const SandboxRightTabsBar = ({
	activeTab,
	setActiveTab,
	testResults,
	hasAiFeedback,
	hasConsoleText,
	showConsoleTab,
}: SandboxRightTabsBarProps) => (
	<div className="flex h-11 shrink-0 items-center border-border/40 border-b px-2">
		{(showConsoleTab
			? SANDBOX_WORKSPACE_RIGHT_TABS
			: SANDBOX_WORKSPACE_RIGHT_TABS.filter((t) => t.id !== "console")
		).map(({ id, label, icon: Icon }) => {
			const isActive = activeTab === id;
			const showBadge =
				(id === "results" && (testResults.length > 0 || hasAiFeedback)) ||
				(id === "console" && hasConsoleText);
			return (
				<button
					className={cn(
						"relative flex h-full items-center gap-1.5 border-b-2 px-3 font-medium text-sm transition-colors",
						isActive
							? "border-primary text-foreground"
							: "border-transparent text-muted-foreground hover:text-foreground"
					)}
					key={id}
					onClick={() => setActiveTab(id)}
					type="button"
				>
					<Icon className="size-3.5" />
					{label}
					{showBadge ? (
						<span
							className={cn(
								"size-1.5 rounded-full",
								hasAiFeedback && id === "results" ? "bg-primary" : "bg-sky-500"
							)}
						/>
					) : null}
				</button>
			);
		})}

		{hasAiFeedback ? (
			<div className="ml-auto flex items-center gap-1.5 px-2">
				<Cpu className="size-3.5 text-primary" />
				<span className="font-semibold text-primary text-xs">AI Graded</span>
			</div>
		) : null}
	</div>
);

type SandboxRightPanelLayersProps = {
	activeTab: SandboxActiveTab;
	html: string | null;
	previewUrl: string | null;
	error: string | null;
	isBuilding: boolean;
	task: SandboxTask;
	currentSubmission: SandboxSubmissionOutput | null;
	viteSandboxEnabled: boolean;
	viteSessionId: string | null;
	isReadOnly: boolean;
	consoleOutput: string;
	consoleError: string;
	consoleExitCode: number | null;
	testResults: Array<{ title: string; passed: boolean; error?: string }>;
};

const SandboxRightPanelLayers = ({
	activeTab,
	html,
	previewUrl,
	error,
	isBuilding,
	task,
	currentSubmission,
	viteSandboxEnabled,
	viteSessionId,
	isReadOnly,
	consoleOutput,
	consoleError,
	consoleExitCode,
	testResults,
}: SandboxRightPanelLayersProps) => (
	<div className="relative isolate min-h-0 flex-1 overflow-hidden">
		<div
			className={cn(
				"absolute inset-0 z-0 flex min-h-0 flex-col overflow-hidden",
				activeTab !== "preview" && "pointer-events-none opacity-0"
			)}
		>
			<SandboxPreviewPanel
				error={error}
				html={html}
				isBuilding={isBuilding}
				previewUrl={previewUrl}
			/>
		</div>

		{activeTab === "overview" ? (
			<div className="absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col overflow-hidden bg-background">
				<SandboxDescription description={task.description} />
			</div>
		) : null}

		{!isReadOnly && activeTab === "console" ? (
			<div className="absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col overflow-hidden bg-background">
				<ConsoleOutput
					emptyDescription={
						viteSandboxEnabled
							? "Dev server logs appear here when the preview session is running."
							: "Set VITE_SANDBOX_VITE_ENABLED=true and use Docker preview to stream logs here."
					}
					emptyTitle="No console output yet"
					exitCode={consoleExitCode}
					isStreaming={
						viteSandboxEnabled && Boolean(viteSessionId) && !isReadOnly
					}
					stderr={consoleError}
					stdout={consoleOutput}
				/>
			</div>
		) : null}

		{activeTab === "results" ? (
			<div className="absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col overflow-hidden bg-background">
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					{currentSubmission?.aiFeedback ? (
						<SandboxAiFeedback
							criteria={task.criteria}
							submission={currentSubmission}
						/>
					) : (
						<TestResults
							emptyHint="Click Run Tests or Submit to run all tests."
							results={testResults}
						/>
					)}
				</div>
			</div>
		) : null}
	</div>
);

type Props = {
	task: SandboxTask;
	existingSubmission: SandboxSubmissionOutput | null;
	onSubmit: (
		files: Record<string, string>,
		testResults: Array<{ title: string; passed: boolean; error?: string }>
	) => void;
	onNextLesson: () => void;
	courseSlug: string;
	lessonSlug: string;
	isCompletingLesson: boolean;
};

export const SandboxWorkspace = ({
	task,
	existingSubmission,
	onSubmit,
	onNextLesson,
	courseSlug,
	lessonSlug,
	isCompletingLesson,
}: Props) => {
	const {
		activeTab,
		isSubmitting,
		isTestingAll,
		testResults,
		setActiveTab,
		setTestResults,
		setTestingAll,
		files,
		activeFile,
		setFiles,
		updateFile,
		setActiveFile,
		viteSessionId,
		consoleOutput,
		consoleError,
		consoleExitCode,
	} = useSandboxWorkspace();

	const { rowRef, splitGridTemplateColumns, onResizeHandlePointerDown } =
		useSandboxMainSplit();

	const currentSubmission = existingSubmission;
	const isReadOnly = !!currentSubmission?.testsPassed;
	const hasAiFeedback = !!currentSubmission?.aiFeedback;
	const allTestsPassed =
		testResults.length > 0 && testResults.every((r) => r.passed);

	useEffect(() => {
		if (isReadOnly && activeTab === "console") {
			setActiveTab("preview");
		}
	}, [isReadOnly, activeTab, setActiveTab]);

	useEffect(() => {
		const saved = loadSavedFiles(task.id);
		const merged =
			existingSubmission === null ? saved : (existingSubmission.files ?? saved);
		const initialFiles = buildSandboxFiles(task, merged);
		setFiles(initialFiles, task.entryFile);
	}, [task, existingSubmission, setFiles]);

	useEffect(() => {
		if (isReadOnly) {
			return;
		}
		const timeout = setTimeout(() => {
			const editable: Record<string, string> = {};
			for (const [filePath, entry] of Object.entries(files)) {
				if (!entry.readOnly) {
					editable[filePath] = entry.code;
				}
			}
			if (Object.keys(editable).length > 0) {
				saveFiles(task.id, editable);
			}
		}, SANDBOX_WORKSPACE_AUTO_SAVE_DELAY_MS);
		return () => clearTimeout(timeout);
	}, [files, task.id, isReadOnly]);

	const { html, previewUrl, isBuilding, error, triggerNow } = useSandboxPreview(
		{
			task,
			enabled: true,
		}
	);

	const viteEnv = (
		import.meta as unknown as { env: Record<string, string | undefined> }
	).env.VITE_SANDBOX_VITE_ENABLED;
	const viteSandboxEnabled = viteEnv === "true" || viteEnv === "1";

	useSandboxPlaygroundLogs({
		sessionId: viteSessionId,
		enabled: viteSandboxEnabled && !isReadOnly,
	});

	const runTestsMutation = useSandboxRunTests({ sandboxTaskId: task.id });

	const [isFileTreeVisible, setIsFileTreeVisible] = useState(true);

	const filesStructureKey = useMemo(
		() => Object.keys(files).sort().join("|"),
		[files]
	);

	const { items: sandboxTreeItems, rootId: sandboxTreeRootId } = useMemo(
		() => buildSandboxTreeItems(files),
		[files]
	);

	const activeCode = files[activeFile]?.code ?? "";
	const isCurrentFileReadOnly = files[activeFile]?.readOnly ?? false;

	const handleEditorChange = useCallback(
		(val: string) => {
			if (isReadOnly || isCurrentFileReadOnly) {
				return;
			}
			updateFile(activeFile, val);
		},
		[isReadOnly, isCurrentFileReadOnly, activeFile, updateFile]
	);

	const handleEditorSave = useCallback(
		(latestCode: string) => {
			if (isReadOnly || isCurrentFileReadOnly) {
				return;
			}
			updateFile(activeFile, latestCode);
			triggerNow();
		},
		[isReadOnly, isCurrentFileReadOnly, activeFile, updateFile, triggerNow]
	);

	const handleSubmit = () => {
		setActiveTab("results");
		const editable: Record<string, string> = {};
		for (const [filePath, entry] of Object.entries(files)) {
			if (!entry.readOnly) {
				editable[filePath] = entry.code;
			}
		}
		onSubmit(editable, testResults);
	};

	return (
		<div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-muted/10">
			<SandboxToolbar
				allTestsPassed={allTestsPassed}
				courseSlug={courseSlug}
				frameworkName={task.framework.name}
				isCompletingLesson={isCompletingLesson}
				isReadOnly={isReadOnly}
				isSubmitting={isSubmitting}
				isTestingAll={isTestingAll}
				lessonSlug={lessonSlug}
				onNextLesson={onNextLesson}
				onRunTests={() => {
					setActiveTab("results");
					setTestResults([]);
					setTestingAll(true);
					runTestsMutation.mutate();
				}}
				onSubmit={handleSubmit}
			/>

			<div
				className="grid min-h-0 w-full min-w-0 max-w-full flex-1 grid-rows-1 gap-x-2 overflow-hidden px-3 pt-2 pb-3"
				ref={rowRef}
				style={{ gridTemplateColumns: splitGridTemplateColumns }}
			>
				<div className="relative z-10 flex min-h-0 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm">
					<div
						className={cn(
							"flex shrink-0 flex-col overflow-hidden border-border/40 border-r bg-muted/20 transition-[width] duration-200 ease-out",
							isFileTreeVisible ? "w-48" : "w-11"
						)}
					>
						{isFileTreeVisible ? (
							<>
								<div className="flex h-11 shrink-0 items-center gap-2 border-border/40 border-b bg-background px-2">
									<span className="min-w-0 flex-1 truncate ps-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
										Files
									</span>
									<Button
										aria-label="Hide file tree"
										className="size-8 shrink-0 text-muted-foreground"
										onClick={() => setIsFileTreeVisible(false)}
										size="icon"
										type="button"
										variant="ghost"
									>
										<PanelLeftClose className="size-4" />
									</Button>
								</div>
								<div className="min-h-0 flex-1 overflow-y-auto bg-background p-1">
									<SandboxFileTree
										activeFile={activeFile}
										items={sandboxTreeItems}
										key={filesStructureKey}
										onSelectFile={setActiveFile}
										rootId={sandboxTreeRootId}
									/>
								</div>
							</>
						) : (
							<div className="flex flex-col items-center bg-background py-2">
								<Button
									aria-label="Show file tree"
									className="size-8 text-muted-foreground"
									onClick={() => setIsFileTreeVisible(true)}
									size="icon"
									type="button"
									variant="ghost"
								>
									<PanelLeftOpen className="size-4" />
								</Button>
							</div>
						)}
					</div>

					<div className="min-h-0 min-w-0 flex-1 overflow-hidden">
						<SandboxCodeEditor
							code={activeCode}
							modelPath={activeFile}
							onChange={
								isReadOnly || isCurrentFileReadOnly
									? undefined
									: handleEditorChange
							}
							onSave={
								isReadOnly || isCurrentFileReadOnly
									? undefined
									: handleEditorSave
							}
							readOnly={isReadOnly || isCurrentFileReadOnly}
						/>
					</div>
				</div>

				<button
					aria-label="Drag to resize the editor and preview panels"
					className="group relative z-20 flex w-full min-w-0 cursor-col-resize touch-none items-stretch justify-center self-stretch rounded-sm border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					onPointerDown={onResizeHandlePointerDown}
					type="button"
				>
					<span
						aria-hidden
						className="my-3 w-px max-w-full shrink-0 rounded-full bg-border transition-colors group-hover:bg-primary/50 group-active:bg-primary"
					/>
				</button>

				<div className="relative z-0 flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm">
					<SandboxRightTabsBar
						activeTab={activeTab}
						hasAiFeedback={hasAiFeedback}
						hasConsoleText={Boolean(consoleOutput) || Boolean(consoleError)}
						setActiveTab={setActiveTab}
						showConsoleTab={!isReadOnly}
						testResults={testResults}
					/>

					<SandboxRightPanelLayers
						activeTab={activeTab}
						consoleError={consoleError}
						consoleExitCode={consoleExitCode}
						consoleOutput={consoleOutput}
						currentSubmission={currentSubmission}
						error={error}
						html={html}
						isBuilding={isBuilding}
						isReadOnly={isReadOnly}
						previewUrl={previewUrl}
						task={task}
						testResults={testResults}
						viteSandboxEnabled={viteSandboxEnabled}
						viteSessionId={viteSessionId}
					/>
				</div>
			</div>
		</div>
	);
};
