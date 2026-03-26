import { course, db } from "@ctl/db";
import { eq } from "drizzle-orm";

import { publicProcedure } from "../../index";
import { type CourseListOutput, courseSchema } from "./validation";

export const coursesRouter = {
	list: publicProcedure
		.output(courseSchema.array())
		.handler(async (): Promise<CourseListOutput> => {
			const courses = await db.query.course.findMany({
				where: eq(course.isPublished, true),
				with: { language: true },
				orderBy: (c, { asc }) => asc(c.sortOrder),
			});

			return courses.map((c) => ({
				id: c.id,
				title: c.title,
				slug: c.slug,
				shortDescription: c.shortDescription,
				difficulty: c.difficulty,
				estimatedHours: c.estimatedHours,
				sortOrder: c.sortOrder,
				language: {
					id: c.language.id,
					name: c.language.name,
					icon: c.language.icon,
					fileExtension: c.language.fileExtension,
					monacoLanguage: c.language.monacoLanguage,
				},
			}));
		}),
};
