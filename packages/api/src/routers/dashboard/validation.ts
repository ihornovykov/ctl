import { z } from "zod";

export const profileUserSchema = z.object({
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	createdAt: z.date(),
});

export const profileStatsSchema = z.object({
	coursesEnrolled: z.number(),
	coursesCompleted: z.number(),
	lessonsCompleted: z.number(),
	totalLearningHours: z.number(),
	currentStreak: z.number(),
	longestStreak: z.number(),
});

export const enrollmentSummarySchema = z.object({
	courseId: z.string(),
	courseTitle: z.string(),
	courseSlug: z.string(),
	difficulty: z.string(),
	estimatedHours: z.number(),
	languageId: z.string(),
	languageName: z.string(),
	languageIcon: z.string().nullable(),
	enrolledAt: z.date(),
	completedLessons: z.number(),
	totalLessons: z.number(),
	isCompleted: z.boolean(),
	completedAt: z.date().nullable(),
	certificateId: z.string().nullable(),
});

export const weeklyLanguageActivityRowSchema = z.object({
	week: z.string(),
	counts: z.record(z.string(), z.number()),
});

export const weeklyLanguageRefSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const weeklyLanguageActivitySchema = z.object({
	rows: z.array(weeklyLanguageActivityRowSchema),
	languages: z.array(weeklyLanguageRefSchema),
});

export const profileOutputSchema = z.object({
	user: profileUserSchema,
	stats: profileStatsSchema,
	enrollments: z.array(enrollmentSummarySchema),
	weeklyLanguageActivity: weeklyLanguageActivitySchema,
});

export type ProfileOutput = z.infer<typeof profileOutputSchema>;
export type EnrollmentSummary = z.infer<typeof enrollmentSummarySchema>;
export type ProfileStats = z.infer<typeof profileStatsSchema>;
export type WeeklyLanguageActivity = z.infer<
	typeof weeklyLanguageActivitySchema
>;
export type WeeklyLanguageActivityRow = z.infer<
	typeof weeklyLanguageActivityRowSchema
>;
export type WeeklyLanguageRef = z.infer<typeof weeklyLanguageRefSchema>;
