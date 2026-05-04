import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api";

export const useJourney = (journeyId: string) =>
	useQuery(orpc.journeys.getById.queryOptions({ input: { journeyId } }));
