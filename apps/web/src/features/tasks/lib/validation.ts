import { z } from "zod";

export const taskLessonSlugsSchema = z.object({
	courseSlug: z.string().min(1),
	lessonSlug: z.string().min(1),
});

export type TaskLessonSlugsInput = z.infer<typeof taskLessonSlugsSchema>;
