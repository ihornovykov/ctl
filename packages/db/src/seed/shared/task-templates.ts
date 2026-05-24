import type { GradingCriteriaRow, TaskTestRow } from "../types";

export const lessonMarkdown = (parts: {
	title: string;
	objective: string;
	body: string;
	pitfalls?: string[];
	next?: string;
}) => {
	const pitfalls =
		parts.pitfalls && parts.pitfalls.length > 0
			? `\n\n## Common pitfalls\n\n${parts.pitfalls.map((p) => `- ${p}`).join("\n")}`
			: "";
	const next = parts.next ? `\n\n## Up next\n\n${parts.next}` : "";
	return `# ${parts.title}

**Objective:** ${parts.objective}

${parts.body}${pitfalls}${next}`;
};

export const taskSpec = (parts: {
	title: string;
	prompt: string;
	examples?: string;
	requirements?: string[];
	solution: string;
	lang?: string;
}) => {
	const examples = parts.examples
		? `\n\n### Examples\n\n${parts.examples}`
		: "";
	const requirements =
		parts.requirements && parts.requirements.length > 0
			? `\n\n### Requirements\n\n${parts.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
			: "";
	const lang = parts.lang ?? "javascript";
	return `## ${parts.title}

${parts.prompt}${examples}${requirements}

---

> **Reference Solution** *(for testing only)*

\`\`\`${lang}
${parts.solution.trim()}
\`\`\``;
};

export const jsTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `${body}\nconsole.log(JSON.stringify({ passed: true }));`,
	sortOrder: index,
});

export const pyTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `${body}\nimport json\nprint(json.dumps({"passed": True}))`,
	sortOrder: index,
});

export const goTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `func main() {
${body
	.split("\n")
	.map((l) => `\t${l}`)
	.join("\n")}
	fmt.Println(\`{"passed": true}\`)
}`,
	sortOrder: index,
});

export const cTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `#include <stdio.h>

int main(void) {
${body
	.split("\n")
	.map((l) => `\t${l}`)
	.join("\n")}
\tprintf("{\\"passed\\": true}\\n");
\treturn 0;
}`,
	sortOrder: index,
});

export const cppTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `#include <iostream>

int main() {
${body
	.split("\n")
	.map((l) => `\t${l}`)
	.join("\n")}
\tstd::cout << "{\\"passed\\": true}" << std::endl;
\treturn 0;
}`,
	sortOrder: index,
});

export const vitestReactTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("${title}", () => {
${body
	.split("\n")
	.map((l) => `    ${l}`)
	.join("\n")}
  });
});
`,
	sortOrder: index,
});

export const vitestReactInteractionTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("${title}", () => {
${body
	.split("\n")
	.map((l) => `    ${l}`)
	.join("\n")}
  });
});
`,
	sortOrder: index,
});

export const vitestVueTest = (
	taskId: string,
	index: number,
	title: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import App from "./App.vue";

describe("App", () => {
  it("${title}", async () => {
${body
	.split("\n")
	.map((l) => `    ${l}`)
	.join("\n")}
  });
});
`,
	sortOrder: index,
});

export const defaultCriteria = (
	taskId: string,
	idiomHint: string
): GradingCriteriaRow[] => [
	{
		id: `criteria-${taskId}-01`,
		taskId,
		name: "Correctness",
		description:
			"Implementation passes all automated tests and handles edge cases described in the task.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: `criteria-${taskId}-02`,
		taskId,
		name: "Idioms & Style",
		description: idiomHint,
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: `criteria-${taskId}-03`,
		taskId,
		name: "Edge Cases",
		description:
			"Handles empty inputs, boundary values, and invalid data without crashing or silent failures.",
		maxScore: 3,
		sortOrder: 3,
	},
];

export const reactSandboxTask = (parts: {
	id: string;
	lessonId: string;
	description: string;
	appCode: string;
}) => ({
	id: parts.id,
	lessonId: parts.lessonId,
	languageId: "react",
	description: parts.description,
	starterCode: " ",
	solutionCode: " ",
	entryFile: "/src/App.tsx",
	readOnlyFiles: ["/src/main.tsx"],
	starterFiles: {
		"/src/App.tsx": parts.appCode,
		"/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
`,
	},
});

export const vueSandboxTask = (parts: {
	id: string;
	lessonId: string;
	description: string;
	appCode: string;
}) => ({
	id: parts.id,
	lessonId: parts.lessonId,
	languageId: "vue",
	description: parts.description,
	starterCode: " ",
	solutionCode: " ",
	entryFile: "/src/App.vue",
	readOnlyFiles: ["/src/main.ts"],
	starterFiles: {
		"/src/App.vue": parts.appCode,
		"/src/main.ts": `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`,
	},
});
