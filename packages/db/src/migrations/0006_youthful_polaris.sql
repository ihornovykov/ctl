ALTER TABLE "submission" ADD COLUMN "sandbox_files" jsonb;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "starter_files" jsonb;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "entry_file" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "read_only_files" jsonb;