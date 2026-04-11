import { z } from "zod";

export const certificateCourseSlugSchema = z.string().min(1);

export type CertificateCourseSlugInput = z.infer<
	typeof certificateCourseSlugSchema
>;
