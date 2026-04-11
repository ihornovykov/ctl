import { useMutation } from "@tanstack/react-query";

import { client } from "@/shared/api/orpc";

import type { SandboxRunTestsOutput } from "../lib/constants";
import { useSandboxWorkspace } from "../stores/sandbox-workspace";

type UseSandboxRunTestsParams = {
	sandboxTaskId: string;
};

const mockRunTests = (): SandboxRunTestsOutput => ({
	results: [{ title: "Mock test", passed: true }],
});

const viteEnv = (
	import.meta as unknown as { env: Record<string, string | undefined> }
).env.VITE_SANDBOX_VITE_ENABLED;
const viteSandboxEnabled = viteEnv === "true" || viteEnv === "1";

export const useSandboxRunTests = ({
	sandboxTaskId: _sandboxTaskId,
}: UseSandboxRunTestsParams) => {
	const setTestResults = useSandboxWorkspace((s) => s.setTestResults);
	const setTestingAll = useSandboxWorkspace((s) => s.setTestingAll);
	const sessionId = useSandboxWorkspace((s) => s.viteSessionId);

	return useMutation({
		mutationFn: async (): Promise<SandboxRunTestsOutput> => {
			if (viteSandboxEnabled && sessionId) {
				return { results: await client.playground.runTests({ sessionId }) };
			}
			return mockRunTests();
		},
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
