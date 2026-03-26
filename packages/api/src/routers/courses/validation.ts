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

export const lessonSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	sortOrder: z.number(),
	isCompleted: z.boolean(),
	isAccessible: z.boolean(),
});

export const courseDetailSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	shortDescription: z.string(),
	difficulty: z.string(),
	estimatedHours: z.number(),
	sortOrder: z.number(),
	language: languageSchema,
	lessons: z.array(lessonSchema),
	isEnrolled: z.boolean(),
	enrolledAt: z.date().nullable(),
	completedLessons: z.number(),
	totalLessons: z.number(),
});

export const courseSlugInput = z.object({ slug: z.string() });
export const enrollInput = z.object({ courseId: z.string() });
export const completeLessonInput = z.object({ lessonId: z.string() });

export type CourseListItem = z.infer<typeof courseSchema>;
export type CourseListOutput = CourseListItem[];
export type LessonItem = z.infer<typeof lessonSchema>;
export type CourseDetail = z.infer<typeof courseDetailSchema>;
export type CourseSlugInput = z.infer<typeof courseSlugInput>;
export type EnrollInput = z.infer<typeof enrollInput>;
export type CompleteLessonInput = z.infer<typeof completeLessonInput>;
