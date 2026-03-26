import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import { course, language } from "./schema";

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

	console.log("Done.");
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
