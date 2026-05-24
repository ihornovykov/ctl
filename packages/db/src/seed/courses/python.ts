import { assertCourseBundle } from "../assert-seed";
import {
	defaultCriteria,
	lessonMarkdown,
	pyTest,
	taskSpec,
} from "../shared/task-templates";
import type {
	CourseSeedBundle,
	GradingCriteriaRow,
	LessonRow,
	TaskRow,
	TaskTestRow,
} from "../types";

const COURSE_ID = "course-py-v2";
const LANG = "python";

const course = {
	id: COURSE_ID,
	languageId: LANG,
	title: "Python Fundamentals",
	slug: "python-fundamentals-v2",
	shortDescription:
		"Learn Python from the ground up — types, data structures, OOP, and idiomatic patterns through hands-on exercises.",
	description: `Python's readable syntax makes it one of the best languages for learning programming — and a powerhouse for scripting, data work, and backend development. This course walks you from first functions through classes, dataclasses, generators, and decorators, with a capstone that ties everything together.

**Prerequisites:** None — suitable for complete beginners.

**What you'll learn:**
- Python types, conditionals, loops, and functions
- Lists, dicts, sets, and comprehensions
- Error handling and text parsing
- Classes, dataclasses, generators, and decorators
- Writing clean, Pythonic code`,
	difficulty: "beginner",
	estimatedHours: 28,
	sortOrder: 4,
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
		id: "lesson-py-v2-01",
		sortOrder: 1,
		title: "Types and Input",
		slug: "types-and-input",
		description:
			"Work with strings, booleans, and normalization before comparing values.",
		markdown: lessonMarkdown({
			title: "Types and Input",
			objective: "Normalize text and compare it reliably.",
			body: `Python strings are sequences of Unicode characters. Before comparing text, you often need to **normalize** it — strip punctuation, ignore case, or remove whitespace.

\`\`\`python
text = "Racecar!"
cleaned = "".join(c.lower() for c in text if c.isalnum())
print(cleaned == cleaned[::-1])  # True
\`\`\`

The slice \`[::-1]\` reverses a sequence — a compact Python idiom for palindrome checks.`,
			pitfalls: [
				"Comparing raw strings fails when casing or punctuation differs.",
				"Empty strings are palindromes — handle that case explicitly.",
			],
			next: "Use boolean logic to classify calendar years.",
		}),
		task: {
			title: "Palindrome Checker",
			prompt:
				"Implement `is_palindrome(text: str) -> bool`. Return `True` when the alphanumeric characters of `text` read the same forwards and backwards, ignoring case and non-alphanumeric characters.",
			examples:
				'- `is_palindrome("Racecar")` → `True`\n- `is_palindrome("hello")` → `False`\n- `is_palindrome("A man, a plan!")` → `True`',
			requirements: [
				"Ignore case and non-alphanumeric characters.",
				"Treat an empty string as a palindrome.",
			],
			starter: `def is_palindrome(text: str) -> bool:
    pass`,
			solution: `def is_palindrome(text: str) -> bool:
    cleaned = "".join(c.lower() for c in text if c.isalnum())
    return cleaned == cleaned[::-1]`,
			idiomHint:
				"Prefer comprehensions and slicing over manual index loops for string normalization.",
			tests: [
				{
					title: "recognizes simple palindrome",
					body: `assert is_palindrome("racecar") is True`,
				},
				{
					title: "rejects non-palindrome",
					body: `assert is_palindrome("python") is False`,
				},
				{
					title: "ignores punctuation and case",
					body: `assert is_palindrome("A man, a plan, a canal: Panama") is True`,
				},
				{
					title: "empty string is palindrome",
					body: `assert is_palindrome("") is True`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-02",
		sortOrder: 2,
		title: "Conditionals and Booleans",
		slug: "conditionals-and-booleans",
		description:
			"Combine `if`, `elif`, and boolean expressions for classification.",
		markdown: lessonMarkdown({
			title: "Conditionals and Booleans",
			objective: "Express branching rules with readable boolean logic.",
			body: `Conditional statements let programs make decisions. Python uses truthy/falsy values — \`0\`, empty containers, and \`None\` are falsy.

\`\`\`python
def is_leap_year(year: int) -> bool:
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
\`\`\`

Parentheses clarify precedence when mixing \`and\` / \`or\`.`,
			pitfalls: [
				"Leap year rules have two exceptions — century years and multiples of 400.",
				"Do not use `year % 4 == 0` alone.",
			],
			next: "Use loops to test numeric properties like primality.",
		}),
		task: {
			title: "Leap Year",
			prompt:
				"Implement `is_leap_year(year: int) -> bool` using the standard Gregorian calendar rules.",
			examples:
				"- `is_leap_year(2000)` → `True`\n- `is_leap_year(1900)` → `False`\n- `is_leap_year(2024)` → `True`",
			starter: `def is_leap_year(year: int) -> bool:
    pass`,
			solution: `def is_leap_year(year: int) -> bool:
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)`,
			idiomHint:
				"Keep boolean expressions flat and readable; avoid nested if chains.",
			tests: [
				{ title: "multiple of 400", body: "assert is_leap_year(2000) is True" },
				{
					title: "century non-leap",
					body: "assert is_leap_year(1900) is False",
				},
				{
					title: "recent leap year",
					body: "assert is_leap_year(2024) is True",
				},
				{
					title: "regular non-leap",
					body: "assert is_leap_year(2023) is False",
				},
			],
		},
	},
	{
		id: "lesson-py-v2-03",
		sortOrder: 3,
		title: "Loops and Iteration",
		slug: "loops-and-iteration",
		description: "Use `for` and `while` loops to analyze numeric properties.",
		markdown: lessonMarkdown({
			title: "Loops and Iteration",
			objective: "Iterate efficiently and exit early when an answer is found.",
			body: `\`for\` loops traverse sequences; \`while\` loops repeat until a condition changes. For primality, test divisors up to \`√n\` and return early.

\`\`\`python
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True
\`\`\``,
			pitfalls: [
				"Numbers less than 2 are not prime.",
				"Checking all numbers up to n is slower than needed.",
			],
			next: "Extract reusable logic into named functions.",
		}),
		task: {
			title: "Prime Checker",
			prompt:
				"Implement `is_prime(n: int) -> bool`. Return `True` when `n` is a prime number.",
			examples:
				"- `is_prime(2)` → `True`\n- `is_prime(15)` → `False`\n- `is_prime(97)` → `True`",
			starter: `def is_prime(n: int) -> bool:
    pass`,
			solution: `def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True`,
			idiomHint:
				"Use early returns inside loops instead of flag variables when possible.",
			tests: [
				{ title: "smallest prime", body: "assert is_prime(2) is True" },
				{ title: "composite", body: "assert is_prime(15) is False" },
				{ title: "large prime", body: "assert is_prime(97) is True" },
				{
					title: "zero and one",
					body: "assert is_prime(0) is False and is_prime(1) is False",
				},
			],
		},
	},
	{
		id: "lesson-py-v2-04",
		sortOrder: 4,
		title: "Writing Functions",
		slug: "writing-functions",
		description:
			"Design pure functions that transform input into structured output.",
		markdown: lessonMarkdown({
			title: "Writing Functions",
			objective: "Break problems into small, testable functions.",
			body: `Functions encapsulate behavior. Use type hints and return structured data like dictionaries when counting occurrences.

\`\`\`python
def word_count(text: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts
\`\`\``,
			pitfalls: [
				"Forgetting to normalize case splits counts across variants.",
				"Mutating a default dict argument causes shared state bugs.",
			],
			next: "Manipulate nested list structures.",
		}),
		task: {
			title: "Word Count",
			prompt:
				"Implement `word_count(text: str) -> dict[str, int]`. Count how many times each word appears, treating words as whitespace-separated tokens compared case-insensitively.",
			examples:
				'- `word_count("to be or not to be")` → `{"to": 2, "be": 2, "or": 1, "not": 1}`',
			starter: `def word_count(text: str) -> dict[str, int]:
    pass`,
			solution: `def word_count(text: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts`,
			idiomHint:
				"Use `dict.get` for counting patterns instead of manual key checks.",
			tests: [
				{
					title: "counts repeated words",
					body: `assert word_count("to be or not to be") == {"to": 2, "be": 2, "or": 1, "not": 1}`,
				},
				{
					title: "case insensitive",
					body: `assert word_count("Hello hello") == {"hello": 2}`,
				},
				{
					title: "empty string",
					body: `assert word_count("") == {}`,
				},
				{
					title: "single word",
					body: `assert word_count("python") == {"python": 1}`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-05",
		sortOrder: 5,
		title: "Working with Lists",
		slug: "working-with-lists",
		description: "Transform 2D list data with slicing and zip.",
		markdown: lessonMarkdown({
			title: "Working with Lists",
			objective: "Rotate matrix data using list operations.",
			body: `Lists are mutable sequences. Matrix rotation combines reversing rows with \`zip(*matrix)\` to transpose.

\`\`\`python
def rotate_matrix(matrix: list[list[int]]) -> list[list[int]]:
    if not matrix:
        return []
    return [list(row) for row in zip(*matrix[::-1])]
\`\`\``,
			pitfalls: [
				"Forgetting to handle an empty matrix.",
				"Mutating the input matrix when a new matrix is expected.",
			],
			next: "Group records with dictionaries.",
		}),
		task: {
			title: "Rotate Matrix",
			prompt:
				"Implement `rotate_matrix(matrix: list[list[int]]) -> list[list[int]]` to rotate a square matrix 90° clockwise. Return a new matrix without mutating the input.",
			examples: "- `rotate_matrix([[1,2],[3,4]])` → `[[3,1],[4,2]]`",
			starter: `def rotate_matrix(matrix: list[list[int]]) -> list[list[int]]:
    pass`,
			solution: `def rotate_matrix(matrix: list[list[int]]) -> list[list[int]]:
    if not matrix:
        return []
    return [list(row) for row in zip(*matrix[::-1])]`,
			idiomHint:
				"Prefer `zip` and comprehensions for matrix transforms over nested index loops.",
			tests: [
				{
					title: "2x2 rotation",
					body: "assert rotate_matrix([[1, 2], [3, 4]]) == [[3, 1], [4, 2]]",
				},
				{
					title: "1x1 matrix",
					body: "assert rotate_matrix([[7]]) == [[7]]",
				},
				{
					title: "empty matrix",
					body: "assert rotate_matrix([]) == []",
				},
				{
					title: "does not mutate input",
					body: `original = [[1, 2], [3, 4]]
copy = [row[:] for row in original]
rotate_matrix(original)
assert original == copy`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-06",
		sortOrder: 6,
		title: "Dictionaries and Grouping",
		slug: "dictionaries-and-grouping",
		description: "Build lookup tables and group records by a key.",
		markdown: lessonMarkdown({
			title: "Dictionaries and Grouping",
			objective: "Aggregate list items into buckets with dicts.",
			body: `\`dict.setdefault\` is ideal for grouping:

\`\`\`python
def group_by_key(items: list[dict], key: str) -> dict:
    grouped: dict = {}
    for item in items:
        grouped.setdefault(item[key], []).append(item)
    return grouped
\`\`\``,
			pitfalls: [
				"Missing keys raise `KeyError` — assume the key exists on every item.",
				"Using bare lists as dict values without copying shared references.",
			],
			next: "Flatten nested lists with comprehensions.",
		}),
		task: {
			title: "Group By Key",
			prompt:
				"Implement `group_by_key(items: list[dict], key: str) -> dict`. Return a dict mapping each distinct `item[key]` value to a list of matching items, preserving input order within each group.",
			examples:
				'- `group_by_key([{"type":"a","v":1},{"type":"b","v":2},{"type":"a","v":3}], "type")` → `{"a": [...], "b": [...]}`',
			starter: `def group_by_key(items: list[dict], key: str) -> dict:
    pass`,
			solution: `def group_by_key(items: list[dict], key: str) -> dict:
    grouped: dict = {}
    for item in items:
        grouped.setdefault(item[key], []).append(item)
    return grouped`,
			idiomHint:
				"Use `setdefault` or `defaultdict` patterns for grouping instead of manual key checks.",
			tests: [
				{
					title: "groups by type",
					body: `items = [{"type": "a", "v": 1}, {"type": "b", "v": 2}, {"type": "a", "v": 3}]
result = group_by_key(items, "type")
assert result["a"] == [{"type": "a", "v": 1}, {"type": "a", "v": 3}]
assert result["b"] == [{"type": "b", "v": 2}]`,
				},
				{
					title: "empty input",
					body: `assert group_by_key([], "type") == {}`,
				},
				{
					title: "single group",
					body: `items = [{"k": 1, "v": "x"}, {"k": 1, "v": "y"}]
assert len(group_by_key(items, "k")[1]) == 2`,
				},
				{
					title: "preserves order",
					body: `items = [{"g": "x", "n": 1}, {"g": "x", "n": 2}, {"g": "y", "n": 3}]
assert [i["n"] for i in group_by_key(items, "g")["x"]] == [1, 2]`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-07",
		sortOrder: 7,
		title: "List Comprehensions",
		slug: "list-comprehensions",
		description: "Flatten nested structures with comprehensions and recursion.",
		markdown: lessonMarkdown({
			title: "List Comprehensions",
			objective: "Flatten arbitrarily nested lists recursively.",
			body: `Comprehensions express transforms concisely, but nested lists often need recursion:

\`\`\`python
def flatten(nested: list) -> list:
    flat: list = []
    for item in nested:
        if isinstance(item, list):
            flat.extend(flatten(item))
        else:
            flat.append(item)
    return flat
\`\`\``,
			pitfalls: [
				"Only checking one nesting level misses deeper lists.",
				"Using `+=` on nested lists when `extend` is needed.",
			],
			next: "Remove duplicates while preserving order with sets.",
		}),
		task: {
			title: "Flatten Nested Lists",
			prompt:
				"Implement `flatten(nested: list) -> list` to flatten arbitrarily nested lists into a single list of non-list values, preserving left-to-right order.",
			examples: "- `flatten([1, [2, [3, 4], 5], 6])` → `[1, 2, 3, 4, 5, 6]`",
			starter: `def flatten(nested: list) -> list:
    pass`,
			solution: `def flatten(nested: list) -> list:
    flat: list = []
    for item in nested:
        if isinstance(item, list):
            flat.extend(flatten(item))
        else:
            flat.append(item)
    return flat`,
			idiomHint:
				"Combine recursion with `extend`/`append` rather than stringifying nested data.",
			tests: [
				{
					title: "deep nesting",
					body: "assert flatten([1, [2, [3, 4], 5], 6]) == [1, 2, 3, 4, 5, 6]",
				},
				{
					title: "already flat",
					body: "assert flatten([1, 2, 3]) == [1, 2, 3]",
				},
				{ title: "empty list", body: "assert flatten([]) == []" },
				{
					title: "empty nested lists",
					body: "assert flatten([[], [1, []], 2]) == [1, 2]",
				},
			],
		},
	},
	{
		id: "lesson-py-v2-08",
		sortOrder: 8,
		title: "Sets and Uniqueness",
		slug: "sets-and-uniqueness",
		description: "Deduplicate sequences while preserving first-seen order.",
		markdown: lessonMarkdown({
			title: "Sets and Uniqueness",
			objective: "Track seen items with a set while building output order.",
			body: `Sets give O(1) membership checks. To preserve order, iterate once and skip seen values:

\`\`\`python
def unique_preserve_order(items: list) -> list:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
\`\`\``,
			pitfalls: [
				"Converting to `set(items)` loses order in older Python versions.",
				"Using unhashable items like lists as set members raises errors.",
			],
			next: "Handle invalid conversions with exceptions.",
		}),
		task: {
			title: "Unique Preserve Order",
			prompt:
				"Implement `unique_preserve_order(items: list) -> list` returning a new list with duplicates removed, keeping the first occurrence of each value.",
			examples:
				"- `unique_preserve_order([1, 2, 1, 3, 2, 4])` → `[1, 2, 3, 4]`",
			starter: `def unique_preserve_order(items: list) -> list:
    pass`,
			solution: `def unique_preserve_order(items: list) -> list:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result`,
			idiomHint:
				"Combine a set for membership with a list for stable ordering.",
			tests: [
				{
					title: "removes duplicates",
					body: "assert unique_preserve_order([1, 2, 1, 3, 2, 4]) == [1, 2, 3, 4]",
				},
				{ title: "empty list", body: "assert unique_preserve_order([]) == []" },
				{
					title: "no duplicates",
					body: "assert unique_preserve_order([1, 2, 3]) == [1, 2, 3]",
				},
				{
					title: "string items",
					body: `assert unique_preserve_order(["a", "b", "a"]) == ["a", "b"]`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-09",
		sortOrder: 9,
		title: "Error Handling",
		slug: "error-handling",
		description: "Catch conversion errors and return safe defaults.",
		markdown: lessonMarkdown({
			title: "Error Handling",
			objective: "Parse user input defensively with try/except.",
			body: `Wrap risky conversions in \`try/except\` and return a default instead of crashing:

\`\`\`python
def safe_int(value: str, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
\`\`\``,
			pitfalls: [
				"Catching bare `Exception` hides unrelated bugs.",
				'Forgetting that `int(" 42 ")` succeeds but `int("42px")` fails.',
			],
			next: "Parse structured text like CSV rows.",
		}),
		task: {
			title: "Safe Integer Parse",
			prompt:
				"Implement `safe_int(value: str, default: int = 0) -> int`. Return `int(value)` when conversion succeeds; otherwise return `default`.",
			examples:
				'- `safe_int("42")` → `42`\n- `safe_int("nope")` → `0`\n- `safe_int("nope", -1)` → `-1`',
			starter: `def safe_int(value: str, default: int = 0) -> int:
    pass`,
			solution: `def safe_int(value: str, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default`,
			idiomHint:
				"Catch specific exceptions and keep fallback behavior explicit.",
			tests: [
				{ title: "valid integer", body: `assert safe_int("42") == 42` },
				{ title: "invalid uses default", body: `assert safe_int("nope") == 0` },
				{ title: "custom default", body: `assert safe_int("nope", -1) == -1` },
				{
					title: "whitespace trimmed by int",
					body: `assert safe_int("  7  ") == 7`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-10",
		sortOrder: 10,
		title: "Parsing Text Data",
		slug: "parsing-text-data",
		description: "Split delimited text into structured fields.",
		markdown: lessonMarkdown({
			title: "Parsing Text Data",
			objective: "Parse a single CSV row into trimmed fields.",
			body: `For simple CSV without embedded commas, split on commas and strip whitespace:

\`\`\`python
def parse_csv_row(line: str) -> list[str]:
    return [field.strip() for field in line.split(",")]
\`\`\``,
			pitfalls: [
				"Forgetting to strip spaces around fields.",
				"Assuming quoted commas — out of scope for this exercise.",
			],
			next: "Model behavior with classes.",
		}),
		task: {
			title: "Parse CSV Row",
			prompt:
				"Implement `parse_csv_row(line: str) -> list[str]`. Split a comma-separated line into fields and strip surrounding whitespace from each field.",
			examples:
				'- `parse_csv_row("name, age, city")` → `["name", "age", "city"]`\n- `parse_csv_row(" ada , 42 , paris ")` → `["ada", "42", "paris"]`',
			starter: `def parse_csv_row(line: str) -> list[str]:
    pass`,
			solution: `def parse_csv_row(line: str) -> list[str]:
    return [field.strip() for field in line.split(",")]`,
			idiomHint: "Use comprehensions for simple field transforms.",
			tests: [
				{
					title: "basic row",
					body: `assert parse_csv_row("name,age,city") == ["name", "age", "city"]`,
				},
				{
					title: "strips whitespace",
					body: `assert parse_csv_row(" ada , 42 , paris ") == ["ada", "42", "paris"]`,
				},
				{
					title: "single field",
					body: `assert parse_csv_row("solo") == ["solo"]`,
				},
				{ title: "empty string", body: `assert parse_csv_row("") == [""]` },
			],
		},
	},
	{
		id: "lesson-py-v2-11",
		sortOrder: 11,
		title: "Object-Oriented Basics",
		slug: "object-oriented-basics",
		description: "Implement a stack abstract data type with a class.",
		markdown: lessonMarkdown({
			title: "Object-Oriented Basics",
			objective: "Encapsulate mutable state in a class with clear methods.",
			body: `Classes bundle data and behavior. A stack uses LIFO ordering:

\`\`\`python
class Stack:
    def __init__(self):
        self._items: list = []

    def push(self, item):
        self._items.append(item)
\`\`\`

Raise \`IndexError\` when popping or peeking an empty stack.`,
			pitfalls: [
				"Exposing the internal list lets callers break invariants.",
				"Returning wrong values from `pop`/`peek` on empty stacks.",
			],
			next: "Use dataclasses for concise record types.",
		}),
		task: {
			title: "Stack ADT",
			prompt:
				"Implement a `Stack` class with `push(item)`, `pop()`, `peek()`, and `is_empty()`. `pop` and `peek` must raise `IndexError` on an empty stack.",
			starter: `class Stack:
    def __init__(self):
        pass

    def push(self, item):
        pass

    def pop(self):
        pass

    def peek(self):
        pass

    def is_empty(self) -> bool:
        pass`,
			solution: `class Stack:
    def __init__(self):
        self._items: list = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self._items[-1]

    def is_empty(self) -> bool:
        return len(self._items) == 0`,
			idiomHint:
				"Hide internal storage with a leading underscore and keep methods small.",
			tests: [
				{
					title: "push and pop",
					body: `s = Stack()
s.push(1)
s.push(2)
assert s.pop() == 2
assert s.pop() == 1
assert s.is_empty()`,
				},
				{
					title: "peek does not remove",
					body: `s = Stack()
s.push("x")
assert s.peek() == "x"
assert s.pop() == "x"`,
				},
				{
					title: "pop empty raises",
					body: `s = Stack()
try:
    s.pop()
    raise AssertionError("expected IndexError")
except IndexError:
    pass`,
				},
				{
					title: "peek empty raises",
					body: `s = Stack()
try:
    s.peek()
    raise AssertionError("expected IndexError")
except IndexError:
    pass`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-12",
		sortOrder: 12,
		title: "Dataclasses",
		slug: "dataclasses",
		description: "Model product records and serialize them to dicts.",
		markdown: lessonMarkdown({
			title: "Dataclasses",
			objective: "Define structured records and convert them to plain dicts.",
			body: `@dataclass removes boilerplate for data containers:

\`\`\`python
from dataclasses import dataclass, asdict

@dataclass
class Product:
    id: str
    name: str
    price: float
\`\`\`

Use \`asdict\` when APIs expect JSON-serializable dictionaries.`,
			pitfalls: [
				"Mutating shared dataclass instances unintentionally.",
				"Forgetting to import `asdict` from dataclasses.",
			],
			next: "Yield batches lazily with generators.",
		}),
		task: {
			title: "Product Catalog",
			prompt:
				"Define a `@dataclass` `Product` with fields `id: str`, `name: str`, and `price: float`. Implement `product_catalog(products: list[Product]) -> list[dict]` returning each product as a dictionary via `asdict`.",
			starter: `from dataclasses import dataclass

@dataclass
class Product:
    id: str
    name: str
    price: float

def product_catalog(products: list[Product]) -> list[dict]:
    pass`,
			solution: `from dataclasses import dataclass, asdict

@dataclass
class Product:
    id: str
    name: str
    price: float

def product_catalog(products: list[Product]) -> list[dict]:
    return [asdict(product) for product in products]`,
			idiomHint:
				"Prefer dataclasses over plain dicts when fields are fixed and typed.",
			tests: [
				{
					title: "serializes products",
					body: `products = [Product("p1", "Keyboard", 79.99), Product("p2", "Mouse", 29.5)]
result = product_catalog(products)
assert result == [{"id": "p1", "name": "Keyboard", "price": 79.99}, {"id": "p2", "name": "Mouse", "price": 29.5}]`,
				},
				{ title: "empty catalog", body: "assert product_catalog([]) == []" },
				{
					title: "single product",
					body: `result = product_catalog([Product("x", "Item", 1.0)])
assert result[0]["name"] == "Item"`,
				},
				{
					title: "returns plain dicts",
					body: `result = product_catalog([Product("a", "A", 0.0)])
assert isinstance(result[0], dict)`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-13",
		sortOrder: 13,
		title: "Generators and Iteration",
		slug: "generators-and-iteration",
		description: "Yield fixed-size batches from a sequence lazily.",
		markdown: lessonMarkdown({
			title: "Generators and Iteration",
			objective: "Process large sequences in chunks with a generator.",
			body: `Generators \`yield\` values lazily. Batch processing avoids loading everything at once:

\`\`\`python
def batch(items: list, size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]
\`\`\``,
			pitfalls: [
				"Using `size <= 0` causes infinite loops or errors — assume positive size.",
				"Returning lists instead of yielding them breaks lazy behavior.",
			],
			next: "Wrap functions with decorators.",
		}),
		task: {
			title: "Batch Generator",
			prompt:
				"Implement `batch(items: list, size: int)` as a generator that yields consecutive slices of `items` with at most `size` elements. Assume `size > 0`.",
			examples: "- `list(batch([1,2,3,4,5], 2))` → `[[1,2],[3,4],[5]]`",
			starter: `def batch(items: list, size: int):
    pass`,
			solution: `def batch(items: list, size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]`,
			idiomHint:
				"Use `yield` for lazy sequences instead of building all batches upfront.",
			tests: [
				{
					title: "batches of two",
					body: "assert list(batch([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]]",
				},
				{
					title: "size larger than list",
					body: "assert list(batch([1, 2], 5)) == [[1, 2]]",
				},
				{ title: "empty list", body: "assert list(batch([], 3)) == []" },
				{
					title: "exact division",
					body: "assert list(batch([1, 2, 3, 4], 2)) == [[1, 2], [3, 4]]",
				},
			],
		},
	},
	{
		id: "lesson-py-v2-14",
		sortOrder: 14,
		title: "Decorators",
		slug: "decorators",
		description: "Measure function runtime with a simple timing decorator.",
		markdown: lessonMarkdown({
			title: "Decorators",
			objective: "Wrap functions to record elapsed execution time.",
			body: `Decorators are functions that return wrappers. Store metadata on the wrapper:

\`\`\`python
import time

def timing(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        wrapper.elapsed = time.perf_counter() - start
        return result
    wrapper.elapsed = 0.0
    return wrapper
\`\`\``,
			pitfalls: [
				"Forgetting to return the wrapped function's result.",
				"Not preserving `*args, **kwargs` breaks decorated signatures.",
			],
			next: "Combine parsing, counting, and aggregation in a capstone.",
		}),
		task: {
			title: "Timing Decorator",
			prompt:
				"Implement a `timing` decorator that wraps a function, returns its result unchanged, and sets `wrapper.elapsed` to the number of seconds (float) the call took. Initialize `wrapper.elapsed` to `0.0`.",
			starter: `import time

def timing(func):
    pass`,
			solution: `import time

def timing(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        wrapper.elapsed = time.perf_counter() - start
        return result

    wrapper.elapsed = 0.0
    return wrapper`,
			idiomHint:
				"Use `functools.wraps` in production code; here focus on correct wrapper behavior.",
			tests: [
				{
					title: "returns function result",
					body: `@timing
def add(a, b):
    return a + b

assert add(2, 3) == 5`,
				},
				{
					title: "records elapsed time",
					body: `@timing
def work():
    total = 0
    for i in range(1000):
        total += i
    return total

work()
assert work.elapsed >= 0`,
				},
				{
					title: "passes arguments through",
					body: `@timing
def greet(name, greeting="hi"):
    return f"{greeting} {name}"

assert greet("ada", greeting="hello") == "hello ada"`,
				},
				{
					title: "initial elapsed is zero",
					body: `@timing
def noop():
    return None

wrapped = noop
assert wrapped.elapsed == 0.0 or wrapped.elapsed >= 0`,
				},
			],
		},
	},
	{
		id: "lesson-py-v2-15",
		sortOrder: 15,
		title: "Capstone: Text Report",
		slug: "capstone-text-report",
		description:
			"Aggregate line, word, and character statistics from raw text lines.",
		markdown: lessonMarkdown({
			title: "Capstone: Text Report",
			objective: "Combine parsing, counting, and aggregation into one report.",
			body: `This capstone pulls together strings, loops, dicts, and defensive coding. Given a list of text lines, compute summary statistics in one pure function.

Think in terms of:
- total lines and non-empty lines
- total words split on whitespace
- longest line length
- average words per line (0.0 when there are no lines)`,
			pitfalls: [
				"Dividing by zero when `lines` is empty.",
				"Treating whitespace-only lines as non-empty.",
			],
			next: "You have completed Python Fundamentals — apply these patterns in your own scripts and projects.",
		}),
		task: {
			title: "Text Report Aggregator",
			prompt:
				"Implement `text_report(lines: list[str]) -> dict` returning a dictionary with keys:\n- `line_count` — total lines\n- `non_empty_lines` — lines that contain non-whitespace\n- `word_count` — total whitespace-separated words across all lines\n- `longest_line_length` — max line length (0 for empty input)\n- `avg_words_per_line` — `word_count / line_count`, or `0.0` when `line_count` is 0",
			examples:
				'- `text_report(["hello world", ""])`) → `{line_count: 2, non_empty_lines: 1, word_count: 2, longest_line_length: 11, avg_words_per_line: 1.0}`',
			starter: `def text_report(lines: list[str]) -> dict:
    pass`,
			solution: `def text_report(lines: list[str]) -> dict:
    line_count = len(lines)
    non_empty_lines = sum(1 for line in lines if line.strip())
    word_count = sum(len(line.split()) for line in lines)
    longest_line_length = max((len(line) for line in lines), default=0)
    avg_words_per_line = word_count / line_count if line_count else 0.0
    return {
        "line_count": line_count,
        "non_empty_lines": non_empty_lines,
        "word_count": word_count,
        "longest_line_length": longest_line_length,
        "avg_words_per_line": avg_words_per_line,
    }`,
			idiomHint:
				"Compose small counting expressions into a single report dict with clear keys.",
			tests: [
				{
					title: "basic report",
					body: `report = text_report(["hello world", ""])
assert report["line_count"] == 2
assert report["non_empty_lines"] == 1
assert report["word_count"] == 2
assert report["longest_line_length"] == 11
assert report["avg_words_per_line"] == 1.0`,
				},
				{
					title: "empty input",
					body: `report = text_report([])
assert report["line_count"] == 0
assert report["word_count"] == 0
assert report["avg_words_per_line"] == 0.0`,
				},
				{
					title: "multiple lines",
					body: `report = text_report(["one", "two words", "three word line"])
assert report["line_count"] == 3
assert report["word_count"] == 6
assert report["longest_line_length"] == 15`,
				},
				{
					title: "whitespace only lines",
					body: `report = text_report(["   ", "a"])
assert report["non_empty_lines"] == 1`,
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
			lang: "python",
		}),
		starterCode: def.task.starter,
		solutionCode: def.task.solution,
	};
});

const taskTests: TaskTestRow[] = lessonDefs.flatMap((def) => {
	const taskId = def.id.replace("lesson-", "task-");
	return def.task.tests.map((test, index) =>
		pyTest(taskId, index + 1, test.title, test.body)
	);
});

const gradingCriteria: GradingCriteriaRow[] = tasks.flatMap((task, index) =>
	defaultCriteria(
		task.id,
		lessonDefs[index]?.task.idiomHint ?? "Write idiomatic Python."
	)
);

export const pythonSeed: CourseSeedBundle = {
	course,
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(pythonSeed);
