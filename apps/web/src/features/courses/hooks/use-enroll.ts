import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client, orpc } from "@/shared/api";

export const useEnroll = (slug: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (courseId: string) => client.courses.enroll({ courseId }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.courses.getBySlug.key({ input: { slug } }),
			});
		},
	});
};
