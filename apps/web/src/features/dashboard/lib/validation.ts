import { z } from "zod";

export const dashboardProfileTabSchema = z.enum(["overview", "activity"]);

export type DashboardProfileTab = z.infer<typeof dashboardProfileTabSchema>;
