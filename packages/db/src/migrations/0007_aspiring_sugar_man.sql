CREATE TABLE "journey_preset" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"graph_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "journey_preset_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_journey" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"preset_id" text,
	"title" text NOT NULL,
	"graph_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_journey_node_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"journey_id" text NOT NULL,
	"node_id" text NOT NULL,
	"status" text NOT NULL,
	"chosen_course_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_journey_node_progress_journey_node" UNIQUE("journey_id","node_id")
);
--> statement-breakpoint
ALTER TABLE "user_journey" ADD CONSTRAINT "user_journey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journey" ADD CONSTRAINT "user_journey_preset_id_journey_preset_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."journey_preset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journey_node_progress" ADD CONSTRAINT "user_journey_node_progress_journey_id_user_journey_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."user_journey"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_journey_preset_slug" ON "journey_preset" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_user_journey_user_id" ON "user_journey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_journey_preset_id" ON "user_journey" USING btree ("preset_id");--> statement-breakpoint
CREATE INDEX "idx_journey_node_progress_journey_id" ON "user_journey_node_progress" USING btree ("journey_id");