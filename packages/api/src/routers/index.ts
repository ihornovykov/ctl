import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { coursesRouter } from "./courses";
import { dashboardRouter } from "./dashboard";
import { playgroundRouter } from "./playground";
import { tasksRouter } from "./tasks";

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
	courses: coursesRouter,
	tasks: tasksRouter,
	playground: playgroundRouter,
	dashboard: dashboardRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
