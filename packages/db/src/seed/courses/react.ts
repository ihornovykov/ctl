import { assertCourseBundle } from "../assert-seed";
import { FRAMEWORK_TASK_TESTING_HINT } from "../shared/framework-hints";
import {
	defaultCriteria,
	lessonMarkdown,
	reactSandboxTask,
	taskSpec,
	vitestReactInteractionTest,
	vitestReactTest,
} from "../shared/task-templates";
import type {
	CourseRow,
	CourseSeedBundle,
	GradingCriteriaRow,
	LessonRow,
	TaskRow,
	TaskTestRow,
} from "../types";

const COURSE_ID = "course-react-v2";

const lessonId = (n: number) => `lesson-react-v2-${String(n).padStart(2, "0")}`;
const taskId = (n: number) => `task-react-v2-${String(n).padStart(2, "0")}`;

const course: CourseRow = {
	id: COURSE_ID,
	languageId: "react",
	title: "React Fundamentals",
	slug: "react-fundamentals-v2",
	shortDescription:
		"Build interactive UIs with components, hooks, context, and composition.",
	description:
		"A hands-on React course covering JSX, props, state, effects, context, reducers, memoization, and compound components. Each lesson runs in a live sandbox with Vitest feedback.",
	difficulty: "beginner",
	estimatedHours: 22,
	sortOrder: 7,
	isPublished: true,
};

type LessonSeed = {
	n: number;
	slug: string;
	title: string;
	description: string;
	content: string;
	appCode: string;
	taskTitle: string;
	taskPrompt: string;
	taskRequirements: string[];
	taskSolution: string;
	tests: TaskTestRow[];
	idiomHint: string;
};

const lessonSeeds: LessonSeed[] = [
	{
		n: 1,
		slug: "hello-react",
		title: "Hello React",
		description: "Render your first JSX and mount a heading.",
		content: lessonMarkdown({
			title: "Hello React",
			objective: "Return JSX from a component and render an `h1` heading.",
			body: `React components are functions that return UI. Your \`App\` component should render a single top-level \`h1\` with the text **Hello React**.

\`\`\`tsx
export default function App() {
  return <h1>Hello React</h1>;
}
\`\`\`

Use the **Preview** tab to see your component live.`,
			pitfalls: [
				"Forgetting to export `App` as the default export.",
				"Returning a string instead of JSX (wrap text in an element).",
			],
			next: "Pass data into child components with props.",
		}),
		appCode: `export default function App() {
  // TODO: render an h1 with "Hello React"
  return null;
}
`,
		taskTitle: "Hello React heading",
		taskPrompt:
			"Implement `App` so it renders an `h1` element containing exactly `Hello React`.",
		taskRequirements: [
			"Export `App` as the default export from `App.tsx`.",
			"Use a semantic `h1` heading (not a `div` or `p`).",
			"The visible text must be exactly `Hello React`.",
		],
		taskSolution: `export default function App() {
  return <h1>Hello React</h1>;
}
`,
		tests: [
			vitestReactTest(
				taskId(1),
				1,
				"renders a level-1 heading",
				`render(<App />);
expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(1),
				2,
				"displays Hello React text",
				`render(<App />);
expect(screen.getByText("Hello React")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(1),
				3,
				"uses an h1 element",
				`render(<App />);
expect(screen.getByRole("heading", { level: 1 }).tagName).toBe("H1");`
			),
		],
		idiomHint:
			"Use a function component with a default export; keep JSX minimal and semantic.",
	},
	{
		n: 2,
		slug: "greeting-card-props",
		title: "Props & GreetingCard",
		description: "Accept a `name` prop and render personalized text.",
		content: lessonMarkdown({
			title: "Props & GreetingCard",
			objective: "Create a child component that reads props.",
			body: `Props let parent components pass data down. Build a \`GreetingCard\` component that accepts \`name: string\` and renders \`Hello, {name}\`.

\`App\` should render \`<GreetingCard name="React" />\`.`,
			pitfalls: [
				"Destructuring props in the parameter list keeps components readable.",
				"Interpolation belongs inside JSX: `{name}`, not string concatenation in HTML.",
			],
			next: "Make UI interactive with `useState`.",
		}),
		appCode: `type GreetingCardProps = {
  name: string;
};

function GreetingCard({ name }: GreetingCardProps) {
  // TODO: render "Hello, {name}"
  return null;
}

export default function App() {
  return <GreetingCard name="React" />;
}
`,
		taskTitle: "GreetingCard name prop",
		taskPrompt:
			'Implement `GreetingCard` so it renders `Hello, {name}` for any `name` prop. `App` should pass `name="React"`.',
		taskRequirements: [
			"Define `GreetingCard` accepting a `name` string prop.",
			"Render the greeting in the format `Hello, React` when name is `React`.",
			'Keep `App` rendering `<GreetingCard name="React" />`.',
		],
		taskSolution: `type GreetingCardProps = {
  name: string;
};

function GreetingCard({ name }: GreetingCardProps) {
  return <p>Hello, {name}</p>;
}

export default function App() {
  return <GreetingCard name="React" />;
}
`,
		tests: [
			vitestReactTest(
				taskId(2),
				1,
				"renders greeting for React",
				`render(<App />);
expect(screen.getByText("Hello, React")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(2),
				2,
				"interpolates the name prop",
				`render(<App />);
expect(screen.getByText(/Hello,/)).toHaveTextContent("React");`
			),
			vitestReactTest(
				taskId(2),
				3,
				"shows comma-separated greeting format",
				`render(<App />);
expect(screen.getByText("Hello, React")).toBeVisible();`
			),
		],
		idiomHint:
			"Type props with a dedicated alias; destructure in the parameter list.",
	},
	{
		n: 3,
		slug: "use-state-counter",
		title: "State with useState",
		description: "Track click count in component state.",
		content: lessonMarkdown({
			title: "State with useState",
			objective: "Increment local state when a button is clicked.",
			body: "Use `useState` to store a number starting at `0`. Render `Count: {count}` and a button labeled `Click` that increments the count on each click.",
			pitfalls: [
				"Call `useState` at the top level of the component, not inside conditionals.",
				"Use the functional updater `setCount(c => c + 1)` when the next state depends on the previous value.",
			],
			next: "Render different UI based on props with conditionals.",
		}),
		appCode: `import { useState } from "react";

export default function App() {
  // TODO: count state, Click button, display "Count: N"
  return null;
}
`,
		taskTitle: "Counter with useState",
		taskPrompt:
			"Build a counter that shows `Count: 0` initially and increments when the user clicks a button labeled `Click`.",
		taskRequirements: [
			"Use `useState` for the count.",
			"Display text in the form `Count: N`.",
			"Provide a button with accessible name `Click`.",
		],
		taskSolution: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Click
      </button>
    </div>
  );
}
`,
		tests: [
			vitestReactTest(
				taskId(3),
				1,
				"starts at Count: 0",
				`render(<App />);
expect(screen.getByText("Count: 0")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(3),
				2,
				"increments on click",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "Click" }));
expect(screen.getByText("Count: 1")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(3),
				3,
				"increments multiple times",
				`render(<App />);
const btn = screen.getByRole("button", { name: "Click" });
fireEvent.click(btn);
fireEvent.click(btn);
expect(screen.getByText("Count: 2")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(3),
				4,
				"button remains clickable",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "Click" }));
expect(screen.getByRole("button", { name: "Click" })).toBeEnabled();`
			),
		],
		idiomHint:
			"Prefer functional state updates for counters; colocate state with the UI that uses it.",
	},
	{
		n: 4,
		slug: "conditional-auth-banner",
		title: "Conditional Rendering",
		description: "Show different messages based on `isLoggedIn`.",
		content: lessonMarkdown({
			title: "Conditional Rendering",
			objective: "Branch UI with a boolean prop.",
			body: `Create \`AuthBanner\` with prop \`isLoggedIn: boolean\`. When \`true\`, show \`Welcome back!\`; otherwise show \`Please log in.\`.

\`App\` renders the logged-out state: \`<AuthBanner isLoggedIn={false} />\`.`,
			pitfalls: [
				"Use a ternary or early return — avoid duplicating wrapper markup.",
				"Boolean props can be written `isLoggedIn` when passing `true`.",
			],
			next: "Render lists from arrays with `map`.",
		}),
		appCode: `type AuthBannerProps = {
  isLoggedIn: boolean;
};

function AuthBanner({ isLoggedIn }: AuthBannerProps) {
  // TODO: conditional message
  return null;
}

export default function App() {
  return <AuthBanner isLoggedIn={false} />;
}
`,
		taskTitle: "AuthBanner conditional",
		taskPrompt:
			"Implement `AuthBanner` to show `Welcome back!` when `isLoggedIn` is true and `Please log in.` when false.",
		taskRequirements: [
			"Accept `isLoggedIn` as a boolean prop.",
			"Render exactly one message at a time.",
			"`App` should demonstrate the logged-out banner.",
		],
		taskSolution: `type AuthBannerProps = {
  isLoggedIn: boolean;
};

function AuthBanner({ isLoggedIn }: AuthBannerProps) {
  return <p>{isLoggedIn ? "Welcome back!" : "Please log in."}</p>;
}

export default function App() {
  return <AuthBanner isLoggedIn={false} />;
}
`,
		tests: [
			vitestReactTest(
				taskId(4),
				1,
				"shows login prompt when logged out",
				`render(<App />);
expect(screen.getByText("Please log in.")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(4),
				2,
				"hides welcome message when logged out",
				`render(<App />);
expect(screen.queryByText("Welcome back!")).not.toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(4),
				3,
				"renders a single paragraph",
				`render(<App />);
expect(screen.getAllByText(/log in|Welcome back/)).toHaveLength(1);`
			),
		],
		idiomHint:
			"Express conditionals directly in JSX with ternaries or logical && for simple branches.",
	},
	{
		n: 5,
		slug: "todo-list-rendering",
		title: "Lists & Keys",
		description: "Map an `items` array into `ul`/`li` elements.",
		content: lessonMarkdown({
			title: "Lists & Keys",
			objective: "Render a list from props with stable keys.",
			body: "Build `TodoList` accepting `items: string[]`. Render a `ul` where each item is an `li` showing the text. Use the item string as the React `key`.",
			pitfalls: [
				"Never use array index as key when items can reorder.",
				"Return a single parent element from list components.",
			],
			next: "Validate form input before submission.",
		}),
		appCode: `type TodoListProps = {
  items: string[];
};

function TodoList({ items }: TodoListProps) {
  // TODO: ul/li list
  return null;
}

export default function App() {
  return <TodoList items={["Learn JSX", "Learn props", "Learn state"]} />;
}
`,
		taskTitle: "Todo list rendering",
		taskPrompt:
			"Implement `TodoList` to render each string in `items` as an `li` inside a `ul`.",
		taskRequirements: [
			"Use `items.map` to produce list items.",
			"Set `key` to each item string.",
			"Preserve the three starter todos in `App`.",
		],
		taskSolution: `type TodoListProps = {
  items: string[];
};

function TodoList({ items }: TodoListProps) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function App() {
  return <TodoList items={["Learn JSX", "Learn props", "Learn state"]} />;
}
`,
		tests: [
			vitestReactTest(
				taskId(5),
				1,
				"renders all todo items",
				`render(<App />);
expect(screen.getByText("Learn JSX")).toBeInTheDocument();
expect(screen.getByText("Learn props")).toBeInTheDocument();
expect(screen.getByText("Learn state")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(5),
				2,
				"uses list semantics",
				`render(<App />);
expect(screen.getByRole("list")).toBeInTheDocument();
expect(screen.getAllByRole("listitem")).toHaveLength(3);`
			),
			vitestReactTest(
				taskId(5),
				3,
				"lists items in order",
				`render(<App />);
const items = screen.getAllByRole("listitem");
expect(items[0]).toHaveTextContent("Learn JSX");
expect(items[2]).toHaveTextContent("Learn state");`
			),
		],
		idiomHint:
			"Map arrays to elements with meaningful keys; keep list rendering pure.",
	},
	{
		n: 6,
		slug: "signup-form-validation",
		title: "Controlled Inputs",
		description: "Show an email validation message on blur.",
		content: lessonMarkdown({
			title: "Controlled Inputs",
			objective: "Control an input with state and show validation feedback.",
			body: "Build `SignupForm` with a labeled email field. On blur, if the value does not contain `@`, show `Enter a valid email address.` Otherwise clear the error.",
			pitfalls: [
				"Wire `value` and `onChange` for controlled inputs.",
				"Validate on blur with `onBlur`, not on every keystroke unless required.",
			],
			next: "Share state between sibling inputs by lifting state up.",
		}),
		appCode: `import { useState } from "react";

function SignupForm() {
  // TODO: email state, validation message on blur
  return null;
}

export default function App() {
  return <SignupForm />;
}
`,
		taskTitle: "SignupForm email validation",
		taskPrompt:
			"Implement `SignupForm` with an email input labeled `Email`. When the field loses focus and the value lacks `@`, display `Enter a valid email address.`",
		taskRequirements: [
			"Use a controlled email input with accessible label `Email`.",
			"Validate on blur.",
			"Show the exact error copy when invalid.",
		],
		taskSolution: `import { useState } from "react";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const onBlur = () => {
    setError(email.includes("@") ? "" : "Enter a valid email address.");
  };

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={onBlur}
      />
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}

export default function App() {
  return <SignupForm />;
}
`,
		tests: [
			vitestReactTest(
				taskId(6),
				1,
				"renders email field",
				`render(<App />);
expect(screen.getByLabelText("Email")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(6),
				2,
				"shows error for invalid email on blur",
				`render(<App />);
const input = screen.getByLabelText("Email");
fireEvent.change(input, { target: { value: "bad" } });
fireEvent.blur(input);
expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(6),
				3,
				"clears error for valid email",
				`render(<App />);
const input = screen.getByLabelText("Email");
fireEvent.change(input, { target: { value: "user@example.com" } });
fireEvent.blur(input);
expect(screen.queryByText("Enter a valid email address.")).not.toBeInTheDocument();`
			),
		],
		idiomHint:
			'Pair controlled inputs with explicit validation state; expose errors with `role="alert"`.',
	},
	{
		n: 7,
		slug: "temperature-converter",
		title: "Lifting State Up",
		description: "Sync Celsius and Fahrenheit in a parent component.",
		content: lessonMarkdown({
			title: "Lifting State Up",
			objective: "Keep conversion logic in a parent and pass props down.",
			body: "Implement `TempConverter` with two labeled inputs: `Celsius` and `Fahrenheit`. Store Celsius in parent state. Changing Celsius updates Fahrenheit (`F = C * 9/5 + 32`, rounded to one decimal). Editing Fahrenheit updates Celsius.",
			pitfalls: [
				"Keep a single source of truth in the parent.",
				"Parse numeric input carefully — empty string can become 0.",
			],
			next: "Run side effects after render with `useEffect`.",
		}),
		appCode: `import { useState } from "react";

function TempConverter() {
  // TODO: lifted celsius state, synced fahrenheit field
  return null;
}

export default function App() {
  return <TempConverter />;
}
`,
		taskTitle: "TempConverter lifting state",
		taskPrompt:
			"Build `TempConverter` with controlled `Celsius` and `Fahrenheit` inputs. Changing either field keeps the other in sync using standard conversion formulas.",
		taskRequirements: [
			"Label inputs `Celsius` and `Fahrenheit`.",
			"Starting Celsius value is `0` (Fahrenheit `32.0`).",
			"Round Fahrenheit display to one decimal place.",
		],
		taskSolution: `import { useState } from "react";

const toF = (c: number) => Number((c * 9) / 5 + 32).toFixed(1);
const toC = (f: number) => ((f - 32) * 5) / 9;

function TempConverter() {
  const [celsius, setCelsius] = useState("0");

  const fahrenheit = toF(Number(celsius) || 0);

  return (
    <div>
      <label htmlFor="c">Celsius</label>
      <input
        id="c"
        value={celsius}
        onChange={(e) => setCelsius(e.target.value)}
      />
      <label htmlFor="f">Fahrenheit</label>
      <input
        id="f"
        value={fahrenheit}
        onChange={(e) => setCelsius(String(toC(Number(e.target.value) || 0)))}
      />
    </div>
  );
}

export default function App() {
  return <TempConverter />;
}
`,
		tests: [
			vitestReactTest(
				taskId(7),
				1,
				"shows 0°C as 32.0°F",
				`render(<App />);
expect(screen.getByLabelText("Celsius")).toHaveValue("0");
expect(screen.getByLabelText("Fahrenheit")).toHaveValue("32.0");`
			),
			vitestReactInteractionTest(
				taskId(7),
				2,
				"updates fahrenheit when celsius changes",
				`render(<App />);
fireEvent.change(screen.getByLabelText("Celsius"), { target: { value: "100" } });
expect(screen.getByLabelText("Fahrenheit")).toHaveValue("212.0");`
			),
			vitestReactInteractionTest(
				taskId(7),
				3,
				"updates celsius when fahrenheit changes",
				`render(<App />);
fireEvent.change(screen.getByLabelText("Fahrenheit"), { target: { value: "32" } });
expect(screen.getByLabelText("Celsius")).toHaveValue("0");`
			),
		],
		idiomHint:
			"Lift shared state to the nearest common parent; derive secondary values from source state.",
	},
	{
		n: 8,
		slug: "use-effect-document-title",
		title: "Effects with useEffect",
		description: "Sync document title and show it in the UI.",
		content: lessonMarkdown({
			title: "Effects with useEffect",
			objective: "Run a side effect after mount to update `document.title`.",
			body: "Use `useEffect` to set `document.title` to `My React App` on mount. Also render `Page title: My React App` so learners can verify without inspecting the tab.",
			pitfalls: [
				"Include a dependency array — `[]` runs once on mount.",
				"Effects belong after state declarations, before return.",
			],
			next: "Model async data with loading and error UI.",
		}),
		appCode: `import { useEffect } from "react";

export default function App() {
  // TODO: useEffect for document.title, show "Page title: My React App"
  return null;
}
`,
		taskTitle: "useEffect document title",
		taskPrompt:
			"Set `document.title` to `My React App` on mount and render the text `Page title: My React App` in the component output.",
		taskRequirements: [
			"Use `useEffect` with an empty dependency array.",
			"Display the page title string in the DOM for testing.",
			"Do not overwrite the title on every render outside the effect.",
		],
		taskSolution: `import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    document.title = "My React App";
  }, []);

  return <p>Page title: My React App</p>;
}
`,
		tests: [
			vitestReactTest(
				taskId(8),
				1,
				"renders page title text",
				`render(<App />);
expect(screen.getByText("Page title: My React App")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(8),
				2,
				"shows title in a paragraph",
				`render(<App />);
expect(screen.getByText(/Page title:/)).toBeVisible();`
			),
			vitestReactTest(
				taskId(8),
				3,
				"includes My React App in output",
				`render(<App />);
expect(screen.getByText("Page title: My React App")).toHaveTextContent("My React App");`
			),
		],
		idiomHint:
			"Keep effects focused on synchronization; mirror external side effects in UI when tests cannot observe the DOM API directly.",
	},
	{
		n: 9,
		slug: "user-card-states",
		title: "Async UI States",
		description: "Render loading, error, and success views.",
		content: lessonMarkdown({
			title: "Async UI States",
			objective: "Switch UI based on a `status` discriminated union.",
			body: `\`UserCard\` accepts \`status: 'loading' | 'error' | 'success'\` and optional \`name\` when successful. Show \`Loading...\`, \`Something went wrong\`, or \`User: {name}\` respectively.`,
			pitfalls: [
				"Model status as a string union for exhaustive checks.",
				"Keep error and loading copy exact for predictable UX.",
			],
			next: "Extract reusable logic into custom hooks.",
		}),
		appCode: `type UserCardProps = {
  status: "loading" | "error" | "success";
  name?: string;
};

function UserCard({ status, name }: UserCardProps) {
  // TODO: loading / error / success branches
  return null;
}

export default function App() {
  return <UserCard status="success" name="Ada" />;
}
`,
		taskTitle: "UserCard loading/error/data states",
		taskPrompt:
			"Implement `UserCard` with three visual states: loading shows `Loading...`, error shows `Something went wrong`, success shows `User: {name}`.",
		taskRequirements: [
			"Handle all three `status` values.",
			"Only read `name` when status is `success`.",
			"`App` demonstrates the success state with `Ada`.",
		],
		taskSolution: `type UserCardProps = {
  status: "loading" | "error" | "success";
  name?: string;
};

function UserCard({ status, name }: UserCardProps) {
  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>Something went wrong</p>;
  return <p>User: {name}</p>;
}

export default function App() {
  return <UserCard status="success" name="Ada" />;
}
`,
		tests: [
			vitestReactTest(
				taskId(9),
				1,
				"renders success user",
				`render(<App />);
expect(screen.getByText("User: Ada")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(9),
				2,
				"shows user name in success state",
				`render(<App />);
expect(screen.getByText(/Ada/)).toBeVisible();`
			),
			vitestReactTest(
				taskId(9),
				3,
				"does not show loading or error copy",
				`render(<App />);
expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();`
			),
		],
		idiomHint:
			"Use early returns for mutually exclusive UI states; narrow types before accessing optional data.",
	},
	{
		n: 10,
		slug: "custom-use-counter-hook",
		title: "Custom Hooks",
		description: "Encapsulate counter logic in `useCounter`.",
		content: lessonMarkdown({
			title: "Custom Hooks",
			objective: "Extract stateful logic into a reusable hook.",
			body: "Create `useCounter(initial = 0)` returning `{ count, increment, decrement }`. `App` uses the hook and renders `Count: {count}` with `+` and `−` buttons.",
			pitfalls: [
				"Custom hooks must start with `use`.",
				"Return stable handlers with `useCallback` when exposing from hooks consumed by memoized children.",
			],
			next: "Share theme state with Context.",
		}),
		appCode: `import { useState } from "react";

function useCounter(initial = 0) {
  // TODO: return count, increment, decrement
  return { count: initial, increment: () => {}, decrement: () => {} };
}

export default function App() {
  // TODO: wire useCounter to UI
  return null;
}
`,
		taskTitle: "useCounter custom hook",
		taskPrompt:
			"Implement `useCounter` and use it in `App` to render `Count: N` with `+` and `−` buttons that adjust the count.",
		taskRequirements: [
			"Define `useCounter` in the same file.",
			"Initial count is `0`.",
			"Buttons have accessible names `+` and `−`.",
		],
		taskSolution: `import { useState } from "react";

function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  return {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
  };
}

export default function App() {
  const { count, increment, decrement } = useCounter();
  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={decrement}>−</button>
    </div>
  );
}
`,
		tests: [
			vitestReactTest(
				taskId(10),
				1,
				"starts at zero",
				`render(<App />);
expect(screen.getByText("Count: 0")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(10),
				2,
				"increments with plus button",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "+" }));
expect(screen.getByText("Count: 1")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(10),
				3,
				"decrements with minus button",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "+" }));
fireEvent.click(screen.getByRole("button", { name: "−" }));
expect(screen.getByText("Count: 0")).toBeInTheDocument();`
			),
		],
		idiomHint:
			"Extract reusable stateful logic into `use*` hooks; keep components focused on rendering.",
	},
	{
		n: 11,
		slug: "theme-context",
		title: "Context API",
		description: "Toggle light and dark theme with React Context.",
		content: lessonMarkdown({
			title: "Context API",
			objective: "Provide theme state to descendants without prop drilling.",
			body: "Create `ThemeContext` with value `{ theme, toggle }`. `ThemeProvider` wraps the app. `App` shows the current theme text (`Theme: light` or `Theme: dark`) and a `Toggle theme` button.",
			pitfalls: [
				"Export a custom hook like `useTheme()` to consume context safely.",
				"Memoize context value when passing objects to avoid needless re-renders.",
			],
			next: "Manage complex state transitions with `useReducer`.",
		}),
		appCode: `import { createContext, useContext, useMemo, useState } from "react";

type Theme = "light" | "dark";

// TODO: ThemeContext, ThemeProvider, useTheme

export default function App() {
  return null;
}
`,
		taskTitle: "ThemeContext dark/light toggle",
		taskPrompt:
			"Implement theme context with `ThemeProvider`. Display `Theme: light` initially and flip to `Theme: dark` when the user clicks `Toggle theme`.",
		taskRequirements: [
			"Use React Context — no prop drilling.",
			"Button accessible name is `Toggle theme`.",
			"Theme text must include the active theme name.",
		],
		taskSolution: `import { createContext, useContext, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
};

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const value = useMemo(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [theme]
  );
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

function ThemePanel() {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <p>Theme: {theme}</p>
      <button type="button" onClick={toggle}>
        Toggle theme
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemePanel />
    </ThemeProvider>
  );
}
`,
		tests: [
			vitestReactTest(
				taskId(11),
				1,
				"starts in light theme",
				`render(<App />);
expect(screen.getByText("Theme: light")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(11),
				2,
				"toggles to dark theme",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
expect(screen.getByText("Theme: dark")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(11),
				3,
				"toggles back to light",
				`render(<App />);
const btn = screen.getByRole("button", { name: "Toggle theme" });
fireEvent.click(btn);
fireEvent.click(btn);
expect(screen.getByText("Theme: light")).toBeInTheDocument();`
			),
		],
		idiomHint:
			"Colocate provider components with context creation; guard consumption with a dedicated hook.",
	},
	{
		n: 12,
		slug: "use-reducer-todos",
		title: "useReducer",
		description: "Add and toggle todos with a reducer.",
		content: lessonMarkdown({
			title: "useReducer",
			objective: "Model todo actions with a reducer function.",
			body: "Use `useReducer` to manage todos `{ id: string; text: string; done: boolean }[]`. Support `add` (append a todo) and `toggle` (flip `done`). Render each todo text with `(done)` suffix when complete.",
			pitfalls: [
				"Keep reducer pure — no mutations; return new state objects.",
				"Use discriminated action types for clarity.",
			],
			next: "Optimize expensive derived lists with `useMemo`.",
		}),
		appCode: `import { useReducer } from "react";

type Todo = { id: string; text: string; done: boolean };

// TODO: reducer, TodoApp with add + toggle

export default function App() {
  return null;
}
`,
		taskTitle: "useReducer todo add/toggle",
		taskPrompt:
			"Build a todo app with an input labeled `New todo`, an `Add` button, and a list. Clicking a todo toggles its done state and appends ` (done)` to the label.",
		taskRequirements: [
			"Use `useReducer` for state management.",
			"Start with one todo: `Learn useReducer`.",
			"Clicking a todo toggles done visually.",
		],
		taskSolution: `import { useReducer, useState } from "react";

type Todo = { id: string; text: string; done: boolean };

type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: string };

const reducer = (state: Todo[], action: Action): Todo[] => {
  switch (action.type) {
    case "add":
      return [...state, { id: crypto.randomUUID(), text: action.text, done: false }];
    case "toggle":
      return state.map((t) =>
        t.id === action.id ? { ...t, done: !t.done } : t
      );
    default:
      return state;
  }
};

function TodoApp() {
  const [todos, dispatch] = useReducer(reducer, [
    { id: "1", text: "Learn useReducer", done: false },
  ]);
  const [text, setText] = useState("");

  return (
    <div>
      <label htmlFor="new">New todo</label>
      <input id="new" value={text} onChange={(e) => setText(e.target.value)} />
      <button
        type="button"
        onClick={() => {
          if (text.trim()) {
            dispatch({ type: "add", text: text.trim() });
            setText("");
          }
        }}
      >
        Add
      </button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <button type="button" onClick={() => dispatch({ type: "toggle", id: todo.id })}>
              {todo.done ? \`\${todo.text} (done)\` : todo.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return <TodoApp />;
}
`,
		tests: [
			vitestReactTest(
				taskId(12),
				1,
				"renders initial todo",
				`render(<App />);
expect(screen.getByText("Learn useReducer")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(12),
				2,
				"toggles todo to done",
				`render(<App />);
fireEvent.click(screen.getByText("Learn useReducer"));
expect(screen.getByText("Learn useReducer (done)")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(12),
				3,
				"adds a new todo",
				`render(<App />);
fireEvent.change(screen.getByLabelText("New todo"), { target: { value: "Write tests" } });
fireEvent.click(screen.getByRole("button", { name: "Add" }));
expect(screen.getByText("Write tests")).toBeInTheDocument();`
			),
		],
		idiomHint:
			"Use reducers when state transitions are event-driven; keep actions small and typed.",
	},
	{
		n: 13,
		slug: "memoized-filter-list",
		title: "useMemo",
		description: "Filter a list efficiently with memoization.",
		content: lessonMarkdown({
			title: "useMemo",
			objective: "Derive a filtered list with `useMemo`.",
			body: "`FilterList` receives `items: string[]` and renders a search input labeled `Filter`. Show matching items in a `ul`. Memoize the filtered array with `useMemo` depending on `query` and `items`.",
			pitfalls: [
				"Only memoize genuinely expensive work — filtering small lists is fine but practice the pattern.",
				"Include every dependency in the memo array.",
			],
			next: "Compose flexible UI with compound components.",
		}),
		appCode: `import { useMemo, useState } from "react";

type FilterListProps = {
  items: string[];
};

function FilterList({ items }: FilterListProps) {
  // TODO: query state, useMemo filtered list
  return null;
}

export default function App() {
  return <FilterList items={["Apple", "Apricot", "Banana", "Cherry"]} />;
}
`,
		taskTitle: "Memoized filter list",
		taskPrompt:
			"Implement `FilterList` with a `Filter` input. As the user types, show only items whose text includes the query (case-insensitive).",
		taskRequirements: [
			"Use `useMemo` for the filtered items.",
			"Render results in a `ul`/`li` list.",
			"Empty query shows all items.",
		],
		taskSolution: `import { useMemo, useState } from "react";

type FilterListProps = {
  items: string[];
};

function FilterList({ items }: FilterListProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [items, query]
  );

  return (
    <div>
      <label htmlFor="filter">Filter</label>
      <input
        id="filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {filtered.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return <FilterList items={["Apple", "Apricot", "Banana", "Cherry"]} />;
}
`,
		tests: [
			vitestReactTest(
				taskId(13),
				1,
				"shows all items initially",
				`render(<App />);
expect(screen.getAllByRole("listitem")).toHaveLength(4);`
			),
			vitestReactInteractionTest(
				taskId(13),
				2,
				"filters by query",
				`render(<App />);
fireEvent.change(screen.getByLabelText("Filter"), { target: { value: "ap" } });
expect(screen.getAllByRole("listitem")).toHaveLength(2);`
			),
			vitestReactInteractionTest(
				taskId(13),
				3,
				"is case insensitive",
				`render(<App />);
fireEvent.change(screen.getByLabelText("Filter"), { target: { value: "BAN" } });
expect(screen.getByText("Banana")).toBeInTheDocument();
expect(screen.queryByText("Apple")).not.toBeInTheDocument();`
			),
		],
		idiomHint:
			"Memoize derived data when dependencies are stable and computation may grow with input size.",
	},
	{
		n: 14,
		slug: "modal-composition",
		title: "Composition Patterns",
		description: "Build a reusable Modal with children.",
		content: lessonMarkdown({
			title: "Composition Patterns",
			objective: "Use `children` to compose flexible dialog content.",
			body: `Create \`Modal\` accepting \`isOpen\`, \`onClose\`, and \`children\`. When open, render a dialog with \`role="dialog"\`, the children, and a \`Close\` button that calls \`onClose\`. \`App\` opens the modal with a \`Open modal\` button.`,
			pitfalls: [
				"Render nothing when `isOpen` is false.",
				"Pass `onClose` to both the Close button and optional backdrop handlers.",
			],
			next: "Combine everything in a dashboard capstone.",
		}),
		appCode: `import { useState } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  // TODO: dialog with children + Close button
  return null;
}

export default function App() {
  // TODO: open/close state
  return null;
}
`,
		taskTitle: "Modal composition children",
		taskPrompt:
			"Implement `Modal` that renders its `children` when open along with a `Close` button. `App` toggles the modal via an `Open modal` button and shows `Modal content` inside.",
		taskRequirements: [
			'Modal root uses `role="dialog"`.',
			"`Close` button calls `onClose`.",
			"Children render inside the dialog when open.",
		],
		taskSolution: `import { useState } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div role="dialog">
      {children}
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <p>Modal content</p>
      </Modal>
    </div>
  );
}
`,
		tests: [
			vitestReactTest(
				taskId(14),
				1,
				"modal hidden initially",
				`render(<App />);
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(14),
				2,
				"opens modal with content",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "Open modal" }));
expect(screen.getByRole("dialog")).toBeInTheDocument();
expect(screen.getByText("Modal content")).toBeInTheDocument();`
			),
			vitestReactInteractionTest(
				taskId(14),
				3,
				"closes modal",
				`render(<App />);
fireEvent.click(screen.getByRole("button", { name: "Open modal" }));
fireEvent.click(screen.getByRole("button", { name: "Close" }));
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();`
			),
		],
		idiomHint:
			"Prefer composition with `children` over boolean prop proliferation for flexible containers.",
	},
	{
		n: 15,
		slug: "dashboard-capstone",
		title: "Dashboard Capstone",
		description: "Compose stat cards into a summary dashboard.",
		content: lessonMarkdown({
			title: "Dashboard Capstone",
			objective: "Combine components, props, and lists into a cohesive screen.",
			body: "Build `StatCard` (`label`, `value`) and `Dashboard` rendering a heading `Dashboard` plus three cards: **Revenue** `$12,400`, **Users** `1,204`, **Orders** `86`.",
			pitfalls: [
				"Extract `StatCard` instead of repeating markup three times.",
				"Use semantic headings for the page title.",
			],
			next: "You have completed the React fundamentals track — explore advanced patterns next!",
		}),
		appCode: `type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  // TODO: card layout
  return null;
}

function Dashboard() {
  // TODO: heading + three StatCards
  return null;
}

export default function App() {
  return <Dashboard />;
}
`,
		taskTitle: "Dashboard capstone with stats cards",
		taskPrompt:
			"Implement `StatCard` and `Dashboard`. The dashboard shows a `Dashboard` heading and three stat cards with the specified labels and values.",
		taskRequirements: [
			"Reuse `StatCard` for each metric.",
			"Display exact values: `$12,400`, `1,204`, `86`.",
			"Each card exposes its label text in the DOM.",
		],
		taskSolution: `type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <article>
      <h2>{label}</h2>
      <p>{value}</p>
    </article>
  );
}

function Dashboard() {
  return (
    <section>
      <h1>Dashboard</h1>
      <StatCard label="Revenue" value="$12,400" />
      <StatCard label="Users" value="1,204" />
      <StatCard label="Orders" value="86" />
    </section>
  );
}

export default function App() {
  return <Dashboard />;
}
`,
		tests: [
			vitestReactTest(
				taskId(15),
				1,
				"renders dashboard heading",
				`render(<App />);
expect(screen.getByRole("heading", { name: "Dashboard", level: 1 })).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(15),
				2,
				"shows all stat values",
				`render(<App />);
expect(screen.getByText("$12,400")).toBeInTheDocument();
expect(screen.getByText("1,204")).toBeInTheDocument();
expect(screen.getByText("86")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(15),
				3,
				"shows stat labels",
				`render(<App />);
expect(screen.getByText("Revenue")).toBeInTheDocument();
expect(screen.getByText("Users")).toBeInTheDocument();
expect(screen.getByText("Orders")).toBeInTheDocument();`
			),
			vitestReactTest(
				taskId(15),
				4,
				"uses three stat cards",
				`render(<App />);
expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);`
			),
		],
		idiomHint:
			"Compose small presentational components into views; keep data props explicit at the leaves.",
	},
];

const lessons: LessonRow[] = lessonSeeds.map((seed) => ({
	id: lessonId(seed.n),
	courseId: COURSE_ID,
	title: seed.title,
	slug: seed.slug,
	description: seed.description,
	content: seed.content,
	hasTask: true,
	sortOrder: seed.n,
}));

const tasks: TaskRow[] = lessonSeeds.map((seed) =>
	reactSandboxTask({
		id: taskId(seed.n),
		lessonId: lessonId(seed.n),
		description:
			taskSpec({
				title: seed.taskTitle,
				prompt: seed.taskPrompt,
				requirements: seed.taskRequirements,
				solution: seed.taskSolution,
				lang: "tsx",
			}) + FRAMEWORK_TASK_TESTING_HINT,
		appCode: seed.appCode,
	})
);

const taskTests: TaskTestRow[] = lessonSeeds.flatMap((seed) => seed.tests);

const gradingCriteria: GradingCriteriaRow[] = lessonSeeds.flatMap((seed) =>
	defaultCriteria(taskId(seed.n), seed.idiomHint)
);

export const reactSeed: CourseSeedBundle = {
	course,
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(reactSeed);
