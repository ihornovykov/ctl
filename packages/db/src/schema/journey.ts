import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const journeyPreset = pgTable(
	"journey_preset",
	{
		id: text("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		graphJson: jsonb("graph_json").notNull().$type<Record<string, unknown>>(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [index("idx_journey_preset_slug").on(t.slug)]
);

export const userJourney = pgTable(
	"user_journey",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		presetId: text("preset_id").references(() => journeyPreset.id, {
			onDelete: "set null",
		}),
		title: text("title").notNull(),
		graphJson: jsonb("graph_json").notNull().$type<Record<string, unknown>>(),
		graphLocked: boolean("graph_locked").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		index("idx_user_journey_user_id").on(t.userId),
		index("idx_user_journey_preset_id").on(t.presetId),
	]
);

export const userJourneyNodeProgress = pgTable(
	"user_journey_node_progress",
	{
		id: text("id").primaryKey(),
		journeyId: text("journey_id")
			.notNull()
			.references(() => userJourney.id, { onDelete: "cascade" }),
		nodeId: text("node_id").notNull(),
		status: text("status").notNull(),
		chosenCourseId: text("chosen_course_id"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		unique("uq_journey_node_progress_journey_node").on(t.journeyId, t.nodeId),
		index("idx_journey_node_progress_journey_id").on(t.journeyId),
	]
);

export const journeyPresetRelations = relations(journeyPreset, ({ many }) => ({
	userJourneys: many(userJourney),
}));

export const userJourneyRelations = relations(userJourney, ({ one, many }) => ({
	user: one(user, {
		fields: [userJourney.userId],
		references: [user.id],
	}),
	preset: one(journeyPreset, {
		fields: [userJourney.presetId],
		references: [journeyPreset.id],
	}),
	nodeProgress: many(userJourneyNodeProgress),
}));

export const userJourneyNodeProgressRelations = relations(
	userJourneyNodeProgress,
	({ one }) => ({
		journey: one(userJourney, {
			fields: [userJourneyNodeProgress.journeyId],
			references: [userJourney.id],
		}),
	})
);
