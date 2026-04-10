import { useMutation } from "@tanstack/react-query";

import type { SandboxRunTestsOutput } from "../lib/sandbox-types";
import { useSandboxWorkspace } from "../stores/sandbox-workspace";

type UseSandboxRunTestsParams = {
	sandboxTaskId: string;
};

const mockRunTests = (): SandboxRunTestsOutput => ({
	results: [{ title: "Mock test", passed: true }],
});

export const useSandboxRunTests = ({
	sandboxTaskId: _sandboxTaskId,
}: UseSandboxRunTestsParams) => {
	const setTestResults = useSandboxWorkspace((s) => s.setTestResults);
	const setTestingAll = useSandboxWorkspace((s) => s.setTestingAll);

	return useMutation({
		mutationFn: () => Promise.resolve(mockRunTests()),
		onMutate: () => {
			setTestingAll(true);
			setTestResults([]);
		},
		onSuccess: ({ results }) => {
			setTestResults(results);
		},
		onSettled: () => {
			setTestingAll(false);
		},
	});
};
