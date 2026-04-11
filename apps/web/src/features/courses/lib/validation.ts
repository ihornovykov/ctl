import { z } from "zod";

export const courseSlugSchema = z.string().min(1);

export type CourseSlugInput = z.infer<typeof courseSlugSchema>;
