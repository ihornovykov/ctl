import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import {
	course,
	gradingCriteria,
	language,
	lesson,
	task,
	taskTest,
} from "./schema";

const db = drizzle(process.env.DATABASE_URL!, { logger: false });

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
];

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
] as const;

const tasks = [
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
4. Multiple counters must be independent of each other`,
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
5. Do not mutate the original array`,
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
];

const taskTests = [
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
];

const gradingCriteriaData = [
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
];

async function seed() {
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
