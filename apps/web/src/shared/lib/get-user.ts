import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/shared/middlewares";

export const getUser = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => {
		return context?.session;
	});
