import type { TestResult } from "@ctl/api/routers/tasks/validation";

type SandpackLeafTest = {
	name: string;
	status: string;
	errors: Array<{ message?: string }>;
};

type SandpackSpecBlock = {
	tests?: Record<string, SandpackLeafTest>;
	describes?: Record<string, SandpackSpecBlock>;
	error?: unknown;
};

const collectLeafTests = (block: SandpackSpecBlock): SandpackLeafTest[] => {
	const direct = Object.values(block.tests ?? {});
	const nested = Object.values(block.describes ?? {}).flatMap((d) =>
		collectLeafTests(d)
	);
	return [...direct, ...nested];
};

const formatTestError = (test: SandpackLeafTest) => {
	const parts = test.errors.map((e) => e.message).filter(Boolean);
	const label = test.name;
	return parts.length > 0 ? `${label}\n${parts.join("\n")}` : label;
};

const specFileErrorMessage = (error: unknown): string => {
	if (typeof error === "string") {
		return error;
	}
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return "Test file error";
};

export const mapSandpackSpecsToTestResults = (
	specs: Record<string, SandpackSpecBlock>,
	orderedTests: Array<{ title: string; testFilePath: string }>
): TestResult[] =>
	orderedTests.map(({ title, testFilePath }) => {
		const spec = specs[testFilePath];
		if (!spec) {
			return {
				title,
				passed: false,
				error: "No results for this test file.",
			};
		}
		if (spec.error != null) {
			return {
				title,
				passed: false,
				error: specFileErrorMessage(spec.error),
			};
		}
		const tests = collectLeafTests(spec);
		if (tests.length === 0) {
			return {
				title,
				passed: false,
				error: "No tests found in file.",
			};
		}
		const failing = tests.filter((t) => t.status === "fail");
		const unfinished = tests.filter(
			(t) => t.status === "idle" || t.status === "running"
		);
		if (failing.length > 0) {
			return {
				title,
				passed: false,
				error: failing.map(formatTestError).join("\n\n"),
			};
		}
		if (unfinished.length > 0) {
			return {
				title,
				passed: false,
				error: "Some tests did not finish.",
			};
		}
		return { title, passed: true };
	});
