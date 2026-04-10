export type SandboxTest = {
	id: string;
	title: string;
	testFilePath: string;
	testCode: string;
	sortOrder: number;
};

export type SandboxGradingCriterion = {
	id: string;
	name: string;
	description: string;
	maxScore: number;
	sortOrder: number;
};

export type SandboxFramework = {
	id: string;
	name: string;
	icon: string | null;
	sandpackTemplate: string;
	defaultDependencies: Record<string, string>;
	defaultDevDependencies: Record<string, string>;
};

export type SandboxTask = {
	id: string;
	lessonId: string;
	frameworkId: string;
	description: string;
	starterFiles: Record<string, string>;
	dependencies: Record<string, string>;
	entryFile: string;
	readOnlyFiles: string[];
	tests: SandboxTest[];
	criteria: SandboxGradingCriterion[];
	framework: SandboxFramework;
};

export type SandboxAiFeedback = {
	totalScore: number;
	maxScore: number;
	mainPoints: string[];
	improvements: string[];
	criteriaScores: Array<{
		criteriaId: string;
		score: number;
		maxScore: number;
		comment: string;
	}>;
};

export type SandboxSubmissionOutput = {
	id: string;
	files: Record<string, string>;
	testsPassed: boolean;
	score: number;
	maxScore: number;
	aiFeedback: SandboxAiFeedback | null;
	submittedAt: Date;
};

export type SandboxLessonTask = {
	kind: "sandbox";
	task: SandboxTask;
	submission: SandboxSubmissionOutput | null;
};

export type SandboxRunTestsOutput = {
	results: Array<{ title: string; passed: boolean; error?: string }>;
};

export type SandboxSubmitOutput = {
	submission: SandboxSubmissionOutput;
};
