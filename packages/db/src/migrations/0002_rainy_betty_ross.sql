CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_enrollment_user_course" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lessons_course_slug" UNIQUE("course_id","slug"),
	CONSTRAINT "uq_lessons_course_sort_order" UNIQUE("course_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_progress_user_lesson" UNIQUE("user_id","lesson_id")
);
--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_enrollment_user_id" ON "enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_enrollment_course_id" ON "enrollment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_lessons_course_id" ON "lesson" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_user_id" ON "lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_lesson_id" ON "lesson_progress" USING btree ("lesson_id");