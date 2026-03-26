import { z } from "zod";

export const languageSchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string().nullable(),
	fileExtension: z.string(),
	monacoLanguage: z.string(),
});

export const courseSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	shortDescription: z.string(),
	difficulty: z.string(),
	estimatedHours: z.number(),
	sortOrder: z.number(),
	language: languageSchema,
});

export type CourseListItem = z.infer<typeof courseSchema>;
export type CourseListOutput = CourseListItem[];
