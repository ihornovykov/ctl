import type { CourseListItem } from "@ctl/api/routers/courses/validation";

import { FRAMEWORK_LANGUAGE_IDS } from "./constants";

export const partitionCoursesByStack = (courses: CourseListItem[]) => {
	const languageCourses = courses.filter(
		(c) => !FRAMEWORK_LANGUAGE_IDS.has(c.language.id)
	);
	const frameworkCourses = courses.filter((c) =>
		FRAMEWORK_LANGUAGE_IDS.has(c.language.id)
	);
	return { languageCourses, frameworkCourses };
};
