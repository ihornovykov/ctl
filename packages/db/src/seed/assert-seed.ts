import type { CourseSeedBundle, MergedSeedData } from "./types";

const SANDBOX_LANGS = new Set(["react", "vue"]);

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This function is used to assert the seed data
export const assertSeedData = (data: MergedSeedData): void => {
	const errors: string[] = [];

	const courseIds = new Set(data.courses.map((c) => c.id));
	const lessonIds = new Set(data.lessons.map((l) => l.id));
	const taskIds = new Set(data.tasks.map((t) => t.id));

	for (const course of data.courses) {
		const courseLessons = data.lessons.filter((l) => l.courseId === course.id);
		if (courseLessons.length < 15) {
			errors.push(
				`Course ${course.id} has ${courseLessons.length} lessons (expected >= 15)`
			);
		}

		const slugs = new Set<string>();
		const orders = new Set<number>();
		for (const lesson of courseLessons) {
			if (slugs.has(lesson.slug)) {
				errors.push(`Duplicate slug ${lesson.slug} in ${course.id}`);
			}
			slugs.add(lesson.slug);
			if (orders.has(lesson.sortOrder)) {
				errors.push(`Duplicate sortOrder ${lesson.sortOrder} in ${course.id}`);
			}
			orders.add(lesson.sortOrder);
		}
	}

	for (const lesson of data.lessons) {
		if (!courseIds.has(lesson.courseId)) {
			errors.push(`Lesson ${lesson.id} references unknown course`);
		}
		const lessonTasks = data.tasks.filter((t) => t.lessonId === lesson.id);
		if (lesson.hasTask && lessonTasks.length !== 1) {
			errors.push(
				`Lesson ${lesson.id} hasTask=true but has ${lessonTasks.length} tasks`
			);
		}
		if (!lesson.hasTask && lessonTasks.length > 0) {
			errors.push(`Lesson ${lesson.id} hasTask=false but has tasks`);
		}
	}

	for (const t of data.tasks) {
		if (!lessonIds.has(t.lessonId)) {
			errors.push(`Task ${t.id} references unknown lesson`);
		}
		if (SANDBOX_LANGS.has(t.languageId)) {
			if (!(t.starterFiles && t.entryFile)) {
				errors.push(`Sandbox task ${t.id} missing starterFiles/entryFile`);
			}
		} else if (!(t.starterCode.trim() && t.solutionCode.trim())) {
			errors.push(`Task ${t.id} missing starterCode/solutionCode`);
		}
	}

	for (const test of data.taskTests) {
		if (!taskIds.has(test.taskId)) {
			errors.push(`Test ${test.id} references unknown task`);
		}
	}

	for (const c of data.gradingCriteria) {
		if (!taskIds.has(c.taskId)) {
			errors.push(`Criteria ${c.id} references unknown task`);
		}
	}

	for (const t of data.tasks) {
		const tests = data.taskTests.filter((x) => x.taskId === t.id);
		if (tests.length < 3) {
			errors.push(`Task ${t.id} has ${tests.length} tests (expected >= 3)`);
		}
		const criteria = data.gradingCriteria.filter((x) => x.taskId === t.id);
		if (criteria.length < 3) {
			errors.push(
				`Task ${t.id} has ${criteria.length} criteria (expected >= 3)`
			);
		}
	}

	if (errors.length > 0) {
		throw new Error(`Seed validation failed:\n${errors.join("\n")}`);
	}
};

export const assertCourseBundle = (bundle: CourseSeedBundle): void => {
	assertSeedData({
		courses: [bundle.course],
		lessons: bundle.lessons,
		tasks: bundle.tasks,
		taskTests: bundle.taskTests,
		gradingCriteria: bundle.gradingCriteria,
	});
};
