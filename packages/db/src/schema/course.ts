import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

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

export const courseRelations = relations(course, ({ one }) => ({
	language: one(language, {
		fields: [course.languageId],
		references: [language.id],
	}),
}));
