import type { CourseListItem } from "@ctl/api/routers/courses/validation";

export const COURSE_CATEGORY_ORDER = [
	"foundations",
	"languages",
	"frameworks",
] as const;

export type CourseCategoryId = (typeof COURSE_CATEGORY_ORDER)[number];

export const COURSE_CATEGORY_TITLES: Record<CourseCategoryId, string> = {
	foundations: "Foundations",
	languages: "Languages",
	frameworks: "Frameworks",
};

const isKnownCategory = (id: string): id is CourseCategoryId =>
	(COURSE_CATEGORY_ORDER as readonly string[]).includes(id);

export const groupCoursesByCategory = (
	courses: CourseListItem[]
): { id: string; title: string; courses: CourseListItem[] }[] => {
	const buckets = new Map<string, CourseListItem[]>();
	for (const c of courses) {
		const key = isKnownCategory(c.category) ? c.category : "languages";
		const list = buckets.get(key) ?? [];
		list.push(c);
		buckets.set(key, list);
	}

	const ordered: { id: string; title: string; courses: CourseListItem[] }[] =
		[];
	for (const id of COURSE_CATEGORY_ORDER) {
		const list = buckets.get(id);
		if (list?.length) {
			ordered.push({
				id,
				title: COURSE_CATEGORY_TITLES[id],
				courses: list,
			});
		}
	}
	return ordered;
};
