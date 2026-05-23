import Docker from "dockerode";

const docker = new Docker();

type ExecResult = {
	stdout: string;
	stderr: string;
	exitCode: number;
};

type TestResult = {
	title: string;
	passed: boolean;
	error?: string;
};

type LanguageConfig = {
	image: string;
	ext: string;
	runCmd: (file: string) => string[];
	memoryBytes?: number;
	timeoutMs?: number;
	runTestsSequential?: boolean;
};

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
	javascript: {
		image: "node:20-alpine",
		ext: ".js",
		runCmd: (file) => ["node", file],
	},
	typescript: {
		image: "node:22-alpine",
		ext: ".ts",
		runCmd: (file) => ["node", "--experimental-strip-types", file],
	},
	python: {
		image: "python:3.12-alpine",
		ext: ".py",
		runCmd: (file) => ["python", file],
	},
	go: {
		image: "golang:1.22-alpine",
		ext: ".go",
		runCmd: (file) => ["go", "run", file],
		memoryBytes: 512 * 1024 * 1024,
		timeoutMs: 45_000,
		runTestsSequential: true,
	},
	c: {
		image: "gcc:14",
		ext: ".c",
		runCmd: (file) => [`gcc -o /work/prog /work/${file} -lm && /work/prog`],
		memoryBytes: 256 * 1024 * 1024,
	},
	cpp: {
		image: "gcc:14",
		ext: ".cpp",
		runCmd: (file) => [
			`g++ -std=c++17 -o /work/prog /work/${file} && /work/prog`,
		],
		memoryBytes: 256 * 1024 * 1024,
	},
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MEMORY = 128 * 1024 * 1024;
const GO_PACKAGE_LINE_RE = /^(package\s+\w+[^\n]*\n)/m;
const GO_FUNC_MAIN_RE = /\bfunc main\b/;
const GO_FMT_USAGE_RE = /\bfmt\./;

const renameGoMainForTests = (code: string): string =>
	code.replace(GO_FUNC_MAIN_RE, "func __user_main__");

const prepareGoForRun = (code: string): string => {
	if (GO_FUNC_MAIN_RE.test(code)) {
		return code;
	}
	return `${code.trimEnd()}\n\nfunc main() {}\n`;
};

const ensureGoFmtImport = (code: string): string => {
	if (code.includes('"fmt"') || !GO_FMT_USAGE_RE.test(code)) {
		return code;
	}
	return code.replace(GO_PACKAGE_LINE_RE, '$1\nimport "fmt"\n');
};

const ensureImage = async (image: string): Promise<void> => {
	try {
		await docker.getImage(image).inspect();
	} catch {
		await new Promise<void>((resolve, reject) => {
			docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
				if (err) {
					return reject(err);
				}
				docker.modem.followProgress(stream, (err: Error | null) => {
					if (err) {
						return reject(err);
					}
					resolve();
				});
			});
		});
	}
};

const runInContainer = async (
	image: string,
	cmd: string[],
	code: string,
	filename: string,
	timeoutMs = DEFAULT_TIMEOUT_MS,
	memoryBytes = DEFAULT_MEMORY
): Promise<ExecResult> => {
	await ensureImage(image);

	const encoded = Buffer.from(code).toString("base64");
	const shellCmd = `mkdir -p /work && echo "${encoded}" | base64 -d > /work/${filename} && ${cmd.join(" ")}`;

	const container = await docker.createContainer({
		Image: image,
		Cmd: ["sh", "-c", shellCmd],
		WorkingDir: "/work",
		HostConfig: {
			Memory: memoryBytes,
			MemorySwap: memoryBytes,
			NetworkMode: "none",
			AutoRemove: true,
		},
		NetworkDisabled: true,
	});

	await container.start();

	const logStream = await container.logs({
		stdout: true,
		stderr: true,
		follow: true,
	});

	let stdout = "";
	let stderr = "";

	const logsPromise = new Promise<void>((resolve) => {
		container.modem.demuxStream(
			logStream as NodeJS.ReadableStream,
			{
				write: (chunk: Buffer) => {
					stdout += chunk.toString();
				},
			},
			{
				write: (chunk: Buffer) => {
					stderr += chunk.toString();
				},
			}
		);
		(logStream as NodeJS.ReadableStream).on("end", resolve);
	});

	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutHandle = setTimeout(() => {
			container.kill().catch(() => undefined);
			reject(new Error("Execution timed out"));
		}, timeoutMs);
	});

	try {
		await Promise.race([logsPromise, timeoutPromise]);
	} finally {
		clearTimeout(timeoutHandle);
	}

	const { StatusCode: exitCode } = await container.wait();

	return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
};

export const executeCode = async (
	languageId: string,
	code: string,
	timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ExecResult> => {
	const config = LANGUAGE_CONFIGS[languageId];
	if (!config) {
		throw new Error(`Unsupported language: ${languageId}`);
	}

	const preparedCode = languageId === "go" ? prepareGoForRun(code) : code;
	const effectiveTimeout = config.timeoutMs ?? timeoutMs;

	const filename = `code${config.ext}`;
	return await runInContainer(
		config.image,
		config.runCmd(filename),
		preparedCode,
		filename,
		effectiveTimeout,
		config.memoryBytes
	);
};

const prepareCombinedCode = (
	languageId: string,
	userCode: string,
	testCode: string
): string => {
	if (languageId === "c" || languageId === "cpp") {
		return `#define main __user_main__\n${userCode}\n#undef main\n\n${testCode}`;
	}

	if (languageId === "go") {
		const combined = `${renameGoMainForTests(userCode)}\n\n${testCode}`;
		return ensureGoFmtImport(combined);
	}

	return `${userCode}\n\n${testCode}`;
};

const parseTestRunOutput = (
	title: string,
	stdout: string,
	stderr: string,
	exitCode: number
): TestResult => {
	if (exitCode !== 0) {
		return { title, passed: false, error: stderr || stdout };
	}

	try {
		const lastLine = stdout
			.split("\n")
			.filter((l) => l.trim())
			.at(-1);
		if (lastLine) {
			const parsed = JSON.parse(lastLine) as { passed?: boolean };
			return { title, passed: parsed.passed === true };
		}
	} catch {
		// stdout doesn't contain JSON — treat as passed if exit code was 0
	}

	return { title, passed: true };
};

const runSingleTest = async (
	config: LanguageConfig,
	languageId: string,
	userCode: string,
	test: { title: string; testCode: string }
): Promise<TestResult> => {
	const combined = prepareCombinedCode(languageId, userCode, test.testCode);
	const filename = `test${config.ext}`;
	const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	try {
		const { stdout, stderr, exitCode } = await runInContainer(
			config.image,
			config.runCmd(filename),
			combined,
			filename,
			timeoutMs,
			config.memoryBytes
		);
		return parseTestRunOutput(test.title, stdout, stderr, exitCode);
	} catch (err) {
		return {
			title: test.title,
			passed: false,
			error: err instanceof Error ? err.message : String(err),
		};
	}
};

export const runTests = async (
	languageId: string,
	userCode: string,
	tests: { title: string; testCode: string }[]
): Promise<TestResult[]> => {
	const config = LANGUAGE_CONFIGS[languageId];
	if (!config) {
		throw new Error(`Unsupported language: ${languageId}`);
	}

	if (config.runTestsSequential) {
		const results: TestResult[] = [];
		for (const test of tests) {
			results.push(await runSingleTest(config, languageId, userCode, test));
		}
		return results;
	}

	return await Promise.all(
		tests.map((test) => runSingleTest(config, languageId, userCode, test))
	);
};

export const warmDockerImages = async (): Promise<void> => {
	const images = Object.values(LANGUAGE_CONFIGS).map((c) => c.image);
	const unique = [...new Set(images)];
	await Promise.all(unique.map(ensureImage));
};
