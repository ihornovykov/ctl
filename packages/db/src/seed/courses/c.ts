import { assertCourseBundle } from "../assert-seed";
import {
	cTest,
	defaultCriteria,
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

const COURSE_ID = "course-c-v2";
const pad = (n: number) => String(n).padStart(2, "0");

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
};

const lessonDefs: LessonDef[] = [
	{
		title: "Integers and Loops",
		slug: "c-v2-integers-loops",
		description: "Sum digits with modulo and loop control.",
		content: lessonMarkdown({
			title: "Integers and Loops",
			objective:
				"Write pure functions over integers using `for`/`while`, modulo, and integer division.",
			body: `C treats integers as value types. Use \`%\` for remainder and \`/\` for quotient when decomposing digits.

\`\`\`c
int sum_digits(int n) {
    if (n < 0) n = -n;
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}
\`\`\`

Keep functions free of I/O so automated tests can call them directly.`,
			pitfalls: [
				"Forgetting to handle negative inputs before the digit loop.",
				"Using floating-point math for digit extraction — stick to integers.",
			],
			next: "Compare multiple values with branching logic.",
		}),
		taskTitle: "Sum Digits",
		taskPrompt:
			"Implement `int sum_digits(int n)` that returns the sum of the decimal digits of `n`. Treat negative numbers by their absolute value.",
		taskExamples:
			"- sum_digits(123) returns 6\n- sum_digits(0) returns 0\n- sum_digits(-45) returns 9",
		taskRequirements: [
			"Use integer arithmetic only.",
			"Do not print from the function.",
		],
		starterCode: `int sum_digits(int n) {
    /* TODO: implement */
    return 0;
}`,
		solutionCode: `int sum_digits(int n) {
    if (n < 0) n = -n;
    int sum = 0;
    if (n == 0) return 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}`,
		idiomHint:
			"Prefer a tight loop with `/` and `%` over converting to strings; normalize sign once at the top.",
		tests: [
			{
				title: "multi-digit positive",
				body: `if (sum_digits(123) != 6) {
\tfprintf(stderr, "expected 6\\n");
\treturn 1;
}`,
			},
			{
				title: "zero",
				body: `if (sum_digits(0) != 0) {
\tfprintf(stderr, "expected 0\\n");
\treturn 1;
}`,
			},
			{
				title: "negative input",
				body: `if (sum_digits(-45) != 9) {
\tfprintf(stderr, "expected 9\\n");
\treturn 1;
}`,
			},
			{
				title: "single digit",
				body: `if (sum_digits(7) != 7) {
\tfprintf(stderr, "expected 7\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Conditionals",
		slug: "c-v2-conditionals",
		description: "Pick the maximum of three integers.",
		content: lessonMarkdown({
			title: "Conditionals",
			objective:
				"Express multi-branch decisions with `if`/`else` and comparison operators.",
			body: `C has no \`max\` built-in for three values — compare pairwise or track a running maximum.

\`\`\`c
int max_of_three(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}
\`\`\`

Early returns are fine when they reduce nesting without hiding side effects.`,
			pitfalls: [
				"Using assignment `=` instead of comparison `==` in conditions.",
				"Assuming argument order matters — the maximum is symmetric.",
			],
			next: "Build recursive algorithms over integers.",
		}),
		taskTitle: "Max of Three",
		taskPrompt:
			"Implement `int max_of_three(int a, int b, int c)` returning the largest of the three values.",
		taskExamples:
			"- max_of_three(1, 9, 3) returns 9\n- max_of_three(-1, -5, -2) returns -1",
		taskRequirements: [
			"Return one of the input values, not a computed average.",
			"Handle equal values correctly.",
		],
		starterCode: `int max_of_three(int a, int b, int c) {
    /* TODO: implement */
    return a;
}`,
		solutionCode: `int max_of_three(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}`,
		idiomHint:
			"Track a running maximum with two comparisons instead of nested ternaries for readability.",
		tests: [
			{
				title: "distinct values",
				body: `if (max_of_three(1, 9, 3) != 9) {
\tfprintf(stderr, "expected 9\\n");
\treturn 1;
}`,
			},
			{
				title: "all negative",
				body: `if (max_of_three(-1, -5, -2) != -1) {
\tfprintf(stderr, "expected -1\\n");
\treturn 1;
}`,
			},
			{
				title: "duplicates",
				body: `if (max_of_three(5, 5, 2) != 5) {
\tfprintf(stderr, "expected 5\\n");
\treturn 1;
}`,
			},
			{
				title: "max last",
				body: `if (max_of_three(1, 2, 3) != 3) {
\tfprintf(stderr, "expected 3\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Recursion",
		slug: "c-v2-recursion",
		description: "Compute factorial with a base case.",
		content: lessonMarkdown({
			title: "Recursion",
			objective:
				"Implement recursive functions with explicit base cases and valid input domains.",
			body: `Factorial grows quickly; for this exercise assume \`0 <= n <= 12\`.

\`\`\`c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
\`\`\`

Every recursive call must move toward the base case.`,
			pitfalls: [
				"Missing the `n == 0` base case.",
				"Infinite recursion when the decrement step is forgotten.",
			],
			next: "Mutate arrays in place with pointers.",
		}),
		taskTitle: "Factorial",
		taskPrompt:
			"Implement `int factorial(int n)` for non-negative `n`. Return `1` when `n` is `0` or `1`.",
		taskExamples: "- factorial(0) returns 1\n- factorial(5) returns 120",
		taskRequirements: [
			"Use recursion or an equivalent loop — both are acceptable.",
			"Assume `n` is non-negative for tests.",
		],
		starterCode: `int factorial(int n) {
    /* TODO: implement */
    return 1;
}`,
		solutionCode: `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
		idiomHint:
			"Keep the base case first; avoid redundant checks after an early return.",
		tests: [
			{
				title: "zero",
				body: `if (factorial(0) != 1) {
\tfprintf(stderr, "expected 1\\n");
\treturn 1;
}`,
			},
			{
				title: "five",
				body: `if (factorial(5) != 120) {
\tfprintf(stderr, "expected 120\\n");
\treturn 1;
}`,
			},
			{
				title: "one",
				body: `if (factorial(1) != 1) {
\tfprintf(stderr, "expected 1\\n");
\treturn 1;
}`,
			},
			{
				title: "small value",
				body: `if (factorial(3) != 6) {
\tfprintf(stderr, "expected 6\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Arrays In Place",
		slug: "c-v2-arrays-reverse",
		description: "Reverse an array using two-pointer technique.",
		content: lessonMarkdown({
			title: "Arrays In Place",
			objective:
				"Modify array elements through pointers without allocating a second buffer.",
			body: `Arrays decay to pointers when passed to functions. Track length explicitly.

\`\`\`c
void reverse_in_place(int *arr, int len) {
    for (int i = 0, j = len - 1; i < j; i++, j--) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
\`\`\`

The caller owns the storage; your function only rearranges elements.`,
			pitfalls: [
				"Off-by-one errors when `len` is 0 or 1.",
				"Returning a pointer to a local array — never do that.",
			],
			next: "Swap values through pointer parameters.",
		}),
		taskTitle: "Reverse In Place",
		taskPrompt:
			"Implement `void reverse_in_place(int *arr, int len)` that reverses the first `len` elements of `arr` in place.",
		taskExamples: "[1,2,3] becomes [3,2,1]; len 0 leaves the array unchanged",
		taskRequirements: [
			"Mutate `arr` directly; do not allocate a new array.",
			"Handle `len <= 1` as a no-op.",
		],
		starterCode: `void reverse_in_place(int *arr, int len) {
    /* TODO: implement */
    (void)arr;
    (void)len;
}`,
		solutionCode: `void reverse_in_place(int *arr, int len) {
    int i = 0;
    int j = len - 1;
    while (i < j) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
        j--;
    }
}`,
		idiomHint:
			"Use two indices converging at the center; cast unused parameters to void in stubs only.",
		tests: [
			{
				title: "odd length",
				body: `int arr[] = {1, 2, 3};
\treverse_in_place(arr, 3);
\tif (arr[0] != 3 || arr[1] != 2 || arr[2] != 1) {
\t\tfprintf(stderr, "reverse failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "even length",
				body: `int arr[] = {1, 2, 3, 4};
\treverse_in_place(arr, 4);
\tif (arr[0] != 4 || arr[3] != 1) {
\t\tfprintf(stderr, "reverse failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "single element",
				body: `int arr[] = {42};
\treverse_in_place(arr, 1);
\tif (arr[0] != 42) {
\t\tfprintf(stderr, "reverse failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "empty",
				body: `int dummy = 0;
\treverse_in_place(&dummy, 0);`,
			},
		],
	},
	{
		title: "Pointers Basics",
		slug: "c-v2-pointers-swap",
		description: "Swap integers through pointer parameters.",
		content: lessonMarkdown({
			title: "Pointers Basics",
			objective:
				"Dereference pointers to read and write caller-owned variables.",
			body: `Pass addresses when a function must mutate caller state.

\`\`\`c
void swap_ints(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}
\`\`\`

Check pointers for \`NULL\` only when the API contract requires it — not needed here.`,
			pitfalls: [
				"Swapping pointer addresses instead of the values they point to.",
				"Dereferencing uninitialized pointers.",
			],
			next: "Walk C strings character by character.",
		}),
		taskTitle: "Swap Ints",
		taskPrompt:
			"Implement `void swap_ints(int *a, int *b)` that exchanges the values at `a` and `b`.",
		taskExamples: "If x=1 and y=2, after swap_ints(&x, &y) then x=2 and y=1",
		taskRequirements: [
			"Use a temporary variable for the exchange.",
			"Assume `a` and `b` are non-null.",
		],
		starterCode: `void swap_ints(int *a, int *b) {
    /* TODO: implement */
    (void)a;
    (void)b;
}`,
		solutionCode: `void swap_ints(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}`,
		idiomHint:
			"Dereference with `*` on both read and write; keep swap logic symmetric and side-effect free beyond the two ints.",
		tests: [
			{
				title: "distinct values",
				body: `int x = 1, y = 2;
\tswap_ints(&x, &y);
\tif (x != 2 || y != 1) {
\t\tfprintf(stderr, "swap failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "equal values",
				body: `int x = 5, y = 5;
\tswap_ints(&x, &y);
\tif (x != 5 || y != 5) {
\t\tfprintf(stderr, "swap failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "negative numbers",
				body: `int x = -3, y = 10;
\tswap_ints(&x, &y);
\tif (x != 10 || y != -3) {
\t\tfprintf(stderr, "swap failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "zero swap",
				body: `int x = 0, y = 99;
\tswap_ints(&x, &y);
\tif (x != 99 || y != 0) {
\t\tfprintf(stderr, "swap failed\\n");
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "C Strings",
		slug: "c-v2-strings-vowels",
		description: "Count vowels in a null-terminated string.",
		content: lessonMarkdown({
			title: "C Strings",
			objective:
				"Iterate null-terminated `const char *` strings safely until `'\\0'`.",
			body: `C strings are char arrays ending with a null byte. Treat them as read-only with \`const char *\`.

\`\`\`c
int is_vowel(char c) {
    c = (char)tolower((unsigned char)c);
    return c=='a'||c=='e'||c=='i'||c=='o'||c=='u';
}
\`\`\`

Cast to \`unsigned char\` before \`tolower\` to avoid undefined behavior on negative \`char\` values.`,
			pitfalls: [
				"Assuming `char` is unsigned — it may be signed on some platforms.",
				"Forgetting that `NULL` is not the same as an empty string.",
			],
			next: "Grow dynamic buffers with `realloc`.",
		}),
		taskTitle: "Count Vowels",
		taskPrompt:
			"Implement `int count_vowels(const char *s)` returning the number of vowels (`a,e,i,o,u`) in `s`, case-insensitive. Return `0` when `s` is `NULL` or empty.",
		taskExamples:
			'- count_vowels("Hello") returns 2\n- count_vowels("") returns 0',
		taskRequirements: [
			"Include both uppercase and lowercase vowels.",
			"Do not modify the input string.",
		],
		starterCode: `#include <ctype.h>

int count_vowels(const char *s) {
    /* TODO: implement */
    (void)s;
    return 0;
}`,
		solutionCode: `#include <ctype.h>

int count_vowels(const char *s) {
    if (s == NULL) return 0;
    int count = 0;
    for (; *s != '\\0'; s++) {
        char c = (char)tolower((unsigned char)*s);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
    }
    return count;
}`,
		idiomHint:
			"Walk with pointer increment; use `<ctype.h>` helpers and `(unsigned char)` casts for portable character handling.",
		tests: [
			{
				title: "mixed case word",
				body: `if (count_vowels("Hello") != 2) {
\tfprintf(stderr, "expected 2\\n");
\treturn 1;
}`,
			},
			{
				title: "empty string",
				body: `if (count_vowels("") != 0) {
\tfprintf(stderr, "expected 0\\n");
\treturn 1;
}`,
			},
			{
				title: "null pointer",
				body: `if (count_vowels(NULL) != 0) {
\tfprintf(stderr, "expected 0\\n");
\treturn 1;
}`,
			},
			{
				title: "all vowels",
				body: `if (count_vowels("aeiouAEIOU") != 10) {
\tfprintf(stderr, "expected 10\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Dynamic Memory",
		slug: "c-v2-dynamic-append",
		description: "Append to a dynamically growing int array.",
		content: lessonMarkdown({
			title: "Dynamic Memory",
			objective:
				"Use `realloc` to grow heap arrays while updating length and capacity out-parameters.",
			body: `Dynamic arrays track \`len\` (used slots) and \`cap\` (allocated slots).

\`\`\`c
int append_to_array(int **arr, int *len, int *cap, int value) {
    if (*len >= *cap) {
        int new_cap = *cap == 0 ? 4 : *cap * 2;
        int *next = realloc(*arr, new_cap * sizeof(int));
        if (!next) return 0;
        *arr = next;
        *cap = new_cap;
    }
    (*arr)[(*len)++] = value;
    return 1;
}
\`\`\`

Return a status code so callers can detect allocation failure.`,
			pitfalls: [
				"Losing the old pointer when `realloc` fails — assign to a temporary first.",
				"Forgetting to double capacity or handle the initial `cap == 0` case.",
			],
			next: "Model small structs passed by value.",
		}),
		taskTitle: "Append To Array",
		taskPrompt:
			"Implement `int append_to_array(int **arr, int *len, int *cap, int value)`. Append `value` to the dynamic array, doubling capacity (starting at 4) when full. Return `1` on success and `0` if `realloc` fails.",
		taskExamples:
			"Starting with *arr=NULL, *len=0, *cap=0, append 10 then 20 yields [10, 20] with *len=2",
		taskRequirements: [
			"Use `realloc`; do not leak the previous pointer on failure.",
			"Update `*len` only after a successful append.",
		],
		starterCode: `#include <stdlib.h>

int append_to_array(int **arr, int *len, int *cap, int value) {
    /* TODO: implement */
    (void)arr;
    (void)len;
    (void)cap;
    (void)value;
    return 0;
}`,
		solutionCode: `#include <stdlib.h>

int append_to_array(int **arr, int *len, int *cap, int value) {
    if (*len >= *cap) {
        int new_cap = *cap == 0 ? 4 : *cap * 2;
        int *next = realloc(*arr, (size_t)new_cap * sizeof(int));
        if (next == NULL) return 0;
        *arr = next;
        *cap = new_cap;
    }
    (*arr)[*len] = value;
    (*len)++;
    return 1;
}`,
		idiomHint:
			"Assign `realloc` to a temporary pointer; grow geometrically; treat `NULL` initial array as empty with zero capacity.",
		tests: [
			{
				title: "first append",
				body: `#include <stdlib.h>
\tint *arr = NULL;
\tint len = 0, cap = 0;
\tif (!append_to_array(&arr, &len, &cap, 10)) {
\t\tfprintf(stderr, "append failed\\n");
\t\treturn 1;
\t}
\tif (len != 1 || arr[0] != 10) {
\t\tfprintf(stderr, "bad state\\n");
\t\tfree(arr);
\t\treturn 1;
\t}
\tfree(arr);`,
			},
			{
				title: "multiple appends",
				body: `#include <stdlib.h>
\tint *arr = NULL;
\tint len = 0, cap = 0;
\tappend_to_array(&arr, &len, &cap, 1);
\tappend_to_array(&arr, &len, &cap, 2);
\tappend_to_array(&arr, &len, &cap, 3);
\tif (len != 3 || arr[2] != 3) {
\t\tfprintf(stderr, "bad sequence\\n");
\t\tfree(arr);
\t\treturn 1;
\t}
\tfree(arr);`,
			},
			{
				title: "capacity growth",
				body: `#include <stdlib.h>
\tint *arr = NULL;
\tint len = 0, cap = 0;
\tfor (int i = 0; i < 5; i++) append_to_array(&arr, &len, &cap, i);
\tif (cap < 5 || len != 5) {
\t\tfprintf(stderr, "growth failed\\n");
\t\tfree(arr);
\t\treturn 1;
\t}
\tfree(arr);`,
			},
			{
				title: "values preserved",
				body: `#include <stdlib.h>
\tint *arr = NULL;
\tint len = 0, cap = 0;
\tappend_to_array(&arr, &len, &cap, 7);
\tappend_to_array(&arr, &len, &cap, 8);
\tif (arr[0] != 7 || arr[1] != 8) {
\t\tfprintf(stderr, "values wrong\\n");
\t\tfree(arr);
\t\treturn 1;
\t}
\tfree(arr);`,
			},
		],
	},
	{
		title: "Structs",
		slug: "c-v2-structs-point",
		description: "Compute Euclidean distance between two points.",
		content: lessonMarkdown({
			title: "Structs",
			objective:
				"Define aggregate types with `struct` and pass them by value to functions.",
			body: `A \`struct Point\` groups coordinates. Distance uses the Pythagorean theorem.

\`\`\`c
struct Point { double x; double y; };

double point_distance(struct Point p1, struct Point p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return sqrt(dx * dx + dy * dy);
}
\`\`\`

Include \`<math.h>\` and link with \`-lm\` (handled by the runner).`,
			pitfalls: [
				"Using `int` math and losing precision for diagonal distances.",
				"Forgetting `#include <math.h>` for `sqrt`.",
			],
			next: "Sort arrays with `qsort` and comparators.",
		}),
		taskTitle: "Point Distance",
		taskPrompt:
			"Given `struct Point { double x; double y; };`, implement `double point_distance(struct Point p1, struct Point p2)` returning the Euclidean distance between the two points.",
		taskExamples: "Point (0,0) to (3,4) returns 5.0",
		taskRequirements: [
			"Use `sqrt` from `<math.h>`.",
			"Return a non-negative `double`.",
		],
		starterCode: `#include <math.h>

struct Point {
    double x;
    double y;
};

double point_distance(struct Point p1, struct Point p2) {
    /* TODO: implement */
    (void)p1;
    (void)p2;
    return 0.0;
}`,
		solutionCode: `#include <math.h>

struct Point {
    double x;
    double y;
};

double point_distance(struct Point p1, struct Point p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return sqrt(dx * dx + dy * dy);
}`,
		idiomHint:
			"Pass small structs by value; compute deltas before squaring to keep the formula readable.",
		tests: [
			{
				title: "3-4-5 triangle",
				body: `struct Point a = {0, 0};
\tstruct Point b = {3, 4};
\tif (point_distance(a, b) < 4.99 || point_distance(a, b) > 5.01) {
\t\tfprintf(stderr, "expected 5\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "same point",
				body: `struct Point p = {2, 2};
\tif (point_distance(p, p) > 0.001) {
\t\tfprintf(stderr, "expected 0\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "horizontal",
				body: `struct Point a = {1, 1};
\tstruct Point b = {4, 1};
\tif (point_distance(a, b) < 2.99 || point_distance(a, b) > 3.01) {
\t\tfprintf(stderr, "expected 3\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "negative coords",
				body: `struct Point a = {-1, -1};
\tstruct Point b = {2, 3};
\tdouble d = point_distance(a, b);
\tif (d < 4.9 || d > 5.2) {
\t\tfprintf(stderr, "unexpected distance\\n");
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "qsort and Comparators",
		slug: "c-v2-qsort",
		description: "Sort an integer array with a custom comparator.",
		content: lessonMarkdown({
			title: "qsort and Comparators",
			objective:
				"Use `qsort` with a comparator obeying the strict weak ordering contract.",
			body: `\`qsort\` expects a comparator returning negative, zero, or positive.

\`\`\`c
int compare_ints(const void *a, const void *b) {
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);
}

void sort_ints(int *arr, int len) {
    qsort(arr, (size_t)len, sizeof(int), compare_ints);
}
\`\`\`

Cast \`void *\` parameters to the element type inside the comparator.`,
			pitfalls: [
				"Returning `a - b` directly — overflow risk for large integers.",
				"Using the wrong element size in `qsort`.",
			],
			next: "Organize related functions in one translation unit.",
		}),
		taskTitle: "Sort With Comparator",
		taskPrompt:
			"Implement `int compare_ints(const void *a, const void *b)` and `void sort_ints(int *arr, int len)` where `sort_ints` sorts ascending using `qsort`.",
		taskExamples: "[3,1,2] becomes [1,2,3]",
		taskRequirements: [
			"Comparator must be safe for all `int` values.",
			"No-op when `len <= 1`.",
		],
		starterCode: `#include <stdlib.h>

int compare_ints(const void *a, const void *b) {
    /* TODO: implement */
    (void)a;
    (void)b;
    return 0;
}

void sort_ints(int *arr, int len) {
    /* TODO: implement */
    (void)arr;
    (void)len;
}`,
		solutionCode: `#include <stdlib.h>

int compare_ints(const void *a, const void *b) {
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);
}

void sort_ints(int *arr, int len) {
    if (len <= 1) return;
    qsort(arr, (size_t)len, sizeof(int), compare_ints);
}`,
		idiomHint:
			"Compare via `(ia > ib) - (ia < ib)`; cast `void *` to `const int *` before dereferencing.",
		tests: [
			{
				title: "unsorted triple",
				body: `int arr[] = {3, 1, 2};
\tsort_ints(arr, 3);
\tif (arr[0] != 1 || arr[1] != 2 || arr[2] != 3) {
\t\tfprintf(stderr, "sort failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "already sorted",
				body: `int arr[] = {1, 2, 3};
\tsort_ints(arr, 3);
\tif (arr[0] != 1 || arr[2] != 3) {
\t\tfprintf(stderr, "sort failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "duplicates",
				body: `int arr[] = {2, 2, 1};
\tsort_ints(arr, 3);
\tif (arr[0] != 1 || arr[1] != 2 || arr[2] != 2) {
\t\tfprintf(stderr, "sort failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "single element",
				body: `int arr[] = {42};
\tsort_ints(arr, 1);
\tif (arr[0] != 42) {
\t\tfprintf(stderr, "sort failed\\n");
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Multi-Function Files",
		slug: "c-v2-math-utils",
		description: "Provide small math helpers in one module.",
		content: lessonMarkdown({
			title: "Multi-Function Files",
			objective: "Group related functions that share no global mutable state.",
			body: `Real C files expose multiple functions with clear names.

\`\`\`c
int math_add(int a, int b) { return a + b; }
int math_multiply(int a, int b) { return a * b; }
\`\`\`

Keep helpers pure — no hidden static buffers unless documented.`,
			pitfalls: [
				"Using global variables when parameters suffice.",
				"Inconsistent naming making discovery harder.",
			],
			next: "Manipulate individual bits with masks.",
		}),
		taskTitle: "Math Utils",
		taskPrompt:
			"Implement `int math_add(int a, int b)` and `int math_multiply(int a, int b)` returning the sum and product respectively.",
		taskExamples:
			"- math_add(2, 3) returns 5\n- math_multiply(4, 5) returns 20",
		taskRequirements: [
			"Both functions must be side-effect free.",
			"Handle negative operands correctly.",
		],
		starterCode: `int math_add(int a, int b) {
    /* TODO: implement */
    (void)a;
    (void)b;
    return 0;
}

int math_multiply(int a, int b) {
    /* TODO: implement */
    (void)a;
    (void)b;
    return 0;
}`,
		solutionCode: `int math_add(int a, int b) {
    return a + b;
}

int math_multiply(int a, int b) {
    return a * b;
}`,
		idiomHint:
			"Keep one function per responsibility; prefix with a module name to avoid linker clashes.",
		tests: [
			{
				title: "add positive",
				body: `if (math_add(2, 3) != 5) {
\tfprintf(stderr, "add failed\\n");
\treturn 1;
}`,
			},
			{
				title: "multiply basic",
				body: `if (math_multiply(4, 5) != 20) {
\tfprintf(stderr, "multiply failed\\n");
\treturn 1;
}`,
			},
			{
				title: "add negatives",
				body: `if (math_add(-2, -3) != -5) {
\tfprintf(stderr, "add failed\\n");
\treturn 1;
}`,
			},
			{
				title: "multiply by zero",
				body: `if (math_multiply(99, 0) != 0) {
\tfprintf(stderr, "multiply failed\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Bit Manipulation",
		slug: "c-v2-bit-ops",
		description: "Set and clear bits with masks.",
		content: lessonMarkdown({
			title: "Bit Manipulation",
			objective: "Use bitwise OR, AND, and NOT to update flags in an integer.",
			body: `Bit \`n\` corresponds to mask \`1u << n\`.

\`\`\`c
unsigned set_bit(unsigned value, int bit) {
    return value | (1u << bit);
}

unsigned clear_bit(unsigned value, int bit) {
    return value & ~(1u << bit);
}
\`\`\`

Use \`unsigned\` for flag words to avoid sign-extension surprises.`,
			pitfalls: [
				"Shifting by negative or overly large bit indices — assume valid tests.",
				"Using decimal literals instead of unsigned masks.",
			],
			next: "Insert into a sorted linked list.",
		}),
		taskTitle: "Set and Clear Bit",
		taskPrompt:
			"Implement `unsigned set_bit(unsigned value, int bit)` and `unsigned clear_bit(unsigned value, int bit)`. Bit indices are 0-based from the least significant bit.",
		taskExamples: "set_bit(0, 2) returns 4; clear_bit(7, 0) returns 6",
		taskRequirements: [
			"Do not mutate global state.",
			"Return the updated flag word.",
		],
		starterCode: `unsigned set_bit(unsigned value, int bit) {
    /* TODO: implement */
    (void)bit;
    return value;
}

unsigned clear_bit(unsigned value, int bit) {
    /* TODO: implement */
    (void)bit;
    return value;
}`,
		solutionCode: `unsigned set_bit(unsigned value, int bit) {
    return value | (1u << bit);
}

unsigned clear_bit(unsigned value, int bit) {
    return value & ~(1u << bit);
}`,
		idiomHint:
			"Use `1u << bit` masks; combine with `|` to set and `& ~mask` to clear without branches.",
		tests: [
			{
				title: "set bit 2",
				body: `if (set_bit(0, 2) != 4) {
\tfprintf(stderr, "set failed\\n");
\treturn 1;
}`,
			},
			{
				title: "clear bit 0",
				body: `if (clear_bit(7, 0) != 6) {
\tfprintf(stderr, "clear failed\\n");
\treturn 1;
}`,
			},
			{
				title: "set already set",
				body: `if (set_bit(5, 0) != 5) {
\tfprintf(stderr, "set failed\\n");
\treturn 1;
}`,
			},
			{
				title: "clear middle bit",
				body: `if (clear_bit(14, 1) != 12) {
\tfprintf(stderr, "clear failed\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Linked Lists",
		slug: "c-v2-linked-list",
		description: "Insert into a sorted singly linked list.",
		content: lessonMarkdown({
			title: "Linked Lists",
			objective:
				"Allocate nodes with `malloc` and splice them into ordered singly linked lists.",
			body: `Maintain a head pointer and insert before the first larger value.

\`\`\`c
struct Node {
    int value;
    struct Node *next;
};

struct Node *sorted_list_insert(struct Node *head, int value) {
    struct Node *node = malloc(sizeof *node);
    node->value = value;
    node->next = NULL;
    if (!head || value < head->value) {
        node->next = head;
        return node;
    }
    struct Node *cur = head;
    while (cur->next && cur->next->value < value) {
        cur = cur->next;
    }
    node->next = cur->next;
    cur->next = node;
    return head;
}
\`\`\`

Tests will free the list — focus on correct ordering.`,
			pitfalls: [
				"Losing the head pointer when inserting at the front.",
				"Not handling an empty list (`head == NULL`).",
			],
			next: "Validate bracket nesting in strings.",
		}),
		taskTitle: "Sorted List Insert",
		taskPrompt:
			"Given `struct Node { int value; struct Node *next; };`, implement `struct Node *sorted_list_insert(struct Node *head, int value)` that inserts `value` into a singly linked list sorted in ascending order and returns the (possibly new) head.",
		taskExamples: "Insert 2 into list 1 -> 3 yields 1 -> 2 -> 3",
		taskRequirements: [
			"Allocate each new node with `malloc`.",
			"Preserve ascending order.",
		],
		starterCode: `#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

struct Node *sorted_list_insert(struct Node *head, int value) {
    /* TODO: implement */
    (void)head;
    (void)value;
    return NULL;
}`,
		solutionCode: `#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

struct Node *sorted_list_insert(struct Node *head, int value) {
    struct Node *node = malloc(sizeof *node);
    if (node == NULL) {
        return head;
    }
    node->value = value;
    node->next = NULL;

    if (head == NULL || value < head->value) {
        node->next = head;
        return node;
    }

    struct Node *cur = head;
    while (cur->next != NULL && cur->next->value < value) {
        cur = cur->next;
    }
    node->next = cur->next;
    cur->next = node;
    return head;
}`,
		idiomHint:
			"Return the new head when inserting at front; walk with a trailing pointer for interior inserts.",
		tests: [
			{
				title: "insert into empty",
				body: `#include <stdlib.h>
\tstruct Node *head = sorted_list_insert(NULL, 5);
\tif (head == NULL || head->value != 5 || head->next != NULL) {
\t\tfprintf(stderr, "insert failed\\n");
\t\tfree(head);
\t\treturn 1;
\t}
\tfree(head);`,
			},
			{
				title: "insert at front",
				body: `#include <stdlib.h>
\tstruct Node *n = malloc(sizeof *n);
\tn->value = 3;
\tn->next = NULL;
\tstruct Node *head = sorted_list_insert(n, 1);
\tif (head->value != 1 || head->next->value != 3) {
\t\tfprintf(stderr, "order wrong\\n");
\t\tfree(head->next);
\t\tfree(head);
\t\treturn 1;
\t}
\tfree(head->next);
\tfree(head);`,
			},
			{
				title: "insert middle",
				body: `#include <stdlib.h>
\tstruct Node *a = malloc(sizeof *a);
\tstruct Node *b = malloc(sizeof *b);
\ta->value = 1;
\tb->value = 3;
\ta->next = b;
\tb->next = NULL;
\tstruct Node *head = sorted_list_insert(a, 2);
\tif (head->value != 1 || head->next->value != 2 || head->next->next->value != 3) {
\t\tfprintf(stderr, "order wrong\\n");
\t\twhile (head) {
\t\t\tstruct Node *t = head->next;
\t\t\tfree(head);
\t\t\thead = t;
\t\t}
\t\treturn 1;
\t}
\twhile (head) {
\t\tstruct Node *t = head->next;
\t\tfree(head);
\t\thead = t;
\t}`,
			},
			{
				title: "insert at end",
				body: `#include <stdlib.h>
\tstruct Node *a = malloc(sizeof *a);
\ta->value = 1;
\ta->next = NULL;
\tstruct Node *head = sorted_list_insert(a, 9);
\tif (head->next == NULL || head->next->value != 9) {
\t\tfprintf(stderr, "tail insert failed\\n");
\t\tfree(head->next);
\t\tfree(head);
\t\treturn 1;
\t}
\tfree(head->next);
\tfree(head);`,
			},
		],
	},
	{
		title: "Stack Parsing",
		slug: "c-v2-brackets",
		description: "Check balanced brackets with depth counters.",
		content: lessonMarkdown({
			title: "Stack Parsing",
			objective:
				"Validate nested `()`, `[]`, and `{}` using per-family depth counters.",
			body: `Track opening symbols and reject mismatches immediately.

\`\`\`c
int bracket_matcher(const char *s) {
    int round = 0, square = 0, curl = 0;
    for (; *s; s++) {
        if (*s == '(') round++;
        else if (*s == ')') { if (--round < 0) return 0; }
        /* handle [], {} similarly */
    }
    return round == 0 && square == 0 && curl == 0;
}
\`\`\`

Return 1 for balanced strings, 0 otherwise.`,
			pitfalls: [
				"Only counting total opens vs closes — nesting order matters.",
				"Ignoring unrelated characters — they should be skipped.",
			],
			next: "Scan multiline text for line counts.",
		}),
		taskTitle: "Bracket Matcher",
		taskPrompt:
			"Implement `int bracket_matcher(const char *s)` returning `1` if brackets are balanced and `0` otherwise. Only consider `()`, `[]`, and `{}`. Ignore all other characters. Treat `NULL` as balanced.",
		taskExamples: "([{}]) returns 1; (] returns 0",
		taskRequirements: [
			"Reject closing brackets without a matching opener.",
			"Return 1 for empty and NULL input.",
		],
		starterCode: `int bracket_matcher(const char *s) {
    /* TODO: implement */
    (void)s;
    return 0;
}`,
		solutionCode: `int bracket_matcher(const char *s) {
    if (s == NULL) return 1;
    int round = 0, square = 0, curl = 0;
    for (; *s != '\\0'; s++) {
        if (*s == '(') round++;
        else if (*s == ')') { if (--round < 0) return 0; }
        else if (*s == '[') square++;
        else if (*s == ']') { if (--square < 0) return 0; }
        else if (*s == '{') curl++;
        else if (*s == '}') { if (--curl < 0) return 0; }
    }
    return round == 0 && square == 0 && curl == 0;
}`,
		idiomHint:
			"Use separate depth counters per bracket family; fail fast on negative depth.",
		tests: [
			{
				title: "nested balanced",
				body: `if (!bracket_matcher("([{}])")) {
\tfprintf(stderr, "expected balanced\\n");
\treturn 1;
}`,
			},
			{
				title: "mismatch",
				body: `if (bracket_matcher("(]")) {
\tfprintf(stderr, "expected unbalanced\\n");
\treturn 1;
}`,
			},
			{
				title: "null balanced",
				body: `if (!bracket_matcher(NULL)) {
\tfprintf(stderr, "null should be balanced\\n");
\treturn 1;
}`,
			},
			{
				title: "ignore other chars",
				body: `if (!bracket_matcher("a(b)c")) {
\tfprintf(stderr, "expected balanced\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Text Processing",
		slug: "c-v2-count-lines",
		description: "Count newline-separated lines in text.",
		content: lessonMarkdown({
			title: "Text Processing",
			objective: "Scan multiline C strings and treat `\\n` as line separators.",
			body: `A line is terminated by \`\\n\`. Trailing text without a newline still counts as one line if non-empty.

\`\`\`c
int count_lines(const char *text) {
    if (!text || !*text) return 0;
    int lines = 1;
    for (; *text; text++) {
        if (*text == '\\n') lines++;
    }
    return lines;
}
\`\`\`

Empty string has zero lines; a single newline alone is one line.`,
			pitfalls: [
				"Off-by-one when text lacks a trailing newline.",
				"Counting `\\r\\n` as two lines — tests use Unix newlines only.",
			],
			next: "Build a phonebook lookup capstone.",
		}),
		taskTitle: "Count Lines",
		taskPrompt:
			"Implement `int count_lines(const char *text)` returning the number of lines. Lines are separated by `'\\n'`. Return `0` for `NULL` or empty strings.",
		taskExamples: "a\\nb has 2 lines; empty string has 0 lines",
		taskRequirements: [
			"Do not allocate memory.",
			"Count non-empty single-line text as one line.",
		],
		starterCode: `int count_lines(const char *text) {
    /* TODO: implement */
    (void)text;
    return 0;
}`,
		solutionCode: `int count_lines(const char *text) {
    if (text == NULL || *text == '\\0') return 0;
    int lines = 1;
    for (; *text != '\\0'; text++) {
        if (*text == '\\n') lines++;
    }
    return lines;
}`,
		idiomHint:
			"Start at one line when text is non-empty; increment on each `\\n` character.",
		tests: [
			{
				title: "two lines",
				body: `if (count_lines("a\\nb") != 2) {
\tfprintf(stderr, "expected 2\\n");
\treturn 1;
}`,
			},
			{
				title: "empty",
				body: `if (count_lines("") != 0) {
\tfprintf(stderr, "expected 0\\n");
\treturn 1;
}`,
			},
			{
				title: "single line",
				body: `if (count_lines("hello") != 1) {
\tfprintf(stderr, "expected 1\\n");
\treturn 1;
}`,
			},
			{
				title: "null",
				body: `if (count_lines(NULL) != 0) {
\tfprintf(stderr, "expected 0\\n");
\treturn 1;
}`,
			},
		],
	},
	{
		title: "Phonebook Capstone",
		slug: "c-v2-phonebook",
		description: "Find contacts by exact name match.",
		content: lessonMarkdown({
			title: "Phonebook Capstone",
			objective:
				"Combine structs, string comparison, and array iteration in a small lookup API.",
			body: `Model contacts and search by exact name.

\`\`\`c
struct Contact {
    const char *name;
    const char *phone;
};

const char *find_contact(struct Contact *book, int count, const char *name) {
    for (int i = 0; i < count; i++) {
        if (strcmp(book[i].name, name) == 0) {
            return book[i].phone;
        }
    }
    return NULL;
}
\`\`\`

Return \`NULL\` when no contact matches — callers distinguish missing entries from empty strings.`,
			pitfalls: [
				"Using pointer comparison instead of `strcmp` for name equality.",
				"Reading past the array when `count` is wrong.",
			],
			next: "You completed the C fundamentals track — explore systems programming and the C++ course next.",
		}),
		taskTitle: "Find Contact",
		taskPrompt:
			"Given `struct Contact { const char *name; const char *phone; };`, implement `const char *find_contact(struct Contact *book, int count, const char *name)` returning the phone number for an exact name match, or `NULL` if not found.",
		taskExamples:
			"book with Ada/555-0100; find_contact for Ada returns 555-0100",
		taskRequirements: [
			"Use `strcmp` from `<string.h>`.",
			"Do not modify the book array.",
		],
		starterCode: `#include <string.h>

struct Contact {
    const char *name;
    const char *phone;
};

const char *find_contact(struct Contact *book, int count, const char *name) {
    /* TODO: implement */
    (void)book;
    (void)count;
    (void)name;
    return NULL;
}`,
		solutionCode: `#include <string.h>

struct Contact {
    const char *name;
    const char *phone;
};

const char *find_contact(struct Contact *book, int count, const char *name) {
    for (int i = 0; i < count; i++) {
        if (strcmp(book[i].name, name) == 0) {
            return book[i].phone;
        }
    }
    return NULL;
}`,
		idiomHint:
			"Linear scan with `strcmp`; return the stored phone pointer on success without copying strings.",
		tests: [
			{
				title: "find existing",
				body: `#include <string.h>
\tstruct Contact book[] = {{"Ada", "555-0100"}, {"Bob", "555-0200"}};
\tconst char *phone = find_contact(book, 2, "Ada");
\tif (phone == NULL || strcmp(phone, "555-0100") != 0) {
\t\tfprintf(stderr, "lookup failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "missing contact",
				body: `#include <string.h>
\tstruct Contact book[] = {{"Ada", "555-0100"}};
\tif (find_contact(book, 1, "Zed") != NULL) {
\t\tfprintf(stderr, "expected NULL\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "second entry",
				body: `#include <string.h>
\tstruct Contact book[] = {{"Ada", "555-0100"}, {"Bob", "555-0200"}};
\tconst char *phone = find_contact(book, 2, "Bob");
\tif (phone == NULL || strcmp(phone, "555-0200") != 0) {
\t\tfprintf(stderr, "lookup failed\\n");
\t\treturn 1;
\t}`,
			},
			{
				title: "empty book",
				body: `if (find_contact(NULL, 0, "Ada") != NULL) {
\tfprintf(stderr, "expected NULL\\n");
\treturn 1;
}`,
			},
		],
	},
];

const lessons: LessonRow[] = lessonDefs.map((def, index) => {
	const n = index + 1;
	return {
		id: `lesson-c-v2-${pad(n)}`,
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
		id: `task-c-v2-${pad(n)}`,
		lessonId: `lesson-c-v2-${pad(n)}`,
		languageId: "c",
		description: taskSpec({
			title: def.taskTitle,
			prompt: def.taskPrompt,
			examples: def.taskExamples,
			requirements: def.taskRequirements,
			solution: def.solutionCode,
			lang: "c",
		}),
		starterCode: def.starterCode,
		solutionCode: def.solutionCode,
	};
});

const taskTests: TaskTestRow[] = lessonDefs.flatMap((def, index) => {
	const taskId = `task-c-v2-${pad(index + 1)}`;
	return def.tests.map((test, testIndex) =>
		cTest(taskId, testIndex + 1, test.title, test.body)
	);
});

const gradingCriteria: GradingCriteriaRow[] = lessonDefs.flatMap((def, index) =>
	defaultCriteria(`task-c-v2-${pad(index + 1)}`, def.idiomHint)
);

export const cSeed: CourseSeedBundle = {
	course: {
		id: COURSE_ID,
		languageId: "c",
		title: "C Fundamentals",
		slug: "c-fundamentals-v2",
		shortDescription:
			"Master C from pointers to structs, memory, and text processing.",
		description:
			"A hands-on C course covering integers, pointers, arrays, dynamic memory, structs, qsort, linked lists, bit manipulation, and practical string parsing. Each lesson pairs concise theory with a function-based coding task validated by automated tests — no student main function required.",
		difficulty: "intermediate",
		estimatedHours: 30,
		sortOrder: 5,
		isPublished: true,
	},
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(cSeed);
