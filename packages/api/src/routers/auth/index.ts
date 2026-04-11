import { auth } from "@ctl/auth";
import { ORPCError } from "@orpc/server";
import { fromNodeHeaders } from "better-auth/node";

import { protectedProcedure } from "../../index";
import {
	type SetPasswordOutput,
	setPasswordInputSchema,
	setPasswordOutputSchema,
} from "./validation";

export const authRouter = {
	setPassword: protectedProcedure
		.input(setPasswordInputSchema)
		.output(setPasswordOutputSchema)
		.handler(async ({ context, input }): Promise<SetPasswordOutput> => {
			try {
				await auth.api.setPassword({
					body: { newPassword: input.newPassword },
					headers: fromNodeHeaders(context.requestHeaders),
				});
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to set password";
				throw new ORPCError("BAD_REQUEST", { message });
			}
			return { ok: true };
		}),
};
