import { z } from "zod";

export const setPasswordInputSchema = z.object({
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>;

export const setPasswordOutputSchema = z.object({ ok: z.literal(true) });

export type SetPasswordOutput = z.infer<typeof setPasswordOutputSchema>;
