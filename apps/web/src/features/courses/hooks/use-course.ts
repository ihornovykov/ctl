import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useCourse = (slug: string) =>
	useQuery(orpc.courses.getBySlug.queryOptions({ input: { slug } }));
