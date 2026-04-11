import { z } from "zod";

export const sandboxLessonIdSchema = z.string().min(1);

export type SandboxLessonIdInput = z.infer<typeof sandboxLessonIdSchema>;
