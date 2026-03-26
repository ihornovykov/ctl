import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { language } from "./language";

export const course = pgTable(
	"course",
	{
		id: text("id").primaryKey(),
		languageId: text("language_id")
			.notNull()
			.references(() => language.id),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		description: text("description").notNull(),
		shortDescription: text("short_description").notNull(),
		difficulty: text("difficulty").notNull(),
		estimatedHours: integer("estimated_hours").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
		isPublished: boolean("is_published").notNull().default(false),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [index("idx_courses_language_id").on(t.languageId)]
);

export const lesson = pgTable(
	"lesson",
	{
		id: text("id").primaryKey(),
		courseId: text("course_id")
			.notNull()
			.references(() => course.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		slug: text("slug").notNull(),
		description: text("description").notNull(),
		content: text("content").notNull(),
		hasTask: boolean("has_task").notNull().default(false),
		sortOrder: integer("sort_order").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		index("idx_lessons_course_id").on(t.courseId),
		unique("uq_lessons_course_slug").on(t.courseId, t.slug),
		unique("uq_lessons_course_sort_order").on(t.courseId, t.sortOrder),
	]
);

export const enrollment = pgTable(
	"enrollment",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		courseId: text("course_id")
			.notNull()
			.references(() => course.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		unique("uq_enrollment_user_course").on(t.userId, t.courseId),
		index("idx_enrollment_user_id").on(t.userId),
		index("idx_enrollment_course_id").on(t.courseId),
	]
);

export const lessonProgress = pgTable(
	"lesson_progress",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		lessonId: text("lesson_id")
			.notNull()
			.references(() => lesson.id, { onDelete: "cascade" }),
		completedAt: timestamp("completed_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		unique("uq_lesson_progress_user_lesson").on(t.userId, t.lessonId),
		index("idx_lesson_progress_user_id").on(t.userId),
		index("idx_lesson_progress_lesson_id").on(t.lessonId),
	]
);

export const courseRelations = relations(course, ({ one, many }) => ({
	language: one(language, {
		fields: [course.languageId],
		references: [language.id],
	}),
	lessons: many(lesson),
	enrollments: many(enrollment),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
	course: one(course, {
		fields: [lesson.courseId],
		references: [course.id],
	}),
	progress: many(lessonProgress),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
	user: one(user, {
		fields: [enrollment.userId],
		references: [user.id],
	}),
	course: one(course, {
		fields: [enrollment.courseId],
		references: [course.id],
	}),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
	user: one(user, {
		fields: [lessonProgress.userId],
		references: [user.id],
	}),
	lesson: one(lesson, {
		fields: [lessonProgress.lessonId],
		references: [lesson.id],
	}),
}));
