import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { authRouter } from "./auth";
import { coursesRouter } from "./courses";
import { dashboardRouter } from "./dashboard";
import { playgroundRouter } from "./playground";
import { tasksRouter } from "./tasks";
import { uploadRouter } from "./upload";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	auth: authRouter,
	courses: coursesRouter,
	tasks: tasksRouter,
	playground: playgroundRouter,
	dashboard: dashboardRouter,
	upload: uploadRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
