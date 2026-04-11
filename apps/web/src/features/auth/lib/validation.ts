import { z } from "zod";

import { AUTH_NAME_MIN_LENGTH, AUTH_PASSWORD_MIN_LENGTH } from "./constants";

export const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z
		.string()
		.min(
			AUTH_PASSWORD_MIN_LENGTH,
			`Password must be at least ${AUTH_PASSWORD_MIN_LENGTH} characters`
		),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
	name: z
		.string()
		.min(
			AUTH_NAME_MIN_LENGTH,
			`Name must be at least ${AUTH_NAME_MIN_LENGTH} characters`
		),
	email: z.string().email("Please enter a valid email address"),
	password: z
		.string()
		.min(
			AUTH_PASSWORD_MIN_LENGTH,
			`Password must be at least ${AUTH_PASSWORD_MIN_LENGTH} characters`
		),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
