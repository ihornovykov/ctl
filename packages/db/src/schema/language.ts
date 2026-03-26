import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { course } from "./course";

export const language = pgTable("language", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	icon: text("icon"),
	dockerImage: text("docker_image").notNull(),
	fileExtension: text("file_extension").notNull(),
	monacoLanguage: text("monaco_language").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const languageRelations = relations(language, ({ many }) => ({
	courses: many(course),
}));
