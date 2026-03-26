import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useCourses = () => useQuery(orpc.courses.list.queryOptions());
