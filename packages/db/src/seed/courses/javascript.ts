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

const COURSE_ID = "course-js-v2";
const LANG = "javascript";

const lid = (n: number) => `lesson-js-v2-${String(n).padStart(2, "0")}`;
const tid = (n: number) => `task-js-v2-${String(n).padStart(2, "0")}`;

type LessonDef = {
	n: number;
	title: string;
	slug: string;
	description: string;
	content: string;
	task: {
		description: string;
		starterCode: string;
		solutionCode: string;
		tests: [string, string, string, string];
		idiomHint: string;
	};
};

const lessonDefs: LessonDef[] = [
	{
		n: 1,
		title: "Functions & Default Parameters",
		slug: "functions-and-default-parameters",
		description:
			"Define reusable functions and use default parameter values for flexible APIs.",
		content: lessonMarkdown({
			title: "Functions & Default Parameters",
			objective:
				"Write a function with a default currency parameter and return a formatted price string.",
			body: `Functions are the building blocks of JavaScript programs. They let you name a piece of logic, reuse it, and pass inputs through **parameters**.

## Declaring functions

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Default parameters

When a caller omits an argument, you can supply a fallback:

\`\`\`javascript
function formatPrice(amount, currency = "USD") {
  const value = Number(amount).toFixed(2);
  return currency === "EUR" ? \`€\${value}\` : \`$\${value}\`;
}
\`\`\`

Defaults are evaluated at call time and make APIs easier to use without extra branching at every call site.

## Return values

Always return the formatted string from your function—\`console.log\` prints to the terminal but does not return a value to the caller.`,
			pitfalls: [
				"Forgetting to return a value (the function implicitly returns `undefined`).",
				"Using `toFixed` on non-numbers—coerce with `Number()` first.",
				"Hard-coding `$` when the currency parameter should drive the symbol.",
			],
			next: "Next you'll classify runtime values with `typeof` and union-style return types.",
		}),
		task: {
			description: taskSpec({
				title: "formatPrice",
				prompt:
					"Implement `formatPrice(amount, currency = 'USD')` that formats a numeric amount to two decimal places with the correct currency symbol.",
				examples: `\`\`\`javascript
formatPrice(19.5)        // "$19.50"
formatPrice(19.5, "EUR") // "€19.50"
formatPrice(7, "GBP")    // "£7.00"
\`\`\``,
				requirements: [
					"Support `USD` (`$`), `EUR` (`€`), and `GBP` (`£`).",
					"Always show exactly two decimal places.",
					"Use a default parameter for `currency`.",
				],
				solution: `function formatPrice(amount, currency = "USD") {
  const value = Number(amount).toFixed(2);
  if (currency === "EUR") return \`€\${value}\`;
  if (currency === "GBP") return \`£\${value}\`;
  return \`$\${value}\`;
}`,
			}),
			starterCode: `function formatPrice(amount, currency = "USD") {
  // TODO: format amount to two decimals with the correct symbol
}`,
			solutionCode: `function formatPrice(amount, currency = "USD") {
  const value = Number(amount).toFixed(2);
  if (currency === "EUR") return \`€\${value}\`;
  if (currency === "GBP") return \`£\${value}\`;
  return \`$\${value}\`;
}`,
			tests: [
				[
					"defaults to USD",
					`const r = formatPrice(10);
if (r !== "$10.00") throw new Error(\`Expected "$10.00", got \${JSON.stringify(r)}\`);`,
				],
				[
					"formats EUR",
					`const r = formatPrice(19.5, "EUR");
if (r !== "€19.50") throw new Error(\`Expected "€19.50", got \${JSON.stringify(r)}\`);`,
				],
				[
					"formats GBP with padding",
					`const r = formatPrice(7, "GBP");
if (r !== "£7.00") throw new Error(\`Expected "£7.00", got \${JSON.stringify(r)}\`);`,
				],
				[
					"rounds fractional cents",
					`const r = formatPrice(2.999);
if (r !== "$3.00") throw new Error(\`Expected "$3.00", got \${JSON.stringify(r)}\`);`,
				],
			],
			idiomHint:
				"Use default parameters instead of manual `currency = currency || 'USD'` checks when the fallback is a constant.",
		},
	},
	{
		n: 2,
		title: "typeof & Value Classification",
		slug: "typeof-and-classification",
		description:
			"Use typeof to inspect runtime values and return a narrow classification string.",
		content: lessonMarkdown({
			title: "typeof & Value Classification",
			objective:
				"Return a discriminated string label for primitive values and bucket everything else as `other`.",
			body: `JavaScript is dynamically typed—the same variable can hold different shapes over time. The **typeof** operator inspects a value at runtime:

| Expression | typeof |
|---|---|
| \`42\` | \`"number"\` |
| \`"hi"\` | \`"string"\` |
| \`true\` | \`"boolean"\` |
| \`null\` | \`"object"\` (historic quirk) |
| \`{}\` | \`"object"\` |
| \`[]\` | \`"object"\` |

For this lesson, treat only \`number\`, \`string\`, and \`boolean\` as first-class categories; arrays, \`null\`, functions, and objects map to \`other\`.

\`\`\`javascript
function classifyValue(val) {
  const t = typeof val;
  if (t === "number" || t === "string" || t === "boolean") return t;
  return "other";
}
\`\`\`

This pattern mirrors **discriminated unions** you'll see in TypeScript later.`,
			pitfalls: [
				"`typeof null === 'object'` — handle null explicitly if you need a separate category.",
				"Assuming arrays are a typeof type (they are objects).",
				"Returning raw typeof for functions when the spec asks for `other`.",
			],
			next: "Apply branching with if/else chains to map numeric scores to letter grades.",
		}),
		task: {
			description: taskSpec({
				title: "classifyValue",
				prompt:
					"Implement `classifyValue(val)` returning `'number'`, `'string'`, `'boolean'`, or `'other'`.",
				examples: `\`\`\`javascript
classifyValue(42)       // "number"
classifyValue("x")      // "string"
classifyValue(null)     // "other"
classifyValue([])       // "other"
\`\`\``,
				requirements: [
					"Return exactly one of the four allowed strings.",
					"Only the three primitives get their typeof name.",
				],
				solution: `function classifyValue(val) {
  const t = typeof val;
  if (t === "number" || t === "string" || t === "boolean") return t;
  return "other";
}`,
			}),
			starterCode: `function classifyValue(val) {
  // TODO: return 'number' | 'string' | 'boolean' | 'other'
}`,
			solutionCode: `function classifyValue(val) {
  const t = typeof val;
  if (t === "number" || t === "string" || t === "boolean") return t;
  return "other";
}`,
			tests: [
				[
					"classifies number",
					`if (classifyValue(0) !== "number") throw new Error("expected number");`,
				],
				[
					"classifies string and boolean",
					`if (classifyValue("a") !== "string") throw new Error("expected string");
if (classifyValue(false) !== "boolean") throw new Error("expected boolean");`,
				],
				[
					"buckets null and array as other",
					`if (classifyValue(null) !== "other") throw new Error("expected other for null");
if (classifyValue([1]) !== "other") throw new Error("expected other for array");`,
				],
				[
					"buckets object and function",
					`if (classifyValue({}) !== "other") throw new Error("expected other for object");
if (classifyValue(() => {}) !== "other") throw new Error("expected other for function");`,
				],
			],
			idiomHint:
				"Prefer a small allow-list of primitive typeof results rather than a long switch with duplicate cases.",
		},
	},
	{
		n: 3,
		title: "Conditional Logic & Grading",
		slug: "conditionals-and-grading",
		description:
			"Chain if/else branches to translate numeric scores into letter grades.",
		content: lessonMarkdown({
			title: "Conditional Logic & Grading",
			objective:
				"Map a numeric score to a letter grade using ordered threshold checks.",
			body: `Conditional statements let programs make decisions. **if / else if / else** chains evaluate top to bottom—the first true branch wins.

\`\`\`javascript
function gradeBucket(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
\`\`\`

## Design tips

- Order thresholds from **highest to lowest** so a score of 95 matches A, not B.
- Use early \`return\` to avoid deep nesting.
- Treat boundary values explicitly: \`90\` is an A in this rubric.

Letter grading is a classic example of **interval classification**—the same pattern appears in pricing tiers, SLA buckets, and feature flags.`,
			pitfalls: [
				"Checking lower thresholds first (score 95 would become F).",
				"Using `else` when you still need to compare remaining ranges.",
				"Off-by-one errors at boundaries (89 vs 90).",
			],
			next: "Combine loops and arrays to generate the classic FizzBuzz sequence.",
		}),
		task: {
			description: taskSpec({
				title: "gradeBucket",
				prompt:
					"Implement `gradeBucket(score)` returning `'A'`, `'B'`, `'C'`, `'D'`, or `'F'` using standard US grading cutoffs.",
				examples: `\`\`\`javascript
gradeBucket(95) // "A"
gradeBucket(82) // "B"
gradeBucket(59) // "F"
\`\`\``,
				requirements: [
					"A: 90+, B: 80+, C: 70+, D: 60+, F: below 60.",
					"Boundary scores belong to the higher grade.",
				],
				solution: `function gradeBucket(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}`,
			}),
			starterCode: `function gradeBucket(score) {
  // TODO: return A/B/C/D/F based on score thresholds
}`,
			solutionCode: `function gradeBucket(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}`,
			tests: [
				[
					"grade A at boundary",
					`if (gradeBucket(90) !== "A") throw new Error("90 should be A");`,
				],
				[
					"grade B and C",
					`if (gradeBucket(85) !== "B") throw new Error("85 should be B");
if (gradeBucket(70) !== "C") throw new Error("70 should be C");`,
				],
				[
					"grade D",
					`if (gradeBucket(60) !== "D") throw new Error("60 should be D");`,
				],
				[
					"grade F below 60",
					`if (gradeBucket(59) !== "F") throw new Error("59 should be F");
if (gradeBucket(0) !== "F") throw new Error("0 should be F");`,
				],
			],
			idiomHint:
				"Use descending threshold checks with early returns instead of nested if/else pyramids.",
		},
	},
	{
		n: 4,
		title: "Loops & FizzBuzz",
		slug: "loops-and-fizzbuzz",
		description:
			"Build arrays with for loops and apply modular arithmetic rules.",
		content: lessonMarkdown({
			title: "Loops & FizzBuzz",
			objective:
				"Generate an array from 1..n replacing multiples of 3, 5, and 15 with FizzBuzz labels.",
			body: `The **for** loop is the workhorse for counted iteration:

\`\`\`javascript
const items = [];
for (let i = 1; i <= n; i++) {
  items.push(i);
}
\`\`\`

FizzBuzz combines loops with **modulo** (\`%\`) to detect divisibility:

- Multiples of 3 → \`"Fizz"\`
- Multiples of 5 → \`"Buzz"\`
- Multiples of both → \`"FizzBuzz"\`
- Otherwise → the number itself

Check \`15\` **before** \`3\` or \`5\` so you don't overwrite the combined case.

\`\`\`javascript
if (i % 15 === 0) push("FizzBuzz");
else if (i % 3 === 0) push("Fizz");
else if (i % 5 === 0) push("Buzz");
else push(i);
\`\`\`

Returning a new array keeps the function pure and easy to test.`,
			pitfalls: [
				"Testing `% 3` before `% 15`, producing `'Fizz'` instead of `'FizzBuzz'`.",
				"Using `<= 0` ranges or off-by-one loop bounds.",
				"Pushing string numbers (`'1'`) instead of numeric `1`.",
			],
			next: "Practice pure numeric transforms with temperature conversion.",
		}),
		task: {
			description: taskSpec({
				title: "fizzBuzz",
				prompt:
					"Implement `fizzBuzz(n)` returning an array of length `n` with FizzBuzz rules applied to values 1 through n.",
				examples: `\`\`\`javascript
fizzBuzz(5)  // [1, 2, "Fizz", 4, "Buzz"]
fizzBuzz(15) // [..., "FizzBuzz", ...] at index 14
\`\`\``,
				requirements: [
					"Return a new array; do not mutate external state.",
					"Multiples of 15 must be the string `FizzBuzz`.",
					"Non-matching values remain numbers.",
				],
				solution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(i);
  }
  return result;
}`,
			}),
			starterCode: `function fizzBuzz(n) {
  // TODO: return array 1..n with FizzBuzz rules
}`,
			solutionCode: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(i);
  }
  return result;
}`,
			tests: [
				[
					"empty for n=0",
					`const r = fizzBuzz(0);
if (!Array.isArray(r) || r.length !== 0) throw new Error("expected empty array");`,
				],
				[
					"first five values",
					`const r = fizzBuzz(5);
if (JSON.stringify(r) !== JSON.stringify([1, 2, "Fizz", 4, "Buzz"])) throw new Error("wrong first five");`,
				],
				[
					"FizzBuzz at 15",
					`const r = fizzBuzz(15);
if (r[14] !== "FizzBuzz") throw new Error("15 should be FizzBuzz");`,
				],
				[
					"correct length",
					`const r = fizzBuzz(20);
if (r.length !== 20) throw new Error("length should be 20");`,
				],
			],
			idiomHint:
				"Check the most specific condition (15) before individual divisors to avoid overlapping branches.",
		},
	},
	{
		n: 5,
		title: "Numeric Conversion",
		slug: "numeric-conversion",
		description:
			"Convert between temperature scales with a pure arithmetic function.",
		content: lessonMarkdown({
			title: "Numeric Conversion",
			objective:
				"Convert Fahrenheit to Celsius using the standard linear formula.",
			body: `Real-world APIs often transform units at the boundary. Temperature conversion is a clean example of a **pure function**—same input, same output, no side effects.

The formula:

\`\`\`
C = (F - 32) × 5/9
\`\`\`

\`\`\`javascript
function celsiusFromFahrenheit(f) {
  return ((f - 32) * 5) / 9;
}
\`\`\`

## Floating-point notes

JavaScript uses IEEE-754 doubles. \`0.1 + 0.2\` is not exactly \`0.3\`. For display, round; for physics, keep full precision until the last step.

Freezing point of water: \`32°F → 0°C\`. Boiling: \`212°F → 100°C\`.`,
			pitfalls: [
				"Dividing before subtracting (wrong order of operations).",
				"Using integer division tricks that truncate precision.",
				"Returning a formatted string when a number is required.",
			],
			next: "Encapsulate private state with closures in a counter factory.",
		}),
		task: {
			description: taskSpec({
				title: "celsiusFromFahrenheit",
				prompt:
					"Implement `celsiusFromFahrenheit(f)` returning the Celsius equivalent of `f` degrees Fahrenheit.",
				examples: `\`\`\`javascript
celsiusFromFahrenheit(32)  // 0
celsiusFromFahrenheit(212) // 100
\`\`\``,
				requirements: [
					"Return a number (not a string).",
					"Use the formula C = (F - 32) * 5 / 9.",
				],
				solution: `function celsiusFromFahrenheit(f) {
  return ((f - 32) * 5) / 9;
}`,
			}),
			starterCode: `function celsiusFromFahrenheit(f) {
  // TODO: return Celsius from Fahrenheit
}`,
			solutionCode: `function celsiusFromFahrenheit(f) {
  return ((f - 32) * 5) / 9;
}`,
			tests: [
				[
					"freezing point",
					`if (celsiusFromFahrenheit(32) !== 0) throw new Error("32F should be 0C");`,
				],
				[
					"boiling point",
					`if (celsiusFromFahrenheit(212) !== 100) throw new Error("212F should be 100C");`,
				],
				[
					"room temperature",
					`const c = celsiusFromFahrenheit(68);
if (Math.abs(c - 20) > 1e-9) throw new Error("68F should be 20C");`,
				],
				[
					"negative Fahrenheit",
					`const c = celsiusFromFahrenheit(-40);
if (Math.abs(c - (-40)) > 1e-9) throw new Error("-40F should be -40C");`,
				],
			],
			idiomHint:
				"Keep conversion functions pure—accept a number, return a number, with no I/O or rounding unless specified.",
		},
	},
	{
		n: 6,
		title: "Closures & Private State",
		slug: "closures-and-private-state",
		description:
			"Use closures to hide mutable state behind a small object API.",
		content: lessonMarkdown({
			title: "Closures & Private State",
			objective:
				"Build a counter factory where internal count is accessible only through methods.",
			body: `A **closure** is formed when an inner function captures variables from an outer scope—even after the outer function returns.

\`\`\`javascript
function makeCounter(start = 0) {
  let count = start;
  return {
    increment() {
      count += 1;
    },
    getCount() {
      return count;
    },
  };
}
\`\`\`

\`count\` is **private**: callers cannot read or write it directly, only through \`increment\` and \`getCount\`. This is lexical encapsulation—no classes required.

Closures power debouncers, memoization caches, and React hooks under the hood.`,
			pitfalls: [
				"Returning `count` directly instead of via `getCount()`.",
				"Recreating shared state on every method call.",
				"Using `var` in loops when creating multiple closures (use `let`).",
			],
			next: "Combine `filter` and `map` to transform collections of user records.",
		}),
		task: {
			description: taskSpec({
				title: "makeCounter",
				prompt:
					"Implement `makeCounter(start = 0)` returning `{ increment, getCount }` where `increment` mutates internal state and `getCount` reads it.",
				examples: `\`\`\`javascript
const c = makeCounter(10);
c.getCount(); // 10
c.increment();
c.getCount(); // 11
\`\`\``,
				requirements: [
					"Default start value is 0.",
					"Each call to `makeCounter` has independent state.",
				],
				solution: `function makeCounter(start = 0) {
  let count = start;
  return {
    increment() {
      count += 1;
    },
    getCount() {
      return count;
    },
  };
}`,
			}),
			starterCode: `function makeCounter(start = 0) {
  // TODO: return { increment, getCount } with private count
}`,
			solutionCode: `function makeCounter(start = 0) {
  let count = start;
  return {
    increment() {
      count += 1;
    },
    getCount() {
      return count;
    },
  };
}`,
			tests: [
				[
					"starts at default 0",
					`const c = makeCounter();
if (c.getCount() !== 0) throw new Error("default start should be 0");`,
				],
				[
					"starts at custom value",
					`const c = makeCounter(5);
if (c.getCount() !== 5) throw new Error("start should be 5");`,
				],
				[
					"increment increases count",
					`const c = makeCounter();
c.increment();
c.increment();
if (c.getCount() !== 2) throw new Error("count should be 2");`,
				],
				[
					"counters are independent",
					`const a = makeCounter(1);
const b = makeCounter(100);
a.increment();
if (b.getCount() !== 100) throw new Error("counters should not share state");`,
				],
			],
			idiomHint:
				"Expose a minimal object API and keep mutable state in the closure lexical environment.",
		},
	},
	{
		n: 7,
		title: "Array map & filter",
		slug: "array-map-and-filter",
		description:
			"Transform collections declaratively with filter followed by map.",
		content: lessonMarkdown({
			title: "Array map & filter",
			objective:
				"Filter active users then map to a simplified shape with uppercase names.",
			body: `Arrays ship with higher-order methods that express **what** you want, not **how** to loop.

\`\`\`javascript
const activeNames = users
  .filter((user) => user.active)
  .map((user) => ({ id: user.id, name: user.name.toUpperCase() }));
\`\`\`

- **filter** keeps elements matching a predicate.
- **map** transforms each element into a new value.
- Chaining returns a **new array**; the original is untouched.

This pipeline pattern is everywhere in UI code: fetch → filter → map → render.`,
			pitfalls: [
				"Mutating `user.name` in place instead of returning a new object.",
				"Forgetting to return from arrow callbacks when using block bodies.",
				"Filtering after mapping (less efficient when filter criteria exist on original).",
			],
			next: "Merge configuration objects with spread syntax and default layering.",
		}),
		task: {
			description: taskSpec({
				title: "transformUsers",
				prompt:
					"Implement `transformUsers(users)` to filter `active === true` and map to `{ id, name }` where `name` is uppercase.",
				examples: `\`\`\`javascript
transformUsers([
  { id: 1, name: "ada", active: true },
  { id: 2, name: "bob", active: false },
]);
// [{ id: 1, name: "ADA" }]
\`\`\``,
				requirements: [
					"Do not mutate the input array or its objects.",
					"Preserve numeric `id` values.",
				],
				solution: `function transformUsers(users) {
  return users
    .filter((user) => user.active)
    .map((user) => ({ id: user.id, name: user.name.toUpperCase() }));
}`,
			}),
			starterCode: `function transformUsers(users) {
  // TODO: filter active users, map id + uppercase name
}`,
			solutionCode: `function transformUsers(users) {
  return users
    .filter((user) => user.active)
    .map((user) => ({ id: user.id, name: user.name.toUpperCase() }));
}`,
			tests: [
				[
					"filters inactive users",
					`const r = transformUsers([
  { id: 1, name: "ada", active: true },
  { id: 2, name: "bob", active: false },
]);
if (r.length !== 1 || r[0].id !== 1) throw new Error("should keep only active");`,
				],
				[
					"uppercases names",
					`const r = transformUsers([{ id: 3, name: "lin", active: true }]);
if (r[0].name !== "LIN") throw new Error("name should be uppercase");`,
				],
				[
					"empty input",
					`const r = transformUsers([]);
if (!Array.isArray(r) || r.length !== 0) throw new Error("expected empty array");`,
				],
				[
					"all inactive",
					`const r = transformUsers([{ id: 1, name: "x", active: false }]);
if (r.length !== 0) throw new Error("expected no results");`,
				],
			],
			idiomHint:
				"Chain `filter` then `map` for readable data pipelines instead of manual for-loops with push.",
		},
	},
	{
		n: 8,
		title: "Object Spread & Defaults",
		slug: "object-spread-and-defaults",
		description:
			"Layer default properties under user-supplied overrides with spread syntax.",
		content: lessonMarkdown({
			title: "Object Spread & Defaults",
			objective:
				"Merge a target object over defaults so provided keys win while missing keys inherit defaults.",
			body: `The **object spread** operator (\`{ ...a, ...b }\`) shallow-copies enumerable own properties. Later keys overwrite earlier ones:

\`\`\`javascript
function mergeDefaults(target, defaults) {
  return { ...defaults, ...target };
}
\`\`\`

\`defaults\` fills the base; \`target\` overrides on collision. This mirrors configuration merging in CLI tools and UI theme providers.

## Shallow vs deep

Spread is **shallow**. Nested objects are copied by reference—deep merges need recursion (a later lesson).`,
			pitfalls: [
				"Spreading in the wrong order (defaults overwriting target).",
				"Expecting nested objects to clone deeply.",
				"Mutating `defaults` or `target` instead of returning a new object.",
			],
			next: "Parse simple comma-separated records into typed objects.",
		}),
		task: {
			description: taskSpec({
				title: "mergeDefaults",
				prompt:
					"Implement `mergeDefaults(target, defaults)` returning a new object with defaults applied first and target properties overriding.",
				examples: `\`\`\`javascript
mergeDefaults({ theme: "dark" }, { theme: "light", lang: "en" });
// { theme: "dark", lang: "en" }
\`\`\``,
				requirements: [
					"Return a new object; do not mutate inputs.",
					"Target keys take precedence over defaults.",
				],
				solution: `function mergeDefaults(target, defaults) {
  return { ...defaults, ...target };
}`,
			}),
			starterCode: `function mergeDefaults(target, defaults) {
  // TODO: merge defaults under target overrides
}`,
			solutionCode: `function mergeDefaults(target, defaults) {
  return { ...defaults, ...target };
}`,
			tests: [
				[
					"target overrides defaults",
					`const r = mergeDefaults({ a: 2 }, { a: 1, b: 3 });
if (r.a !== 2 || r.b !== 3) throw new Error("override failed");`,
				],
				[
					"fills missing keys",
					`const r = mergeDefaults({}, { x: true });
if (r.x !== true) throw new Error("missing key not filled");`,
				],
				[
					"does not mutate inputs",
					`const t = { a: 1 };
const d = { b: 2 };
mergeDefaults(t, d);
if (t.b !== undefined || d.a !== undefined) throw new Error("inputs mutated");`,
				],
				[
					"empty target uses defaults",
					`const r = mergeDefaults({}, { k: "v" });
if (r.k !== "v") throw new Error("defaults not applied");`,
				],
			],
			idiomHint:
				"Use object spread with defaults first, target second, for shallow configuration merging.",
		},
	},
	{
		n: 9,
		title: "String Parsing",
		slug: "string-parsing",
		description: "Split delimited strings and coerce tokens into typed fields.",
		content: lessonMarkdown({
			title: "String Parsing",
			objective:
				"Parse a CSV-like line into an object with string id/name and boolean active.",
			body: `Logs and imports often arrive as delimited text. \`String.prototype.split\` breaks a line into tokens:

\`\`\`javascript
function parseRecord(line) {
  const [id, name, active] = line.split(",");
  return {
    id,
    name,
    active: active === "true",
  };
}
\`\`\`

Compare to the string \`"true"\`—JSON booleans and CSV booleans are not the same type.

For production CSV you'd reach for a parser library; here we focus on **split → destructure → coerce**.`,
			pitfalls: [
				"Returning active as the string `'true'` instead of boolean `true`.",
				"Not handling extra whitespace around tokens (trim if needed).",
				"Assuming every line has exactly three fields without validation.",
			],
			next: "Update deeply nested state immutably using recursion and spread.",
		}),
		task: {
			description: taskSpec({
				title: "parseRecord",
				prompt:
					'Implement `parseRecord(line)` for lines shaped `"id,name,active"` returning `{ id, name, active }` with `active` as boolean.',
				examples: `\`\`\`javascript
parseRecord("u1,Ada,true");
// { id: "u1", name: "Ada", active: true }

parseRecord("u2,Bob,false");
// { id: "u2", name: "Bob", active: false }
\`\`\``,
				requirements: [
					"Split on commas (no quoted-field edge cases in this task).",
					"Coerce `active` from the strings `true` / `false`.",
				],
				solution: `function parseRecord(line) {
  const [id, name, active] = line.split(",");
  return { id, name, active: active === "true" };
}`,
			}),
			starterCode: `function parseRecord(line) {
  // TODO: parse "id,name,active" into an object
}`,
			solutionCode: `function parseRecord(line) {
  const [id, name, active] = line.split(",");
  return { id, name, active: active === "true" };
}`,
			tests: [
				[
					"parses active true",
					`const r = parseRecord("u1,Ada,true");
if (r.id !== "u1" || r.name !== "Ada" || r.active !== true) throw new Error("parse true failed");`,
				],
				[
					"parses active false",
					`const r = parseRecord("u2,Bob,false");
if (r.active !== false) throw new Error("active should be boolean false");`,
				],
				[
					"preserves string id",
					`const r = parseRecord("abc-9,X,false");
if (r.id !== "abc-9" || typeof r.id !== "string") throw new Error("id should be string");`,
				],
				[
					"returns object shape",
					`const r = parseRecord("1,A,false");
if (!("id" in r && "name" in r && "active" in r)) throw new Error("missing keys");`,
				],
			],
			idiomHint:
				"Destructure split tokens and coerce string flags to booleans explicitly.",
		},
	},
	{
		n: 10,
		title: "Immutable Nested Updates",
		slug: "immutable-nested-updates",
		description:
			"Update deeply nested objects without mutation using spread and recursion.",
		content: lessonMarkdown({
			title: "Immutable Nested Updates",
			objective:
				"Set a value at a dot-less path array while returning new object snapshots along the path.",
			body: `React and Redux expect **immutable** updates—never mutate previous state. For a path like \`['user', 'profile', 'city']\`, clone each level you traverse:

\`\`\`javascript
function updateNestedState(state, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return {
    ...state,
    [head]: updateNestedState(state[head] ?? {}, rest, value),
  };
}
\`\`\`

Each recursive call returns a new object reusing untouched siblings via spread. This is structural sharing—efficient enough for typical UI state trees.`,
			pitfalls: [
				"Mutating `state[head]` directly.",
				"Forgetting to handle missing intermediate keys.",
				"Returning the original reference when path is empty (should return `value`).",
			],
			next: "Wrap flaky callbacks with synchronous retry logic.",
		}),
		task: {
			description: taskSpec({
				title: "updateNestedState",
				prompt:
					"Implement `updateNestedState(state, path, value)` to immutably set `value` at the nested key sequence `path`.",
				examples: `\`\`\`javascript
const s = { a: { b: 1 } };
updateNestedState(s, ["a", "b"], 2); // { a: { b: 2 } }
// s is unchanged
\`\`\``,
				requirements: [
					"Do not mutate `state`.",
					"Create missing intermediate objects as needed.",
					"Return `value` when `path` is empty.",
				],
				solution: `function updateNestedState(state, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return {
    ...state,
    [head]: updateNestedState(state[head] ?? {}, rest, value),
  };
}`,
			}),
			starterCode: `function updateNestedState(state, path, value) {
  // TODO: immutably set value at path
}`,
			solutionCode: `function updateNestedState(state, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return {
    ...state,
    [head]: updateNestedState(state[head] ?? {}, rest, value),
  };
}`,
			tests: [
				[
					"updates nested key",
					`const s = { a: { b: 1 } };
const r = updateNestedState(s, ["a", "b"], 2);
if (r.a.b !== 2 || s.a.b !== 1) throw new Error("nested update failed");`,
				],
				[
					"creates missing path",
					`const r = updateNestedState({}, ["x", "y"], 9);
if (r.x.y !== 9) throw new Error("should create intermediate objects");`,
				],
				[
					"empty path returns value",
					`if (updateNestedState({ a: 1 }, [], 5) !== 5) throw new Error("empty path");`,
				],
				[
					"preserves sibling keys",
					`const s = { a: { b: 1, c: 3 } };
const r = updateNestedState(s, ["a", "b"], 2);
if (r.a.c !== 3) throw new Error("sibling lost");`,
				],
			],
			idiomHint:
				"Recurse on the path tail and spread shallow copies at each level for immutable tree updates.",
		},
	},
	{
		n: 11,
		title: "Retry with Callbacks",
		slug: "retry-with-callbacks",
		description:
			"Execute a flaky callback multiple times before surfacing the last error.",
		content: lessonMarkdown({
			title: "Retry with Callbacks",
			objective:
				"Call a zero-argument callback up to N times, returning its result or rethrowing the final error.",
			body: `Network and IO operations fail transiently. **Retry** wraps a callback:

\`\`\`javascript
function retry(fn, times) {
  let lastError;
  for (let attempt = 0; attempt < times; attempt++) {
    try {
      return fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
\`\`\`

The loop tries up to \`times\` attempts. First success short-circuits; exhaustion rethrows the last caught error.

This synchronous version prepares you for async retries with \`await\` in the next lessons.`,
			pitfalls: [
				"Swallowing errors without rethrowing after final attempt.",
				"Using `times` as inclusive count off-by-one.",
				"Retrying forever without a cap.",
			],
			next: "Run an array of async task functions sequentially with await.",
		}),
		task: {
			description: taskSpec({
				title: "retry",
				prompt:
					"Implement `retry(fn, times)` invoking `fn` up to `times` attempts. Return its value on success; throw the last error if all attempts fail.",
				examples: `\`\`\`javascript
let n = 0;
retry(() => {
  n += 1;
  if (n < 3) throw new Error("fail");
  return "ok";
}, 3); // "ok" after 3 attempts
\`\`\``,
				requirements: [
					"`times` is the maximum number of attempts (>= 1).",
					"Do not retry after a successful return.",
				],
				solution: `function retry(fn, times) {
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}`,
			}),
			starterCode: `function retry(fn, times) {
  // TODO: retry fn up to times attempts
}`,
			solutionCode: `function retry(fn, times) {
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}`,
			tests: [
				[
					"succeeds first try",
					`const v = retry(() => 42, 3);
if (v !== 42) throw new Error("should return 42");`,
				],
				[
					"succeeds after failures",
					`let n = 0;
const v = retry(() => {
  n += 1;
  if (n < 2) throw new Error("nope");
  return "ok";
}, 3);
if (v !== "ok") throw new Error("should eventually succeed");`,
				],
				[
					"throws after exhausting attempts",
					`let threw = false;
try {
  retry(() => { throw new Error("always"); }, 2);
} catch (e) {
  threw = e.message === "always";
}
if (!threw) throw new Error("should rethrow last error");`,
				],
				[
					"respects attempt limit",
					`let calls = 0;
try { retry(() => { calls += 1; throw new Error("x"); }, 3); } catch {}
if (calls !== 3) throw new Error(\`expected 3 calls, got \${calls}\`);`,
				],
			],
			idiomHint:
				"Use try/catch inside a bounded for-loop and rethrow the last captured error after exhaustion.",
		},
	},
	{
		n: 12,
		title: "Sequential Async Tasks",
		slug: "sequential-async-tasks",
		description:
			"Await async task functions one after another preserving result order.",
		content: lessonMarkdown({
			title: "Sequential Async Tasks",
			objective:
				"Execute an array of async task factories in order and collect their resolved values.",
			body: `\`Promise.all\` runs tasks concurrently. Sometimes order matters—database migrations, chained API calls, or UI wizards require **sequential** execution:

\`\`\`javascript
async function runSequential(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}
\`\`\`

Each \`task\` is a **thunk**—a zero-arg function returning a Promise. Awaiting inside the loop guarantees result \`i\` finishes before task \`i + 1\` starts.

Compare:
- Sequential: predictable order, slower total time.
- Parallel: faster, but race conditions if tasks share state.`,
			pitfalls: [
				"Using `Promise.all` when order of side effects matters.",
				"Forgetting to invoke `task()` (pushing the function, not its promise).",
				"Not marking the outer function `async` when using `await`.",
			],
			next: "Race a mock fetch promise against a timeout delay.",
		}),
		task: {
			description: taskSpec({
				title: "runSequential",
				prompt:
					"Implement `async function runSequential(tasks)` where each task is `() => Promise<value>`. Return an array of results in the same order.",
				examples: `\`\`\`javascript
await runSequential([
  () => Promise.resolve(1),
  () => Promise.resolve(2),
]); // [1, 2]
\`\`\``,
				requirements: [
					"Tasks run one at a time, not concurrently.",
					"If any task rejects, the promise rejects (natural await behavior).",
				],
				solution: `async function runSequential(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}`,
			}),
			starterCode: `async function runSequential(tasks) {
  // TODO: run tasks sequentially, return results array
}`,
			solutionCode: `async function runSequential(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}`,
			tests: [
				[
					"collects results in order",
					`let settled = false;
let failure = null;
runSequential([
  () => Promise.resolve("a"),
  () => Promise.resolve("b"),
])
  .then((r) => {
    if (JSON.stringify(r) !== JSON.stringify(["a", "b"])) failure = new Error("wrong order");
  })
  .catch((e) => { failure = e; })
  .finally(() => { settled = true; });
while (!settled) {}
if (failure) throw failure;`,
				],
				[
					"empty task list",
					`let settled = false;
let failure = null;
runSequential([])
  .then((r) => {
    if (!Array.isArray(r) || r.length !== 0) failure = new Error("expected empty");
  })
  .catch((e) => { failure = e; })
  .finally(() => { settled = true; });
while (!settled) {}
if (failure) throw failure;`,
				],
				[
					"sequential not parallel",
					`let running = 0;
let max = 0;
const task = () => {
  running += 1;
  max = Math.max(max, running);
  return new Promise((resolve) => {
    setTimeout(() => {
      running -= 1;
      resolve(1);
    }, 5);
  });
};
let settled = false;
let failure = null;
runSequential([task, task, task])
  .then(() => {
    if (max > 1) failure = new Error("tasks ran in parallel");
  })
  .catch((e) => { failure = e; })
  .finally(() => { settled = true; });
while (!settled) {}
if (failure) throw failure;`,
				],
				[
					"propagates rejection",
					`let settled = false;
let rejected = false;
runSequential([
  () => Promise.resolve(1),
  () => Promise.reject(new Error("boom")),
])
  .catch((e) => { rejected = e.message === "boom"; })
  .finally(() => { settled = true; });
while (!settled) {}
if (!rejected) throw new Error("should reject");`,
				],
			],
			idiomHint:
				"Await inside a for-of loop over task thunks to guarantee sequential completion order.",
		},
	},
	{
		n: 13,
		title: "Promise Timeouts",
		slug: "promise-timeouts",
		description:
			"Race a mock fetch promise against a timer without calling real fetch.",
		content: lessonMarkdown({
			title: "Promise Timeouts",
			objective:
				"Simulate fetch with an immediately resolving promise and enforce a timeout via Promise.race.",
			body: `Real \`fetch\` hits the network. For learning, mock the success path and focus on **timeout racing**:

\`\`\`javascript
async function fetchWithTimeout(url, ms) {
  const fetchPromise = Promise.resolve({ url, status: 200, body: "ok" });
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([fetchPromise, timeoutPromise]);
}
\`\`\`

\`Promise.race\` settles with the first fulfilled or rejected promise. If the timer wins, you reject with \`Timeout\`.

In production you'd combine \`AbortController\` with fetch; racing delays teaches the core pattern.`,
			pitfalls: [
				"Calling global `fetch` in tests (forbidden in this exercise).",
				"Forgetting to reject the timeout promise.",
				"Not returning the raced promise from an async function.",
			],
			next: "Build a small utility module factory returning helper functions.",
		}),
		task: {
			description: taskSpec({
				title: "fetchWithTimeout",
				prompt:
					"Implement `async function fetchWithTimeout(url, ms)` that resolves to `{ url, status: 200, body: 'ok' }` unless `ms` milliseconds elapse first, then reject with `Error('Timeout')`. Do not use `fetch`.",
				examples: `\`\`\`javascript
await fetchWithTimeout("/api", 1000);
// { url: "/api", status: 200, body: "ok" }

await fetchWithTimeout("/api", 0); // likely Timeout
\`\`\``,
				requirements: [
					"Use `Promise.race` between a resolved mock and a delayed rejection.",
					"Resolved object must include the input `url`.",
				],
				solution: `async function fetchWithTimeout(url, ms) {
  const fetchPromise = Promise.resolve({ url, status: 200, body: "ok" });
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([fetchPromise, timeoutPromise]);
}`,
			}),
			starterCode: `async function fetchWithTimeout(url, ms) {
  // TODO: race mock resolve against timeout — do not use fetch
}`,
			solutionCode: `async function fetchWithTimeout(url, ms) {
  const fetchPromise = Promise.resolve({ url, status: 200, body: "ok" });
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([fetchPromise, timeoutPromise]);
}`,
			tests: [
				[
					"resolves mock response",
					`let settled = false;
let failure = null;
fetchWithTimeout("/test", 500)
  .then((r) => {
    if (r.url !== "/test" || r.status !== 200 || r.body !== "ok") failure = new Error("bad response");
  })
  .catch((e) => { failure = e; })
  .finally(() => { settled = true; });
while (!settled) {}
if (failure) throw failure;`,
				],
				[
					"rejects on zero timeout",
					`let settled = false;
let timedOut = false;
fetchWithTimeout("/slow", 0)
  .catch((e) => { timedOut = e.message === "Timeout"; })
  .finally(() => { settled = true; });
while (!settled) {}
if (!timedOut) throw new Error("expected Timeout");`,
				],
				[
					"preserves url in response",
					`let settled = false;
let failure = null;
fetchWithTimeout("https://example.com", 100)
  .then((r) => {
    if (r.url !== "https://example.com") failure = new Error("url mismatch");
  })
  .catch((e) => { failure = e; })
  .finally(() => { settled = true; });
while (!settled) {}
if (failure) throw failure;`,
				],
				[
					"returns a promise",
					`const p = fetchWithTimeout("/x", 50);
if (!(p instanceof Promise)) throw new Error("should return a promise");`,
				],
			],
			idiomHint:
				"Race a immediately resolving mock promise against setTimeout rejection for timeout semantics without network I/O.",
		},
	},
	{
		n: 14,
		title: "Utility Factory Pattern",
		slug: "utility-factory-pattern",
		description:
			"Return a bag of related helper functions from a factory function.",
		content: lessonMarkdown({
			title: "Utility Factory Pattern",
			objective:
				"Expose `clamp` and `capitalize` helpers from a `buildUtils` factory.",
			body: `Grouping related pure functions behind a factory keeps namespaces tidy:

\`\`\`javascript
function buildUtils() {
  return {
    clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    },
    capitalize(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
  };
}
\`\`\`

Each call to \`buildUtils()\` returns a fresh object—no shared mutable state. This pattern appears in plugin systems and test fixtures.`,
			pitfalls: [
				"Using `this` incorrectly when methods are detached from the object.",
				"Forgetting edge cases like empty strings in `capitalize`.",
				"Swapping min/max in clamp.",
			],
			next: "Combine everything in a capstone ETL pipeline over messy user records.",
		}),
		task: {
			description: taskSpec({
				title: "buildUtils",
				prompt:
					"Implement `buildUtils()` returning `{ clamp, capitalize }` where `clamp(n, min, max)` bounds a number and `capitalize(str)` title-cases the first character.",
				examples: `\`\`\`javascript
const { clamp, capitalize } = buildUtils();
clamp(15, 0, 10);    // 10
capitalize("hELLO"); // "Hello"
\`\`\``,
				requirements: [
					"`clamp` uses inclusive min/max bounds.",
					"`capitalize('')` returns `''`.",
				],
				solution: `function buildUtils() {
  return {
    clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    },
    capitalize(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
  };
}`,
			}),
			starterCode: `function buildUtils() {
  // TODO: return { clamp, capitalize }
}`,
			solutionCode: `function buildUtils() {
  return {
    clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    },
    capitalize(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
  };
}`,
			tests: [
				[
					"clamp bounds high",
					`const { clamp } = buildUtils();
if (clamp(15, 0, 10) !== 10) throw new Error("clamp high");`,
				],
				[
					"clamp bounds low",
					`const { clamp } = buildUtils();
if (clamp(-5, 0, 10) !== 0) throw new Error("clamp low");`,
				],
				[
					"capitalize mixed case",
					`const { capitalize } = buildUtils();
if (capitalize("hELLO") !== "Hello") throw new Error("capitalize");`,
				],
				[
					"capitalize empty string",
					`const { capitalize } = buildUtils();
if (capitalize("") !== "") throw new Error("empty capitalize");`,
				],
			],
			idiomHint:
				"Return plain object literals of pure functions from a factory for grouped, stateless utilities.",
		},
	},
	{
		n: 15,
		title: "Capstone: User ETL Pipeline",
		slug: "capstone-user-etl-pipeline",
		description:
			"Normalize messy user records and compute aggregate statistics in one pipeline.",
		content: lessonMarkdown({
			title: "Capstone: User ETL Pipeline",
			objective:
				"Clean raw user rows, derive email domains, and return users plus `{ total, active, domains }` stats.",
			body: `This capstone combines parsing, mapping, filtering, and aggregation.

\`\`\`javascript
function normalizeUsers(raw) {
  const users = raw.map((row) => ({
    id: String(row.id).trim(),
    email: String(row.email).trim().toLowerCase(),
    active: Boolean(row.active),
    domain: String(row.email).split("@")[1]?.toLowerCase() ?? "",
  }));

  const domains = [...new Set(users.map((u) => u.domain).filter(Boolean))];

  return {
    users,
    stats: {
      total: users.length,
      active: users.filter((u) => u.active).length,
      domains,
    },
  };
}
\`\`\`

**ETL** — Extract (read raw), Transform (clean/map), Load (return structured result).

Watch for:
- Coercing ids/emails to strings before trimming.
- Lowercasing emails for case-insensitive comparison.
- Using \`Set\` for unique domain lists.`,
			pitfalls: [
				"Counting domains before deduplication.",
				"Mutating raw input objects during map.",
				"Forgetting to handle missing `@` in email (domain becomes empty string).",
			],
			next: "Congratulations—you've completed JavaScript Fundamentals v2. Continue to TypeScript for static typing on the same patterns.",
		}),
		task: {
			description: taskSpec({
				title: "normalizeUsers",
				prompt:
					"Implement `normalizeUsers(raw)` returning `{ users, stats }` where each user has `{ id, email, active, domain }` and stats has `{ total, active, domains }` (unique domain strings, excluding empty).",
				examples: `\`\`\`javascript
normalizeUsers([
  { id: " 1 ", email: "Ada@Example.COM", active: 1 },
  { id: 2, email: "bob@test.com", active: 0 },
]);
// stats: { total: 2, active: 1, domains: ["example.com", "test.com"] }
\`\`\``,
				requirements: [
					"Trim and stringify ids; trim and lowercase emails.",
					"Coerce `active` with `Boolean()`.",
					"Derive `domain` from the email host; dedupe domains in stats.",
				],
				solution: `function normalizeUsers(raw) {
  const users = raw.map((row) => ({
    id: String(row.id).trim(),
    email: String(row.email).trim().toLowerCase(),
    active: Boolean(row.active),
    domain: String(row.email).split("@")[1]?.toLowerCase() ?? "",
  }));

  const domains = [...new Set(users.map((u) => u.domain).filter(Boolean))];

  return {
    users,
    stats: {
      total: users.length,
      active: users.filter((u) => u.active).length,
      domains,
    },
  };
}`,
			}),
			starterCode: `function normalizeUsers(raw) {
  // TODO: normalize users and return { users, stats: { total, active, domains } }
}`,
			solutionCode: `function normalizeUsers(raw) {
  const users = raw.map((row) => ({
    id: String(row.id).trim(),
    email: String(row.email).trim().toLowerCase(),
    active: Boolean(row.active),
    domain: String(row.email).split("@")[1]?.toLowerCase() ?? "",
  }));

  const domains = [...new Set(users.map((u) => u.domain).filter(Boolean))];

  return {
    users,
    stats: {
      total: users.length,
      active: users.filter((u) => u.active).length,
      domains,
    },
  };
}`,
			tests: [
				[
					"normalizes user fields",
					`const { users } = normalizeUsers([
  { id: " 1 ", email: "Ada@Example.COM", active: 1 },
]);
if (users[0].id !== "1" || users[0].email !== "ada@example.com") throw new Error("normalize fields");`,
				],
				[
					"computes stats",
					`const { stats } = normalizeUsers([
  { id: 1, email: "a@x.com", active: true },
  { id: 2, email: "b@x.com", active: false },
]);
if (stats.total !== 2 || stats.active !== 1) throw new Error("stats counts");`,
				],
				[
					"dedupes domains",
					`const { stats } = normalizeUsers([
  { id: 1, email: "a@X.com", active: true },
  { id: 2, email: "b@x.com", active: true },
]);
if (stats.domains.length !== 1 || stats.domains[0] !== "x.com") throw new Error("domains dedupe");`,
				],
				[
					"handles empty input",
					`const { users, stats } = normalizeUsers([]);
if (users.length !== 0 || stats.total !== 0 || stats.active !== 0 || stats.domains.length !== 0) throw new Error("empty");`,
				],
			],
			idiomHint:
				"Map to normalized rows, then derive aggregate stats and unique domains with Set in a single return object.",
		},
	},
];

const lessons: LessonRow[] = lessonDefs.map((def) => ({
	id: lid(def.n),
	courseId: COURSE_ID,
	title: def.title,
	slug: def.slug,
	description: def.description,
	content: def.content,
	hasTask: true,
	sortOrder: def.n,
}));

const tasks: TaskRow[] = lessonDefs.map((def) => ({
	id: tid(def.n),
	lessonId: lid(def.n),
	languageId: LANG,
	description: def.task.description,
	starterCode: def.task.starterCode,
	solutionCode: def.task.solutionCode,
}));

const taskTests: TaskTestRow[] = lessonDefs.flatMap((def) =>
	def.task.tests.map(([title, body], i) =>
		jsTest(tid(def.n), i + 1, title, body)
	)
);

const gradingCriteria: GradingCriteriaRow[] = lessonDefs.flatMap((def) =>
	defaultCriteria(tid(def.n), def.task.idiomHint)
);

export const javascriptSeed: CourseSeedBundle = {
	course: {
		id: COURSE_ID,
		languageId: LANG,
		title: "JavaScript Fundamentals v2",
		slug: "javascript-fundamentals-v2",
		shortDescription:
			"Master core JavaScript from functions and closures to async patterns with hands-on exercises.",
		description:
			"A project-driven path through modern JavaScript fundamentals. Each lesson introduces one concept and immediately applies it in a focused coding task—from formatting and classification to immutable state, retries, sequential async, and a capstone ETL pipeline.",
		difficulty: "beginner",
		estimatedHours: 28,
		sortOrder: 1,
		isPublished: true,
	},
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(javascriptSeed);
