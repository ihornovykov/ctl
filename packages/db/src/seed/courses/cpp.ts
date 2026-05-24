import { assertCourseBundle } from "../assert-seed";
import {
	cppTest,
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

const COURSE_ID = "course-cpp-v2";
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
		title: "std::string Basics",
		slug: "cpp-v2-string-vowels",
		description: "Count vowels in a std::string.",
		content: lessonMarkdown({
			title: "std::string Basics",
			objective:
				"Use `std::string`, range-friendly loops, and `<cctype>` helpers.",
			body: `\`std::string\` owns its buffer and exposes \`.size()\` and indexed access.

\`\`\`cpp
#include <string>
#include <cctype>

int countVowels(const std::string& s) {
    int count = 0;
    for (char ch : s) {
        char c = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u') count++;
    }
    return count;
}
\`\`\`

Take strings by \`const std::string&\` to avoid copies.`,
			pitfalls: [
				"Using C string functions on `std::string` without `.c_str()` when unnecessary.",
				"Forgetting unsigned char cast before `tolower`.",
			],
			next: "Swap values with references.",
		}),
		taskTitle: "Count Vowels",
		taskPrompt:
			"Implement `int countVowels(const std::string& s)` returning the number of vowels, case-insensitive.",
		taskExamples: `- \`countVowels("Hello")\` → \`2\`
- \`countVowels("")\` → \`0\``,
		taskRequirements: [
			"Use `std::string` — not C strings.",
			"Include `<string>` and `<cctype>`.",
		],
		starterCode: `#include <string>
#include <cctype>

int countVowels(const std::string& s) {
    // TODO: implement
    (void)s;
    return 0;
}`,
		solutionCode: `#include <string>
#include <cctype>

int countVowels(const std::string& s) {
    int count = 0;
    for (char ch : s) {
        char c = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
    }
    return count;
}`,
		idiomHint:
			"Prefer range-for over index loops; pass strings by const reference.",
		tests: [
			{
				title: "mixed case",
				body: `if (countVowels("Hello") != 2) {
\tstd::cerr << "expected 2\\n";
\treturn 1;
}`,
			},
			{
				title: "empty",
				body: `if (countVowels("") != 0) {
\tstd::cerr << "expected 0\\n";
\treturn 1;
}`,
			},
			{
				title: "all vowels",
				body: `if (countVowels("aeiouAEIOU") != 10) {
\tstd::cerr << "expected 10\\n";
\treturn 1;
}`,
			},
			{
				title: "no vowels",
				body: `if (countVowels("xyz") != 0) {
\tstd::cerr << "expected 0\\n";
\treturn 1;
}`,
			},
		],
	},
	{
		title: "References",
		slug: "cpp-v2-references-swap",
		description: "Swap integers using references.",
		content: lessonMarkdown({
			title: "References",
			objective: "Use C++ references as aliases for caller-owned variables.",
			body: `References must bind to existing objects and cannot be reassigned to refer elsewhere.

\`\`\`cpp
void swap_values(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}
\`\`\`

Prefer references over pointers when null is not part of the API.`,
			pitfalls: [
				"Returning a reference to a local variable.",
				"Using references where optional absence requires pointers or std::optional.",
			],
			next: "Dedupe sorted vector elements in place.",
		}),
		taskTitle: "Swap Values",
		taskPrompt:
			"Implement `void swap_values(int& a, int& b)` exchanging the two integers.",
		taskExamples: "swap_values(x, y) swaps the contents of x and y in place.",
		taskRequirements: [
			"Use references, not pointers.",
			"Do not return a value.",
		],
		starterCode: `void swap_values(int& a, int& b) {
    // TODO: implement
    (void)a;
    (void)b;
}`,
		solutionCode: `void swap_values(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}`,
		idiomHint:
			"Use a temporary for exchange; references make call sites cleaner than pointer syntax.",
		tests: [
			{
				title: "basic swap",
				body: `int x = 1, y = 2;
\tswap_values(x, y);
\tif (x != 2 || y != 1) {
\t\tstd::cerr << "swap failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "equal values",
				body: `int x = 5, y = 5;
\tswap_values(x, y);
\tif (x != 5 || y != 5) {
\t\tstd::cerr << "swap failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "negatives",
				body: `int x = -1, y = 10;
\tswap_values(x, y);
\tif (x != 10 || y != -1) {
\t\tstd::cerr << "swap failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "zero",
				body: `int x = 0, y = 42;
\tswap_values(x, y);
\tif (x != 42 || y != 0) {
\t\tstd::cerr << "swap failed\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "std::vector",
		slug: "cpp-v2-vector-dedupe",
		description: "Remove duplicates from a sorted vector.",
		content: lessonMarkdown({
			title: "std::vector",
			objective: "Use `std::vector` algorithms to compact containers in place.",
			body: `When data is sorted, unique consecutive duplicates sit next to each other.

\`\`\`cpp
#include <vector>
#include <algorithm>

void removeDuplicates(std::vector<int>& nums) {
    auto end = std::unique(nums.begin(), nums.end());
    nums.erase(end, nums.end());
}
\`\`\`

Assume input is sorted ascending for this exercise.`,
			pitfalls: [
				"Calling `unique` without sorting first on unsorted input.",
				"Forgetting to erase the trailing duplicate slots.",
			],
			next: "Split strings into tokens.",
		}),
		taskTitle: "Remove Duplicates",
		taskPrompt:
			"Implement `void removeDuplicates(std::vector<int>& nums)` removing consecutive duplicates from a **sorted** vector in place.",
		taskExamples: "[1,1,2,3,3] becomes [1,2,3] after removeDuplicates runs.",
		taskRequirements: [
			"Mutate `nums` in place.",
			"Preserve relative order of remaining elements.",
		],
		starterCode: `#include <vector>
#include <algorithm>

void removeDuplicates(std::vector<int>& nums) {
    // TODO: implement
    (void)nums;
}`,
		solutionCode: `#include <vector>
#include <algorithm>

void removeDuplicates(std::vector<int>& nums) {
    auto end = std::unique(nums.begin(), nums.end());
    nums.erase(end, nums.end());
}`,
		idiomHint:
			"Combine `std::unique` with `erase` for the erase-remove idiom on sorted vectors.",
		tests: [
			{
				title: "basic dedupe",
				body: `std::vector<int> v = {1, 1, 2, 3, 3};
\tremoveDuplicates(v);
\tif (v.size() != 3 || v[0] != 1 || v[2] != 3) {
\t\tstd::cerr << "dedupe failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "no duplicates",
				body: `std::vector<int> v = {1, 2, 3};
\tremoveDuplicates(v);
\tif (v.size() != 3) {
\t\tstd::cerr << "size changed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "all same",
				body: `std::vector<int> v = {7, 7, 7};
\tremoveDuplicates(v);
\tif (v.size() != 1 || v[0] != 7) {
\t\tstd::cerr << "dedupe failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty",
				body: `std::vector<int> v;
\tremoveDuplicates(v);
\tif (!v.empty()) {
\t\tstd::cerr << "expected empty\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "String Tokenizing",
		slug: "cpp-v2-split-tokens",
		description: "Split a string on a delimiter.",
		content: lessonMarkdown({
			title: "String Tokenizing",
			objective:
				"Parse `std::string` with `find` and `substr` without manual C buffers.",
			body: `Scan for delimiter positions and push substrings into a vector.

\`\`\`cpp
std::vector<std::string> splitTokens(const std::string& s, char delim) {
    std::vector<std::string> out;
    std::size_t start = 0;
    while (start <= s.size()) {
        auto pos = s.find(delim, start);
        if (pos == std::string::npos) {
            out.push_back(s.substr(start));
            break;
        }
        out.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    return out;
}
\`\`\`

Empty segments appear when delimiters are adjacent — preserve them.`,
			pitfalls: [
				"Off-by-one when advancing past the delimiter.",
				"Returning dangling references to temporary strings.",
			],
			next: "Build a small RAII string buffer class.",
		}),
		taskTitle: "Split Tokens",
		taskPrompt:
			"Implement `std::vector<std::string> splitTokens(const std::string& s, char delim)` splitting `s` on every `delim` character.",
		taskExamples:
			'splitTokens("a,b,c", \',\') returns three tokens: "a", "b", "c".',
		taskRequirements: [
			"Return by value — RVO applies.",
			"Include `<string>` and `<vector>`.",
		],
		starterCode: `#include <string>
#include <vector>

std::vector<std::string> splitTokens(const std::string& s, char delim) {
    // TODO: implement
    (void)s;
    (void)delim;
    return {};
}`,
		solutionCode: `#include <string>
#include <vector>

std::vector<std::string> splitTokens(const std::string& s, char delim) {
    std::vector<std::string> out;
    std::size_t start = 0;
    while (true) {
        std::size_t pos = s.find(delim, start);
        if (pos == std::string::npos) {
            out.push_back(s.substr(start));
            break;
        }
        out.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    return out;
}`,
		idiomHint:
			"Use `find`/`substr`; loop until npos; return vector by value for clarity.",
		tests: [
			{
				title: "comma separated",
				body: `auto parts = splitTokens("a,b,c", ',');
\tif (parts.size() != 3 || parts[1] != "b") {
\t\tstd::cerr << "split failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "single token",
				body: `auto parts = splitTokens("solo", ',');
\tif (parts.size() != 1 || parts[0] != "solo") {
\t\tstd::cerr << "split failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty pieces",
				body: `auto parts = splitTokens("a,,b", ',');
\tif (parts.size() != 3 || parts[1] != "") {
\t\tstd::cerr << "split failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "space delim",
				body: `auto parts = splitTokens("hi there", ' ');
\tif (parts.size() != 2 || parts[0] != "hi") {
\t\tstd::cerr << "split failed\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "RAII String Buffer",
		slug: "cpp-v2-string-buffer",
		description: "Build a minimal append-only string buffer class.",
		content: lessonMarkdown({
			title: "RAII String Buffer",
			objective:
				"Encapsulate a `std::string` with methods and a C-string accessor.",
			body: `RAII ties resource lifetime to object lifetime — here the owned string cleans itself up.

\`\`\`cpp
class StringBuffer {
    std::string data_;
public:
    StringBuffer& append(const std::string& s) {
        data_ += s;
        return *this;
    }
    const char* cstr() const { return data_.c_str(); }
    std::size_t size() const { return data_.size(); }
};
\`\`\`

Return \`*this\` from \`append\` for optional chaining.`,
			pitfalls: [
				"Returning `c_str()` of a temporary StringBuffer.",
				"Exposing non-const `c_str()` that allows mutation bypass.",
			],
			next: "Model rectangles with a class.",
		}),
		taskTitle: "StringBuffer",
		taskPrompt:
			"Implement class `StringBuffer` with `append(const std::string& s)` returning `StringBuffer&`, `const char* cstr() const`, and `std::size_t size() const`.",
		taskExamples:
			'StringBuffer buf; buf.append("hi").append("!"); buf.cstr() yields "hi!".',
		taskRequirements: [
			"Store text in a private `std::string` member.",
			"`cstr()` must remain valid until the next mutating call.",
		],
		starterCode: `#include <string>

class StringBuffer {
public:
    StringBuffer& append(const std::string& s) {
        // TODO: implement
        (void)s;
        return *this;
    }

    const char* cstr() const {
        // TODO: implement
        return "";
    }

    std::size_t size() const {
        // TODO: implement
        return 0;
    }

private:
    std::string data_;
};`,
		solutionCode: `#include <string>

class StringBuffer {
public:
    StringBuffer& append(const std::string& s) {
        data_ += s;
        return *this;
    }

    const char* cstr() const {
        return data_.c_str();
    }

    std::size_t size() const {
        return data_.size();
    }

private:
    std::string data_;
};`,
		idiomHint:
			"Keep storage private; delegate to std::string; return *this for fluent append.",
		tests: [
			{
				title: "append and cstr",
				body: `StringBuffer buf;
\tbuf.append("hi").append("!");
\tif (std::string(buf.cstr()) != "hi!") {
\t\tstd::cerr << "buffer mismatch\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "size tracks length",
				body: `StringBuffer buf;
\tbuf.append("abc");
\tif (buf.size() != 3) {
\t\tstd::cerr << "size wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty buffer",
				body: `StringBuffer buf;
\tif (buf.size() != 0 || std::string(buf.cstr()) != "") {
\t\tstd::cerr << "empty buffer wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "chained append",
				body: `StringBuffer buf;
\tbuf.append("a").append("b").append("c");
\tif (buf.size() != 3) {
\t\tstd::cerr << "chain failed\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Classes and Methods",
		slug: "cpp-v2-rectangle",
		description: "Compute rectangle area with a member function.",
		content: lessonMarkdown({
			title: "Classes and Methods",
			objective:
				"Define a class with constructor, private fields, and const methods.",
			body: `\`const\` member functions promise not to mutate observable state.

\`\`\`cpp
class Rectangle {
    double width_;
    double height_;
public:
    Rectangle(double w, double h) : width_(w), height_(h) {}
    double area() const { return width_ * height_; }
};
\`\`\`

Initialize members in the constructor initializer list when possible.`,
			pitfalls: [
				"Forgetting `const` on accessors that should work for const objects.",
				"Public data members when invariants need protection.",
			],
			next: "Apply the rule of zero with std::vector storage.",
		}),
		taskTitle: "Rectangle Area",
		taskPrompt:
			"Implement class `Rectangle` constructed with `(double width, double height)` and `double area() const`.",
		taskExamples: "Rectangle(3, 4).area() returns 12.",
		taskRequirements: [
			"Width and height must be private.",
			"`area()` must be `const`.",
		],
		starterCode: `class Rectangle {
public:
    Rectangle(double width, double height)
        : width_(width), height_(height) {}

    double area() const {
        // TODO: implement
        return 0.0;
    }

private:
    double width_;
    double height_;
};`,
		solutionCode: `class Rectangle {
public:
    Rectangle(double width, double height)
        : width_(width), height_(height) {}

    double area() const {
        return width_ * height_;
    }

private:
    double width_;
    double height_;
};`,
		idiomHint:
			"Use initializer lists; mark observers const; keep dimensions private.",
		tests: [
			{
				title: "3 by 4",
				body: `Rectangle r(3, 4);
\tif (r.area() < 11.9 || r.area() > 12.1) {
\t\tstd::cerr << "area wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "square",
				body: `Rectangle r(5, 5);
\tif (r.area() < 24.9 || r.area() > 25.1) {
\t\tstd::cerr << "area wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "unit rectangle",
				body: `Rectangle r(1, 1);
\tif (r.area() < 0.9 || r.area() > 1.1) {
\t\tstd::cerr << "area wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "const object",
				body: `const Rectangle r(2, 6);
\tif (r.area() < 11.9 || r.area() > 12.1) {
\t\tstd::cerr << "const area wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Rule of Zero",
		slug: "cpp-v2-simple-buffer",
		description: "Wrap std::vector with value semantics.",
		content: lessonMarkdown({
			title: "Rule of Zero",
			objective:
				"Let compiler-generated special members handle RAII when a class owns only RAII types.",
			body: `If every member already manages its resources (\`std::vector\`), you often need no custom destructor.

\`\`\`cpp
class SimpleBuffer {
    std::vector<int> data_;
public:
    void push(int value) { data_.push_back(value); }
    int sum() const {
        int total = 0;
        for (int v : data_) total += v;
        return total;
    }
    std::size_t size() const { return data_.size(); }
};
\`\`\`

This is the **rule of zero** — avoid writing five special functions unless necessary.`,
			pitfalls: [
				"Raw owning pointers without custom special members.",
				"Mixing manual delete with std::vector in the same class.",
			],
			next: "Write a function template returning std::pair.",
		}),
		taskTitle: "SimpleBuffer",
		taskPrompt:
			"Implement class `SimpleBuffer` with `void push(int value)`, `int sum() const`, and `std::size_t size() const` backed by `std::vector<int>`.",
		taskExamples: "push 1, 2, 3 → sum() == 6 and size() == 3.",
		taskRequirements: [
			"Do not use raw `new`/`delete`.",
			"Follow the rule of zero.",
		],
		starterCode: `#include <vector>
#include <cstddef>

class SimpleBuffer {
public:
    void push(int value) {
        // TODO: implement
        (void)value;
    }

    int sum() const {
        // TODO: implement
        return 0;
    }

    std::size_t size() const {
        // TODO: implement
        return 0;
    }

private:
    std::vector<int> data_;
};`,
		solutionCode: `#include <vector>
#include <cstddef>

class SimpleBuffer {
public:
    void push(int value) {
        data_.push_back(value);
    }

    int sum() const {
        int total = 0;
        for (int v : data_) {
            total += v;
        }
        return total;
    }

    std::size_t size() const {
        return data_.size();
    }

private:
    std::vector<int> data_;
};`,
		idiomHint:
			"Delegate storage to std::vector; let the compiler generate copy/move/destructor.",
		tests: [
			{
				title: "sum after pushes",
				body: `SimpleBuffer buf;
\tbuf.push(1);
\tbuf.push(2);
\tbuf.push(3);
\tif (buf.sum() != 6 || buf.size() != 3) {
\t\tstd::cerr << "buffer wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty sum",
				body: `SimpleBuffer buf;
\tif (buf.sum() != 0 || buf.size() != 0) {
\t\tstd::cerr << "empty wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "negatives",
				body: `SimpleBuffer buf;
\tbuf.push(-2);
\tbuf.push(5);
\tif (buf.sum() != 3) {
\t\tstd::cerr << "sum wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "size tracks pushes",
				body: `SimpleBuffer buf;
\tbuf.push(10);
\tbuf.push(20);
\tif (buf.size() != 2) {
\t\tstd::cerr << "size wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Templates",
		slug: "cpp-v2-min-max",
		description: "Generic min/max returning std::pair.",
		content: lessonMarkdown({
			title: "Templates",
			objective:
				"Write function templates deducing types and returning structured results.",
			body: `\`std::pair\` groups two related values with type safety.

\`\`\`cpp
#include <utility>
#include <vector>

template <typename T>
std::pair<T, T> minMax(const std::vector<T>& values) {
    T lo = values.front();
    T hi = values.front();
    for (const T& v : values) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
    }
    return {lo, hi};
}
\`\`\`

Templates live in headers — here the whole solution is one file.`,
			pitfalls: [
				"Using `T` without requiring comparability — assume tests use ordered types.",
				"Undefined behavior on empty vectors — assume non-empty input.",
			],
			next: "Use `<algorithm>` with custom predicates.",
		}),
		taskTitle: "Min Max Template",
		taskPrompt:
			"Implement `template <typename T> std::pair<T, T> minMax(const std::vector<T>& values)` returning the minimum and maximum. Assume `values` is non-empty.",
		taskExamples: "{3,1,4} becomes {1,4}.",
		taskRequirements: [
			"Single pass over the vector.",
			"Include `<utility>` and `<vector>`.",
		],
		starterCode: `#include <utility>
#include <vector>

template <typename T>
std::pair<T, T> minMax(const std::vector<T>& values) {
    // TODO: implement
    (void)values;
    return {T{}, T{}};
}`,
		solutionCode: `#include <utility>
#include <vector>

template <typename T>
std::pair<T, T> minMax(const std::vector<T>& values) {
    T lo = values.front();
    T hi = values.front();
    for (const T& v : values) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
    }
    return {lo, hi};
}`,
		idiomHint:
			"Initialize both extrema from front(); use brace return for pair; keep template in header-style single file.",
		tests: [
			{
				title: "ints",
				body: `auto mm = minMax(std::vector<int>{3, 1, 4});
\tif (mm.first != 1 || mm.second != 4) {
\t\tstd::cerr << "minMax failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "single element",
				body: `auto mm = minMax(std::vector<int>{7});
\tif (mm.first != 7 || mm.second != 7) {
\t\tstd::cerr << "minMax failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "negatives",
				body: `auto mm = minMax(std::vector<int>{-5, -1, -9});
\tif (mm.first != -9 || mm.second != -1) {
\t\tstd::cerr << "minMax failed\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "doubles",
				body: `auto mm = minMax(std::vector<double>{1.5, 0.5, 2.5});
\tif (mm.first > 0.51 || mm.first < 0.49 || mm.second < 2.4) {
\t\tstd::cerr << "minMax failed\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Algorithms",
		slug: "cpp-v2-count-if-positive",
		description: "Count positive elements with std::count_if.",
		content: lessonMarkdown({
			title: "Algorithms",
			objective:
				"Compose `<algorithm>` with lambdas for readable vector processing.",
			body: `\`std::count_if\` applies a predicate and returns a count.

\`\`\`cpp
#include <algorithm>
#include <vector>

int countIfPositive(const std::vector<int>& values) {
    return static_cast<int>(std::count_if(values.begin(), values.end(),
        [](int v) { return v > 0; }));
}
\`\`\`

Lambdas keep predicates local and capture-free here.`,
			pitfalls: [
				"Counting `>= 0` when the task asks for strictly positive.",
				"Signed/unsigned mismatches when returning counts.",
			],
			next: "Aggregate inventory counts with std::map.",
		}),
		taskTitle: "Count If Positive",
		taskPrompt:
			"Implement `int countIfPositive(const std::vector<int>& values)` returning how many elements are **strictly greater than zero**.",
		taskExamples: "[-1, 0, 2, 3] yields a count of 2.",
		taskRequirements: [
			"Use `std::count_if` from `<algorithm>`.",
			"Zero is not positive.",
		],
		starterCode: `#include <vector>
#include <algorithm>

int countIfPositive(const std::vector<int>& values) {
    // TODO: implement
    (void)values;
    return 0;
}`,
		solutionCode: `#include <vector>
#include <algorithm>

int countIfPositive(const std::vector<int>& values) {
    return static_cast<int>(std::count_if(
        values.begin(), values.end(),
        [](int v) { return v > 0; }));
}`,
		idiomHint:
			"Prefer std algorithms over manual loops; use static_cast when narrowing from size_t.",
		tests: [
			{
				title: "mixed signs",
				body: `if (countIfPositive({-1, 0, 2, 3}) != 2) {
\tstd::cerr << "count wrong\\n";
\treturn 1;
}`,
			},
			{
				title: "all non-positive",
				body: `if (countIfPositive({0, -1, -2}) != 0) {
\tstd::cerr << "count wrong\\n";
\treturn 1;
}`,
			},
			{
				title: "all positive",
				body: `if (countIfPositive({1, 2, 3}) != 3) {
\tstd::cerr << "count wrong\\n";
\treturn 1;
}`,
			},
			{
				title: "empty",
				body: `if (countIfPositive({}) != 0) {
\tstd::cerr << "count wrong\\n";
\treturn 1;
}`,
			},
		],
	},
	{
		title: "std::map",
		slug: "cpp-v2-inventory-count",
		description: "Count SKU occurrences into a map.",
		content: lessonMarkdown({
			title: "std::map",
			objective:
				"Build frequency tables with `std::map` and sorted key iteration.",
			body: `\`std::map\` keeps keys ordered and default-constructs values on first access.

\`\`\`cpp
#include <map>
#include <string>
#include <vector>

std::map<std::string, int> inventoryCount(const std::vector<std::string>& skus) {
    std::map<std::string, int> counts;
    for (const std::string& sku : skus) {
        counts[sku]++;
    }
    return counts;
}
\`\`\`

Use \`operator[]\` or \`.at\` depending on whether missing keys should insert.`,
			pitfalls: [
				"Using `operator[]` on const maps — it is not available.",
				"Forgetting that map iteration is sorted by key.",
			],
			next: "Express exclusive ownership with std::unique_ptr.",
		}),
		taskTitle: "Inventory Count",
		taskPrompt:
			"Implement `std::map<std::string, int> inventoryCount(const std::vector<std::string>& skus)` returning how many times each SKU appears.",
		taskExamples:
			'inventoryCount({"bolt","bolt","nut"}) maps "bolt" to 2 and "nut" to 1.',
		taskRequirements: [
			"Return a new map — do not mutate the input vector.",
			"Include `<map>`, `<string>`, and `<vector>`.",
		],
		starterCode: `#include <map>
#include <string>
#include <vector>

std::map<std::string, int> inventoryCount(const std::vector<std::string>& skus) {
    // TODO: implement
    (void)skus;
    return {};
}`,
		solutionCode: `#include <map>
#include <string>
#include <vector>

std::map<std::string, int> inventoryCount(const std::vector<std::string>& skus) {
    std::map<std::string, int> counts;
    for (const std::string& sku : skus) {
        counts[sku]++;
    }
    return counts;
}`,
		idiomHint:
			"Use counts[sku]++ for frequency maps; return by value and let RVO elide copies.",
		tests: [
			{
				title: "duplicate skus",
				body: `auto counts = inventoryCount({"bolt", "bolt", "nut"});
\tif (counts["bolt"] != 2 || counts["nut"] != 1) {
\t\tstd::cerr << "counts wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty input",
				body: `auto counts = inventoryCount({});
\tif (!counts.empty()) {
\t\tstd::cerr << "expected empty map\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "single sku",
				body: `auto counts = inventoryCount({"gear"});
\tif (counts["gear"] != 1) {
\t\tstd::cerr << "count wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "three distinct",
				body: `auto counts = inventoryCount({"a", "b", "c"});
\tif (counts.size() != 3 || counts["b"] != 1) {
\t\tstd::cerr << "counts wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Smart Pointers",
		slug: "cpp-v2-make-widget",
		description: "Factory returning std::unique_ptr.",
		content: lessonMarkdown({
			title: "Smart Pointers",
			objective:
				"Return exclusive ownership with `std::unique_ptr` and `std::make_unique`.",
			body: `\`std::unique_ptr\` expresses single ownership without manual delete.

\`\`\`cpp
#include <memory>
#include <string>

struct Widget {
    int id;
    std::string label;
};

std::unique_ptr<Widget> makeWidget(int id, const std::string& label) {
    return std::make_unique<Widget>(Widget{id, label});
}
\`\`\`

Prefer \`make_unique\` over \`new\` for exception safety and clarity.`,
			pitfalls: [
				"Returning raw pointers from factories — callers cannot tell who owns memory.",
				"Copying a unique_ptr — move instead.",
			],
			next: "Sort with a custom lambda comparator.",
		}),
		taskTitle: "Make Widget",
		taskPrompt:
			"Define `struct Widget { int id; std::string label; }` and implement `std::unique_ptr<Widget> makeWidget(int id, const std::string& label)`.",
		taskExamples:
			'makeWidget(1, "gear") returns a Widget with id 1 and label gear.',
		taskRequirements: [
			"Use `std::make_unique`.",
			"Include `<memory>` and `<string>`.",
		],
		starterCode: `#include <memory>
#include <string>

struct Widget {
    int id;
    std::string label;
};

std::unique_ptr<Widget> makeWidget(int id, const std::string& label) {
    // TODO: implement
    (void)id;
    (void)label;
    return nullptr;
}`,
		solutionCode: `#include <memory>
#include <string>

struct Widget {
    int id;
    std::string label;
};

std::unique_ptr<Widget> makeWidget(int id, const std::string& label) {
    return std::make_unique<Widget>(Widget{id, label});
}`,
		idiomHint:
			"Return unique_ptr from factories; prefer make_unique over naked new/delete.",
		tests: [
			{
				title: "fields set",
				body: `auto w = makeWidget(1, "gear");
\tif (!w || w->id != 1 || w->label != "gear") {
\t\tstd::cerr << "widget wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "unique ownership",
				body: `auto w = makeWidget(42, "bolt");
\tif (!w) {
\t\tstd::cerr << "null widget\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty label",
				body: `auto w = makeWidget(0, "");
\tif (!w || w->label != "") {
\t\tstd::cerr << "label wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "negative id allowed",
				body: `auto w = makeWidget(-1, "test");
\tif (!w || w->id != -1) {
\t\tstd::cerr << "id wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Lambdas",
		slug: "cpp-v2-sort-by-length",
		description: "Sort strings by length with a lambda.",
		content: lessonMarkdown({
			title: "Lambdas",
			objective:
				"Pass lambdas to `<algorithm>` for custom ordering without named functors.",
			body: `\`std::sort\` accepts a comparator callable. Capture nothing when comparing by size alone.

\`\`\`cpp
#include <algorithm>
#include <string>
#include <vector>

void sortByLength(std::vector<std::string>& words) {
    std::sort(words.begin(), words.end(),
        [](const std::string& a, const std::string& b) {
            return a.size() < b.size();
        });
}
\`\`\`

Sort in place unless the task asks for a copy.`,
			pitfalls: [
				"Using `<` on strings when the task asks for length order.",
				"Unstable expectations — std::sort is not stable; use stable_sort if ties must preserve order.",
			],
			next: "Represent missing values with std::optional.",
		}),
		taskTitle: "Sort By Length",
		taskPrompt:
			"Implement `void sortByLength(std::vector<std::string>& words)` sorting ascending by string length.",
		taskExamples: 'sortByLength puts "a" before "longer".',
		taskRequirements: [
			"Mutate `words` in place.",
			"Use `std::sort` with a lambda.",
		],
		starterCode: `#include <algorithm>
#include <string>
#include <vector>

void sortByLength(std::vector<std::string>& words) {
    // TODO: implement
    (void)words;
}`,
		solutionCode: `#include <algorithm>
#include <string>
#include <vector>

void sortByLength(std::vector<std::string>& words) {
    std::sort(words.begin(), words.end(),
        [](const std::string& a, const std::string& b) {
            return a.size() < b.size();
        });
}`,
		idiomHint:
			"Keep lambdas short for std::sort; compare sizes, not lexicographic order.",
		tests: [
			{
				title: "ascending lengths",
				body: `std::vector<std::string> words = {"ccc", "a", "bb"};
\tsortByLength(words);
\tif (words[0] != "a" || words[2] != "ccc") {
\t\tstd::cerr << "sort wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "already sorted",
				body: `std::vector<std::string> words = {"a", "bb"};
\tsortByLength(words);
\tif (words[0] != "a" || words[1] != "bb") {
\t\tstd::cerr << "sort wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "empty vector",
				body: `std::vector<std::string> words;
\tsortByLength(words);
\tif (!words.empty()) {
\t\tstd::cerr << "expected empty\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "equal lengths",
				body: `std::vector<std::string> words = {"ab", "cd"};
\tsortByLength(words);
\tif (words.size() != 2 || words[0].size() != 2) {
\t\tstd::cerr << "sort wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "std::optional",
		slug: "cpp-v2-optional-double",
		description: "Parse strings into optional doubles.",
		content: lessonMarkdown({
			title: "std::optional",
			objective:
				"Return `std::optional<double>` when parsing may fail instead of sentinel values.",
			body: `C++17 \`std::optional\` models a value that may be absent.

\`\`\`cpp
#include <optional>
#include <string>

std::optional<double> optionalDouble(const std::string& text) {
    try {
        std::size_t idx = 0;
        double value = std::stod(text, &idx);
        if (idx != text.size()) return std::nullopt;
        return value;
    } catch (...) {
        return std::nullopt;
    }
}
\`\`\`

Reject trailing junk after a valid number.`,
			pitfalls: [
				"Using `-1` or `NaN` sentinels when optional expresses intent better.",
				"Calling `.value()` without checking `.has_value()`.",
			],
			next: "Return vectors efficiently with move semantics.",
		}),
		taskTitle: "Optional Double",
		taskPrompt:
			"Implement `std::optional<double> optionalDouble(const std::string& text)` returning a parsed double or `std::nullopt` on failure.",
		taskExamples:
			'optionalDouble("3.14") returns 3.14; optionalDouble("abc") returns nullopt.',
		taskRequirements: [
			"Use `std::stod` or equivalent parsing.",
			"Reject strings with trailing non-whitespace after the number.",
		],
		starterCode: `#include <optional>
#include <string>

std::optional<double> optionalDouble(const std::string& text) {
    // TODO: implement
    (void)text;
    return std::nullopt;
}`,
		solutionCode: `#include <optional>
#include <string>

std::optional<double> optionalDouble(const std::string& text) {
    try {
        std::size_t idx = 0;
        double value = std::stod(text, &idx);
        if (idx != text.size()) {
            return std::nullopt;
        }
        return value;
    } catch (...) {
        return std::nullopt;
    }
}`,
		idiomHint:
			"Return std::nullopt on parse failure; avoid exceptions leaking to callers by catching locally.",
		tests: [
			{
				title: "valid double",
				body: `auto v = optionalDouble("3.14");
\tif (!v || *v < 3.13 || *v > 3.15) {
\t\tstd::cerr << "parse wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "invalid text",
				body: `if (optionalDouble("abc")) {
\t\tstd::cerr << "expected nullopt\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "trailing junk rejected",
				body: `if (optionalDouble("12px")) {
\t\tstd::cerr << "expected nullopt\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "integer string",
				body: `auto v = optionalDouble("42");
\tif (!v || *v < 41.9 || *v > 42.1) {
\t\tstd::cerr << "parse wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Move Semantics",
		slug: "cpp-v2-return-vector",
		description: "Return vectors using move and RVO.",
		content: lessonMarkdown({
			title: "Move Semantics",
			objective:
				"Return large containers by value and rely on move elision instead of manual copies.",
			body: `Returning a local \`std::vector\` triggers **RVO** or a move in C++17.

\`\`\`cpp
#include <vector>

std::vector<int> returnVector() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    return data;
}
\`\`\`

Do not \`std::move\` locals on return — it can pessimise elision.`,
			pitfalls: [
				"Returning references to locals.",
				"Overusing std::move on return statements.",
			],
			next: "Combine classes and maps in a grade-book capstone.",
		}),
		taskTitle: "Return Vector",
		taskPrompt:
			"Implement `std::vector<int> returnVector()` returning `[1, 2, 3, 4, 5]` using a local vector and return-by-value.",
		taskExamples: "returnVector() yields five elements ending at 5.",
		taskRequirements: [
			"Do not take parameters.",
			"Return exactly the sequence 1 through 5.",
		],
		starterCode: `#include <vector>

std::vector<int> returnVector() {
    // TODO: implement
    return {};
}`,
		solutionCode: `#include <vector>

std::vector<int> returnVector() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    return data;
}`,
		idiomHint:
			"Return locals by value; trust RVO/move instead of manual new/delete or std::move on return.",
		tests: [
			{
				title: "size five",
				body: `auto v = returnVector();
\tif (v.size() != 5) {
\t\tstd::cerr << "size wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "first element",
				body: `auto v = returnVector();
\tif (v.empty() || v[0] != 1) {
\t\tstd::cerr << "first wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "last element",
				body: `auto v = returnVector();
\tif (v.back() != 5) {
\t\tstd::cerr << "last wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "middle element",
				body: `auto v = returnVector();
\tif (v[2] != 3) {
\t\tstd::cerr << "middle wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
	{
		title: "Capstone: GradeBook",
		slug: "cpp-v2-gradebook",
		description: "Track student grades and compute averages.",
		content: lessonMarkdown({
			title: "Capstone: GradeBook",
			objective:
				"Combine classes, maps, and const methods to aggregate student grades.",
			body: `Store grades per student in a \`std::map<std::string, std::vector<int>>\`.

\`\`\`cpp
class GradeBook {
public:
    void addGrade(const std::string& student, int score);
    double averageFor(const std::string& student) const;
private:
    std::map<std::string, std::vector<int>> grades_;
};
\`\`\`

Return \`0.0\` when a student has no recorded grades.`,
			pitfalls: [
				"Integer division when computing averages — accumulate in a wider type first.",
				"Mutating in const methods — use `find` and read-only access.",
			],
			next: "Congratulations — you have completed the C++ fundamentals track. Apply these patterns in performance-sensitive systems and embedded tooling.",
		}),
		taskTitle: "GradeBook",
		taskPrompt:
			"Implement class `GradeBook` with `void addGrade(const std::string& student, int score)` and `double averageFor(const std::string& student) const` returning the mean score or `0.0` if unknown.",
		taskExamples:
			'addGrade("Ada", 90) and addGrade("Ada", 80) yields averageFor("Ada") == 85.',
		taskRequirements: [
			"Use `std::map<std::string, std::vector<int>>` internally.",
			"`averageFor` must be `const`.",
		],
		starterCode: `#include <map>
#include <string>
#include <vector>

class GradeBook {
public:
    void addGrade(const std::string& student, int score) {
        // TODO: implement
        (void)student;
        (void)score;
    }

    double averageFor(const std::string& student) const {
        // TODO: implement
        (void)student;
        return 0.0;
    }

private:
    std::map<std::string, std::vector<int>> grades_;
};`,
		solutionCode: `#include <map>
#include <string>
#include <vector>

class GradeBook {
public:
    void addGrade(const std::string& student, int score) {
        grades_[student].push_back(score);
    }

    double averageFor(const std::string& student) const {
        auto it = grades_.find(student);
        if (it == grades_.end() || it->second.empty()) {
            return 0.0;
        }
        long total = 0;
        for (int s : it->second) {
            total += s;
        }
        return static_cast<double>(total) / static_cast<double>(it->second.size());
    }

private:
    std::map<std::string, std::vector<int>> grades_;
};`,
		idiomHint:
			"Use find() for const queries; accumulate in a wider integer type before dividing as double.",
		tests: [
			{
				title: "average two grades",
				body: `GradeBook book;
\tbook.addGrade("Ada", 90);
\tbook.addGrade("Ada", 80);
\tif (book.averageFor("Ada") < 84.9 || book.averageFor("Ada") > 85.1) {
\t\tstd::cerr << "average wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "unknown student",
				body: `GradeBook book;
\tif (book.averageFor("Zed") > 0.001) {
\t\tstd::cerr << "expected 0\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "multiple students",
				body: `GradeBook book;
\tbook.addGrade("Ada", 100);
\tbook.addGrade("Bob", 50);
\tif (book.averageFor("Bob") < 49.9 || book.averageFor("Bob") > 50.1) {
\t\tstd::cerr << "average wrong\\n";
\t\treturn 1;
\t}`,
			},
			{
				title: "single grade",
				body: `GradeBook book;
\tbook.addGrade("Lin", 72);
\tif (book.averageFor("Lin") < 71.9 || book.averageFor("Lin") > 72.1) {
\t\tstd::cerr << "average wrong\\n";
\t\treturn 1;
\t}`,
			},
		],
	},
];

const lessons: LessonRow[] = lessonDefs.map((def, index) => {
	const n = index + 1;
	return {
		id: `lesson-cpp-v2-${pad(n)}`,
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
		id: `task-cpp-v2-${pad(n)}`,
		lessonId: `lesson-cpp-v2-${pad(n)}`,
		languageId: "cpp",
		description: taskSpec({
			title: def.taskTitle,
			prompt: def.taskPrompt,
			examples: def.taskExamples,
			requirements: def.taskRequirements,
			solution: def.solutionCode,
			lang: "cpp",
		}),
		starterCode: def.starterCode,
		solutionCode: def.solutionCode,
	};
});

const taskTests: TaskTestRow[] = lessonDefs.flatMap((def, index) => {
	const taskId = `task-cpp-v2-${pad(index + 1)}`;
	return def.tests.map((test, testIndex) =>
		cppTest(taskId, testIndex + 1, test.title, test.body)
	);
});

const gradingCriteria: GradingCriteriaRow[] = lessonDefs.flatMap((def, index) =>
	defaultCriteria(`task-cpp-v2-${pad(index + 1)}`, def.idiomHint)
);

export const cppSeed: CourseSeedBundle = {
	course: {
		id: COURSE_ID,
		languageId: "cpp",
		title: "C++ Fundamentals",
		slug: "cpp-fundamentals-v2",
		shortDescription:
			"Modern C++ from strings and vectors to templates, optional, and move semantics.",
		description:
			"An advanced C++ course covering std::string, references, vectors, algorithms, classes, templates, maps, unique_ptr, lambdas, optional, move semantics, and a grade-book capstone. Each lesson uses function or class implementations validated by automated tests — student code never provides main.",
		difficulty: "advanced",
		estimatedHours: 30,
		sortOrder: 6,
		isPublished: true,
	},
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(cppSeed);
