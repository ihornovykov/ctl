import { assertCourseBundle } from "../assert-seed";
import {
	defaultCriteria,
	jsTest,
	lessonMarkdown,
	taskSpec,
} from "../shared/task-templates";
import type {
	CourseSeedBundle,
	GradingCriteriaRow,
	LessonRow,
	TaskRow,
	TaskTestRow,
} from "../types";

const COURSE_ID = "course-ts-v2";
const LANG = "typescript";

const course = {
	id: COURSE_ID,
	languageId: LANG,
	title: "TypeScript Essentials",
	slug: "typescript-essentials-v2",
	shortDescription:
		"Add strong types to JavaScript — interfaces, generics, narrowing, and patterns for real-world TypeScript projects.",
	description: `TypeScript catches bugs at compile time and documents intent in your code. This course moves from basic annotations through generics, discriminated unions, utility types, and the Result pattern, ending with a typed CMS mapper capstone.

**Prerequisites:** Comfortable with basic JavaScript.

**What you'll learn:**
- Type annotations, interfaces, and union types
- Generics, constraints, and utility types
- Classes, narrowing, and discriminated unions
- Readonly configs, const assertions, and Result patterns
- Designing typed APIs and data mappers`,
	difficulty: "intermediate",
	estimatedHours: 26,
	sortOrder: 2,
	isPublished: true,
};

const lessonDefs: Array<{
	id: string;
	sortOrder: number;
	title: string;
	slug: string;
	description: string;
	markdown: ReturnType<typeof lessonMarkdown>;
	task: {
		title: string;
		prompt: string;
		examples?: string;
		requirements?: string[];
		starter: string;
		solution: string;
		idiomHint: string;
		tests: Array<{ title: string; body: string }>;
	};
}> = [
	{
		id: "lesson-ts-v2-01",
		sortOrder: 1,
		title: "Type Annotations",
		slug: "type-annotations",
		description: "Annotate parameters and return types for safer arithmetic.",
		markdown: lessonMarkdown({
			title: "Type Annotations",
			objective: "Use explicit types to document function contracts.",
			body: `TypeScript adds optional static types to JavaScript. Annotate parameters and return values so callers know what to expect:

\`\`\`typescript
function calculateGrade(scores: number[]): "A" | "B" | "C" | "D" | "F" {
  const avg = scores.reduce((sum, n) => sum + n, 0) / scores.length;
  if (avg >= 90) return "A";
  // ...
}
\`\`\`

Literal return types like \`"A" | "B"\` restrict outputs to known values.`,
			pitfalls: [
				"Dividing by zero when `scores` is empty.",
				"Using `string` instead of a grade literal union loses type safety.",
			],
			next: "Model structured objects with interfaces.",
		}),
		task: {
			title: "Calculate Grade",
			prompt:
				'Implement `calculateGrade(scores: number[]): "A" | "B" | "C" | "D" | "F"`. Use the average score with thresholds: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, otherwise F. Return `"F"` when `scores` is empty.',
			examples:
				'- `calculateGrade([95, 88, 92])` → `"A"`\n- `calculateGrade([72, 68, 75])` → `"C"`',
			starter: `export function calculateGrade(scores: number[]): "A" | "B" | "C" | "D" | "F" {
  // TODO
}`,
			solution: `export function calculateGrade(scores: number[]): "A" | "B" | "C" | "D" | "F" {
  if (scores.length === 0) return "F";
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  if (avg >= 90) return "A";
  if (avg >= 80) return "B";
  if (avg >= 70) return "C";
  if (avg >= 60) return "D";
  return "F";
}`,
			idiomHint:
				"Prefer literal union return types over plain string for fixed domains.",
			tests: [
				{
					title: "A average",
					body: `if (calculateGrade([95, 88, 92]) !== "A") throw new Error("expected A");`,
				},
				{
					title: "C average",
					body: `if (calculateGrade([72, 68, 75]) !== "C") throw new Error("expected C");`,
				},
				{
					title: "empty scores",
					body: `if (calculateGrade([]) !== "F") throw new Error("expected F");`,
				},
				{
					title: "borderline B",
					body: `if (calculateGrade([80, 80, 80]) !== "B") throw new Error("expected B");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-02",
		sortOrder: 2,
		title: "Interfaces",
		slug: "interfaces",
		description:
			"Validate unknown data against an interface with a type guard.",
		markdown: lessonMarkdown({
			title: "Interfaces",
			objective: "Describe object shapes and validate external data.",
			body: `Interfaces document required fields. Combine runtime checks with a **type predicate**:

\`\`\`typescript
interface User {
  id: string;
  email: string;
  age: number;
}

function validateUser(value: unknown): value is User {
  // narrow with typeof / in checks
}
\`\`\``,
			pitfalls: [
				"Assuming unknown JSON already matches your interface.",
				"Forgetting to validate nested objects when requirements grow.",
			],
			next: "Parse string inputs into literal union types.",
		}),
		task: {
			title: "Validate User",
			prompt:
				"Define `interface User { id: string; email: string; age: number }` and implement `validateUser(value: unknown): value is User`. Return `true` only when `value` is a non-null object with string `id`, string `email` containing `@`, and number `age` ≥ 0.",
			starter: `export interface User {
  id: string;
  email: string;
  age: number;
}

export function validateUser(value: unknown): value is User {
  // TODO
}`,
			solution: `export interface User {
  id: string;
  email: string;
  age: number;
}

export function validateUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    record.email.includes("@") &&
    typeof record.age === "number" &&
    record.age >= 0
  );
}`,
			idiomHint:
				"Use type predicates (`value is User`) to bridge runtime checks and static types.",
			tests: [
				{
					title: "valid user",
					body: `if (!validateUser({ id: "u1", email: "a@b.com", age: 30 })) throw new Error("expected valid");`,
				},
				{
					title: "invalid email",
					body: `if (validateUser({ id: "u1", email: "bad", age: 30 })) throw new Error("expected invalid");`,
				},
				{
					title: "null rejected",
					body: `if (validateUser(null)) throw new Error("expected invalid");`,
				},
				{
					title: "negative age rejected",
					body: `if (validateUser({ id: "u1", email: "a@b.com", age: -1 })) throw new Error("expected invalid");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-03",
		sortOrder: 3,
		title: "Unions and Literals",
		slug: "unions-and-literals",
		description: "Map raw strings to a closed set of status literals.",
		markdown: lessonMarkdown({
			title: "Unions and Literals",
			objective: "Parse external strings into typed literal unions safely.",
			body: `Union types represent a fixed set of values:

\`\`\`typescript
type Status = "active" | "inactive" | "pending";

function parseStatus(input: string): Status | null {
  const normalized = input.trim().toLowerCase();
  if (normalized === "active") return "active";
  // ...
  return null;
}
\`\`\``,
			pitfalls: [
				"Returning raw strings without narrowing to the union.",
				"Case-sensitive comparisons when input may vary.",
			],
			next: "Express multiple call signatures with overloads.",
		}),
		task: {
			title: "Parse Status",
			prompt:
				'Implement `parseStatus(input: string): "active" | "inactive" | "pending" | null`. Accept case-insensitive input and trim whitespace. Return `null` for unrecognized values.',
			starter: `export function parseStatus(input: string): "active" | "inactive" | "pending" | null {
  // TODO
}`,
			solution: `export function parseStatus(input: string): "active" | "inactive" | "pending" | null {
  const normalized = input.trim().toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "inactive") return "inactive";
  if (normalized === "pending") return "pending";
  return null;
}`,
			idiomHint:
				"Normalize external strings before comparing to literal unions.",
			tests: [
				{
					title: "parses active",
					body: `if (parseStatus("Active") !== "active") throw new Error("expected active");`,
				},
				{
					title: "parses inactive with spaces",
					body: `if (parseStatus("  inactive ") !== "inactive") throw new Error("expected inactive");`,
				},
				{
					title: "unknown returns null",
					body: `if (parseStatus("deleted") !== null) throw new Error("expected null");`,
				},
				{
					title: "parses pending",
					body: `if (parseStatus("PENDING") !== "pending") throw new Error("expected pending");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-04",
		sortOrder: 4,
		title: "Functions and Overloads",
		slug: "functions-and-overloads",
		description: "Provide typed overloads for different argument shapes.",
		markdown: lessonMarkdown({
			title: "Functions and Overloads",
			objective: "Use overload signatures for distinct call patterns.",
			body: `Overloads document multiple valid call shapes:

\`\`\`typescript
export function formatId(id: number): string;
export function formatId(id: string, prefix: string): string;
export function formatId(id: number | string, prefix?: string): string {
  // implementation
}
\`\`\``,
			pitfalls: [
				"Implementation signature must be compatible with all overloads.",
				"Forgetting to pad numeric IDs consistently.",
			],
			next: "Write reusable helpers with generics.",
		}),
		task: {
			title: "Format ID",
			prompt:
				'Implement overloaded `formatId`. When called with a number, return `"ID-"` plus the number zero-padded to 6 digits. When called with a string and prefix, return the prefix, a hyphen, and the id joined together.',
			starter: `export function formatId(id: number): string;
export function formatId(id: string, prefix: string): string;
export function formatId(id: number | string, prefix?: string): string {
  // TODO
}`,
			solution: `export function formatId(id: number): string;
export function formatId(id: string, prefix: string): string;
export function formatId(id: number | string, prefix?: string): string {
  if (typeof id === "number") {
    return \`ID-\${id.toString().padStart(6, "0")}\`;
  }
  return \`\${prefix}-\${id}\`;
}`,
			idiomHint:
				"Keep overload signatures user-facing and implement one flexible body.",
			tests: [
				{
					title: "numeric padding",
					body: `if (formatId(42) !== "ID-000042") throw new Error("bad numeric format");`,
				},
				{
					title: "string with prefix",
					body: `if (formatId("abc", "USR") !== "USR-abc") throw new Error("bad string format");`,
				},
				{
					title: "zero padding",
					body: `if (formatId(0) !== "ID-000000") throw new Error("bad zero format");`,
				},
				{
					title: "large number",
					body: `if (formatId(1234567) !== "ID-1234567") throw new Error("bad large format");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-05",
		sortOrder: 5,
		title: "Generics Intro",
		slug: "generics-intro",
		description: "Write generic helpers that work across types.",
		markdown: lessonMarkdown({
			title: "Generics Intro",
			objective: "Reuse logic across types with generic parameters.",
			body: `Generics preserve type information:

\`\`\`typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}
\`\`\`

The same helper works for numbers, strings, or custom types.`,
			pitfalls: [
				"Returning `T | undefined` when empty arrays should yield `undefined`.",
				"Using `any` instead of a type parameter.",
			],
			next: "Constrain generics to object keys.",
		}),
		task: {
			title: "First and Last",
			prompt:
				"Implement `first<T>(items: T[]): T | undefined` and `last<T>(items: T[]): T | undefined`. Return `undefined` for empty arrays.",
			starter: `export function first<T>(items: T[]): T | undefined {
  // TODO
}

export function last<T>(items: T[]): T | undefined {
  // TODO
}`,
			solution: `export function first<T>(items: T[]): T | undefined {
  return items[0];
}

export function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}`,
			idiomHint:
				"Use generic type parameters instead of overloads for homogeneous collections.",
			tests: [
				{
					title: "first element",
					body: `if (first([1, 2, 3]) !== 1) throw new Error("bad first");`,
				},
				{
					title: "last element",
					body: `if (last(["a", "b"]) !== "b") throw new Error("bad last");`,
				},
				{
					title: "empty first",
					body: `if (first([]) !== undefined) throw new Error("expected undefined");`,
				},
				{
					title: "empty last",
					body: `if (last([]) !== undefined) throw new Error("expected undefined");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-06",
		sortOrder: 6,
		title: "Generic Constraints",
		slug: "generic-constraints",
		description: "Constrain generics to objects with string keys.",
		markdown: lessonMarkdown({
			title: "Generic Constraints",
			objective: "Limit type parameters so property access is safe.",
			body: `Constraints restrict generics:

\`\`\`typescript
function longestProp<T extends Record<string, unknown>>(obj: T): keyof T | undefined {
  // compare Object.keys lengths... actually compare string values
}
\`\`\`

Use \`keyof T\` to refer to valid property names.`,
			pitfalls: [
				"Assuming all property values are strings.",
				"Returning a key name instead of comparing value lengths.",
			],
			next: "Build DTO helpers with utility types.",
		}),
		task: {
			title: "Longest Property",
			prompt:
				"Implement `longestProp<T extends Record<string, unknown>>(obj: T): keyof T | undefined`. Return the key whose string representation is longest. Break ties by first encountered key. Return `undefined` for an empty object.",
			starter: `export function longestProp<T extends Record<string, unknown>>(obj: T): keyof T | undefined {
  // TODO
}`,
			solution: `export function longestProp<T extends Record<string, unknown>>(obj: T): keyof T | undefined {
  const entries = Object.entries(obj) as [keyof T, unknown][];
  if (entries.length === 0) return undefined;
  let [bestKey] = entries[0];
  let bestLength = String(entries[0][1]).length;
  for (const [key, value] of entries.slice(1)) {
    const length = String(value).length;
    if (length > bestLength) {
      bestKey = key;
      bestLength = length;
    }
  }
  return bestKey;
}`,
			idiomHint:
				"Use `extends Record<string, unknown>` when iterating object entries generically.",
			tests: [
				{
					title: "finds longest value",
					body: `const key = longestProp({ a: "hi", b: "hello", c: "hey" });
if (key !== "b") throw new Error("expected b");`,
				},
				{
					title: "empty object",
					body: `if (longestProp({}) !== undefined) throw new Error("expected undefined");`,
				},
				{
					title: "numeric values",
					body: `const key = longestProp({ x: 1, y: 1000, z: 22 });
if (key !== "y") throw new Error("expected y");`,
				},
				{
					title: "tie keeps first",
					body: `const key = longestProp({ first: "aa", second: "bb" });
if (key !== "first") throw new Error("expected first");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-07",
		sortOrder: 7,
		title: "Utility Types",
		slug: "utility-types",
		description: "Pick a subset of fields with a generic utility helper.",
		markdown: lessonMarkdown({
			title: "Utility Types",
			objective: "Project objects onto typed subsets with `Pick`.",
			body: `Utility types transform existing types:

\`\`\`typescript
function pickFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}
\`\`\``,
			pitfalls: [
				"Returning a wider type than `Pick<T, K>`.",
				"Mutating the original object instead of creating a new one.",
			],
			next: "Encapsulate state in classes.",
		}),
		task: {
			title: "Pick Fields",
			prompt:
				"Implement `pickFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>` returning a new object containing only the requested keys.",
			starter: `export function pickFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // TODO
}`,
			solution: `export function pickFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}`,
			idiomHint:
				"Compose generic helpers with built-in utility types like Pick and Omit.",
			tests: [
				{
					title: "picks subset",
					body: `const user = { id: "1", name: "Ada", email: "a@b.com", role: "admin" };
const picked = pickFields(user, ["id", "name"]);
if (picked.id !== "1" || picked.name !== "Ada") throw new Error("bad pick");
if ("email" in picked) throw new Error("unexpected email");`,
				},
				{
					title: "single key",
					body: `const picked = pickFields({ a: 1, b: 2 }, ["b"]);
if (picked.b !== 2) throw new Error("bad single pick");`,
				},
				{
					title: "does not mutate source",
					body: `const source = { x: 1, y: 2 };
pickFields(source, ["x"]);
if (source.y !== 2) throw new Error("mutated source");`,
				},
				{
					title: "empty keys",
					body: `const picked = pickFields({ a: 1 }, []);
if (Object.keys(picked).length !== 0) throw new Error("expected empty");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-08",
		sortOrder: 8,
		title: "Classes",
		slug: "classes",
		description: "Model account balance with deposit and withdraw methods.",
		markdown: lessonMarkdown({
			title: "Classes",
			objective: "Encapsulate mutable state in a typed class.",
			body: `Classes combine fields and methods with access modifiers:

\`\`\`typescript
class BankAccount {
  private balance = 0;
  deposit(amount: number): void { /* ... */ }
}
\`\`\`

Validate inputs and prevent overdrafts explicitly.`,
			pitfalls: [
				"Allowing negative deposits or withdrawals.",
				"Exposing balance as publicly writable.",
			],
			next: "Narrow union types with runtime checks.",
		}),
		task: {
			title: "Bank Account",
			prompt:
				"Implement `class BankAccount` with `deposit(amount: number)`, `withdraw(amount: number): boolean`, and `getBalance(): number`. Reject non-positive amounts. Withdraw returns `false` without changing balance when insufficient funds.",
			starter: `export class BankAccount {
  // TODO
}`,
			solution: `export class BankAccount {
  private balance = 0;

  deposit(amount: number): void {
    if (amount <= 0) return;
    this.balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount <= 0) return false;
    if (amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }

  getBalance(): number {
    return this.balance;
  }
}`,
			idiomHint: "Use private fields and methods to protect invariants.",
			tests: [
				{
					title: "deposit increases balance",
					body: `const account = new BankAccount();
account.deposit(100);
if (account.getBalance() !== 100) throw new Error("bad balance");`,
				},
				{
					title: "withdraw succeeds",
					body: `const account = new BankAccount();
account.deposit(50);
if (!account.withdraw(20)) throw new Error("withdraw failed");
if (account.getBalance() !== 30) throw new Error("bad balance after withdraw");`,
				},
				{
					title: "withdraw fails on insufficient funds",
					body: `const account = new BankAccount();
account.deposit(10);
if (account.withdraw(20)) throw new Error("should not withdraw");
if (account.getBalance() !== 10) throw new Error("balance changed");`,
				},
				{
					title: "reject non-positive deposit",
					body: `const account = new BankAccount();
account.deposit(-5);
if (account.getBalance() !== 0) throw new Error("accepted negative deposit");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-09",
		sortOrder: 9,
		title: "Type Narrowing",
		slug: "type-narrowing",
		description: "Discriminate shapes with typeof and property checks.",
		markdown: lessonMarkdown({
			title: "Type Narrowing",
			objective: "Refine union types with runtime checks.",
			body: `Narrowing lets TypeScript understand branches:

\`\`\`typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function classifyShape(shape: Shape): string {
  if (shape.kind === "circle") {
    return \`circle:\${shape.radius}\`;
  }
  return \`rectangle:\${shape.width}x\${shape.height}\`;
}
\`\`\``,
			pitfalls: [
				"Accessing fields before narrowing the discriminant.",
				"Missing a union member in conditional branches.",
			],
			next: "Handle tagged events with discriminated unions.",
		}),
		task: {
			title: "Classify Shape",
			prompt:
				'Define `type Shape = { kind: "circle"; radius: number } | { kind: "rectangle"; width: number; height: number }` and implement `classifyShape(shape: Shape): string` returning `"circle:<radius>"` or `"rectangle:<width>x<height>"`.',
			starter: `export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

export function classifyShape(shape: Shape): string {
  // TODO
}`,
			solution: `export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

export function classifyShape(shape: Shape): string {
  if (shape.kind === "circle") {
    return \`circle:\${shape.radius}\`;
  }
  return \`rectangle:\${shape.width}x\${shape.height}\`;
}`,
			idiomHint:
				"Switch on discriminant fields (`kind`) before accessing variant-specific properties.",
			tests: [
				{
					title: "circle label",
					body: `if (classifyShape({ kind: "circle", radius: 3 }) !== "circle:3") throw new Error("bad circle");`,
				},
				{
					title: "rectangle label",
					body: `if (classifyShape({ kind: "rectangle", width: 4, height: 5 }) !== "rectangle:4x5") throw new Error("bad rectangle");`,
				},
				{
					title: "zero radius circle",
					body: `if (classifyShape({ kind: "circle", radius: 0 }) !== "circle:0") throw new Error("bad zero circle");`,
				},
				{
					title: "square rectangle",
					body: `if (classifyShape({ kind: "rectangle", width: 2, height: 2 }) !== "rectangle:2x2") throw new Error("bad square");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-10",
		sortOrder: 10,
		title: "Discriminated Unions",
		slug: "discriminated-unions",
		description: "Route events through a single handler using tags.",
		markdown: lessonMarkdown({
			title: "Discriminated Unions",
			objective: "Process tagged events with exhaustive branching.",
			body: `Discriminated unions pair a tag with payload fields:

\`\`\`typescript
type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string };

function handleEvent(event: AppEvent): string {
  switch (event.type) {
    case "click":
      return \`click@\${event.x},\${event.y}\`;
    case "keypress":
      return \`key:\${event.key}\`;
  }
}
\`\`\``,
			pitfalls: [
				"Forgetting to handle every union member.",
				"Using loose string comparisons instead of the discriminant.",
			],
			next: "Freeze configuration objects as readonly.",
		}),
		task: {
			title: "Handle Event",
			prompt:
				'Define `type AppEvent = { type: "click"; x: number; y: number } | { type: "keypress"; key: string }` and implement `handleEvent(event: AppEvent): string` returning `"click:<x>,<y>"` or `"key:<key>"`.',
			starter: `export type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string };

export function handleEvent(event: AppEvent): string {
  // TODO
}`,
			solution: `export type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string };

export function handleEvent(event: AppEvent): string {
  switch (event.type) {
    case "click":
      return \`click:\${event.x},\${event.y}\`;
    case "keypress":
      return \`key:\${event.key}\`;
  }
}`,
			idiomHint:
				"Use switch on the discriminant for exhaustive union handling.",
			tests: [
				{
					title: "click event",
					body: `if (handleEvent({ type: "click", x: 1, y: 2 }) !== "click:1,2") throw new Error("bad click");`,
				},
				{
					title: "keypress event",
					body: `if (handleEvent({ type: "keypress", key: "Enter" }) !== "key:Enter") throw new Error("bad key");`,
				},
				{
					title: "zero coordinates",
					body: `if (handleEvent({ type: "click", x: 0, y: 0 }) !== "click:0,0") throw new Error("bad zero click");`,
				},
				{
					title: "special key",
					body: `if (handleEvent({ type: "keypress", key: " " }) !== "key: ") throw new Error("bad space key");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-11",
		sortOrder: 11,
		title: "Readonly and Const",
		slug: "readonly-and-const",
		description: "Return deeply readonly configuration objects.",
		markdown: lessonMarkdown({
			title: "Readonly and Const",
			objective: "Prevent accidental mutation of config data.",
			body: `\`readonly\` marks properties immutable at the type level. Deep freeze enforces runtime immutability:

\`\`\`typescript
function freezeConfig<T extends Record<string, unknown>>(config: T): Readonly<T> {
  return Object.freeze(config);
}
\`\`\``,
			pitfalls: [
				"Shallow freeze leaves nested objects mutable.",
				"Returning the same mutable reference defeats the purpose.",
			],
			next: "Lock literal shapes with const assertions.",
		}),
		task: {
			title: "Freeze Config",
			prompt:
				"Implement `freezeConfig<T extends Record<string, unknown>>(config: T): Readonly<T>` returning a deeply frozen copy. Do not mutate the input object.",
			starter: `export function freezeConfig<T extends Record<string, unknown>>(config: T): Readonly<T> {
  // TODO
}`,
			solution: `export function freezeConfig<T extends Record<string, unknown>>(config: T): Readonly<T> {
  const clone = structuredClone(config) as T;
  const deepFreeze = (value: unknown): void => {
    if (typeof value !== "object" || value === null) return;
    Object.freeze(value);
    for (const nested of Object.values(value)) {
      deepFreeze(nested);
    }
  };
  deepFreeze(clone);
  return clone;
}`,
			idiomHint:
				"Pair readonly types with runtime freezing when configs must not change.",
			tests: [
				{
					title: "top level frozen",
					body: `const input = { api: "v1", retries: 3 };
const frozen = freezeConfig(input);
if (Object.isFrozen(frozen) !== true) throw new Error("not frozen");
if (input.retries !== 3) throw new Error("mutated input");`,
				},
				{
					title: "nested frozen",
					body: `const frozen = freezeConfig({ db: { host: "localhost", port: 5432 } });
if (Object.isFrozen(frozen.db) !== true) throw new Error("nested not frozen");`,
				},
				{
					title: "preserves values",
					body: `const frozen = freezeConfig({ theme: "dark", features: { beta: true } });
if (frozen.theme !== "dark" || frozen.features.beta !== true) throw new Error("bad values");`,
				},
				{
					title: "empty object",
					body: `const frozen = freezeConfig({});
if (Object.isFrozen(frozen) !== true) throw new Error("empty not frozen");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-12",
		sortOrder: 12,
		title: "Const Assertions",
		slug: "const-assertions",
		description: "Define theme tokens with literal types via const assertions.",
		markdown: lessonMarkdown({
			title: "Const Assertions",
			objective: "Preserve literal types with `as const` objects.",
			body: `\`as const\` narrows values to literal types:

\`\`\`typescript
export const themeTokens = {
  colors: {
    primary: "#3366ff",
    surface: "#ffffff",
  },
  spacing: {
    sm: 4,
    md: 8,
  },
} as const;
\`\`\`

Consumers get precise keyof/typeof inference.`,
			pitfalls: [
				"Omitting `as const` widens string/number types unnecessarily.",
				"Mutating const-asserted objects breaks inference guarantees.",
			],
			next: "Wrap API calls with typed success/error results.",
		}),
		task: {
			title: "Theme Tokens",
			prompt:
				'Export `themeTokens` as a const-asserted object with `colors.primary`, `colors.surface`, `spacing.sm`, and `spacing.md`. Implement `getThemeColor(token: "primary" | "surface"): string` returning the matching color.',
			starter: `export const themeTokens = {
  colors: {
    primary: "#3366ff",
    surface: "#ffffff",
  },
  spacing: {
    sm: 4,
    md: 8,
  },
};

export function getThemeColor(token: "primary" | "surface"): string {
  // TODO
}`,
			solution: `export const themeTokens = {
  colors: {
    primary: "#3366ff",
    surface: "#ffffff",
  },
  spacing: {
    sm: 4,
    md: 8,
  },
} as const;

export function getThemeColor(token: "primary" | "surface"): string {
  return themeTokens.colors[token];
}`,
			idiomHint:
				"Use `as const` on token maps so downstream code gets literal types.",
			tests: [
				{
					title: "primary color",
					body: `if (getThemeColor("primary") !== "#3366ff") throw new Error("bad primary");`,
				},
				{
					title: "surface color",
					body: `if (getThemeColor("surface") !== "#ffffff") throw new Error("bad surface");`,
				},
				{
					title: "spacing preserved",
					body: `if (themeTokens.spacing.sm !== 4 || themeTokens.spacing.md !== 8) throw new Error("bad spacing");`,
				},
				{
					title: "colors object exists",
					body: `if (!themeTokens.colors.primary.startsWith("#")) throw new Error("bad token shape");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-13",
		sortOrder: 13,
		title: "Typed API Wrapper",
		slug: "typed-api-wrapper",
		description: "Wrap throwing code in a typed success/error result.",
		markdown: lessonMarkdown({
			title: "Typed API Wrapper",
			objective:
				"Represent fallible operations without untyped try/catch at call sites.",
			body: `Model API outcomes explicitly:

\`\`\`typescript
type ApiSuccess<T> = { ok: true; data: T };
type ApiError = { ok: false; error: string };
type ApiResult<T> = ApiSuccess<T> | ApiError;
\`\`\`

Centralize error handling in one helper.`,
			pitfalls: [
				"Swallowing errors without a message.",
				"Using `any` for successful payloads.",
			],
			next: "Generalize to a reusable Result type.",
		}),
		task: {
			title: "API Result",
			prompt:
				"Define `type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }` and implement `apiResult<T>(fn: () => T): ApiResult<T>`. Return `{ ok: true, data }` on success and `{ ok: false, error: message }` when the function throws.",
			starter: `export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function apiResult<T>(fn: () => T): ApiResult<T> {
  // TODO
}`,
			solution: `export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function apiResult<T>(fn: () => T): ApiResult<T> {
  try {
    return { ok: true, data: fn() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}`,
			idiomHint:
				"Model success and failure as a discriminated union instead of throwing across layers.",
			tests: [
				{
					title: "success path",
					body: `const result = apiResult(() => 42);
if (!result.ok || result.data !== 42) throw new Error("bad success");`,
				},
				{
					title: "failure path",
					body: `const result = apiResult(() => { throw new Error("boom"); });
if (result.ok || result.error !== "boom") throw new Error("bad failure");`,
				},
				{
					title: "returns objects",
					body: `const result = apiResult(() => ({ id: "1" }));
if (!result.ok || result.data.id !== "1") throw new Error("bad object");`,
				},
				{
					title: "non-error throwables",
					body: `const result = apiResult(() => { throw "fail"; });
if (result.ok || result.error !== "fail") throw new Error("bad string error");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-14",
		sortOrder: 14,
		title: "Result Pattern",
		slug: "result-pattern",
		description: "Represent success and failure with explicit Ok/Err values.",
		markdown: lessonMarkdown({
			title: "Result Pattern",
			objective: "Make control flow explicit with tagged Ok/Err results.",
			body: `The Result pattern avoids thrown exceptions for expected failures:

\`\`\`typescript
type Ok<T> = { kind: "ok"; value: T };
type Err<E> = { kind: "err"; error: E };
type Result<T, E> = Ok<T> | Err<E>;
\`\`\`

Helpers \`ok\` and \`err\` construct each branch.`,
			pitfalls: [
				"Mixing thrown errors with Result returns in the same API.",
				"Forgetting to check `kind` before accessing `value` or `error`.",
			],
			next: "Map typed CMS content in the capstone.",
		}),
		task: {
			title: "Result Ok/Err",
			prompt:
				'Define `type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E }` plus helpers `ok<T>(value: T)` and `err<E>(error: E)`. Implement `parsePositiveInt(input: string): Result<number, string>` returning `ok(parsed)` for positive integers and `err(message)` otherwise.',
			starter: `export type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };

export function ok<T>(value: T): Result<T, never> {
  // TODO
}

export function err<E>(error: E): Result<never, E> {
  // TODO
}

export function parsePositiveInt(input: string): Result<number, string> {
  // TODO
}`,
			solution: `export type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { kind: "ok", value };
}

export function err<E>(error: E): Result<never, E> {
  return { kind: "err", error };
}

export function parsePositiveInt(input: string): Result<number, string> {
  const trimmed = input.trim();
  if (!/^\\d+$/.test(trimmed)) {
    return err("invalid integer");
  }
  const value = Number(trimmed);
  if (value <= 0) {
    return err("must be positive");
  }
  return ok(value);
}`,
			idiomHint:
				"Prefer tagged Result unions over exceptions for expected validation failures.",
			tests: [
				{
					title: "parses positive int",
					body: `const result = parsePositiveInt("42");
if (result.kind !== "ok" || result.value !== 42) throw new Error("bad ok");`,
				},
				{
					title: "rejects zero",
					body: `const result = parsePositiveInt("0");
if (result.kind !== "err" || result.error !== "must be positive") throw new Error("bad zero");`,
				},
				{
					title: "rejects invalid",
					body: `const result = parsePositiveInt("abc");
if (result.kind !== "err" || result.error !== "invalid integer") throw new Error("bad invalid");`,
				},
				{
					title: "ok helper",
					body: `const result = ok("done");
if (result.kind !== "ok" || result.value !== "done") throw new Error("bad ok helper");`,
				},
			],
		},
	},
	{
		id: "lesson-ts-v2-15",
		sortOrder: 15,
		title: "Capstone: CMS Mapper",
		slug: "capstone-cms-mapper",
		description: "Map typed CMS articles into preview DTOs.",
		markdown: lessonMarkdown({
			title: "Capstone: CMS Mapper",
			objective: "Combine unions, generics, and mapping into a typed pipeline.",
			body: `This capstone models CMS content blocks as a discriminated union, then maps articles into preview DTOs for a listing page.

You will:
- define block and article types
- derive a text preview from the first text block
- fall back to image alt text or a placeholder when no text exists`,
			pitfalls: [
				"Assuming every article has a text block.",
				"Returning untyped objects instead of the preview DTO shape.",
			],
			next: "You have completed TypeScript Essentials — apply these patterns in your apps and shared libraries.",
		}),
		task: {
			title: "CMS Mapper",
			prompt:
				'Define:\n- `type ContentBlock = { type: "text"; body: string } | { type: "image"; url: string; alt: string }`\n- `type Article = { id: string; title: string; blocks: ContentBlock[] }`\n- `type ArticlePreview = { id: string; title: string; preview: string }`\n\nImplement `cmsMapper(articles: Article[]): ArticlePreview[]`. Use the first text block body truncated to 80 characters (append `...` when longer). If no text block exists, use `alt` from the first image block. Otherwise preview is `"No preview"`.',
			starter: `export type ContentBlock =
  | { type: "text"; body: string }
  | { type: "image"; url: string; alt: string };

export type Article = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

export type ArticlePreview = {
  id: string;
  title: string;
  preview: string;
};

export function cmsMapper(articles: Article[]): ArticlePreview[] {
  // TODO
}`,
			solution: `export type ContentBlock =
  | { type: "text"; body: string }
  | { type: "image"; url: string; alt: string };

export type Article = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

export type ArticlePreview = {
  id: string;
  title: string;
  preview: string;
};

const toPreview = (blocks: ContentBlock[]): string => {
  const textBlock = blocks.find((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text");
  if (textBlock) {
    return textBlock.body.length > 80 ? \`\${textBlock.body.slice(0, 80)}...\` : textBlock.body;
  }
  const imageBlock = blocks.find((block): block is Extract<ContentBlock, { type: "image" }> => block.type === "image");
  if (imageBlock) {
    return imageBlock.alt;
  }
  return "No preview";
};

export function cmsMapper(articles: Article[]): ArticlePreview[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    preview: toPreview(article.blocks),
  }));
}`,
			idiomHint:
				"Compose small typed helpers and discriminated unions for maintainable mappers.",
			tests: [
				{
					title: "text preview",
					body: `const previews = cmsMapper([{ id: "1", title: "Hello", blocks: [{ type: "text", body: "Short body" }] }]);
if (previews[0].preview !== "Short body") throw new Error("bad text preview");`,
				},
				{
					title: "truncates long text",
					body: `const long = "a".repeat(100);
const previews = cmsMapper([{ id: "2", title: "Long", blocks: [{ type: "text", body: long }] }]);
if (!previews[0].preview.endsWith("...") || previews[0].preview.length !== 83) throw new Error("bad truncate");`,
				},
				{
					title: "image alt fallback",
					body: `const previews = cmsMapper([{ id: "3", title: "Img", blocks: [{ type: "image", url: "/x.png", alt: "Logo" }] }]);
if (previews[0].preview !== "Logo") throw new Error("bad alt preview");`,
				},
				{
					title: "no preview fallback",
					body: `const previews = cmsMapper([{ id: "4", title: "Empty", blocks: [] }]);
if (previews[0].preview !== "No preview") throw new Error("bad empty preview");`,
				},
			],
		},
	},
];

const lessons: LessonRow[] = lessonDefs.map((def) => ({
	id: def.id,
	courseId: COURSE_ID,
	title: def.title,
	slug: def.slug,
	description: def.description,
	content: def.markdown,
	hasTask: true,
	sortOrder: def.sortOrder,
}));

const tasks: TaskRow[] = lessonDefs.map((def) => {
	const taskId = def.id.replace("lesson-", "task-");
	return {
		id: taskId,
		lessonId: def.id,
		languageId: LANG,
		description: taskSpec({
			title: def.task.title,
			prompt: def.task.prompt,
			examples: def.task.examples,
			requirements: def.task.requirements,
			solution: def.task.solution,
			lang: "typescript",
		}),
		starterCode: def.task.starter,
		solutionCode: def.task.solution,
	};
});

const taskTests: TaskTestRow[] = lessonDefs.flatMap((def) => {
	const taskId = def.id.replace("lesson-", "task-");
	return def.task.tests.map((test, index) =>
		jsTest(taskId, index + 1, test.title, test.body)
	);
});

const gradingCriteria: GradingCriteriaRow[] = tasks.flatMap((task, index) =>
	defaultCriteria(
		task.id,
		lessonDefs[index]?.task.idiomHint ??
			"Use explicit types, narrowing, and generics instead of any."
	)
);

export const typescriptSeed: CourseSeedBundle = {
	course,
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(typescriptSeed);
