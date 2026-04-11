import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	real,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { lesson } from "./course";
import { language } from "./language";

export const task = pgTable(
	"task",
	{
		id: text("id").primaryKey(),
		lessonId: text("lesson_id")
			.notNull()
			.unique()
			.references(() => lesson.id, { onDelete: "cascade" }),
		description: text("description").notNull(),
		starterCode: text("starter_code").notNull(),
		solutionCode: text("solution_code").notNull(),
		languageId: text("language_id")
			.notNull()
			.references(() => language.id),
		starterFiles: jsonb("starter_files").$type<Record<string, string>>(),
		entryFile: text("entry_file"),
		readOnlyFiles: jsonb("read_only_files").$type<string[]>(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [index("idx_task_lesson_id").on(t.lessonId)]
);

export const taskTest = pgTable(
	"task_test",
	{
		id: text("id").primaryKey(),
		taskId: text("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		testCode: text("test_code").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [index("idx_task_test_task_id").on(t.taskId)]
);

export const gradingCriteria = pgTable(
	"grading_criteria",
	{
		id: text("id").primaryKey(),
		taskId: text("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description").notNull(),
		maxScore: integer("max_score").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [index("idx_grading_criteria_task_id").on(t.taskId)]
);

export const submission = pgTable(
	"submission",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		taskId: text("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		code: text("code").notNull(),
		sandboxFiles: jsonb("sandbox_files").$type<Record<string, string>>(),
		languageId: text("language_id")
			.notNull()
			.references(() => language.id),
		testsPassed: boolean("tests_passed").notNull().default(false),
		score: real("score").notNull().default(0),
		maxScore: real("max_score").notNull().default(0),
		aiFeedback: jsonb("ai_feedback"),
		submittedAt: timestamp("submitted_at").defaultNow().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		unique("uq_submission_user_task").on(t.userId, t.taskId),
		index("idx_submission_user_id").on(t.userId),
		index("idx_submission_task_id").on(t.taskId),
	]
);

export const taskRelations = relations(task, ({ one, many }) => ({
	lesson: one(lesson, {
		fields: [task.lessonId],
		references: [lesson.id],
	}),
	language: one(language, {
		fields: [task.languageId],
		references: [language.id],
	}),
	tests: many(taskTest),
	criteria: many(gradingCriteria),
	submissions: many(submission),
}));

export const taskTestRelations = relations(taskTest, ({ one }) => ({
	task: one(task, {
		fields: [taskTest.taskId],
		references: [task.id],
	}),
}));

export const gradingCriteriaRelations = relations(
	gradingCriteria,
	({ one }) => ({
		task: one(task, {
			fields: [gradingCriteria.taskId],
			references: [task.id],
		}),
	})
);

export const submissionRelations = relations(submission, ({ one }) => ({
	user: one(user, {
		fields: [submission.userId],
		references: [user.id],
	}),
	task: one(task, {
		fields: [submission.taskId],
		references: [task.id],
	}),
	language: one(language, {
		fields: [submission.languageId],
		references: [language.id],
	}),
}));
