import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/shared/api";
import { useTaskWorkspace } from "../stores/task-workspace";

export const useRunCode = (languageId: string) => {
	const { setRunning, setConsoleOutput } = useTaskWorkspace();

	return useMutation({
		mutationFn: (variables: { taskId: string; code: string }) =>
			client.tasks.run({ ...variables, languageId }),
		onMutate: () => setRunning(true),
		onSuccess: (data) => {
			setConsoleOutput(data.stdout, data.stderr, data.exitCode);
		},
		onError: () => {
			toast.error("Failed to run code");
		},
		onSettled: () => setRunning(false),
	});
};

export const useRunTests = () => {
	const { setTestingAll, setTestResults } = useTaskWorkspace();

	return useMutation({
		mutationFn: (variables: { taskId: string; code: string }) =>
			client.tasks.runTests(variables),
		onMutate: () => setTestingAll(true),
		onSuccess: (data) => {
			setTestResults(data);
		},
		onError: () => {
			toast.error("Failed to run tests");
		},
		onSettled: () => setTestingAll(false),
	});
};
