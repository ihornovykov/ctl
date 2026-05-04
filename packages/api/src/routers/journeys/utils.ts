import { and, course, db, eq, inArray, lesson, lessonProgress } from "@ctl/db";

import type { CourseCompletionStats, JourneyGraph } from "./validation";

export const extractCourseIdsFromGraph = (graph: JourneyGraph): string[] => {
	const ids = new Set<string>();
	for (const node of graph.nodes) {
		const cid = node.data.courseId;
		if (typeof cid === "string" && cid.length > 0) {
			ids.add(cid);
		}
	}
	return [...ids];
};

export const extractCourseSlugsFromGraph = (graph: JourneyGraph): string[] => {
	const slugs = new Set<string>();
	for (const node of graph.nodes) {
		const slug = node.data.courseSlug;
		if (typeof slug === "string" && slug.length > 0) {
			slugs.add(slug);
		}
	}
	return [...slugs];
};

export const resolveCourseSlugsInGraph = async (
	graph: JourneyGraph
): Promise<JourneyGraph> => {
	const slugs = extractCourseSlugsFromGraph(graph);
	if (slugs.length === 0) {
		return graph;
	}

	const rows = await db.query.course.findMany({
		where: inArray(course.slug, slugs),
		columns: { id: true, slug: true },
	});

	const bySlug = new Map(rows.map((r) => [r.slug, r.id]));
	const missing = slugs.filter((s) => !bySlug.has(s));
	if (missing.length > 0) {
		return Promise.reject(
			new Error(`Unknown or unpublished course slugs: ${missing.join(", ")}`)
		);
	}

	const nodes = graph.nodes.map((node) => {
		const slug = node.data.courseSlug;
		if (typeof slug !== "string" || slug.length === 0) {
			return node;
		}
		const courseId = bySlug.get(slug);
		const { courseSlug: _cs, ...dataRest } = node.data;
		return {
			...node,
			data: { ...dataRest, courseId },
		};
	});

	return { ...graph, nodes };
};

export const buildCourseCompletionMap = async (
	userId: string,
	courseIds: string[]
): Promise<Record<string, CourseCompletionStats>> => {
	if (courseIds.length === 0) {
		return {};
	}

	const lessonRows = await db.query.lesson.findMany({
		where: inArray(lesson.courseId, courseIds),
		columns: { id: true, courseId: true },
	});

	const lessonsByCourse = new Map<string, string[]>();
	for (const row of lessonRows) {
		const list = lessonsByCourse.get(row.courseId) ?? [];
		list.push(row.id);
		lessonsByCourse.set(row.courseId, list);
	}

	const allLessonIds = lessonRows.map((r) => r.id);
	const progressRows =
		allLessonIds.length > 0
			? await db.query.lessonProgress.findMany({
					where: and(
						eq(lessonProgress.userId, userId),
						inArray(lessonProgress.lessonId, allLessonIds)
					),
					columns: { lessonId: true },
				})
			: [];

	const completedSet = new Set(progressRows.map((p) => p.lessonId));

	const result: Record<string, CourseCompletionStats> = {};
	for (const courseId of courseIds) {
		const lessonIds = lessonsByCourse.get(courseId) ?? [];
		const totalLessons = lessonIds.length;
		let completedLessons = 0;
		for (const lid of lessonIds) {
			if (completedSet.has(lid)) {
				completedLessons++;
			}
		}
		const isGloballyComplete =
			totalLessons > 0 && completedLessons === totalLessons;
		result[courseId] = {
			totalLessons,
			completedLessons,
			isGloballyComplete,
		};
	}
	return result;
};

export const verifyCourseIdsExist = async (
	courseIds: string[]
): Promise<void> => {
	if (courseIds.length === 0) {
		return;
	}
	const rows = await db.query.course.findMany({
		where: inArray(course.id, courseIds),
		columns: { id: true },
	});
	const found = new Set(rows.map((r) => r.id));
	const missing = courseIds.filter((id) => !found.has(id));
	if (missing.length > 0) {
		throw new Error(`Invalid course ids: ${missing.join(", ")}`);
	}
};
