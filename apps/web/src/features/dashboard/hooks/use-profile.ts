import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useProfile = () =>
	useQuery(orpc.dashboard.getProfile.queryOptions());
