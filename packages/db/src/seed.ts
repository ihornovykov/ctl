import "dotenv/config";
import { notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import {
	course,
	gradingCriteria,
	language,
	lesson,
	task,
	taskTest,
} from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is required to run seed");
	process.exit(1);
}

const db = drizzle(databaseUrl, { logger: false });

const languages = [
	{
		id: "javascript",
		name: "JavaScript",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
		dockerImage: "node:20-alpine",
		fileExtension: ".js",
		monacoLanguage: "javascript",
	},
	{
		id: "typescript",
		name: "TypeScript",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
		dockerImage: "node:20-alpine",
		fileExtension: ".ts",
		monacoLanguage: "typescript",
	},
	{
		id: "go",
		name: "Go",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
		dockerImage: "golang:1.22-alpine",
		fileExtension: ".go",
		monacoLanguage: "go",
	},
	{
		id: "python",
		name: "Python",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
		dockerImage: "python:3.12-alpine",
		fileExtension: ".py",
		monacoLanguage: "python",
	},
	{
		id: "c",
		name: "C",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
		dockerImage: "gcc:14",
		fileExtension: ".c",
		monacoLanguage: "c",
	},
	{
		id: "cpp",
		name: "C++",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
		dockerImage: "gcc:14",
		fileExtension: ".cpp",
		monacoLanguage: "cpp",
	},
	{
		id: "react",
		name: "React",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
		dockerImage: "ctl-playground:latest",
		fileExtension: ".tsx",
		monacoLanguage: "typescript",
	},
	{
		id: "vue",
		name: "Vue",
		icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
		dockerImage: "ctl-playground:latest",
		fileExtension: ".vue",
		monacoLanguage: "vue",
	},
] as const;

const courses = [
	{
		id: "course-javascript-fundamentals",
		languageId: "javascript",
		title: "JavaScript Fundamentals",
		slug: "javascript-fundamentals",
		shortDescription:
			"Master the language of the web. Learn variables, functions, async patterns, and modern ES2024 features from the ground up.",
		description: `JavaScript powers everything on the modern web. In this course you will build a rock-solid foundation in the language — starting with variables, types, and control flow, then advancing to closures, prototypes, the event loop, Promises, and async/await. By the end you will confidently write clean, idiomatic JS for both browser and Node.js environments.

**Prerequisites:** None — this is a beginner course.

**What you'll learn:**
- Variables, data types, and operators
- Functions, scope, and closures
- Objects, arrays, and destructuring
- Asynchronous JavaScript: callbacks, Promises, async/await
- Modern ES2024 features and best practices`,
		difficulty: "beginner",
		estimatedHours: 24,
		sortOrder: 1,
		isPublished: true,
	},
	{
		id: "course-typescript-essentials",
		languageId: "typescript",
		title: "TypeScript Essentials",
		slug: "typescript-essentials",
		shortDescription:
			"Add strong types to JavaScript. Interfaces, generics, utility types, and how to integrate TS into real projects.",
		description: `TypeScript is JavaScript with superpowers. This course teaches you how to annotate your code with types, design reusable generic utilities, and leverage TypeScript's powerful type inference to catch bugs before they reach production.

**Prerequisites:** Basic JavaScript knowledge.

**What you'll learn:**
- Type annotations, interfaces, and type aliases
- Generics and conditional types
- Utility types: Partial, Pick, Omit, Record, and more
- Strict mode and compiler configuration
- Integrating TypeScript into existing JS projects`,
		difficulty: "intermediate",
		estimatedHours: 18,
		sortOrder: 2,
		isPublished: true,
	},
	{
		id: "course-go-fundamentals",
		languageId: "go",
		title: "Go Fundamentals",
		slug: "go-fundamentals",
		shortDescription:
			"Build fast, concurrent software with Go. Goroutines, channels, interfaces, and idiomatic Go patterns.",
		description: `Go was designed for building reliable, efficient software at scale. You will learn Go's unique approach to simplicity — static typing without the ceremony, goroutines for concurrency, and interfaces for polymorphism. From hello world to writing CLI tools and HTTP servers.

**Prerequisites:** Basic programming experience in any language.

**What you'll learn:**
- Types, structs, and methods
- Goroutines and channels
- Interfaces and composition
- Error handling idioms
- Building CLI tools and HTTP servers`,
		difficulty: "intermediate",
		estimatedHours: 20,
		sortOrder: 3,
		isPublished: true,
	},
	{
		id: "course-python-fundamentals",
		languageId: "python",
		title: "Python Fundamentals",
		slug: "python-fundamentals",
		shortDescription:
			"The friendliest introduction to programming. Learn Python's clean syntax, data structures, and scripting superpowers.",
		description: `Python's readable syntax makes it the ideal first language — and a powerful tool for experienced developers. This course covers the core language from basics through object-oriented programming, with a focus on practical scripts, data manipulation, and writing clean Pythonic code.

**Prerequisites:** None — suitable for complete beginners.

**What you'll learn:**
- Python syntax, types, and control flow
- Lists, dictionaries, sets, and comprehensions
- Functions, decorators, and closures
- Classes and object-oriented programming
- File I/O, modules, and the standard library`,
		difficulty: "beginner",
		estimatedHours: 20,
		sortOrder: 4,
		isPublished: true,
	},
	{
		id: "course-c-fundamentals",
		languageId: "c",
		title: "C Fundamentals",
		slug: "c-fundamentals",
		shortDescription:
			"Understand computing at the metal level. Pointers, memory management, and systems programming with C.",
		description: `C is the language that built operating systems, compilers, and databases. Learning C gives you a deep understanding of how computers actually work — memory, pointers, and manual resource management. This course takes you from syntax basics through pointers, structs, and writing real systems programs.

**Prerequisites:** Basic programming experience recommended.

**What you'll learn:**
- Variables, types, operators, and control flow
- Functions and the call stack
- Arrays, strings, and pointers
- Dynamic memory allocation with malloc/free
- Structs, file I/O, and systems programming patterns`,
		difficulty: "intermediate",
		estimatedHours: 22,
		sortOrder: 5,
		isPublished: true,
	},
	{
		id: "course-cpp-fundamentals",
		languageId: "cpp",
		title: "C++ Fundamentals",
		slug: "cpp-fundamentals",
		shortDescription:
			"Systems programming with object-oriented power. Classes, templates, RAII, and modern C++20 features.",
		description: `C++ combines low-level control with high-level abstractions. This course covers the full spectrum — from C-style basics through classes, inheritance, templates, the STL, and modern C++20 features like concepts and ranges. Ideal for anyone who wants to write high-performance software.

**Prerequisites:** Basic C or programming experience recommended.

**What you'll learn:**
- Classes, constructors, and destructors
- Inheritance, polymorphism, and virtual functions
- Templates and the Standard Template Library (STL)
- RAII and smart pointers (unique_ptr, shared_ptr)
- Modern C++20: concepts, ranges, and coroutines`,
		difficulty: "advanced",
		estimatedHours: 28,
		sortOrder: 6,
		isPublished: true,
	},
	{
		id: "course-react-fundamentals",
		languageId: "react",
		title: "React Fundamentals",
		slug: "react-fundamentals",
		shortDescription:
			"Build interactive UIs with components, JSX, state, and hooks in a live Vite playground.",
		description: `Learn React by editing real \`.tsx\` files with instant preview. This course covers components, JSX, props, state, and effects — all in a browser-based sandbox backed by Vite and Vitest.

**Prerequisites:** Basic JavaScript.

**What you'll learn:**
- Function components and JSX
- Props and one-way data flow
- \`useState\` and \`useEffect\`
- Testing components with Vitest`,
		difficulty: "beginner",
		estimatedHours: 12,
		sortOrder: 7,
		isPublished: true,
	},
	{
		id: "course-vue-fundamentals",
		languageId: "vue",
		title: "Vue Fundamentals",
		slug: "vue-fundamentals",
		shortDescription:
			"Learn Vue 3 with single-file components, reactivity, and composition in a live dev playground.",
		description: `Vue pairs approachable templates with powerful reactivity. Work through lessons in a real Vite + Vue project with tests and live preview.

**Prerequisites:** Basic JavaScript.

**What you'll learn:**
- Single-file components (SFC)
- Template syntax and directives
- \`ref\`, \`reactive\`, and \`computed\`
- Testing with Vitest and Vue Test Utils`,
		difficulty: "beginner",
		estimatedHours: 12,
		sortOrder: 8,
		isPublished: true,
	},
];

const FRAMEWORK_TASK_TESTING_HINT = `

### How to verify your solution

- Open the **Preview** tab for a live view while you edit \`App.tsx\` or \`App.vue\`.
- Click **Run Tests** in the toolbar to execute Vitest in the sandbox. All tests must pass before **Submit** unlocks.
`;

const FRAMEWORK_EXAMPLE_REACT_HELLO = `

### Example

\`\`\`tsx
export default function App() {
  return (
    <main>
      <h1>Hello React</h1>
    </main>
  );
}
\`\`\``;

const FRAMEWORK_EXAMPLE_REACT_COUNTER = `

### Example

\`\`\`tsx
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Click
      </button>
    </main>
  );
}
\`\`\``;

const FRAMEWORK_EXAMPLE_REACT_LIST = `

### Example

\`\`\`tsx
const items = ["alpha", "beta", "gamma"];

export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
\`\`\``;

const FRAMEWORK_EXAMPLE_VUE_HELLO = `

### Example

\`\`\`vue
<template>
  <main style="font-family: system-ui; padding: 24px">
    <h1>Hello Vue</h1>
  </main>
</template>
\`\`\``;

const FRAMEWORK_EXAMPLE_VUE_COUNTER = `

### Example

\`\`\`vue
<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>

<template>
  <main style="font-family: system-ui; padding: 24px">
    <p>Count: {{ count }}</p>
    <button type="button" @click="count++">Click</button>
  </main>
</template>
\`\`\``;

const FRAMEWORK_EXAMPLE_VUE_GREETING = `

### Example

\`\`\`vue
<script setup lang="ts">
import { computed, ref } from "vue";
const name = ref("Ada");
const greeting = computed(() => \`Hello, \${name.value}\`);
</script>

<template>
  <main style="font-family: system-ui; padding: 24px">
    <p>{{ greeting }}</p>
  </main>
</template>
\`\`\``;

const lessons = [
	// JavaScript Fundamentals — 5 lessons
	{
		id: "lesson-js-01",
		courseId: "course-javascript-fundamentals",
		title: "Variables and Data Types",
		slug: "variables-and-data-types",
		description:
			"Learn how JavaScript stores data — primitives, type coercion, and the difference between var, let, and const.",
		content: `# Variables and Data Types

JavaScript has eight data types: \`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\`, and \`object\`.

## Declaring Variables

\`\`\`js
const name = "Alice";   // block-scoped, cannot be reassigned
let age = 30;           // block-scoped, can be reassigned
var legacy = true;      // function-scoped (avoid in modern code)
\`\`\`

## Type Coercion

JavaScript automatically converts types in certain contexts — this is called *implicit coercion*.

\`\`\`js
"5" + 3     // "53"  — string concatenation wins
"5" - 3     // 2     — minus converts string to number
Boolean("")  // false — empty string is falsy
\`\`\`

Use \`===\` (strict equality) instead of \`==\` to avoid unexpected coercions.`,
		sortOrder: 1,
		hasTask: true,
	},
	{
		id: "lesson-js-02",
		courseId: "course-javascript-fundamentals",
		title: "Control Flow",
		slug: "control-flow",
		description:
			"Master if/else, switch, ternary expressions, and the nullish coalescing and optional chaining operators.",
		content: `# Control Flow

Control flow lets your program make decisions and repeat actions.

## Conditionals

\`\`\`js
const score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C or below");
}
\`\`\`

## Ternary Operator

\`\`\`js
const label = score >= 60 ? "Pass" : "Fail";
\`\`\`

## Nullish Coalescing & Optional Chaining

\`\`\`js
const user = null;
const name = user?.profile?.name ?? "Anonymous";
\`\`\``,
		sortOrder: 2,
	},
	{
		id: "lesson-js-03",
		courseId: "course-javascript-fundamentals",
		title: "Functions and Scope",
		slug: "functions-and-scope",
		description:
			"Understand function declarations vs. expressions, arrow functions, closures, and lexical scoping.",
		content: `# Functions and Scope

Functions are the building blocks of JavaScript programs.

## Function Styles

\`\`\`js
// Declaration — hoisted
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Arrow function — concise, lexical \`this\`
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Closures

A closure is a function that remembers variables from its outer scope even after that scope has finished executing.

\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
\`\`\``,
		sortOrder: 3,
		hasTask: true,
	},
	{
		id: "lesson-js-04",
		courseId: "course-javascript-fundamentals",
		title: "Objects and Arrays",
		slug: "objects-and-arrays",
		description:
			"Work with JavaScript's two primary data structures — including destructuring, spread, and array methods.",
		content: `# Objects and Arrays

## Objects

\`\`\`js
const user = { name: "Alice", age: 30 };

// Destructuring
const { name, age } = user;

// Spread — shallow clone / merge
const updated = { ...user, age: 31 };
\`\`\`

## Arrays

\`\`\`js
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);          // [2, 4, 6, 8, 10]
nums.filter(n => n % 2 === 0); // [2, 4]
nums.reduce((acc, n) => acc + n, 0); // 15
\`\`\`

## Destructuring Arrays

\`\`\`js
const [first, second, ...rest] = nums;
\`\`\``,
		sortOrder: 4,
		hasTask: true,
	},
	{
		id: "lesson-js-05",
		courseId: "course-javascript-fundamentals",
		title: "Async JavaScript",
		slug: "async-javascript",
		hasTask: true,
		description:
			"From callbacks to Promises to async/await — understand the event loop and write non-blocking code.",
		content: `# Async JavaScript

JavaScript is single-threaded but handles async work via the **event loop**.

## Promises

\`\`\`js
fetch("https://api.example.com/data")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

## async/await

\`\`\`js
async function loadData() {
  try {
    const res = await fetch("https://api.example.com/data");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
\`\`\`

## Parallel execution

\`\`\`js
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);
\`\`\``,
		sortOrder: 5,
	},

	// TypeScript Essentials — 5 lessons
	{
		id: "lesson-ts-01",
		courseId: "course-typescript-essentials",
		title: "Type Annotations Basics",
		slug: "type-annotations-basics",
		description:
			"Add type safety to variables, parameters, and return values. Understand primitive types, arrays, and tuples.",
		content: `# Type Annotations Basics

TypeScript lets you annotate variables and functions with types.

\`\`\`ts
const name: string = "Alice";
const age: number = 30;
const active: boolean = true;

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Arrays and Tuples

\`\`\`ts
const scores: number[] = [100, 95, 88];
const pair: [string, number] = ["Alice", 30];
\`\`\`

## Type Inference

TypeScript infers types when you initialize variables — you don't always need annotations.

\`\`\`ts
const x = 42;        // inferred as number
const items = [];    // inferred as never[] — always annotate empty arrays
\`\`\``,
		sortOrder: 1,
		hasTask: true,
	},
	{
		id: "lesson-ts-02",
		courseId: "course-typescript-essentials",
		title: "Interfaces and Type Aliases",
		slug: "interfaces-and-type-aliases",
		description:
			"Define object shapes with interfaces and type aliases, and understand when to use each.",
		content: `# Interfaces and Type Aliases

Both describe the shape of objects, but have different capabilities.

## Type Aliases

\`\`\`ts
type User = {
  id: string;
  name: string;
  email: string;
};
\`\`\`

## Interfaces

\`\`\`ts
interface Product {
  id: string;
  name: string;
  price: number;
}
\`\`\`

## Key Differences

- **Type aliases** can represent unions, intersections, and primitives.
- **Interfaces** support declaration merging (adding properties later).
- Prefer \`type\` for most cases; use \`interface\` for public API contracts.`,
		sortOrder: 2,
	},
	{
		id: "lesson-ts-03",
		courseId: "course-typescript-essentials",
		title: "Generics",
		slug: "generics",
		description:
			"Write reusable, type-safe code with generic functions, classes, and constraints.",
		content: `# Generics

Generics let you write functions that work with any type while preserving type safety.

\`\`\`ts
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello"); // string
identity<number>(42);      // number
\`\`\`

## Generic Constraints

\`\`\`ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello"); // 5
getLength([1, 2]);  // 2
\`\`\`

## Generic Interfaces

\`\`\`ts
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};
\`\`\``,
		sortOrder: 3,
	},
	{
		id: "lesson-ts-04",
		courseId: "course-typescript-essentials",
		title: "Utility Types",
		slug: "utility-types",
		description:
			"Master built-in utility types: Partial, Required, Pick, Omit, Record, and more.",
		content: `# Utility Types

TypeScript ships with powerful built-in type transformers.

\`\`\`ts
type User = { id: string; name: string; email: string; age: number };

// Make all fields optional
type PartialUser = Partial<User>;

// Pick specific fields
type UserPreview = Pick<User, "id" | "name">;

// Omit specific fields
type UserWithoutAge = Omit<User, "age">;

// Map keys to values
type RoleMap = Record<"admin" | "editor" | "viewer", boolean>;
\`\`\`

## ReturnType and Parameters

\`\`\`ts
function fetchUser(id: string): Promise<User> { /* ... */ }

type FetchReturn = ReturnType<typeof fetchUser>; // Promise<User>
type FetchParams = Parameters<typeof fetchUser>; // [string]
\`\`\``,
		sortOrder: 4,
	},
	{
		id: "lesson-ts-05",
		courseId: "course-typescript-essentials",
		title: "Strict Mode and Project Config",
		slug: "strict-mode-and-project-config",
		description:
			"Configure tsconfig.json for maximum safety and integrate TypeScript into real projects.",
		content: `# Strict Mode and Project Config

## tsconfig.json

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src"
  }
}
\`\`\`

## What strict enables

- \`strictNullChecks\` — null and undefined are not assignable to other types
- \`noImplicitAny\` — variables must have explicit types
- \`strictFunctionTypes\` — stricter function parameter checking

## Path Aliases

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
\`\`\``,
		sortOrder: 5,
	},

	// Go Fundamentals — 5 lessons
	{
		id: "lesson-go-01",
		courseId: "course-go-fundamentals",
		title: "Getting Started with Go",
		slug: "getting-started-with-go",
		description:
			"Install Go, write your first program, and understand the workspace and module system.",
		content: `# Getting Started with Go

## Hello, World

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

## Modules

Initialize a new module:

\`\`\`bash
go mod init github.com/yourname/myapp
\`\`\`

## Basic Types

\`\`\`go
var name string = "Alice"
age := 30           // short declaration, type inferred
const pi = 3.14159
\`\`\`

Go is statically typed with type inference via \`:=\`.`,
		sortOrder: 1,
		hasTask: true,
	},
	{
		id: "lesson-go-02",
		courseId: "course-go-fundamentals",
		title: "Structs and Methods",
		slug: "structs-and-methods",
		description:
			"Define custom types with structs and attach behavior with methods.",
		content: `# Structs and Methods

\`\`\`go
type User struct {
    ID    string
    Name  string
    Email string
}

// Method with pointer receiver
func (u *User) Greet() string {
    return "Hello, " + u.Name
}

func main() {
    u := &User{ID: "1", Name: "Alice", Email: "alice@example.com"}
    fmt.Println(u.Greet())
}
\`\`\`

## Struct Embedding

\`\`\`go
type Admin struct {
    User
    Role string
}
\`\`\`

Embedding composes structs — \`Admin\` inherits \`User\`'s fields and methods.`,
		sortOrder: 2,
	},
	{
		id: "lesson-go-03",
		courseId: "course-go-fundamentals",
		title: "Interfaces",
		slug: "interfaces",
		description:
			"Use interfaces for polymorphism and understand Go's implicit interface satisfaction.",
		content: `# Interfaces

Go interfaces are implicitly satisfied — no \`implements\` keyword.

\`\`\`go
type Stringer interface {
    String() string
}

type User struct{ Name string }
func (u User) String() string { return u.Name }

type Product struct{ Title string }
func (p Product) String() string { return p.Title }

func Print(s Stringer) {
    fmt.Println(s.String())
}
\`\`\`

## Empty Interface

\`\`\`go
func PrintAny(v interface{}) {
    fmt.Println(v)
}
\`\`\`

In modern Go (1.18+), use \`any\` as an alias for \`interface{}\`.`,
		sortOrder: 3,
	},
	{
		id: "lesson-go-04",
		courseId: "course-go-fundamentals",
		title: "Goroutines and Channels",
		slug: "goroutines-and-channels",
		description:
			"Write concurrent code with goroutines and communicate safely between them using channels.",
		content: `# Goroutines and Channels

## Goroutines

\`\`\`go
go func() {
    fmt.Println("running concurrently")
}()
\`\`\`

## Channels

\`\`\`go
ch := make(chan string)

go func() {
    ch <- "hello from goroutine"
}()

msg := <-ch
fmt.Println(msg)
\`\`\`

## Buffered Channels

\`\`\`go
ch := make(chan int, 3)
ch <- 1
ch <- 2
ch <- 3
// Does not block — buffer holds 3 items
\`\`\`

## Select

\`\`\`go
select {
case msg := <-ch1:
    fmt.Println("ch1:", msg)
case msg := <-ch2:
    fmt.Println("ch2:", msg)
}
\`\`\``,
		sortOrder: 4,
	},
	{
		id: "lesson-go-05",
		courseId: "course-go-fundamentals",
		title: "Error Handling",
		slug: "error-handling",
		description:
			"Handle errors idiomatically in Go — errors as values, custom errors, and the errors package.",
		content: `# Error Handling

Go treats errors as values returned from functions.

\`\`\`go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    log.Fatal(err)
}
\`\`\`

## Custom Errors

\`\`\`go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return e.Field + ": " + e.Message
}
\`\`\`

## errors.Is and errors.As

\`\`\`go
var ErrNotFound = errors.New("not found")

if errors.Is(err, ErrNotFound) {
    // handle specifically
}
\`\`\``,
		sortOrder: 5,
	},

	// Python Fundamentals — 5 lessons
	{
		id: "lesson-py-01",
		courseId: "course-python-fundamentals",
		title: "Python Syntax and Types",
		slug: "python-syntax-and-types",
		description:
			"Python's clean syntax, dynamic typing, and built-in data types: strings, numbers, booleans, and None.",
		content: `# Python Syntax and Types

\`\`\`python
name = "Alice"          # str
age = 30                # int
height = 1.75           # float
is_active = True        # bool
nothing = None          # None

# f-strings for formatting
print(f"Hello, {name}! You are {age} years old.")
\`\`\`

## Dynamic Typing

Python infers types at runtime — the same variable can hold different types.

\`\`\`python
x = 42
x = "now a string"   # valid in Python
\`\`\`

## Type Hints (Python 3.5+)

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"
\`\`\``,
		sortOrder: 1,
		hasTask: true,
	},
	{
		id: "lesson-py-02",
		courseId: "course-python-fundamentals",
		title: "Lists, Dicts, and Sets",
		slug: "lists-dicts-and-sets",
		description:
			"Python's essential data structures with slicing, comprehensions, and common operations.",
		content: `# Lists, Dicts, and Sets

## Lists

\`\`\`python
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits[1:3]          # ["banana", "cherry"]
[f.upper() for f in fruits]  # list comprehension
\`\`\`

## Dictionaries

\`\`\`python
user = {"name": "Alice", "age": 30}
user["email"] = "alice@example.com"
user.get("phone", "N/A")   # safe access with default

{k: v for k, v in user.items()}  # dict comprehension
\`\`\`

## Sets

\`\`\`python
tags = {"python", "coding", "python"}  # {"python", "coding"}
tags.add("open-source")
tags & {"python", "ruby"}   # intersection
\`\`\``,
		sortOrder: 2,
	},
	{
		id: "lesson-py-03",
		courseId: "course-python-fundamentals",
		title: "Functions and Decorators",
		slug: "functions-and-decorators",
		description:
			"First-class functions, *args/**kwargs, lambda expressions, and writing your first decorator.",
		content: `# Functions and Decorators

\`\`\`python
def add(a: int, b: int = 0) -> int:
    return a + b

# *args and **kwargs
def log(*args, **kwargs):
    print(args, kwargs)
\`\`\`

## Lambda

\`\`\`python
double = lambda x: x * 2
sorted(users, key=lambda u: u["age"])
\`\`\`

## Decorators

\`\`\`python
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        import time
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.3f}s")
        return result
    return wrapper

@timer
def slow_function():
    import time; time.sleep(0.1)
\`\`\``,
		sortOrder: 3,
	},
	{
		id: "lesson-py-04",
		courseId: "course-python-fundamentals",
		title: "Classes and OOP",
		slug: "classes-and-oop",
		description:
			"Object-oriented programming in Python — classes, inheritance, dunder methods, and dataclasses.",
		content: `# Classes and OOP

\`\`\`python
class Animal:
    def __init__(self, name: str) -> None:
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name} says Woof!"

dog = Dog("Rex")
print(dog.speak())
\`\`\`

## Dunder Methods

\`\`\`python
class Vector:
    def __init__(self, x, y): self.x, self.y = x, y
    def __repr__(self): return f"Vector({self.x}, {self.y})"
    def __add__(self, other): return Vector(self.x + other.x, self.y + other.y)
\`\`\`

## Dataclasses

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
\`\`\``,
		sortOrder: 4,
	},
	{
		id: "lesson-py-05",
		courseId: "course-python-fundamentals",
		title: "File I/O and Modules",
		slug: "file-io-and-modules",
		description:
			"Read and write files, use the standard library, create your own modules, and manage packages with pip.",
		content: `# File I/O and Modules

## Reading and Writing Files

\`\`\`python
# Read
with open("data.txt", "r") as f:
    content = f.read()

# Write
with open("output.txt", "w") as f:
    f.write("Hello, file!")
\`\`\`

## JSON

\`\`\`python
import json

data = {"name": "Alice", "scores": [100, 95]}
json_str = json.dumps(data)
parsed = json.loads(json_str)
\`\`\`

## Creating Modules

Any \`.py\` file is a module. Import with:

\`\`\`python
# utils.py
def add(a, b): return a + b

# main.py
from utils import add
\`\`\`

## pip

\`\`\`bash
pip install requests
pip freeze > requirements.txt
\`\`\``,
		sortOrder: 5,
	},

	// C Fundamentals — 5 lessons
	{
		id: "lesson-c-01",
		courseId: "course-c-fundamentals",
		title: "C Basics and Compilation",
		slug: "c-basics-and-compilation",
		description:
			"Write your first C program, understand the compilation pipeline, and explore primitive types.",
		content: `# C Basics and Compilation

\`\`\`c
#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

## Compilation

\`\`\`bash
gcc -Wall -o hello hello.c
./hello
\`\`\`

## Primitive Types

\`\`\`c
int age = 30;
float pi = 3.14f;
double precise = 3.14159265;
char grade = 'A';
\`\`\`

## printf format specifiers

\`\`\`c
printf("%d %f %c %s\\n", age, pi, grade, "Alice");
\`\`\``,
		sortOrder: 1,
		hasTask: true,
	},
	{
		id: "lesson-c-02",
		courseId: "course-c-fundamentals",
		title: "Arrays and Strings",
		slug: "arrays-and-strings",
		description:
			"Work with fixed-size arrays and null-terminated strings — the foundation of C data handling.",
		content: `# Arrays and Strings

## Arrays

\`\`\`c
int scores[5] = {100, 95, 88, 72, 60};
printf("%d\\n", scores[0]); // 100

// Iterate
for (int i = 0; i < 5; i++) {
    printf("%d ", scores[i]);
}
\`\`\`

## Strings

Strings in C are arrays of \`char\` terminated by \`'\\0'\`.

\`\`\`c
#include <string.h>

char name[20] = "Alice";
printf("Length: %zu\\n", strlen(name));  // 5

char greeting[50];
snprintf(greeting, sizeof(greeting), "Hello, %s!", name);
\`\`\``,
		sortOrder: 2,
	},
	{
		id: "lesson-c-03",
		courseId: "course-c-fundamentals",
		title: "Pointers",
		slug: "pointers",
		description:
			"Understand memory addresses, pointer arithmetic, and passing by reference in C.",
		content: `# Pointers

A pointer stores a memory address.

\`\`\`c
int x = 42;
int *p = &x;        // p holds the address of x

printf("%d\\n", *p); // dereference: prints 42
*p = 100;           // modifies x through the pointer
\`\`\`

## Passing by Reference

\`\`\`c
void double_it(int *n) {
    *n *= 2;
}

int value = 5;
double_it(&value);
printf("%d\\n", value); // 10
\`\`\`

## Arrays and Pointers

Array names decay to pointers to their first element.

\`\`\`c
int arr[] = {1, 2, 3};
int *p = arr;
printf("%d\\n", *(p + 1)); // 2
\`\`\``,
		sortOrder: 3,
	},
	{
		id: "lesson-c-04",
		courseId: "course-c-fundamentals",
		title: "Dynamic Memory",
		slug: "dynamic-memory",
		description:
			"Allocate and free heap memory with malloc, calloc, realloc, and free.",
		content: `# Dynamic Memory

\`\`\`c
#include <stdlib.h>

// Allocate
int *arr = malloc(10 * sizeof(int));
if (arr == NULL) {
    fprintf(stderr, "Out of memory\\n");
    exit(1);
}

// Use
for (int i = 0; i < 10; i++) arr[i] = i * i;

// Resize
arr = realloc(arr, 20 * sizeof(int));

// Free
free(arr);
arr = NULL;  // good habit — avoid dangling pointer
\`\`\`

## calloc

\`\`\`c
int *zeros = calloc(10, sizeof(int)); // allocates AND zero-initializes
\`\`\`

Always free every allocation. Tools like \`valgrind\` detect memory leaks.`,
		sortOrder: 4,
	},
	{
		id: "lesson-c-05",
		courseId: "course-c-fundamentals",
		title: "Structs and File I/O",
		slug: "structs-and-file-io",
		description:
			"Group related data with structs and read/write files with the stdio FILE API.",
		content: `# Structs and File I/O

## Structs

\`\`\`c
typedef struct {
    char name[50];
    int age;
    float score;
} Student;

Student s = {"Alice", 20, 95.5f};
printf("%s: %.1f\\n", s.name, s.score);
\`\`\`

## File I/O

\`\`\`c
FILE *fp = fopen("data.txt", "w");
if (fp == NULL) { perror("fopen"); exit(1); }

fprintf(fp, "%s %d %.1f\\n", s.name, s.age, s.score);
fclose(fp);

// Read back
fp = fopen("data.txt", "r");
char name[50]; int age; float score;
fscanf(fp, "%s %d %f", name, &age, &score);
fclose(fp);
\`\`\``,
		sortOrder: 5,
	},

	// C++ Fundamentals — 5 lessons
	{
		id: "lesson-cpp-01",
		courseId: "course-cpp-fundamentals",
		title: "C++ Basics and Classes",
		slug: "cpp-basics-and-classes",
		description:
			"Transition from C to C++ — namespaces, references, and writing your first class.",
		content: `# C++ Basics and Classes

\`\`\`cpp
#include <iostream>
#include <string>

class Animal {
public:
    std::string name;

    Animal(std::string n) : name(std::move(n)) {}

    virtual std::string speak() const {
        return name + " makes a sound";
    }
};
\`\`\`

## References

\`\`\`cpp
void increment(int& n) { ++n; }

int x = 5;
increment(x);
std::cout << x << "\\n"; // 6
\`\`\`

## Namespaces

\`\`\`cpp
namespace math {
    double square(double x) { return x * x; }
}

auto result = math::square(4.0); // 16.0
\`\`\``,
		sortOrder: 1,
		hasTask: true,
	},
	{
		id: "lesson-cpp-02",
		courseId: "course-cpp-fundamentals",
		title: "Inheritance and Polymorphism",
		slug: "inheritance-and-polymorphism",
		description:
			"Extend classes with inheritance, override virtual functions, and use polymorphism.",
		content: `# Inheritance and Polymorphism

\`\`\`cpp
class Dog : public Animal {
public:
    Dog(std::string n) : Animal(std::move(n)) {}

    std::string speak() const override {
        return name + " says Woof!";
    }
};

// Polymorphism via pointer/reference
Animal* a = new Dog("Rex");
std::cout << a->speak() << "\\n"; // Rex says Woof!
delete a;
\`\`\`

## Abstract Classes

\`\`\`cpp
class Shape {
public:
    virtual double area() const = 0; // pure virtual
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
};
\`\`\``,
		sortOrder: 2,
	},
	{
		id: "lesson-cpp-03",
		courseId: "course-cpp-fundamentals",
		title: "Templates",
		slug: "templates",
		description:
			"Write generic code with function templates and class templates — the basis of the STL.",
		content: `# Templates

\`\`\`cpp
template<typename T>
T max(T a, T b) {
    return a > b ? a : b;
}

max(3, 7);          // int
max(3.14, 2.71);    // double
max(std::string("b"), std::string("a")); // string
\`\`\`

## Class Templates

\`\`\`cpp
template<typename T>
class Stack {
    std::vector<T> data;
public:
    void push(T item) { data.push_back(std::move(item)); }
    T pop() { T item = data.back(); data.pop_back(); return item; }
    bool empty() const { return data.empty(); }
};

Stack<int> s;
s.push(1); s.push(2);
\`\`\``,
		sortOrder: 3,
	},
	{
		id: "lesson-cpp-04",
		courseId: "course-cpp-fundamentals",
		title: "RAII and Smart Pointers",
		slug: "raii-and-smart-pointers",
		description:
			"Manage resources safely with RAII, unique_ptr, shared_ptr, and avoid memory leaks.",
		content: `# RAII and Smart Pointers

RAII (Resource Acquisition Is Initialization) ties resource lifetime to object lifetime.

## unique_ptr

\`\`\`cpp
#include <memory>

auto dog = std::make_unique<Dog>("Rex");
dog->speak(); // no manual delete needed
// automatically freed when dog goes out of scope
\`\`\`

## shared_ptr

\`\`\`cpp
auto a = std::make_shared<Dog>("Max");
auto b = a;  // reference count = 2
// freed when both a and b go out of scope
\`\`\`

## weak_ptr

Breaks circular references:

\`\`\`cpp
std::weak_ptr<Dog> weak = a;
if (auto locked = weak.lock()) {
    locked->speak();
}
\`\`\``,
		sortOrder: 4,
	},
	{
		id: "lesson-cpp-05",
		courseId: "course-cpp-fundamentals",
		title: "The STL",
		slug: "the-stl",
		description:
			"Use the Standard Template Library — vector, map, algorithms, iterators, and ranges.",
		content: `# The Standard Template Library

## Containers

\`\`\`cpp
#include <vector>
#include <map>

std::vector<int> nums = {3, 1, 4, 1, 5};
nums.push_back(9);

std::map<std::string, int> scores;
scores["Alice"] = 100;
\`\`\`

## Algorithms

\`\`\`cpp
#include <algorithm>

std::sort(nums.begin(), nums.end());
auto it = std::find(nums.begin(), nums.end(), 4);
int total = std::accumulate(nums.begin(), nums.end(), 0);
\`\`\`

## C++20 Ranges

\`\`\`cpp
#include <ranges>

auto even = nums | std::views::filter([](int n){ return n % 2 == 0; });
auto doubled = even | std::views::transform([](int n){ return n * 2; });
\`\`\``,
		sortOrder: 5,
	},
	{
		id: "lesson-react-01",
		courseId: "course-react-fundamentals",
		title: "Your first component",
		slug: "your-first-component",
		description:
			"Edit a React component and see it update instantly in the preview.",
		content: `# Your first component

Open \`src/App.tsx\` and change the JSX. The preview updates automatically.

## Goal

Render a level-1 heading with the exact text **Hello React**.${FRAMEWORK_EXAMPLE_REACT_HELLO}${FRAMEWORK_TASK_TESTING_HINT}`,
		hasTask: true,
		sortOrder: 1,
	},
	{
		id: "lesson-react-02",
		courseId: "course-react-fundamentals",
		title: "State with useState",
		slug: "state-with-usestate",
		description: "Add local state and wire it to a button.",
		content: `# useState

Use \`useState\` so each button click increments a visible count starting at 0. Keep a **Click** button (tests find it by that name) and show the count as **Count: 0**, **Count: 1**, and so on.${FRAMEWORK_EXAMPLE_REACT_COUNTER}${FRAMEWORK_TASK_TESTING_HINT}`,
		hasTask: true,
		sortOrder: 2,
	},
	{
		id: "lesson-react-03",
		courseId: "course-react-fundamentals",
		title: "Lists from data",
		slug: "lists-from-data",
		description: "Render an array of items with keys.",
		content: `# Lists

Map over an array of strings and render each inside a \`<ul>\` with one \`<li>\` per item. Use the item string as \`key\`.${FRAMEWORK_EXAMPLE_REACT_LIST}${FRAMEWORK_TASK_TESTING_HINT}`,
		hasTask: true,
		sortOrder: 3,
	},
	{
		id: "lesson-vue-01",
		courseId: "course-vue-fundamentals",
		title: "Your first SFC",
		slug: "your-first-sfc",
		description: "Edit the template in App.vue and use the preview.",
		content: `# Single-file component

Update \`App.vue\` so the page shows a level-1 heading with the exact text **Hello Vue**.${FRAMEWORK_EXAMPLE_VUE_HELLO}${FRAMEWORK_TASK_TESTING_HINT}`,
		hasTask: true,
		sortOrder: 1,
	},
	{
		id: "lesson-vue-02",
		courseId: "course-vue-fundamentals",
		title: "Reactivity with ref",
		slug: "reactivity-with-ref",
		description: "Use ref to drive the UI.",
		content: `# ref

Use \`ref(0)\` for the count. Each button click increments it. Label the button **Click** and show **Count:** with the value (e.g. **Count: 1** after one click).${FRAMEWORK_EXAMPLE_VUE_COUNTER}${FRAMEWORK_TASK_TESTING_HINT}`,
		hasTask: true,
		sortOrder: 2,
	},
	{
		id: "lesson-vue-03",
		courseId: "course-vue-fundamentals",
		title: "Computed values",
		slug: "computed-values",
		description: "Derive display text with computed().",
		content: `# computed

Use \`computed\` to derive \`greeting\` from a \`ref\` \`name\` (starter uses \`"Ada"\`) so the page shows **Hello, Ada**.${FRAMEWORK_EXAMPLE_VUE_GREETING}${FRAMEWORK_TASK_TESTING_HINT}`,
		hasTask: true,
		sortOrder: 3,
	},
] as const;

const tasks = [
	// ── JavaScript: Variables and Data Types ─────────────────────────────────
	{
		id: "task-js-01",
		lessonId: "lesson-js-01",
		languageId: "javascript",
		description: `## Format a Price String

Write a function \`formatPrice(amount, currency)\` that formats a monetary amount as a string.

- The \`currency\` parameter should default to \`"USD"\`
- The amount must always be displayed with **exactly 2 decimal places**
- Output format: \`"CURRENCY AMOUNT"\` (e.g. \`"USD 19.99"\`)

### Examples

\`\`\`js
formatPrice(19.99)         // "USD 19.99"
formatPrice(9.5)           // "USD 9.50"
formatPrice(100, "EUR")    // "EUR 100.00"
formatPrice(0, "GBP")      // "GBP 0.00"
\`\`\`

### Requirements

1. Default currency is \`"USD"\` when omitted
2. Amount always has exactly 2 decimal places (use \`.toFixed(2)\`)
3. Output format is \`"{CURRENCY} {AMOUNT}"\`
4. Works with any positive number, zero, and large integers

---

> **Reference Solution** *(for testing only)*

\`\`\`js
function formatPrice(amount, currency = "USD") {
  return \`\${currency} \${Number(amount).toFixed(2)}\`;
}
\`\`\``,
		starterCode: `function formatPrice(amount, currency = "USD") {
  // Your code here
  // Return a formatted string like "USD 19.99" or "EUR 9.50"
  // Hint: use .toFixed(2) to fix the decimal places
}

// Example usage:
// formatPrice(19.99)        // "USD 19.99"
// formatPrice(9.5)          // "USD 9.50"
// formatPrice(100, "EUR")   // "EUR 100.00"
`,
		solutionCode: `function formatPrice(amount, currency = "USD") {
  return \`\${currency} \${Number(amount).toFixed(2)}\`;
}
`,
	},

	// ── TypeScript: Type Annotations Basics ──────────────────────────────────
	{
		id: "task-ts-01",
		lessonId: "lesson-ts-01",
		languageId: "typescript",
		description: `## Calculate a Letter Grade

Write a function \`calculateGrade(score: number): string\` that converts a numeric score (0–100) to a letter grade.

| Range | Grade |
|-------|-------|
| 90 +  | A     |
| 80–89 | B     |
| 70–79 | C     |
| 60–69 | D     |
| < 60  | F     |

### Examples

\`\`\`ts
calculateGrade(95)  // "A"
calculateGrade(82)  // "B"
calculateGrade(74)  // "C"
calculateGrade(61)  // "D"
calculateGrade(45)  // "F"
\`\`\`

### Requirements

1. Parameter \`score\` must be typed as \`number\`; return type must be \`string\`
2. Return exactly the single-letter string (\`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`, or \`"F"\`)
3. Boundary values (90, 80, 70, 60) belong to the **upper** grade

---

> **Reference Solution** *(for testing only)*

\`\`\`ts
function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
\`\`\``,
		starterCode: `function calculateGrade(score: number): string {
  // Your code here
  // Return "A" for 90+, "B" for 80-89, "C" for 70-79, "D" for 60-69, "F" for below 60
  return "";
}

// Example usage:
// calculateGrade(95)  // "A"
// calculateGrade(82)  // "B"
// calculateGrade(45)  // "F"
`,
		solutionCode: `function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
`,
	},

	// ── Go: Getting Started with Go ──────────────────────────────────────────
	{
		id: "task-go-01",
		lessonId: "lesson-go-01",
		languageId: "go",
		description: `## Celsius from Fahrenheit

Write a Go function \`CelsiusFromFahrenheit(f float64) float64\` that converts a Fahrenheit temperature to Celsius.

**Formula:** C = (F − 32) × 5 / 9

### Examples

\`\`\`go
CelsiusFromFahrenheit(212.0)  // 100.0  (boiling point)
CelsiusFromFahrenheit(32.0)   // 0.0    (freezing point)
CelsiusFromFahrenheit(-40.0)  // -40.0  (where scales meet)
CelsiusFromFahrenheit(68.0)   // 20.0   (room temperature)
\`\`\`

### Requirements

1. Accepts a \`float64\` and returns a \`float64\`
2. Implements the formula exactly: \`(f - 32) * 5 / 9\`
3. The starter file already imports \`"fmt"\` — do not remove it

---

> **Reference Solution** *(for testing only)*

\`\`\`go
func CelsiusFromFahrenheit(f float64) float64 {
    return (f - 32) * 5 / 9
}
\`\`\``,
		starterCode: `package main

// CelsiusFromFahrenheit converts a Fahrenheit temperature to Celsius.
// Formula: C = (F - 32) * 5 / 9
func CelsiusFromFahrenheit(f float64) float64 {
	// Your code here
	return 0
}
`,
		solutionCode: `package main

// CelsiusFromFahrenheit converts a Fahrenheit temperature to Celsius.
func CelsiusFromFahrenheit(f float64) float64 {
	return (f - 32) * 5 / 9
}
`,
	},

	// ── Python: Python Syntax and Types ──────────────────────────────────────
	{
		id: "task-py-01",
		lessonId: "lesson-py-01",
		languageId: "python",
		description: `## Is It a Palindrome?

Write a Python function \`is_palindrome(text: str) -> bool\` that returns \`True\` if the input string is a palindrome.

- **Ignore case** (treat uppercase and lowercase as equal)
- **Ignore spaces** (remove all spaces before checking)
- A palindrome reads the same forwards and backwards

### Examples

\`\`\`python
is_palindrome("racecar")                      # True
is_palindrome("hello")                        # False
is_palindrome("A man a plan a canal Panama")  # True
is_palindrome("Was it a car or a cat I saw")  # True
is_palindrome("Python")                       # False
\`\`\`

### Requirements

1. Parameter \`text\` is typed as \`str\`; return type is \`bool\`
2. Case is ignored (convert to lowercase)
3. Spaces are ignored (remove before comparing)
4. An empty string is considered a palindrome

---

> **Reference Solution** *(for testing only)*

\`\`\`python
def is_palindrome(text: str) -> bool:
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]
\`\`\``,
		starterCode: `def is_palindrome(text: str) -> bool:
    """Return True if text is a palindrome (ignoring case and spaces)."""
    # Your code here
    # Hint: clean the string (lowercase + remove spaces), then compare with its reverse
    pass

# Example usage:
# is_palindrome("racecar")   # True
# is_palindrome("hello")     # False
`,
		solutionCode: `def is_palindrome(text: str) -> bool:
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]
`,
	},

	// ── C: C Basics and Compilation ──────────────────────────────────────────
	{
		id: "task-c-01",
		lessonId: "lesson-c-01",
		languageId: "c",
		description: `## Sum the Digits of a Number

Write a C function \`int sum_digits(int n)\` that returns the sum of all decimal digits of a non-negative integer \`n\`.

For example, \`sum_digits(123)\` = 1 + 2 + 3 = **6**.

### Examples

\`\`\`c
sum_digits(0)    // 0
sum_digits(5)    // 5
sum_digits(123)  // 6
sum_digits(9999) // 36
\`\`\`

### Requirements

1. Works for \`n = 0\` (returns 0)
2. Works for single-digit numbers
3. Correctly sums all digits for multi-digit numbers
4. Uses a loop to extract digits with the modulo (\`%\`) and integer division (\`/\`) operators

---

> **Reference Solution** *(for testing only)*

\`\`\`c
int sum_digits(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}
\`\`\``,
		starterCode: `#include <stdio.h>

/* sum_digits returns the sum of all decimal digits of n.
 * Example: sum_digits(123) == 6  (1 + 2 + 3)
 */
int sum_digits(int n) {
    /* Your code here */
    return 0;
}

int main(void) {
    printf("%d\\n", sum_digits(0));
    printf("%d\\n", sum_digits(123));
    printf("%d\\n", sum_digits(9999));
    return 0;
}
`,
		solutionCode: `#include <stdio.h>

int sum_digits(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

int main(void) {
    printf("%d\\n", sum_digits(0));
    printf("%d\\n", sum_digits(123));
    printf("%d\\n", sum_digits(9999));
    return 0;
}
`,
	},

	// ── C++: C++ Basics and Classes ───────────────────────────────────────────
	{
		id: "task-cpp-01",
		lessonId: "lesson-cpp-01",
		languageId: "cpp",
		description: `## Count Vowels in a String

Write a C++ function \`int countVowels(const std::string& s)\` that returns the number of vowel characters (\`a e i o u\`, case-insensitive) in the input string.

### Examples

\`\`\`cpp
countVowels("Hello")        // 2  (e, o)
countVowels("Hello World")  // 3  (e, o, o)
countVowels("rhythm")       // 0
countVowels("")             // 0
countVowels("AEIOU")        // 5
\`\`\`

### Requirements

1. Counts both lowercase and uppercase vowels
2. Non-vowel characters (consonants, spaces, digits, etc.) are not counted
3. Returns 0 for an empty string
4. Use a range-based \`for\` loop to iterate over characters

---

> **Reference Solution** *(for testing only)*

\`\`\`cpp
#include <string>
#include <cctype>

int countVowels(const std::string& s) {
    int count = 0;
    for (char c : s) {
        char lc = std::tolower(static_cast<unsigned char>(c));
        if (lc == 'a' || lc == 'e' || lc == 'i' || lc == 'o' || lc == 'u') {
            ++count;
        }
    }
    return count;
}
\`\`\``,
		starterCode: `#include <string>
#include <cctype>
#include <iostream>

// countVowels returns the number of vowels (a, e, i, o, u, case-insensitive)
// in the given string.
int countVowels(const std::string& s) {
    // Your code here
    return 0;
}

int main() {
    std::cout << countVowels("Hello")  << "\\n";
    std::cout << countVowels("AEIOU")  << "\\n";
    std::cout << countVowels("rhythm") << "\\n";
    return 0;
}
`,
		solutionCode: `#include <string>
#include <cctype>
#include <iostream>

int countVowels(const std::string& s) {
    int count = 0;
    for (char c : s) {
        char lc = std::tolower(static_cast<unsigned char>(c));
        if (lc == 'a' || lc == 'e' || lc == 'i' || lc == 'o' || lc == 'u') {
            ++count;
        }
    }
    return count;
}

int main() {
    std::cout << countVowels("Hello")  << "\\n";
    std::cout << countVowels("AEIOU")  << "\\n";
    std::cout << countVowels("rhythm") << "\\n";
    return 0;
}
`,
	},

	// ── Existing JavaScript tasks ─────────────────────────────────────────────
	{
		id: "task-js-03",
		lessonId: "lesson-js-03",
		languageId: "javascript",
		description: `## Make a Counter Factory

Write a function \`makeCounter(start)\` that accepts an optional starting number (defaulting to \`0\`) and returns an object with two methods:

- \`increment()\` — increases the counter by 1 and returns the new value
- \`getCount()\` — returns the current value without changing it

This exercise practices closures: the returned object must capture and mutate the \`start\` variable from the outer scope.

### Examples

\`\`\`js
const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2

const counter2 = makeCounter(10);
counter2.increment(); // 11
counter2.getCount();  // 11
\`\`\`

### Requirements

1. \`makeCounter\` must accept an optional \`start\` parameter (default \`0\`)
2. Each call to \`increment()\` must increase the count by exactly 1
3. \`getCount()\` must return the current count without side effects
4. Multiple counters must be independent of each other

---

> **Reference Solution** *(for testing only)*

\`\`\`js
function makeCounter(start = 0) {
  let count = start;
  return {
    increment() {
      count += 1;
      return count;
    },
    getCount() {
      return count;
    },
  };
}
\`\`\``,
		starterCode: `function makeCounter(start = 0) {
  // Your code here
  // Return an object with increment() and getCount() methods
}

// Example usage:
// const counter = makeCounter();
// counter.increment(); // 1
// counter.increment(); // 2
// counter.getCount();  // 2
`,
		solutionCode: `function makeCounter(start = 0) {
  let count = start;
  return {
    increment() {
      count += 1;
      return count;
    },
    getCount() {
      return count;
    },
  };
}
`,
	},
	{
		id: "task-js-04",
		lessonId: "lesson-js-04",
		languageId: "javascript",
		description: `## Transform a User List

Write a function \`transformUsers(users)\` that accepts an array of user objects and returns a new array where each user has:

- Only \`id\` and \`name\` fields (all other fields removed)
- \`name\` converted to uppercase
- Users with \`active: false\` filtered out

### Examples

\`\`\`js
const users = [
  { id: 1, name: "alice", email: "alice@example.com", active: true },
  { id: 2, name: "bob", email: "bob@example.com", active: false },
  { id: 3, name: "carol", email: "carol@example.com", active: true },
];

transformUsers(users);
// [
//   { id: 1, name: "ALICE" },
//   { id: 3, name: "CAROL" },
// ]
\`\`\`

### Requirements

1. Filter out users where \`active\` is \`false\`
2. Return objects with only \`id\` and \`name\`
3. Convert \`name\` to uppercase
4. Preserve the original array order
5. Do not mutate the original array

---

> **Reference Solution** *(for testing only)*

\`\`\`js
function transformUsers(users) {
  return users
    .filter(user => user.active)
    .map(({ id, name }) => ({ id, name: name.toUpperCase() }));
}
\`\`\``,
		starterCode: `function transformUsers(users) {
  // Your code here
  // Filter inactive users, keep only id and name, uppercase the name
}

// Example usage:
// const users = [
//   { id: 1, name: "alice", active: true },
//   { id: 2, name: "bob", active: false },
// ];
// transformUsers(users); // [{ id: 1, name: "ALICE" }]
`,
		solutionCode: `function transformUsers(users) {
  return users
    .filter(user => user.active)
    .map(({ id, name }) => ({ id, name: name.toUpperCase() }));
}
`,
	},
	{
		id: "task-react-01",
		lessonId: "lesson-react-01",
		languageId: "react",
		description: `## Hello React

Set the level-1 heading text to exactly **Hello React**.${FRAMEWORK_EXAMPLE_REACT_HELLO}${FRAMEWORK_TASK_TESTING_HINT}`,
		starterCode: " ",
		solutionCode: " ",
		entryFile: "/src/App.tsx",
		readOnlyFiles: ["/src/main.tsx"],
		starterFiles: {
			"/src/App.tsx": `export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Edit this heading</h1>
    </main>
  );
}
`,
			"/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
`,
		},
	},
	{
		id: "task-react-02",
		lessonId: "lesson-react-02",
		languageId: "react",
		description: `## Click counter

Use \`useState\` so each button click increments a visible count starting at 0. Keep a **Click** button (tests find it by that name) and show the count in text like **Count: 0** so it becomes **Count: 1** after one click.${FRAMEWORK_EXAMPLE_REACT_COUNTER}${FRAMEWORK_TASK_TESTING_HINT}`,
		starterCode: " ",
		solutionCode: " ",
		entryFile: "/src/App.tsx",
		readOnlyFiles: ["/src/main.tsx"],
		starterFiles: {
			"/src/App.tsx": `import { useState } from "react";

export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <p>Count: 0</p>
      <button type="button">Click</button>
    </main>
  );
}
`,
			"/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
`,
		},
	},
	{
		id: "task-react-03",
		lessonId: "lesson-react-03",
		languageId: "react",
		description: `## Render a list

Render \`items\` as a \`<ul>\` with one \`<li>\` per item. Use the item string as \`key\`.${FRAMEWORK_EXAMPLE_REACT_LIST}${FRAMEWORK_TASK_TESTING_HINT}`,
		starterCode: " ",
		solutionCode: " ",
		entryFile: "/src/App.tsx",
		readOnlyFiles: ["/src/main.tsx"],
		starterFiles: {
			"/src/App.tsx": `const items = ["alpha", "beta", "gamma"];

export default function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <p>Render the list here</p>
    </main>
  );
}
`,
			"/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
`,
		},
	},
	{
		id: "task-vue-01",
		lessonId: "lesson-vue-01",
		languageId: "vue",
		description: `## Hello Vue

Set the level-1 heading text to exactly **Hello Vue**.${FRAMEWORK_EXAMPLE_VUE_HELLO}${FRAMEWORK_TASK_TESTING_HINT}`,
		starterCode: " ",
		solutionCode: " ",
		entryFile: "/src/App.vue",
		readOnlyFiles: ["/src/main.ts"],
		starterFiles: {
			"/src/App.vue": `<script setup lang="ts"></script>

<template>
  <main style="font-family: system-ui; padding: 24px">
    <h1>Edit this heading</h1>
  </main>
</template>
`,
			"/src/main.ts": `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`,
		},
	},
	{
		id: "task-vue-02",
		lessonId: "lesson-vue-02",
		languageId: "vue",
		description: `## Counter

Use \`ref(0)\` for the count. Each button click increments it. Show **Count:** followed by the value (tests expect **Count: 1** after one click).${FRAMEWORK_EXAMPLE_VUE_COUNTER}${FRAMEWORK_TASK_TESTING_HINT}`,
		starterCode: " ",
		solutionCode: " ",
		entryFile: "/src/App.vue",
		readOnlyFiles: ["/src/main.ts"],
		starterFiles: {
			"/src/App.vue": `<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>

<template>
  <main style="font-family: system-ui; padding: 24px">
    <p>Count: {{ count }}</p>
    <button type="button">Click</button>
  </main>
</template>
`,
			"/src/main.ts": `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`,
		},
	},
	{
		id: "task-vue-03",
		lessonId: "lesson-vue-03",
		languageId: "vue",
		description: `## Greeting

Use \`computed\` to derive \`greeting\` from a \`ref\` \`name\` (starter uses \`"Ada"\`) so the page shows **Hello, Ada**.${FRAMEWORK_EXAMPLE_VUE_GREETING}${FRAMEWORK_TASK_TESTING_HINT}`,
		starterCode: " ",
		solutionCode: " ",
		entryFile: "/src/App.vue",
		readOnlyFiles: ["/src/main.ts"],
		starterFiles: {
			"/src/App.vue": `<script setup lang="ts">
import { computed, ref } from "vue";
const name = ref("Ada");
const greeting = computed(() => "fix me");
</script>

<template>
  <main style="font-family: system-ui; padding: 24px">
    <p>{{ greeting }}</p>
  </main>
</template>
`,
			"/src/main.ts": `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`,
		},
	},
];

const taskTests = [
	// ── Tests for task-c-01 (sum_digits) ─────────────────────────────────────
	{
		id: "test-c-01-01",
		taskId: "task-c-01",
		title: "sum_digits(123) == 6",
		testCode: `#include <stdio.h>

int main(void) {
    int result = sum_digits(123);
    if (result != 6) {
        fprintf(stderr, "Expected 6 for 123, got %d\\n", result);
        return 1;
    }
    printf("{\\"passed\\": true}\\n");
    return 0;
}`,
		sortOrder: 1,
	},
	{
		id: "test-c-01-02",
		taskId: "task-c-01",
		title: "sum_digits(0) == 0",
		testCode: `#include <stdio.h>

int main(void) {
    int result = sum_digits(0);
    if (result != 0) {
        fprintf(stderr, "Expected 0 for 0, got %d\\n", result);
        return 1;
    }
    printf("{\\"passed\\": true}\\n");
    return 0;
}`,
		sortOrder: 2,
	},
	{
		id: "test-c-01-03",
		taskId: "task-c-01",
		title: "sum_digits(5) == 5 (single digit)",
		testCode: `#include <stdio.h>

int main(void) {
    int result = sum_digits(5);
    if (result != 5) {
        fprintf(stderr, "Expected 5 for 5, got %d\\n", result);
        return 1;
    }
    printf("{\\"passed\\": true}\\n");
    return 0;
}`,
		sortOrder: 3,
	},
	{
		id: "test-c-01-04",
		taskId: "task-c-01",
		title: "sum_digits(9999) == 36",
		testCode: `#include <stdio.h>

int main(void) {
    int result = sum_digits(9999);
    if (result != 36) {
        fprintf(stderr, "Expected 36 for 9999, got %d\\n", result);
        return 1;
    }
    printf("{\\"passed\\": true}\\n");
    return 0;
}`,
		sortOrder: 4,
	},

	// ── Tests for task-cpp-01 (countVowels) ──────────────────────────────────
	{
		id: "test-cpp-01-01",
		taskId: "task-cpp-01",
		title: 'countVowels("Hello") == 2',
		testCode: `#include <iostream>
#include <string>

int main() {
    int result = countVowels("Hello");
    if (result != 2) {
        std::cerr << "Expected 2 for \\"Hello\\", got " << result << std::endl;
        return 1;
    }
    std::cout << "{\\"passed\\": true}" << std::endl;
    return 0;
}`,
		sortOrder: 1,
	},
	{
		id: "test-cpp-01-02",
		taskId: "task-cpp-01",
		title: 'countVowels("") == 0 (empty string)',
		testCode: `#include <iostream>
#include <string>

int main() {
    int result = countVowels("");
    if (result != 0) {
        std::cerr << "Expected 0 for empty string, got " << result << std::endl;
        return 1;
    }
    std::cout << "{\\"passed\\": true}" << std::endl;
    return 0;
}`,
		sortOrder: 2,
	},
	{
		id: "test-cpp-01-03",
		taskId: "task-cpp-01",
		title: 'countVowels("AEIOU") == 5 (uppercase vowels)',
		testCode: `#include <iostream>
#include <string>

int main() {
    int result = countVowels("AEIOU");
    if (result != 5) {
        std::cerr << "Expected 5 for \\"AEIOU\\", got " << result << std::endl;
        return 1;
    }
    std::cout << "{\\"passed\\": true}" << std::endl;
    return 0;
}`,
		sortOrder: 3,
	},
	{
		id: "test-cpp-01-04",
		taskId: "task-cpp-01",
		title: 'countVowels("rhythm") == 0 (no vowels)',
		testCode: `#include <iostream>
#include <string>

int main() {
    int result = countVowels("rhythm");
    if (result != 0) {
        std::cerr << "Expected 0 for \\"rhythm\\", got " << result << std::endl;
        return 1;
    }
    std::cout << "{\\"passed\\": true}" << std::endl;
    return 0;
}`,
		sortOrder: 4,
	},

	// ── Tests for task-js-01 (formatPrice) ───────────────────────────────────
	{
		id: "test-js-01-01",
		taskId: "task-js-01",
		title: 'formatPrice(19.99) returns "USD 19.99"',
		testCode: `const result = formatPrice(19.99);
if (result !== "USD 19.99") throw new Error("Expected 'USD 19.99', got '" + result + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 1,
	},
	{
		id: "test-js-01-02",
		taskId: "task-js-01",
		title: 'formatPrice(9.5) pads to 2 decimal places → "USD 9.50"',
		testCode: `const result = formatPrice(9.5);
if (result !== "USD 9.50") throw new Error("Expected 'USD 9.50', got '" + result + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 2,
	},
	{
		id: "test-js-01-03",
		taskId: "task-js-01",
		title: 'formatPrice(100, "EUR") uses the provided currency',
		testCode: `const result = formatPrice(100, "EUR");
if (result !== "EUR 100.00") throw new Error("Expected 'EUR 100.00', got '" + result + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 3,
	},
	{
		id: "test-js-01-04",
		taskId: "task-js-01",
		title: 'formatPrice(0) returns "USD 0.00"',
		testCode: `const result = formatPrice(0);
if (result !== "USD 0.00") throw new Error("Expected 'USD 0.00', got '" + result + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 4,
	},

	// ── Tests for task-ts-01 (calculateGrade) ────────────────────────────────
	{
		id: "test-ts-01-01",
		taskId: "task-ts-01",
		title: 'calculateGrade(95) returns "A"',
		testCode: `const result = calculateGrade(95);
if (result !== "A") throw new Error("Expected 'A' for 95, got '" + result + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 1,
	},
	{
		id: "test-ts-01-02",
		taskId: "task-ts-01",
		title: 'calculateGrade(82) returns "B"',
		testCode: `const result = calculateGrade(82);
if (result !== "B") throw new Error("Expected 'B' for 82, got '" + result + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 2,
	},
	{
		id: "test-ts-01-03",
		taskId: "task-ts-01",
		title: 'calculateGrade(74) returns "C" and calculateGrade(61) returns "D"',
		testCode: `const r1 = calculateGrade(74);
if (r1 !== "C") throw new Error("Expected 'C' for 74, got '" + r1 + "'");
const r2 = calculateGrade(61);
if (r2 !== "D") throw new Error("Expected 'D' for 61, got '" + r2 + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 3,
	},
	{
		id: "test-ts-01-04",
		taskId: "task-ts-01",
		title: 'calculateGrade(45) returns "F" and boundary 90 returns "A"',
		testCode: `const r1 = calculateGrade(45);
if (r1 !== "F") throw new Error("Expected 'F' for 45, got '" + r1 + "'");
const r2 = calculateGrade(90);
if (r2 !== "A") throw new Error("Expected 'A' for boundary 90, got '" + r2 + "'");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 4,
	},

	// ── Tests for task-go-01 (CelsiusFromFahrenheit) ─────────────────────────
	{
		id: "test-go-01-01",
		taskId: "task-go-01",
		title: "212°F → 100°C (boiling point)",
		testCode: `func main() {
	result := CelsiusFromFahrenheit(212.0)
	if result != 100.0 {
		panic(fmt.Sprintf("212°F: expected 100.0°C, got %v", result))
	}
	fmt.Println(\`{"passed": true}\`)
}`,
		sortOrder: 1,
	},
	{
		id: "test-go-01-02",
		taskId: "task-go-01",
		title: "32°F → 0°C (freezing point)",
		testCode: `func main() {
	result := CelsiusFromFahrenheit(32.0)
	if result != 0.0 {
		panic(fmt.Sprintf("32°F: expected 0.0°C, got %v", result))
	}
	fmt.Println(\`{"passed": true}\`)
}`,
		sortOrder: 2,
	},
	{
		id: "test-go-01-03",
		taskId: "task-go-01",
		title: "-40°F → -40°C (scales intersect)",
		testCode: `func main() {
	result := CelsiusFromFahrenheit(-40.0)
	if result != -40.0 {
		panic(fmt.Sprintf("-40°F: expected -40.0°C, got %v", result))
	}
	fmt.Println(\`{"passed": true}\`)
}`,
		sortOrder: 3,
	},
	{
		id: "test-go-01-04",
		taskId: "task-go-01",
		title: "68°F → 20°C (room temperature)",
		testCode: `func main() {
	result := CelsiusFromFahrenheit(68.0)
	if result != 20.0 {
		panic(fmt.Sprintf("68°F: expected 20.0°C, got %v", result))
	}
	fmt.Println(\`{"passed": true}\`)
}`,
		sortOrder: 4,
	},

	// ── Tests for task-py-01 (is_palindrome) ─────────────────────────────────
	{
		id: "test-py-01-01",
		taskId: "task-py-01",
		title: '"racecar" is a palindrome',
		testCode: `import json
result = is_palindrome("racecar")
if result is not True:
    raise AssertionError(f"Expected True for 'racecar', got {result}")
print(json.dumps({"passed": True}))`,
		sortOrder: 1,
	},
	{
		id: "test-py-01-02",
		taskId: "task-py-01",
		title: '"hello" is not a palindrome',
		testCode: `import json
result = is_palindrome("hello")
if result is not False:
    raise AssertionError(f"Expected False for 'hello', got {result}")
print(json.dumps({"passed": True}))`,
		sortOrder: 2,
	},
	{
		id: "test-py-01-03",
		taskId: "task-py-01",
		title: 'ignores case and spaces: "A man a plan a canal Panama"',
		testCode: `import json
result = is_palindrome("A man a plan a canal Panama")
if result is not True:
    raise AssertionError(f"Expected True for classic phrase, got {result}")
print(json.dumps({"passed": True}))`,
		sortOrder: 3,
	},
	{
		id: "test-py-01-04",
		taskId: "task-py-01",
		title: "empty string is a palindrome",
		testCode: `import json
result = is_palindrome("")
if result is not True:
    raise AssertionError(f"Expected True for empty string, got {result}")
print(json.dumps({"passed": True}))`,
		sortOrder: 4,
	},

	// Tests for task-js-03 (makeCounter)
	{
		id: "test-js-03-01",
		taskId: "task-js-03",
		title: "increment() returns 1 on first call from default start",
		testCode: `const c = makeCounter();
const result = c.increment();
if (result !== 1) throw new Error("Expected 1, got " + result);
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 1,
	},
	{
		id: "test-js-03-02",
		taskId: "task-js-03",
		title: "getCount() returns current value without incrementing",
		testCode: `const c = makeCounter();
c.increment();
c.increment();
const count = c.getCount();
if (count !== 2) throw new Error("Expected 2, got " + count);
const countAgain = c.getCount();
if (countAgain !== 2) throw new Error("getCount should not change the value, expected 2, got " + countAgain);
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 2,
	},
	{
		id: "test-js-03-03",
		taskId: "task-js-03",
		title: "makeCounter(start) respects the start parameter",
		testCode: `const c = makeCounter(10);
const result = c.increment();
if (result !== 11) throw new Error("Expected 11, got " + result);
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 3,
	},
	{
		id: "test-js-03-04",
		taskId: "task-js-03",
		title: "Multiple counters are independent",
		testCode: `const c1 = makeCounter();
const c2 = makeCounter(100);
c1.increment();
c1.increment();
c2.increment();
if (c1.getCount() !== 2) throw new Error("c1 should be 2, got " + c1.getCount());
if (c2.getCount() !== 101) throw new Error("c2 should be 101, got " + c2.getCount());
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 4,
	},
	// Tests for task-js-04 (transformUsers)
	{
		id: "test-js-04-01",
		taskId: "task-js-04",
		title: "filters out inactive users",
		testCode: `const users = [
  { id: 1, name: "alice", email: "a@b.com", active: true },
  { id: 2, name: "bob", email: "b@b.com", active: false },
];
const result = transformUsers(users);
if (result.length !== 1) throw new Error("Expected 1 user, got " + result.length);
if (result[0].id !== 1) throw new Error("Expected user with id 1");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 1,
	},
	{
		id: "test-js-04-02",
		taskId: "task-js-04",
		title: "converts name to uppercase",
		testCode: `const users = [{ id: 1, name: "alice", active: true }];
const result = transformUsers(users);
if (result[0].name !== "ALICE") throw new Error("Expected ALICE, got " + result[0].name);
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 2,
	},
	{
		id: "test-js-04-03",
		taskId: "task-js-04",
		title: "returns only id and name fields",
		testCode: `const users = [{ id: 1, name: "alice", email: "a@b.com", role: "admin", active: true }];
const result = transformUsers(users);
const keys = Object.keys(result[0]).sort();
if (JSON.stringify(keys) !== JSON.stringify(["id", "name"])) {
  throw new Error("Expected only id and name, got: " + keys.join(", "));
}
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 3,
	},
	{
		id: "test-js-04-04",
		taskId: "task-js-04",
		title: "does not mutate the original array",
		testCode: `const users = [{ id: 1, name: "alice", active: true }];
const original = JSON.stringify(users);
transformUsers(users);
if (JSON.stringify(users) !== original) throw new Error("Original array was mutated");
console.log(JSON.stringify({ passed: true }));`,
		sortOrder: 4,
	},

	{
		id: "test-react-01-01",
		taskId: "task-react-01",
		title: "heading text is Hello React",
		testCode: `import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello React");
  });
});
`,
		sortOrder: 1,
	},
	{
		id: "test-react-02-01",
		taskId: "task-react-02",
		title: "click increments count",
		testCode: `import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("counter", () => {
    render(<App />);
    const btn = screen.getByRole("button", { name: /click/i });
    fireEvent.click(btn);
    expect(screen.getByText(/count:\\s*1/i)).toBeTruthy();
  });
});
`,
		sortOrder: 1,
	},
	{
		id: "test-react-03-01",
		taskId: "task-react-03",
		title: "renders three list items",
		testCode: `import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("list", () => {
    render(<App />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
`,
		sortOrder: 1,
	},
	{
		id: "test-vue-01-01",
		taskId: "task-vue-01",
		title: "heading text is Hello Vue",
		testCode: `import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
  it("heading", () => {
    const w = mount(App);
    expect(w.get("h1").text()).toBe("Hello Vue");
  });
});
`,
		sortOrder: 1,
	},
	{
		id: "test-vue-02-01",
		taskId: "task-vue-02",
		title: "click increments count",
		testCode: `import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
  it("counter", async () => {
    const w = mount(App);
    await w.get("button").trigger("click");
    expect(w.text()).toMatch(/count:\\s*1/i);
  });
});
`,
		sortOrder: 1,
	},
	{
		id: "test-vue-03-01",
		taskId: "task-vue-03",
		title: "greeting uses name",
		testCode: `import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
  it("greeting", () => {
    const w = mount(App);
    expect(w.text()).toContain("Hello, Ada");
  });
});
`,
		sortOrder: 1,
	},
];

const gradingCriteriaData = [
	// ── Criteria for task-c-01 (sum_digits) ─────────────────────────────────
	{
		id: "criteria-c-01-01",
		taskId: "task-c-01",
		name: "Correctness",
		description:
			"The function returns the correct digit sum for all inputs, including zero and single-digit numbers.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-c-01-02",
		taskId: "task-c-01",
		name: "Algorithm",
		description:
			"Uses modulo (%) and integer division (/) to extract digits iteratively, rather than converting to a string.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-c-01-03",
		taskId: "task-c-01",
		name: "Code Readability",
		description:
			"Variable names are meaningful, the loop is clear, and no unnecessary temporary allocations are made.",
		maxScore: 3,
		sortOrder: 3,
	},

	// ── Criteria for task-cpp-01 (countVowels) ───────────────────────────────
	{
		id: "criteria-cpp-01-01",
		taskId: "task-cpp-01",
		name: "Correctness",
		description:
			"Counts vowels correctly for all cases: lowercase, uppercase, mixed, no vowels, and empty string.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-cpp-01-02",
		taskId: "task-cpp-01",
		name: "C++ Idioms",
		description:
			"Uses a range-based for loop, std::tolower for case normalization, and a const reference parameter.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-cpp-01-03",
		taskId: "task-cpp-01",
		name: "Code Readability",
		description:
			"Code is concise and clearly expresses intent; the vowel check is easy to follow.",
		maxScore: 3,
		sortOrder: 3,
	},

	// ── Criteria for task-js-01 (formatPrice) ────────────────────────────────
	{
		id: "criteria-js-01-01",
		taskId: "task-js-01",
		name: "Correctness",
		description:
			"The function returns the correctly formatted price string for all inputs, including the default currency and edge cases like zero.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-js-01-02",
		taskId: "task-js-01",
		name: "Default Parameter Usage",
		description:
			"The solution uses a default parameter for currency rather than an if/else check inside the function body.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-js-01-03",
		taskId: "task-js-01",
		name: "Code Readability",
		description:
			"Code is concise and idiomatic, preferably using a template literal to compose the output string.",
		maxScore: 3,
		sortOrder: 3,
	},

	// ── Criteria for task-ts-01 (calculateGrade) ─────────────────────────────
	{
		id: "criteria-ts-01-01",
		taskId: "task-ts-01",
		name: "Correctness",
		description:
			"All grade boundaries are handled correctly, including exact boundary values (90 → A, 80 → B, etc.).",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-ts-01-02",
		taskId: "task-ts-01",
		name: "Type Annotations",
		description:
			"The function signature uses explicit TypeScript types for both the parameter (number) and return value (string).",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-ts-01-03",
		taskId: "task-ts-01",
		name: "Code Readability",
		description:
			"Logic uses a clean chain of early returns (guard clauses) rather than deeply nested if/else blocks.",
		maxScore: 3,
		sortOrder: 3,
	},

	// ── Criteria for task-go-01 (CelsiusFromFahrenheit) ──────────────────────
	{
		id: "criteria-go-01-01",
		taskId: "task-go-01",
		name: "Correctness",
		description:
			"The formula (F − 32) × 5 / 9 is implemented correctly and produces exact results for all test inputs.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-go-01-02",
		taskId: "task-go-01",
		name: "Go Idioms",
		description:
			"Code follows Go conventions: proper function signature with typed parameters and return value, no unnecessary variables.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-go-01-03",
		taskId: "task-go-01",
		name: "Code Readability",
		description:
			"The implementation is a single, clear expression. Variable names (if any) are descriptive.",
		maxScore: 3,
		sortOrder: 3,
	},

	// ── Criteria for task-py-01 (is_palindrome) ──────────────────────────────
	{
		id: "criteria-py-01-01",
		taskId: "task-py-01",
		name: "Correctness",
		description:
			"The function correctly handles normal palindromes, non-palindromes, mixed-case strings, and strings with spaces.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-py-01-02",
		taskId: "task-py-01",
		name: "Pythonic Style",
		description:
			"Solution uses Python idioms: string methods (lower, replace) and slice notation for reversal ([::-1]) rather than manual loops.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-py-01-03",
		taskId: "task-py-01",
		name: "Code Readability",
		description:
			"Code is concise, avoids unnecessary intermediate variables, and clearly expresses intent.",
		maxScore: 3,
		sortOrder: 3,
	},

	// Criteria for task-js-03 (makeCounter)
	{
		id: "criteria-js-03-01",
		taskId: "task-js-03",
		name: "Correctness",
		description:
			"The function correctly implements the counter behavior: increment returns incrementing values and getCount returns the current value without side effects.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-js-03-02",
		taskId: "task-js-03",
		name: "Closure Usage",
		description:
			"The solution uses closures properly — the inner state is encapsulated and not exposed globally.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-js-03-03",
		taskId: "task-js-03",
		name: "Code Readability",
		description:
			"Code is clean, uses descriptive variable names, and follows modern JavaScript conventions.",
		maxScore: 3,
		sortOrder: 3,
	},
	// Criteria for task-js-04 (transformUsers)
	{
		id: "criteria-js-04-01",
		taskId: "task-js-04",
		name: "Correctness",
		description:
			"The function correctly filters, maps, and transforms the user array per the requirements.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-js-04-02",
		taskId: "task-js-04",
		name: "Functional Style",
		description:
			"Solution uses array methods (filter, map) in a functional, non-mutating style rather than imperative loops.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-js-04-03",
		taskId: "task-js-04",
		name: "Code Readability",
		description:
			"Code is concise, uses destructuring where appropriate, and is easy to understand.",
		maxScore: 3,
		sortOrder: 3,
	},

	{
		id: "criteria-react-01-01",
		taskId: "task-react-01",
		name: "Correctness",
		description: "The heading displays the required text exactly.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-react-01-02",
		taskId: "task-react-01",
		name: "JSX structure",
		description: "Uses semantic markup (main, h1) appropriately.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-react-01-03",
		taskId: "task-react-01",
		name: "Style",
		description: "Code is readable and idiomatic React.",
		maxScore: 3,
		sortOrder: 3,
	},
	{
		id: "criteria-react-02-01",
		taskId: "task-react-02",
		name: "Correctness",
		description: "useState drives the counter; clicks increment correctly.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-react-02-02",
		taskId: "task-react-02",
		name: "Hooks",
		description: "Uses useState appropriately without unnecessary state.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-react-02-03",
		taskId: "task-react-02",
		name: "UX",
		description: "Button is accessible and label is clear.",
		maxScore: 3,
		sortOrder: 3,
	},
	{
		id: "criteria-react-03-01",
		taskId: "task-react-03",
		name: "Correctness",
		description: "All items render as list items with stable keys.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-react-03-02",
		taskId: "task-react-03",
		name: "Lists in React",
		description: "Uses map over the array and supplies keys.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-react-03-03",
		taskId: "task-react-03",
		name: "Readability",
		description: "JSX is clear and concise.",
		maxScore: 3,
		sortOrder: 3,
	},
	{
		id: "criteria-vue-01-01",
		taskId: "task-vue-01",
		name: "Correctness",
		description: "The heading displays the required text exactly.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-vue-01-02",
		taskId: "task-vue-01",
		name: "SFC structure",
		description: "Template and script blocks are used appropriately.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-vue-01-03",
		taskId: "task-vue-01",
		name: "Style",
		description: "Code is readable and idiomatic Vue.",
		maxScore: 3,
		sortOrder: 3,
	},
	{
		id: "criteria-vue-02-01",
		taskId: "task-vue-02",
		name: "Correctness",
		description: "ref updates on click and the template reflects it.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-vue-02-02",
		taskId: "task-vue-02",
		name: "Reactivity",
		description: "Uses ref from vue correctly.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-vue-02-03",
		taskId: "task-vue-02",
		name: "Template",
		description: "Bindings and event handlers are clear.",
		maxScore: 3,
		sortOrder: 3,
	},
	{
		id: "criteria-vue-03-01",
		taskId: "task-vue-03",
		name: "Correctness",
		description: "Computed greeting includes the current name value.",
		maxScore: 4,
		sortOrder: 1,
	},
	{
		id: "criteria-vue-03-02",
		taskId: "task-vue-03",
		name: "Composition API",
		description: "Uses computed() appropriately.",
		maxScore: 3,
		sortOrder: 2,
	},
	{
		id: "criteria-vue-03-03",
		taskId: "task-vue-03",
		name: "Readability",
		description: "Script setup code is clear.",
		maxScore: 3,
		sortOrder: 3,
	},
];

const cleanupSeedTables = async () => {
	const languageIds = languages.map((row) => row.id);
	const courseIds = courses.map((row) => row.id);
	const lessonIds = lessons.map((row) => row.id);
	const taskIds = tasks.map((row) => row.id);
	const taskTestIds = taskTests.map((row) => row.id);
	const gradingCriteriaIds = gradingCriteriaData.map((row) => row.id);

	console.log("Cleaning up rows removed from seed...");

	await db
		.delete(gradingCriteria)
		.where(notInArray(gradingCriteria.id, gradingCriteriaIds));
	await db.delete(taskTest).where(notInArray(taskTest.id, taskTestIds));
	await db.delete(task).where(notInArray(task.id, taskIds));
	await db.delete(lesson).where(notInArray(lesson.id, lessonIds));
	await db.delete(course).where(notInArray(course.id, courseIds));
	await db.delete(language).where(notInArray(language.id, languageIds));

	console.log("  Cleanup done.");
};

async function seed() {
	await cleanupSeedTables();

	console.log("Seeding languages...");
	await db
		.insert(language)
		.values(languages)
		.onConflictDoUpdate({
			target: language.id,
			set: {
				name: language.name,
				icon: language.icon,
				dockerImage: language.dockerImage,
				fileExtension: language.fileExtension,
				monacoLanguage: language.monacoLanguage,
			},
		});
	console.log(`  Inserted/updated ${languages.length} languages`);

	console.log("Seeding courses...");
	await db
		.insert(course)
		.values(courses)
		.onConflictDoUpdate({
			target: course.id,
			set: {
				title: course.title,
				slug: course.slug,
				shortDescription: course.shortDescription,
				description: course.description,
				difficulty: course.difficulty,
				estimatedHours: course.estimatedHours,
				sortOrder: course.sortOrder,
				isPublished: course.isPublished,
			},
		});
	console.log(`  Inserted/updated ${courses.length} courses`);

	console.log("Seeding lessons...");
	await db
		.insert(lesson)
		.values(lessons)
		.onConflictDoUpdate({
			target: lesson.id,
			set: {
				title: lesson.title,
				slug: lesson.slug,
				description: lesson.description,
				content: lesson.content,
				hasTask: lesson.hasTask,
				sortOrder: lesson.sortOrder,
			},
		});
	console.log(`  Inserted/updated ${lessons.length} lessons`);

	console.log("Seeding tasks...");
	await db
		.insert(task)
		.values(tasks)
		.onConflictDoUpdate({
			target: task.id,
			set: {
				description: task.description,
				starterCode: task.starterCode,
				solutionCode: task.solutionCode,
				starterFiles: task.starterFiles,
				entryFile: task.entryFile,
				readOnlyFiles: task.readOnlyFiles,
			},
		});
	console.log(`  Inserted/updated ${tasks.length} tasks`);

	console.log("Seeding task tests...");
	await db
		.insert(taskTest)
		.values(taskTests)
		.onConflictDoUpdate({
			target: taskTest.id,
			set: {
				title: taskTest.title,
				testCode: taskTest.testCode,
				sortOrder: taskTest.sortOrder,
			},
		});
	console.log(`  Inserted/updated ${taskTests.length} task tests`);

	console.log("Seeding grading criteria...");
	await db
		.insert(gradingCriteria)
		.values(gradingCriteriaData)
		.onConflictDoUpdate({
			target: gradingCriteria.id,
			set: {
				name: gradingCriteria.name,
				description: gradingCriteria.description,
				maxScore: gradingCriteria.maxScore,
				sortOrder: gradingCriteria.sortOrder,
			},
		});
	console.log(
		`  Inserted/updated ${gradingCriteriaData.length} grading criteria`
	);

	console.log("Done.");
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
