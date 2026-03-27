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

const LANGUAGE_CONFIGS: Record<
	string,
	{
		image: string;
		ext: string;
		runCmd: (file: string) => string[];
		memoryBytes?: number;
	}
> = {
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

const DEFAULT_MEMORY = 128 * 1024 * 1024;

const runInContainer = async (
	image: string,
	cmd: string[],
	code: string,
	filename: string,
	timeoutMs = 10_000,
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
	timeoutMs = 10_000
): Promise<ExecResult> => {
	const config = LANGUAGE_CONFIGS[languageId];
	if (!config) {
		throw new Error(`Unsupported language: ${languageId}`);
	}

	const filename = `code${config.ext}`;
	return await runInContainer(
		config.image,
		config.runCmd(filename),
		code,
		filename,
		timeoutMs,
		config.memoryBytes
	);
};

const GO_PACKAGE_LINE_RE = /^(package\s+\w+[^\n]*\n)/m;

export const runTests = async (
	languageId: string,
	userCode: string,
	tests: { title: string; testCode: string }[]
): Promise<TestResult[]> => {
	const config = LANGUAGE_CONFIGS[languageId];
	if (!config) {
		throw new Error(`Unsupported language: ${languageId}`);
	}

	const prepareUserCode = (code: string): string => {
		if (languageId === "c" || languageId === "cpp") {
			return `#define main __user_main__\n${code}\n#undef main`;
		}

		if (languageId === "go") {
			let prepared = code.replace(/\bfunc main\b/g, "func __user_main__");
			if (!prepared.includes('"fmt"')) {
				prepared = prepared.replace(GO_PACKAGE_LINE_RE, '$1\nimport "fmt"\n');
			}
			return prepared;
		}

		return code;
	};

	const results = await Promise.all(
		tests.map(async ({ title, testCode }) => {
			const combined = `${prepareUserCode(userCode)}\n\n${testCode}`;
			const filename = `test${config.ext}`;
			try {
				const { stdout, stderr, exitCode } = await runInContainer(
					config.image,
					config.runCmd(filename),
					combined,
					filename,
					undefined,
					config.memoryBytes
				);

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
			} catch (err) {
				return {
					title,
					passed: false,
					error: err instanceof Error ? err.message : String(err),
				};
			}
		})
	);

	return results;
};

export const warmDockerImages = async (): Promise<void> => {
	const images = Object.values(LANGUAGE_CONFIGS).map((c) => c.image);
	const unique = [...new Set(images)];
	await Promise.all(unique.map(ensureImage));
};
