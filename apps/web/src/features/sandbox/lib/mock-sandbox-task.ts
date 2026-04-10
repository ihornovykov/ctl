import type { SandboxLessonTask, SandboxTask } from "./sandbox-types";

export const mockSandboxTaskQueryKey = (lessonId: string) =>
	["mock-sandbox-task", lessonId] as const;

/** Add `courseSlug/lessonSlug` entries to enable the mock sandbox workspace for that lesson. */
export const MOCK_SANDBOX_LESSON_KEYS: readonly string[] = [];

export const isMockSandboxLesson = (
	courseSlug: string,
	lessonSlug: string
): boolean => MOCK_SANDBOX_LESSON_KEYS.includes(`${courseSlug}/${lessonSlug}`);

const mockFramework: SandboxTask["framework"] = {
	id: "fw-react",
	name: "React",
	icon: null,
	sandpackTemplate: "react-ts",
	defaultDependencies: {
		react: "^19.0.0",
		"react-dom": "^19.0.0",
	},
	defaultDevDependencies: {
		typescript: "^5.6.0",
		"@types/react": "^19.0.0",
		"@types/react-dom": "^19.0.0",
	},
};

const buildMockTask = (lessonId: string): SandboxTask => ({
	id: `mock-sandbox-task-${lessonId}`,
	lessonId,
	frameworkId: mockFramework.id,
	description: `## Mock sandbox task

Edit \`src/App.tsx\` and use **Preview** to see changes. Tests and submit are mocked locally.`,
	starterFiles: {
		"/src/App.tsx": `export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Mock sandbox</h1>
      <p>Edit this file — preview uses a static placeholder in mock mode.</p>
    </main>
  );
}
`,
		"/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
`,
	},
	dependencies: {
		...mockFramework.defaultDependencies,
	},
	entryFile: "/src/App.tsx",
	readOnlyFiles: ["/src/main.tsx"],
	tests: [
		{
			id: "mock-test-1",
			title: "App renders",
			testFilePath: "/src/App.test.tsx",
			testCode: "// mock",
			sortOrder: 0,
		},
	],
	criteria: [
		{
			id: "mock-c1",
			name: "Structure",
			description: "Component structure",
			maxScore: 10,
			sortOrder: 0,
		},
	],
	framework: mockFramework,
});

export const getMockSandboxLessonTask = (
	lessonId: string
): SandboxLessonTask => ({
	kind: "sandbox",
	task: buildMockTask(lessonId),
	submission: null,
});
