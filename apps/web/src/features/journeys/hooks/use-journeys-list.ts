import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useJourneysList = () =>
	useQuery(orpc.journeys.listMine.queryOptions());

export const useJourneyPresets = () =>
	useQuery(orpc.journeys.listPresets.queryOptions());
