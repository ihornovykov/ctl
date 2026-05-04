import type { RouterClient } from "@orpc/server";
import { authRouter } from "./auth";
import { coursesRouter } from "./courses";
import { dashboardRouter } from "./dashboard";
import { journeysRouter } from "./journeys";
import { playgroundRouter } from "./playground";
import { tasksRouter } from "./tasks";
import { uploadRouter } from "./upload";

export const appRouter = {
	auth: authRouter,
	courses: coursesRouter,
	tasks: tasksRouter,
	playground: playgroundRouter,
	dashboard: dashboardRouter,
	journeys: journeysRouter,
	upload: uploadRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
