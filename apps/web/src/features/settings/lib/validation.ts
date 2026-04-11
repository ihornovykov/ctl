import { z } from "zod";

export const updateDisplayNameSchema = z.object({
	name: z.string().min(1, "Name is required").max(120),
});

export type UpdateDisplayNameValues = z.infer<typeof updateDisplayNameSchema>;

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "At least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your new password"),
	})
	.refine((v) => v.newPassword === v.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const setPasswordSchema = z
	.object({
		newPassword: z.string().min(8, "At least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.refine((v) => v.newPassword === v.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
