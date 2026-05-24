export type LanguageRow = {
	id: string;
	name: string;
	icon: string;
	dockerImage: string;
	fileExtension: string;
	monacoLanguage: string;
};

export type CourseRow = {
	id: string;
	languageId: string;
	title: string;
	slug: string;
	shortDescription: string;
	description: string;
	difficulty: string;
	estimatedHours: number;
	sortOrder: number;
	isPublished: boolean;
};

export type LessonRow = {
	id: string;
	courseId: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	hasTask: boolean;
	sortOrder: number;
};

export type TaskRow = {
	id: string;
	lessonId: string;
	languageId: string;
	description: string;
	starterCode: string;
	solutionCode: string;
	starterFiles?: Record<string, string>;
	entryFile?: string;
	readOnlyFiles?: string[];
};

export type TaskTestRow = {
	id: string;
	taskId: string;
	title: string;
	testCode: string;
	sortOrder: number;
};

export type GradingCriteriaRow = {
	id: string;
	taskId: string;
	name: string;
	description: string;
	maxScore: number;
	sortOrder: number;
};

export type CourseSeedBundle = {
	course: CourseRow;
	lessons: LessonRow[];
	tasks: TaskRow[];
	taskTests: TaskTestRow[];
	gradingCriteria: GradingCriteriaRow[];
};

export type MergedSeedData = {
	courses: CourseRow[];
	lessons: LessonRow[];
	tasks: TaskRow[];
	taskTests: TaskTestRow[];
	gradingCriteria: GradingCriteriaRow[];
};

export const mergeCourseBundles = (
	bundles: CourseSeedBundle[]
): MergedSeedData => ({
	courses: bundles.map((b) => b.course),
	lessons: bundles.flatMap((b) => b.lessons),
	tasks: bundles.flatMap((b) => b.tasks),
	taskTests: bundles.flatMap((b) => b.taskTests),
	gradingCriteria: bundles.flatMap((b) => b.gradingCriteria),
});
