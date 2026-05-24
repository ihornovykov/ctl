import { assertCourseBundle } from "../assert-seed";
import {
	defaultCriteria,
	goTest,
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

const COURSE_ID = "course-go-v2";
const pad = (n: number) => String(n).padStart(2, "0");

const goTestWithSetup = (
	taskId: string,
	index: number,
	title: string,
	setup: string,
	body: string
): TaskTestRow => ({
	id: `test-${taskId}-${String(index).padStart(2, "0")}`,
	taskId,
	title,
	testCode: `${setup}

func main() {
${body
	.split("\n")
	.map((l) => `\t${l}`)
	.join("\n")}
	fmt.Println(\`{"passed": true}\`)
}`,
	sortOrder: index,
});

const shapeTestSetup = `type testSquare struct{ side float64 }

func (s testSquare) Area() float64 { return s.side * s.side }

type testRect struct{ w, h float64 }

func (r testRect) Area() float64 { return r.w * r.h }`;

type LessonDef = {
	title: string;
	slug: string;
	description: string;
	content: string;
	taskTitle: string;
	taskPrompt: string;
	taskExamples?: string;
	taskRequirements?: string[];
	starterCode: string;
	solutionCode: string;
	idiomHint: string;
	tests: { title: string; body: string }[];
	useShapeTestSetup?: boolean;
};

const lessonDefs: LessonDef[] = [
	{
		title: "Go Basics",
		slug: "go-v2-basics",
		description: "Variables, types, and your first Go functions.",
		content: lessonMarkdown({
			title: "Go Basics",
			objective:
				"Write typed functions in Go using `package main`, basic types, and explicit return values.",
			body: `Go programs start with a package declaration. Exported functions use capitalized names; parameters and return types are declared explicitly.

\`\`\`go
package main

func Add(a int, b int) int {
	return a + b
}
\`\`\`

Floating-point math uses \`float64\` by default for literals in many contexts. Convert Fahrenheit to Celsius with \`(f - 32) * 5 / 9\`.`,
			pitfalls: [
				"Forgetting that undeclared variables are compile errors — Go is statically typed.",
				"Mixing integer division with float math; keep operands as `float64` when you need fractional results.",
			],
			next: "Next you will branch on conditions with `if`, `for`, and boolean logic.",
		}),
		taskTitle: "Celsius From Fahrenheit",
		taskPrompt:
			"Implement `CelsiusFromFahrenheit(f float64) float64` that converts a Fahrenheit temperature to Celsius.",
		taskExamples: `- \`CelsiusFromFahrenheit(32)\` → \`0\`
- \`CelsiusFromFahrenheit(212)\` → \`100\``,
		taskRequirements: [
			"Use the formula `(f - 32) * 5 / 9`.",
			"Return a `float64` value.",
		],
		starterCode: `package main

func CelsiusFromFahrenheit(f float64) float64 {
	// TODO: implement
	return 0
}`,
		solutionCode: `package main

func CelsiusFromFahrenheit(f float64) float64 {
	return (f - 32) * 5 / 9
}`,
		idiomHint:
			"Prefer explicit parameter and return types; keep conversion formulas readable with grouped arithmetic rather than magic constants scattered inline.",
		tests: [
			{
				title: "freezing point",
				body: `if got := CelsiusFromFahrenheit(32); got != 0 {
	panic(fmt.Sprintf("expected 0, got %v", got))
}`,
			},
			{
				title: "boiling point",
				body: `if got := CelsiusFromFahrenheit(212); got < 99.9 || got > 100.1 {
	panic(fmt.Sprintf("expected ~100, got %v", got))
}`,
			},
			{
				title: "body temperature",
				body: `if got := CelsiusFromFahrenheit(98.6); got < 36.9 || got > 37.1 {
	panic(fmt.Sprintf("expected ~37, got %v", got))
}`,
			},
			{
				title: "negative Fahrenheit",
				body: `if got := CelsiusFromFahrenheit(-40); got < -40.1 || got > -39.9 {
	panic(fmt.Sprintf("expected -40, got %v", got))
}`,
			},
		],
	},
	{
		title: "Control Flow",
		slug: "go-v2-control-flow",
		description: "Conditionals and loops for decision-making.",
		content: lessonMarkdown({
			title: "Control Flow",
			objective:
				"Use `if` statements and boolean expressions to implement rules with multiple branches.",
			body: `Go has only \`for\` for looping, but \`if\` supports a short statement before the condition. Leap-year rules combine modulo checks:

\`\`\`go
func IsDivisible(n, d int) bool {
	return n%d == 0
}
\`\`\`

A year is a leap year when it is divisible by 4, except centuries unless divisible by 400.`,
			pitfalls: [
				"Writing `if (x)` — Go conditions must be boolean expressions, not truthy values.",
				"Applying the leap rule in the wrong order; check the 400-year exception after the 100-year rule.",
			],
			next: "Next you will extract reusable logic into standalone functions.",
		}),
		taskTitle: "Is Leap Year",
		taskPrompt:
			"Implement `IsLeapYear(year int) bool` using the standard Gregorian leap-year rules.",
		taskExamples: `- \`IsLeapYear(2024)\` → \`true\`
- \`IsLeapYear(1900)\` → \`false\`
- \`IsLeapYear(2000)\` → \`true\``,
		taskRequirements: [
			"Return true when the year is divisible by 4.",
			"Exclude years divisible by 100 unless also divisible by 400.",
		],
		starterCode: `package main

func IsLeapYear(year int) bool {
	// TODO: implement
	return false
}`,
		solutionCode: `package main

func IsLeapYear(year int) bool {
	return year%4 == 0 && (year%100 != 0 || year%400 == 0)
}`,
		idiomHint:
			"Express compound boolean rules in a single return when readable; avoid unnecessary temporary variables for simple predicates.",
		tests: [
			{
				title: "standard leap year",
				body: `if !IsLeapYear(2024) {
	panic("2024 should be a leap year")
}`,
			},
			{
				title: "century non-leap",
				body: `if IsLeapYear(1900) {
	panic("1900 should not be a leap year")
}`,
			},
			{
				title: "400-year exception",
				body: `if !IsLeapYear(2000) {
	panic("2000 should be a leap year")
}`,
			},
			{
				title: "common year",
				body: `if IsLeapYear(2023) {
	panic("2023 should not be a leap year")
}`,
			},
		],
	},
	{
		title: "Functions",
		slug: "go-v2-functions",
		description: "Reusable logic with parameters and return values.",
		content: lessonMarkdown({
			title: "Functions",
			objective:
				"Implement iterative algorithms in pure functions without mutating caller state.",
			body: `Functions are first-class values in Go, but most exercises focus on small, testable units. The Euclidean algorithm reassigns parameters in a loop:

\`\`\`go
func GCD(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}
\`\`\`

Multiple return values are common, but a single \`int\` result keeps this lesson focused.`,
			pitfalls: [
				"Infinite loops when the remainder step is forgotten.",
				"Returning a negative GCD; normalize with `abs` logic if inputs may be negative.",
			],
			next: "Next you will pass addresses with pointers to mutate caller variables.",
		}),
		taskTitle: "Greatest Common Divisor",
		taskPrompt:
			"Implement `GCD(a, b int) int` using the Euclidean algorithm. Return a non-negative result.",
		taskExamples: `- \`GCD(48, 18)\` → \`6\`
- \`GCD(17, 13)\` → \`1\``,
		taskRequirements: [
			"Use an iterative Euclidean algorithm.",
			"Handle negative inputs by returning a non-negative GCD.",
		],
		starterCode: `package main

func GCD(a, b int) int {
	// TODO: implement
	return 0
}`,
		solutionCode: `package main

func GCD(a, b int) int {
	if a < 0 {
		a = -a
	}
	if b < 0 {
		b = -b
	}
	for b != 0 {
		a, b = b, a%b
	}
	return a
}`,
		idiomHint:
			"Use tuple assignment `a, b = b, a%b` for Euclidean GCD; normalize signs once up front instead of branching inside the loop.",
		tests: [
			{
				title: "basic gcd",
				body: `if GCD(48, 18) != 6 {
	panic(fmt.Sprintf("expected 6, got %d", GCD(48, 18)))
}`,
			},
			{
				title: "coprime values",
				body: `if GCD(17, 13) != 1 {
	panic("expected 1")
}`,
			},
			{
				title: "zero second argument",
				body: `if GCD(7, 0) != 7 {
	panic("expected 7")
}`,
			},
			{
				title: "negative inputs",
				body: `if GCD(-48, 18) != 6 {
	panic("expected 6 for negative input")
}`,
			},
		],
	},
	{
		title: "Pointers",
		slug: "go-v2-pointers",
		description: "Share memory locations and mutate caller state.",
		content: lessonMarkdown({
			title: "Pointers",
			objective:
				"Use pointer parameters to modify variables in the caller's scope.",
			body: `A pointer holds the address of a value. Prefix a type with \`*\` for a pointer and use \`&\` to take an address:

\`\`\`go
func Swap(a, b *int) {
	*a, *b = *b, *a
}
\`\`\`

Pointer receivers and pointer parameters are idiomatic when mutation is intentional.`,
			pitfalls: [
				"Dereferencing nil pointers — always ensure pointers refer to valid variables.",
				"Swapping values instead of addresses; parameters must be `*int`, not `int`.",
			],
			next: "Next you will group fields into structs and attach behavior with methods.",
		}),
		taskTitle: "Swap",
		taskPrompt:
			"Implement `Swap(a, b *int)` to exchange the values at the two pointer addresses in place.",
		taskExamples: `x, y := 3, 7
Swap(&x, &y)
// x == 7, y == 3`,
		taskRequirements: [
			"Mutate values through the provided pointers.",
			"Do not return new integers — swap in place.",
		],
		starterCode: `package main

func Swap(a, b *int) {
	// TODO: implement
}`,
		solutionCode: `package main

func Swap(a, b *int) {
	*a, *b = *b, *a
}`,
		idiomHint:
			"Use tuple assignment on dereferenced pointers for in-place swaps; pointer parameters signal intentional mutation to callers.",
		tests: [
			{
				title: "swap two values",
				body: `x, y := 3, 7
Swap(&x, &y)
if x != 7 || y != 3 {
	panic(fmt.Sprintf("expected 7,3 got %d,%d", x, y))
}`,
			},
			{
				title: "swap equal values",
				body: `x, y := 5, 5
Swap(&x, &y)
if x != 5 || y != 5 {
	panic("equal swap should remain 5,5")
}`,
			},
			{
				title: "swap negatives",
				body: `x, y := -2, 4
Swap(&x, &y)
if x != 4 || y != -2 {
	panic("negative swap failed")
}`,
			},
			{
				title: "swap zeros",
				body: `x, y := 0, 9
Swap(&x, &y)
if x != 9 || y != 0 {
	panic("zero swap failed")
}`,
			},
		],
	},
	{
		title: "Structs",
		slug: "go-v2-structs",
		description: "Model data with struct types and methods.",
		content: lessonMarkdown({
			title: "Structs",
			objective:
				"Define struct types with exported fields and implement value-receiver methods.",
			body: `Structs group related fields. Methods attach behavior with a receiver before the function name:

\`\`\`go
type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}
\`\`\`

Value receivers are appropriate when methods do not mutate the struct.`,
			pitfalls: [
				"Using unexported field names when tests construct literals from another package — keep fields exported with capital letters.",
				"Confusing perimeter `(w+h)*2` with area `w*h`.",
			],
			next: "Next you will use pointer receivers when methods mutate internal state.",
		}),
		taskTitle: "Rectangle Methods",
		taskPrompt:
			"Define `type Rectangle struct { Width, Height float64 }` and implement `Area() float64` and `Perimeter() float64` methods.",
		taskExamples: `r := Rectangle{Width: 3, Height: 4}
r.Area()      // 12
r.Perimeter() // 14`,
		taskRequirements: [
			"Area returns Width * Height.",
			"Perimeter returns 2 * (Width + Height).",
		],
		starterCode: `package main

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	// TODO: implement
	return 0
}

func (r Rectangle) Perimeter() float64 {
	// TODO: implement
	return 0
}`,
		solutionCode: `package main

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}`,
		idiomHint:
			"Use value receivers for read-only geometry methods; keep exported struct field names capitalized for cross-package access.",
		tests: [
			{
				title: "area 3x4",
				body: `r := Rectangle{Width: 3, Height: 4}
if r.Area() != 12 {
	panic(fmt.Sprintf("expected area 12, got %v", r.Area()))
}`,
			},
			{
				title: "perimeter 3x4",
				body: `r := Rectangle{Width: 3, Height: 4}
if r.Perimeter() != 14 {
	panic(fmt.Sprintf("expected perimeter 14, got %v", r.Perimeter()))
}`,
			},
			{
				title: "square",
				body: `r := Rectangle{Width: 5, Height: 5}
if r.Area() != 25 || r.Perimeter() != 20 {
	panic("square calculations failed")
}`,
			},
			{
				title: "unit rectangle",
				body: `r := Rectangle{Width: 1, Height: 1}
if r.Area() != 1 || r.Perimeter() != 4 {
	panic("unit rectangle failed")
}`,
			},
		],
	},
	{
		title: "Methods",
		slug: "go-v2-methods",
		description: "Pointer receivers and mutable struct state.",
		content: lessonMarkdown({
			title: "Methods",
			objective:
				"Choose pointer receivers when methods mutate struct fields across calls.",
			body: `Pointer receivers let methods update the receiver's fields:

\`\`\`go
type Counter struct {
	value int
}

func (c *Counter) Increment() int {
	c.value++
	return c.value
}
\`\`\`

Go automatically takes the address when calling pointer-receiver methods on values.`,
			pitfalls: [
				"Using value receivers for mutating methods — copies will not persist state.",
				"Forgetting to reset internal fields in `Reset`.",
			],
			next: "Next you will abstract behavior behind interfaces.",
		}),
		taskTitle: "Counter Methods",
		taskPrompt:
			"Implement a `Counter` struct with `Increment() int` (returns the new count) and `Reset()` (sets count back to zero).",
		taskExamples: `c := Counter{}
c.Increment() // 1
c.Increment() // 2
c.Reset()
c.Increment() // 1`,
		taskRequirements: [
			"Use a pointer receiver for mutating methods.",
			"`Increment` returns the updated count after each call.",
		],
		starterCode: `package main

type Counter struct {
	value int
}

func (c *Counter) Increment() int {
	// TODO: implement
	return 0
}

func (c *Counter) Reset() {
	// TODO: implement
}`,
		solutionCode: `package main

type Counter struct {
	value int
}

func (c *Counter) Increment() int {
	c.value++
	return c.value
}

func (c *Counter) Reset() {
	c.value = 0
}`,
		idiomHint:
			"Use pointer receivers on mutating methods like Increment and Reset; keep unexported state lowercase and expose behavior through methods.",
		tests: [
			{
				title: "increment sequence",
				body: `c := Counter{}
if c.Increment() != 1 || c.Increment() != 2 {
	panic("increment sequence failed")
}`,
			},
			{
				title: "reset clears count",
				body: `c := Counter{}
c.Increment()
c.Increment()
c.Reset()
if c.Increment() != 1 {
	panic("reset should restart count")
}`,
			},
			{
				title: "multiple counters independent",
				body: `a, b := Counter{}, Counter{}
a.Increment()
b.Increment()
b.Increment()
if a.Increment() != 2 || b.Increment() != 3 {
	panic("counters should be independent")
}`,
			},
			{
				title: "reset idempotent",
				body: `c := Counter{}
c.Increment()
c.Reset()
c.Reset()
if c.Increment() != 1 {
	panic("double reset failed")
}`,
			},
		],
	},
	{
		title: "Interfaces",
		slug: "go-v2-interfaces",
		description: "Polymorphism with implicit interface satisfaction.",
		content: lessonMarkdown({
			title: "Interfaces",
			objective:
				"Write functions that operate on interface types to process heterogeneous concrete types.",
			body: `Interfaces define behavior without naming concrete types. Any type with matching methods satisfies the interface implicitly:

\`\`\`go
type Shape interface {
	Area() float64
}

func TotalArea(shapes []Shape) float64 {
	var sum float64
	for _, s := range shapes {
		sum += s.Area()
	}
	return sum
}
\`\`\``,
			pitfalls: [
				"Defining overly large interfaces — keep them focused on the behavior you need.",
				"Using concrete types in `TotalArea` instead of the `Shape` interface parameter slice.",
			],
			next: "Next you will work with dynamic-length sequences using slices.",
		}),
		taskTitle: "Total Area",
		taskPrompt:
			"Given `type Shape interface { Area() float64 }`, implement `TotalArea(shapes []Shape) float64` that sums each shape's area.",
		taskExamples: `type Square struct{ Side float64 }
func (s Square) Area() float64 { return s.Side * s.Side }

shapes := []Shape{Square{Side: 2}, Square{Side: 3}}
TotalArea(shapes) // 13`,
		taskRequirements: [
			"Accept a slice of `Shape` values.",
			"Return 0 for an empty slice.",
		],
		starterCode: `package main

type Shape interface {
	Area() float64
}

func TotalArea(shapes []Shape) float64 {
	// TODO: implement
	return 0
}`,
		solutionCode: `package main

type Shape interface {
	Area() float64
}

func TotalArea(shapes []Shape) float64 {
	var sum float64
	for _, s := range shapes {
		sum += s.Area()
	}
	return sum
}`,
		idiomHint:
			"Accept interfaces and return concrete types; iterate with range over `[]Shape` and let implicit satisfaction keep call sites simple.",
		tests: [
			{
				title: "empty slice",
				body: `if TotalArea([]Shape{}) != 0 {
	panic("empty total should be 0")
}`,
			},
			{
				title: "single shape",
				body: `if TotalArea([]Shape{testSquare{side: 4}}) != 16 {
	panic("expected 16")
}`,
			},
			{
				title: "multiple shapes",
				body: `total := TotalArea([]Shape{testSquare{side: 2}, testSquare{side: 3}})
if total != 13 {
	panic(fmt.Sprintf("expected 13, got %v", total))
}`,
			},
			{
				title: "mixed dimensions",
				body: `total := TotalArea([]Shape{testRect{w: 2, h: 5}, testRect{w: 1, h: 3}})
if total != 13 {
	panic(fmt.Sprintf("expected 13, got %v", total))
}`,
			},
		],
		useShapeTestSetup: true,
	},
	{
		title: "Slices",
		slug: "go-v2-slices",
		description: "Dynamic arrays, append, and slice algorithms.",
		content: lessonMarkdown({
			title: "Slices",
			objective:
				"Merge two sorted slices into a new sorted slice using indices instead of resorting.",
			body: `Slices are views over underlying arrays. The merge step compares heads of two sorted inputs:

\`\`\`go
result := make([]int, 0, len(a)+len(b))
// compare a[i] and b[j], append smaller, advance index
\`\`\`

Preallocate capacity with \`make\` to avoid repeated growth.`,
			pitfalls: [
				"Mutating input slices when the task expects a new merged result.",
				"Forgetting to append remaining elements after one slice exhausts.",
			],
			next: "Next you will count occurrences with maps.",
		}),
		taskTitle: "Merge Sorted",
		taskPrompt:
			"Implement `MergeSorted(a, b []int) []int` that merges two ascending slices into a new ascending slice.",
		taskExamples: `- \`MergeSorted([]int{1, 3}, []int{2, 4})\` → \`[]int{1, 2, 3, 4}\`
- \`MergeSorted([]int{}, []int{2})\` → \`[]int{2}\``,
		taskRequirements: [
			"Do not mutate the input slices.",
			"Preserve stable ordering for equal values (take from `a` first when equal).",
		],
		starterCode: `package main

func MergeSorted(a, b []int) []int {
	// TODO: implement
	return nil
}`,
		solutionCode: `package main

func MergeSorted(a, b []int) []int {
	result := make([]int, 0, len(a)+len(b))
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] {
			result = append(result, a[i])
			i++
		} else {
			result = append(result, b[j])
			j++
		}
	}
	result = append(result, a[i:]...)
	result = append(result, b[j:]...)
	return result
}`,
		idiomHint:
			"Preallocate with `make([]int, 0, len(a)+len(b))` and use two-index merge logic; append tail segments with slice syntax instead of extra loops.",
		tests: [
			{
				title: "interleaved merge",
				body: `got := MergeSorted([]int{1, 3}, []int{2, 4})
if len(got) != 4 || got[0] != 1 || got[3] != 4 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "empty first slice",
				body: `got := MergeSorted([]int{}, []int{2, 5})
if len(got) != 2 || got[0] != 2 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "empty second slice",
				body: `got := MergeSorted([]int{1}, []int{})
if len(got) != 1 || got[0] != 1 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "duplicates preserved",
				body: `got := MergeSorted([]int{1, 1}, []int{1, 2})
if len(got) != 4 || got[2] != 1 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
		],
	},
	{
		title: "Maps",
		slug: "go-v2-maps",
		description: "Key-value lookups and frequency counting.",
		content: lessonMarkdown({
			title: "Maps",
			objective:
				"Build word-frequency maps by normalizing text and iterating tokens.",
			body: `Maps are reference types created with \`make\` or literals. Combine \`strings.ToLower\` and \`strings.Fields\` to tokenize:

\`\`\`go
freq := make(map[string]int)
for _, word := range strings.Fields(strings.ToLower(text)) {
	freq[word]++
}
\`\`\``,
			pitfalls: [
				"Reading a missing key assumes zero — good for counts, but know when `ok` is needed.",
				"Splitting on single spaces only; `strings.Fields` handles multiple spaces and tabs.",
			],
			next: "Next you will return errors explicitly instead of panicking.",
		}),
		taskTitle: "Word Frequency",
		taskPrompt:
			"Implement `WordFrequency(text string) map[string]int` that lowercases words and counts tokens separated by whitespace.",
		taskExamples: `- \`WordFrequency("Go go GO")\` → \`map[string]int{"go": 3}\`
- \`WordFrequency("")\` → empty map or map with no entries`,
		taskRequirements: [
			"Lowercase each word before counting.",
			"Split on whitespace using `strings.Fields`.",
		],
		starterCode: `package main

import "strings"

func WordFrequency(text string) map[string]int {
	// TODO: implement
	return nil
}`,
		solutionCode: `package main

import "strings"

func WordFrequency(text string) map[string]int {
	freq := make(map[string]int)
	for _, word := range strings.Fields(strings.ToLower(text)) {
		freq[word]++
	}
	return freq
}`,
		idiomHint:
			"Use `strings.Fields(strings.ToLower(text))` for tokenization and the `freq[word]++` idiom; initialize maps with `make` when building dynamically.",
		tests: [
			{
				title: "repeated word",
				body: `freq := WordFrequency("Go go GO")
if freq["go"] != 3 {
	panic(fmt.Sprintf("expected 3, got %d", freq["go"]))
}`,
			},
			{
				title: "distinct words",
				body: `freq := WordFrequency("hello world")
if freq["hello"] != 1 || freq["world"] != 1 {
	panic(fmt.Sprintf("unexpected %v", freq))
}`,
			},
			{
				title: "empty string",
				body: `freq := WordFrequency("")
if len(freq) != 0 {
	panic("expected empty map")
}`,
			},
			{
				title: "extra whitespace",
				body: `freq := WordFrequency("  a   a  b ")
if freq["a"] != 2 || freq["b"] != 1 {
	panic(fmt.Sprintf("unexpected %v", freq))
}`,
			},
		],
	},
	{
		title: "Errors",
		slug: "go-v2-errors",
		description: "Explicit error values and multiple return values.",
		content: lessonMarkdown({
			title: "Errors",
			objective:
				"Return `(value, error)` tuples and construct errors with `errors.New`.",
			body: `Go treats errors as values. Callers check the second return:

\`\`\`go
func SafeDivide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}
\`\`\`

Return the zero value for the primary result when failing.`,
			pitfalls: [
				"Panicking on expected invalid input — prefer returning errors.",
				"Returning `nil` error on failure paths.",
			],
			next: "Next you will run work concurrently with goroutines.",
		}),
		taskTitle: "Safe Divide",
		taskPrompt:
			"Implement `SafeDivide(a, b float64) (float64, error)` that divides unless `b` is zero.",
		taskExamples: `- \`SafeDivide(10, 2)\` → \`(5, nil)\`
- \`SafeDivide(10, 0)\` → \`(0, error)\``,
		taskRequirements: [
			"Return an error when `b` is exactly zero.",
			"Use `errors.New` for the error message.",
		],
		starterCode: `package main

import "errors"

func SafeDivide(a, b float64) (float64, error) {
	// TODO: implement
	return 0, nil
}`,
		solutionCode: `package main

import "errors"

func SafeDivide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}`,
		idiomHint:
			"Return `(zeroValue, err)` on failure and `(result, nil)` on success; use `errors.New` for simple sentinel messages instead of fmt.Errorf unless formatting is needed.",
		tests: [
			{
				title: "valid division",
				body: `v, err := SafeDivide(10, 2)
if err != nil || v != 5 {
	panic(fmt.Sprintf("expected 5,nil got %v,%v", v, err))
}`,
			},
			{
				title: "divide by zero",
				body: `_, err := SafeDivide(10, 0)
if err == nil {
	panic("expected error for division by zero")
}`,
			},
			{
				title: "negative numerator",
				body: `v, err := SafeDivide(-9, 3)
if err != nil || v != -3 {
	panic("expected -3")
}`,
			},
			{
				title: "fractional result",
				body: `v, err := SafeDivide(5, 2)
if err != nil || v != 2.5 {
	panic(fmt.Sprintf("expected 2.5 got %v", v))
}`,
			},
		],
	},
	{
		title: "Goroutines",
		slug: "go-v2-goroutines",
		description: "Lightweight concurrency with goroutines and WaitGroups.",
		content: lessonMarkdown({
			title: "Goroutines",
			objective:
				"Launch one goroutine per element and synchronize completion before returning.",
			body: `Start concurrent work with the \`go\` keyword and coordinate with \`sync.WaitGroup\`:

\`\`\`go
var wg sync.WaitGroup
for i, n := range nums {
	wg.Add(1)
	go func(i, n int) {
		defer wg.Done()
		result[i] = n * 2
	}(i, n)
}
wg.Wait()
\`\`\`

Capture loop variables explicitly in goroutine parameters.`,
			pitfalls: [
				"Closing over loop index variables without passing them as parameters.",
				"Returning before `wg.Wait()` finishes — results may be incomplete.",
			],
			next: "Next you will coordinate goroutines with channels.",
		}),
		taskTitle: "Double All",
		taskPrompt:
			"Implement `DoubleAll(nums []int) []int` that doubles each element using one goroutine per index, synchronized with `sync.WaitGroup`.",
		taskExamples: `- \`DoubleAll([]int{1, 2, 3})\` → \`[]int{2, 4, 6}\`
- \`DoubleAll([]int{})\` → \`[]int{}\``,
		taskRequirements: [
			"Use at least one goroutine per element when the slice is non-empty.",
			"Preserve input order in the output slice.",
		],
		starterCode: `package main

import "sync"

func DoubleAll(nums []int) []int {
	// TODO: implement
	return nil
}`,
		solutionCode: `package main

import "sync"

func DoubleAll(nums []int) []int {
	if len(nums) == 0 {
		return []int{}
	}
	result := make([]int, len(nums))
	var wg sync.WaitGroup
	for i, n := range nums {
		wg.Add(1)
		go func(i, n int) {
			defer wg.Done()
			result[i] = n * 2
		}(i, n)
	}
	wg.Wait()
	return result
}`,
		idiomHint:
			"Pass loop index and value into goroutine closures, use `defer wg.Done()`, and wait on the WaitGroup before returning shared slice results.",
		tests: [
			{
				title: "double small slice",
				body: `got := DoubleAll([]int{1, 2, 3})
if len(got) != 3 || got[0] != 2 || got[2] != 6 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "empty slice",
				body: `got := DoubleAll([]int{})
if len(got) != 0 {
	panic("expected empty slice")
}`,
			},
			{
				title: "negative values",
				body: `got := DoubleAll([]int{-2, 0, 5})
if got[0] != -4 || got[1] != 0 || got[2] != 10 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "single element",
				body: `got := DoubleAll([]int{7})
if len(got) != 1 || got[0] != 14 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
		],
	},
	{
		title: "Channels",
		slug: "go-v2-channels",
		description: "Pipeline data between goroutines with channels.",
		content: lessonMarkdown({
			title: "Channels",
			objective:
				"Build a channel pipeline that filters even numbers from a stream.",
			body: `Channels connect goroutines. A simple pipeline sends inputs on one channel and reads filtered results on another:

\`\`\`go
src := make(chan int)
dst := make(chan int)

go func() {
	for n := range src {
		if n%2 == 0 {
			dst <- n
		}
	}
	close(dst)
}()
\`\`\`

Always close channels when producers finish.`,
			pitfalls: [
				"Deadlocking by ranging over a channel that nobody closes.",
				"Filtering in the main goroutine instead of using a pipeline stage.",
			],
			next: "Next you will decode JSON payloads into Go values.",
		}),
		taskTitle: "Filter Even",
		taskPrompt:
			"Implement `FilterEven(nums []int) []int` using a channel pipeline with at least one worker goroutine that passes only even numbers through.",
		taskExamples: `- \`FilterEven([]int{1, 2, 3, 4})\` → \`[]int{2, 4}\`
- \`FilterEven([]int{1, 3})\` → empty slice`,
		taskRequirements: [
			"Use channels to move data between goroutines.",
			"Preserve relative order of even values.",
		],
		starterCode: `package main

func FilterEven(nums []int) []int {
	// TODO: implement
	return nil
}`,
		solutionCode: `package main

func FilterEven(nums []int) []int {
	src := make(chan int)
	dst := make(chan int)

	go func() {
		for _, n := range nums {
			src <- n
		}
		close(src)
	}()

	go func() {
		for n := range src {
			if n%2 == 0 {
				dst <- n
			}
		}
		close(dst)
	}()

	var result []int
	for n := range dst {
		result = append(result, n)
	}
	return result
}`,
		idiomHint:
			"Close channels from the sending side when done and range over the output channel; separate producer, filter, and collector stages for clarity.",
		tests: [
			{
				title: "mixed values",
				body: `got := FilterEven([]int{1, 2, 3, 4})
if len(got) != 2 || got[0] != 2 || got[1] != 4 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "no evens",
				body: `got := FilterEven([]int{1, 3, 5})
if len(got) != 0 {
	panic(fmt.Sprintf("expected empty, got %v", got))
}`,
			},
			{
				title: "all evens",
				body: `got := FilterEven([]int{2, 4, 6})
if len(got) != 3 || got[2] != 6 {
	panic(fmt.Sprintf("unexpected %v", got))
}`,
			},
			{
				title: "empty input",
				body: `got := FilterEven([]int{})
if len(got) != 0 {
	panic(fmt.Sprintf("expected empty, got %v", got))
}`,
			},
		],
	},
	{
		title: "JSON",
		slug: "go-v2-json",
		description: "Decode JSON strings with encoding/json.",
		content: lessonMarkdown({
			title: "JSON",
			objective: "Unmarshal JSON objects into struct fields using struct tags.",
			body: `The \`encoding/json\` package maps JSON keys to struct fields:

\`\`\`go
var payload struct {
	Name string \`json:"name"\`
	Age  int    \`json:"age"\`
}
if err := json.Unmarshal([]byte(jsonStr), &payload); err != nil {
	return "", 0, err
}
\`\`\`

Return parsed fields and the unmarshal error to callers.`,
			pitfalls: [
				"Forgetting struct tags so JSON keys do not bind to fields.",
				"Unmarshaling into a value instead of a pointer.",
			],
			next: "Next you will write pure helpers suited for table-driven tests.",
		}),
		taskTitle: "Parse User",
		taskPrompt:
			'Implement `ParseUser(jsonStr string) (name string, age int, err error)` for payloads like `{"name":"Ada","age":36}`.',
		taskExamples: `- \`ParseUser('{"name":"Ada","age":36}')\` → \`("Ada", 36, nil)\`
- invalid JSON returns a non-nil error`,
		taskRequirements: [
			"Use `encoding/json` to decode the payload.",
			"Return zero values and the unmarshal error on failure.",
		],
		starterCode: `package main

import "encoding/json"

func ParseUser(jsonStr string) (name string, age int, err error) {
	// TODO: implement
	return "", 0, nil
}`,
		solutionCode: [
			"package main",
			"",
			'import "encoding/json"',
			"",
			"func ParseUser(jsonStr string) (name string, age int, err error) {",
			"\tvar data struct {",
			'\t\tName string `json:"name"`',
			'\t\tAge  int    `json:"age"`',
			"\t}",
			"\tif err := json.Unmarshal([]byte(jsonStr), &data); err != nil {",
			'\t\treturn "", 0, err',
			"\t}",
			"\treturn data.Name, data.Age, nil",
			"}",
		].join("\n"),
		idiomHint:
			"Use struct tags for JSON field names and unmarshal into a pointer; return decoder errors unchanged instead of wrapping unless adding context.",
		tests: [
			{
				title: "valid user",
				body: 'name, age, err := ParseUser(`{"name":"Ada","age":36}`)\nif err != nil || name != "Ada" || age != 36 {\n\tpanic(fmt.Sprintf("unexpected %q,%d,%v", name, age, err))\n}',
			},
			{
				title: "zero age allowed",
				body: 'name, age, err := ParseUser(`{"name":"Baby","age":0}`)\nif err != nil || name != "Baby" || age != 0 {\n\tpanic("zero age should parse")\n}',
			},
			{
				title: "invalid json",
				body: `_, _, err := ParseUser("{not json")
if err == nil {
	panic("expected unmarshal error")
}`,
			},
			{
				title: "extra fields ignored",
				body: 'name, age, err := ParseUser(`{"name":"Lin","age":22,"role":"admin"}`)\nif err != nil || name != "Lin" || age != 22 {\n\tpanic("extra fields should be ignored")\n}',
			},
		],
	},
	{
		title: "Testing Style",
		slug: "go-v2-testing-style",
		description: "Write small pure functions that are easy to test.",
		content: lessonMarkdown({
			title: "Testing Style",
			objective:
				"Implement deterministic helpers with clear edge-case behavior suitable for table-driven tests.",
			body: `Go's testing package shines with table-driven cases. Pure functions like absolute value are ideal building blocks:

\`\`\`go
func Abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
\`\`\`

Keep branches explicit for boundary values like zero.`,
			pitfalls: [
				"Using math.Abs with float conversions when an int helper is enough.",
				"Forgetting that the minimum int value negation overflows — handle if required by scope.",
			],
			next: "Next you will combine string parsing and maps in a capstone exercise.",
		}),
		taskTitle: "Absolute Value",
		taskPrompt:
			"Implement `Abs(n int) int` that returns the non-negative magnitude of `n`.",
		taskExamples: `- \`Abs(-8)\` → \`8\`
- \`Abs(0)\` → \`0\``,
		taskRequirements: [
			"Return `n` unchanged when it is already non-negative.",
			"Return `-n` when `n` is negative.",
		],
		starterCode: `package main

func Abs(n int) int {
	// TODO: implement
	return 0
}`,
		solutionCode: `package main

func Abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}`,
		idiomHint:
			"Keep pure helpers branch-simple for table-driven tests; compare signs explicitly instead of relying on math package conversions.",
		tests: [
			{
				title: "negative input",
				body: `if Abs(-8) != 8 {
	panic("expected 8")
}`,
			},
			{
				title: "zero",
				body: `if Abs(0) != 0 {
	panic("expected 0")
}`,
			},
			{
				title: "positive unchanged",
				body: `if Abs(5) != 5 {
	panic("expected 5")
}`,
			},
			{
				title: "large negative",
				body: `if Abs(-1000) != 1000 {
	panic("expected 1000")
}`,
			},
		],
	},
	{
		title: "Capstone: Log Stats",
		slug: "go-v2-capstone",
		description: "Parse log lines and aggregate level counts.",
		content: lessonMarkdown({
			title: "Capstone: Log Stats",
			objective:
				"Combine string parsing, maps, and defensive handling to summarize log levels.",
			body: `Each log line follows \`LEVEL message\`. Count recognized levels into a map:

\`\`\`go
stats := map[string]int{"INFO": 0, "WARN": 0, "ERROR": 0}
fields := strings.Fields(line)
level := strings.ToUpper(fields[0])
\`\`\`

Skip malformed lines instead of crashing.`,
			pitfalls: [
				"Counting unknown levels — only INFO, WARN, and ERROR belong in the result.",
				"Assuming every line has two fields; guard with `len(fields) < 2`.",
			],
			next: "Congratulations — you have completed the Go fundamentals track. Apply these patterns in services, CLI tools, and concurrent backends.",
		}),
		taskTitle: "Parse Log Stats",
		taskPrompt:
			'Implement `ParseLogStats(lines []string) map[string]int` counting `INFO`, `WARN`, and `ERROR` lines formatted as `"LEVEL message"`.',
		taskExamples: `lines := []string{"INFO started", "WARN slow", "ERROR fail", "INFO done"}
ParseLogStats(lines)
// map[string]int{"INFO": 2, "WARN": 1, "ERROR": 1}`,
		taskRequirements: [
			"Initialize counts for INFO, WARN, and ERROR to zero.",
			"Ignore blank or malformed lines without panicking.",
		],
		starterCode: `package main

import "strings"

func ParseLogStats(lines []string) map[string]int {
	// TODO: implement
	return nil
}`,
		solutionCode: `package main

import "strings"

func ParseLogStats(lines []string) map[string]int {
	stats := map[string]int{
		"INFO":  0,
		"WARN":  0,
		"ERROR": 0,
	}
	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		level := strings.ToUpper(fields[0])
		if _, ok := stats[level]; ok {
			stats[level]++
		}
	}
	return stats
}`,
		idiomHint:
			"Use strings.Fields and map lookup with comma ok idiom to ignore unknown levels; pre-seed result keys so callers always see consistent level names.",
		tests: [
			{
				title: "mixed log lines",
				body: `stats := ParseLogStats([]string{"INFO started", "WARN slow", "ERROR fail", "INFO done"})
if stats["INFO"] != 2 || stats["WARN"] != 1 || stats["ERROR"] != 1 {
	panic(fmt.Sprintf("unexpected stats %v", stats))
}`,
			},
			{
				title: "empty lines skipped",
				body: `stats := ParseLogStats([]string{"", "INFO ok", "   "})
if stats["INFO"] != 1 || stats["WARN"] != 0 {
	panic(fmt.Sprintf("unexpected stats %v", stats))
}`,
			},
			{
				title: "unknown levels ignored",
				body: `stats := ParseLogStats([]string{"DEBUG detail", "INFO ok"})
if stats["INFO"] != 1 || stats["ERROR"] != 0 {
	panic(fmt.Sprintf("unexpected stats %v", stats))
}`,
			},
			{
				title: "case insensitive level",
				body: `stats := ParseLogStats([]string{"warn low memory", "error disk full"})
if stats["WARN"] != 1 || stats["ERROR"] != 1 {
	panic(fmt.Sprintf("unexpected stats %v", stats))
}`,
			},
		],
	},
];

const lessons: LessonRow[] = lessonDefs.map((def, index) => {
	const n = index + 1;
	const lessonId = `lesson-go-v2-${pad(n)}`;
	return {
		id: lessonId,
		courseId: COURSE_ID,
		title: def.title,
		slug: def.slug,
		description: def.description,
		content: def.content,
		hasTask: true,
		sortOrder: n,
	};
});

const tasks: TaskRow[] = lessonDefs.map((def, index) => {
	const n = index + 1;
	return {
		id: `task-go-v2-${pad(n)}`,
		lessonId: `lesson-go-v2-${pad(n)}`,
		languageId: "go",
		description: taskSpec({
			title: def.taskTitle,
			prompt: def.taskPrompt,
			examples: def.taskExamples,
			requirements: def.taskRequirements,
			solution: def.solutionCode,
			lang: "go",
		}),
		starterCode: def.starterCode,
		solutionCode: def.solutionCode,
	};
});

const taskTests: TaskTestRow[] = lessonDefs.flatMap((def, index) => {
	const taskId = `task-go-v2-${pad(index + 1)}`;
	return def.tests.map((test, testIndex) => {
		const testIndexOneBased = testIndex + 1;
		if (def.useShapeTestSetup && testIndexOneBased > 1) {
			return goTestWithSetup(
				taskId,
				testIndexOneBased,
				test.title,
				shapeTestSetup,
				test.body
			);
		}
		return goTest(taskId, testIndexOneBased, test.title, test.body);
	});
});

const gradingCriteria: GradingCriteriaRow[] = lessonDefs.flatMap((def, index) =>
	defaultCriteria(`task-go-v2-${pad(index + 1)}`, def.idiomHint)
);

export const goSeed: CourseSeedBundle = {
	course: {
		id: COURSE_ID,
		languageId: "go",
		title: "Go Fundamentals",
		slug: "go-fundamentals-v2",
		shortDescription:
			"Master Go from syntax to concurrency with hands-on exercises.",
		description:
			"A comprehensive Go course covering types, control flow, structs, interfaces, slices, maps, errors, goroutines, channels, JSON, and practical parsing patterns. Each lesson pairs concise theory with a coding task validated by automated tests.",
		difficulty: "intermediate",
		estimatedHours: 28,
		sortOrder: 3,
		isPublished: true,
	},
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(goSeed);
