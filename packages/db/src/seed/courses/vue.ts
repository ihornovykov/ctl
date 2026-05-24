import { assertCourseBundle } from "../assert-seed";
import { FRAMEWORK_TASK_TESTING_HINT } from "../shared/framework-hints";
import {
	defaultCriteria,
	lessonMarkdown,
	taskSpec,
	vitestVueTest,
	vueSandboxTask,
} from "../shared/task-templates";
import type {
	CourseRow,
	CourseSeedBundle,
	GradingCriteriaRow,
	LessonRow,
	TaskRow,
	TaskTestRow,
} from "../types";

const COURSE_ID = "course-vue-v2";

const lessonId = (n: number) => `lesson-vue-v2-${String(n).padStart(2, "0")}`;
const taskId = (n: number) => `task-vue-v2-${String(n).padStart(2, "0")}`;

const course: CourseRow = {
	id: COURSE_ID,
	languageId: "vue",
	title: "Vue Fundamentals",
	slug: "vue-fundamentals-v2",
	shortDescription:
		"Build reactive UIs with Vue 3 composition API, reactivity, and components.",
	description:
		"A hands-on Vue 3 course covering templates, props, refs, reactive objects, computed properties, watchers, directives, emits, provide/inject, composables, async data, transitions, slots, and a capstone task board. Each lesson runs in a live sandbox with Vitest feedback.",
	difficulty: "beginner",
	estimatedHours: 22,
	sortOrder: 8,
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
		slug: "hello-vue",
		title: "Hello Vue",
		description: "Render your first template and mount a heading.",
		content: lessonMarkdown({
			title: "Hello Vue",
			objective:
				"Use a single-file component template to render an `h1` heading.",
			body: `Vue single-file components (SFCs) combine markup, logic, and styles. Your \`App.vue\` should render a single top-level \`h1\` with the text **Hello Vue**.

\`\`\`vue
<template>
  <h1>Hello Vue</h1>
</template>
\`\`\`

Use the **Preview** tab to see your component live. Vue compiles the template into render functions automatically.`,
			pitfalls: [
				"Every SFC needs a `<template>` block with exactly one root element (or a fragment).",
				"Text in templates is plain — no JSX curly braces needed for static strings.",
			],
			next: "Pass data into child components with props.",
		}),
		appCode: `<script setup lang="ts"></script>

<template>
  <!-- TODO: render an h1 with "Hello Vue" -->
</template>
`,
		taskTitle: "Hello Vue heading",
		taskPrompt:
			"Implement `App.vue` so it renders an `h1` element containing exactly `Hello Vue`.",
		taskRequirements: [
			"Use a semantic `h1` heading (not a `div` or `p`).",
			"The visible text must be exactly `Hello Vue`.",
			'Keep the default `<script setup lang="ts">` block (it can stay empty).',
		],
		taskSolution: `<script setup lang="ts"></script>

<template>
  <h1>Hello Vue</h1>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(1),
				1,
				"renders Hello Vue text",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Hello Vue");`
			),
			vitestVueTest(
				taskId(1),
				2,
				"uses an h1 element",
				`const wrapper = mount(App);
expect(wrapper.find("h1").exists()).toBe(true);`
			),
			vitestVueTest(
				taskId(1),
				3,
				"h1 contains exact heading text",
				`const wrapper = mount(App);
expect(wrapper.find("h1").text()).toBe("Hello Vue");`
			),
		],
		idiomHint:
			"Prefer `<script setup>` for concise SFCs; keep templates declarative and semantic.",
	},
	{
		n: 2,
		slug: "profile-card-props",
		title: "Props & ProfileCard",
		description: "Accept `name` and `email` props in a child component.",
		content: lessonMarkdown({
			title: "Props & ProfileCard",
			objective: "Declare typed props and render them in a child component.",
			body: `Props let parent components pass data down. Build a \`ProfileCard\` component that accepts \`name\` and \`email\` strings and renders them in an \`article\` with an \`h2\` for the name and a \`p\` for the email.

\`App\` should render \`<ProfileCard name="Alex Morgan" email="alex@example.com" />\`.

You may define \`ProfileCard\` inline in the same file with \`defineComponent\` — a common pattern for small sandboxes.`,
			pitfalls: [
				"Declare props with `defineProps` in `<script setup>` or an explicit `props` option.",
				"Interpolation in templates uses `{{ name }}`, not JSX braces.",
			],
			next: "Track mutable UI state with `ref`.",
		}),
		appCode: `<script setup lang="ts">
import { defineComponent } from "vue";

const ProfileCard = defineComponent({
  props: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  template: \`
    <article>
      <!-- TODO: show name and email -->
    </article>
  \`,
});
</script>

<template>
  <ProfileCard name="Alex Morgan" email="alex@example.com" />
</template>
`,
		taskTitle: "ProfileCard name and email props",
		taskPrompt:
			'Implement `ProfileCard` so it displays the `name` in an `h2` and the `email` in a `p`. `App` should pass `name="Alex Morgan"` and `email="alex@example.com"`.',
		taskRequirements: [
			"Define `ProfileCard` accepting `name` and `email` string props.",
			"Render the name as a level-2 heading and the email as a paragraph.",
			"Keep the parent usage with Alex Morgan's profile data.",
		],
		taskSolution: `<script setup lang="ts">
import { defineComponent } from "vue";

const ProfileCard = defineComponent({
  props: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  template: \`
    <article>
      <h2>{{ name }}</h2>
      <p>{{ email }}</p>
    </article>
  \`,
});
</script>

<template>
  <ProfileCard name="Alex Morgan" email="alex@example.com" />
</template>
`,
		tests: [
			vitestVueTest(
				taskId(2),
				1,
				"renders profile name",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Alex Morgan");`
			),
			vitestVueTest(
				taskId(2),
				2,
				"renders profile email",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("alex@example.com");`
			),
			vitestVueTest(
				taskId(2),
				3,
				"uses heading for name",
				`const wrapper = mount(App);
expect(wrapper.find("h2").text()).toBe("Alex Morgan");`
			),
			vitestVueTest(
				taskId(2),
				4,
				"uses paragraph for email",
				`const wrapper = mount(App);
expect(wrapper.find("p").text()).toBe("alex@example.com");`
			),
		],
		idiomHint:
			"Type props explicitly; keep presentational components focused on display.",
	},
	{
		n: 3,
		slug: "ref-counter",
		title: "Reactive State with ref",
		description: "Increment a counter stored in a ref.",
		content: lessonMarkdown({
			title: "Reactive State with ref",
			objective:
				"Use `ref` to hold primitive reactive state and update it on click.",
			body: `The Composition API's \`ref\` wraps a value and tracks changes. Create a \`count\` ref starting at \`0\`, display \`Click Count: {{ count }}\`, and add a button labeled \`Click\` that increments the count.

\`\`\`vue
<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>
\`\`\`

In the template, refs auto-unwrap — use \`count\`, not \`count.value\`.`,
			pitfalls: [
				"In `<script setup>`, mutate with `count.value++`; in templates, use `count` directly.",
				'Always set `type="button"` on non-submit buttons.',
			],
			next: "Group related fields with `reactive`.",
		}),
		appCode: `<script setup lang="ts">
import { ref } from "vue";

// TODO: count ref, Click button, display "Click Count: N"
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Click Count counter with ref",
		taskPrompt:
			"Build a counter that shows `Click Count: 0` initially and increments when the user clicks a button labeled `Click`.",
		taskRequirements: [
			"Use `ref` from Vue for the count.",
			"Display text in the form `Click Count: N`.",
			"Provide a button with accessible name `Click`.",
		],
		taskSolution: `<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <div>
    <p>Click Count: {{ count }}</p>
    <button type="button" @click="count++">Click</button>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(3),
				1,
				"starts at Click Count: 0",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Click Count: 0");`
			),
			vitestVueTest(
				taskId(3),
				2,
				"increments on click",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.text()).toContain("Click Count: 1");`
			),
			vitestVueTest(
				taskId(3),
				3,
				"increments multiple times",
				`const wrapper = mount(App);
const btn = wrapper.get("button");
await btn.trigger("click");
await btn.trigger("click");
expect(wrapper.text()).toContain("Click Count: 2");`
			),
			vitestVueTest(
				taskId(3),
				4,
				"button remains in document after click",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.get("button").exists()).toBe(true);`
			),
		],
		idiomHint:
			"Use `ref` for primitives; mutate in event handlers and let the template auto-unwrap.",
	},
	{
		n: 4,
		slug: "reactive-form",
		title: "Reactive Objects",
		description: "Bind name and email fields with a reactive form object.",
		content: lessonMarkdown({
			title: "Reactive Objects",
			objective:
				"Use `reactive` to group related form fields and display their values.",
			body: `When several fields belong together, \`reactive\` keeps them in one object. Create \`form\` with \`name\` and \`email\` strings (both empty initially). Bind two inputs with \`v-model\` and show a summary line \`{{ form.name }} · {{ form.email }}\` below the fields.

Label the inputs **Name** and **Email** for accessibility.`,
			pitfalls: [
				"Do not reassign the entire reactive object — mutate properties instead.",
				"Pair each input with a `<label>` or `aria-label`.",
			],
			next: "Derive values with `computed`.",
		}),
		appCode: `<script setup lang="ts">
import { reactive } from "vue";

// TODO: reactive form with name/email, bound inputs, summary line
</script>

<template>
  <form></form>
</template>
`,
		taskTitle: "Reactive form name and email",
		taskPrompt:
			"Implement a form with `name` and `email` fields stored in a `reactive` object. Display `Name · Email` summary text that updates as the user types.",
		taskRequirements: [
			"Use `reactive` for the form state object.",
			"Bind both inputs with `v-model`.",
			"Show a summary in the format `{name} · {email}` (middle dot separator).",
			"Label inputs `Name` and `Email`.",
		],
		taskSolution: `<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({ name: "", email: "" });
</script>

<template>
  <form>
    <label>
      Name
      <input v-model="form.name" aria-label="Name" />
    </label>
    <label>
      Email
      <input v-model="form.email" aria-label="Email" />
    </label>
    <p>{{ form.name }} · {{ form.email }}</p>
  </form>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(4),
				1,
				"renders name and email fields",
				`const wrapper = mount(App);
expect(wrapper.find('[aria-label="Name"]').exists()).toBe(true);
expect(wrapper.find('[aria-label="Email"]').exists()).toBe(true);`
			),
			vitestVueTest(
				taskId(4),
				2,
				"updates name in summary",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="Name"]').setValue("Alex");
expect(wrapper.text()).toContain("Alex ·");`
			),
			vitestVueTest(
				taskId(4),
				3,
				"updates email in summary",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="Email"]').setValue("alex@example.com");
expect(wrapper.text()).toContain("· alex@example.com");`
			),
			vitestVueTest(
				taskId(4),
				4,
				"shows both values together",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="Name"]').setValue("Alex");
await wrapper.find('[aria-label="Email"]').setValue("alex@example.com");
expect(wrapper.text()).toContain("Alex · alex@example.com");`
			),
		],
		idiomHint:
			"Group related fields in `reactive` objects; bind with `v-model` for two-way sync.",
	},
	{
		n: 5,
		slug: "computed-full-name",
		title: "Computed Properties",
		description: "Derive fullName from first and last refs.",
		content: lessonMarkdown({
			title: "Computed Properties",
			objective:
				"Create a derived value that updates when its dependencies change.",
			body: `Computed properties cache derived state. Store \`first\` and \`last\` in separate \`ref\`s. Create \`fullName\` as a \`computed\` that joins them with a space (trim extra whitespace when one side is empty).

Render two labeled inputs and display \`Full name: {{ fullName }}\`.`,
			pitfalls: [
				"Computed getters must be pure — no side effects inside.",
				"Access ref values with `.value` inside computed callbacks.",
			],
			next: "React to changes over time with `watch`.",
		}),
		appCode: `<script setup lang="ts">
import { ref, computed } from "vue";

const first = ref("");
const last = ref("");

// TODO: fullName computed, inputs, display line
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Computed fullName from first and last",
		taskPrompt:
			"Implement `fullName` as a computed property from `first` and `last` refs. Show labeled inputs `First name` and `Last name`, and display `Full name: {fullName}`.",
		taskRequirements: [
			"Use `computed` for `fullName`.",
			"Join first and last with a single space; trim when a part is empty.",
			"Display the prefix `Full name:` before the computed value.",
		],
		taskSolution: `<script setup lang="ts">
import { ref, computed } from "vue";

const first = ref("");
const last = ref("");

const fullName = computed(() =>
  \`\${first.value} \${last.value}\`.trim()
);
</script>

<template>
  <div>
    <label>
      First name
      <input v-model="first" aria-label="First name" />
    </label>
    <label>
      Last name
      <input v-model="last" aria-label="Last name" />
    </label>
    <p>Full name: {{ fullName }}</p>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(5),
				1,
				"starts with empty full name label",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Full name:");`
			),
			vitestVueTest(
				taskId(5),
				2,
				"combines first and last",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="First name"]').setValue("Alex");
await wrapper.find('[aria-label="Last name"]').setValue("Morgan");
expect(wrapper.text()).toContain("Full name: Alex Morgan");`
			),
			vitestVueTest(
				taskId(5),
				3,
				"updates when first changes",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="Last name"]').setValue("Morgan");
await wrapper.find('[aria-label="First name"]').setValue("Alex");
expect(wrapper.text()).toContain("Alex Morgan");`
			),
			vitestVueTest(
				taskId(5),
				4,
				"shows only first when last empty",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="First name"]').setValue("Alex");
expect(wrapper.text()).toContain("Full name: Alex");`
			),
		],
		idiomHint:
			"Use `computed` for derived state; keep source refs as the single source of truth.",
	},
	{
		n: 6,
		slug: "watch-debounced-search",
		title: "Watchers & Debounce",
		description: "Debounce a search query with watch and setTimeout.",
		content: lessonMarkdown({
			title: "Watchers & Debounce",
			objective: "Use `watch` to run side effects when reactive state changes.",
			body: `Watchers respond to data changes. Implement a search field bound to \`query\` and a \`display\` ref that updates **300ms** after \`query\` stops changing (debounce with \`setTimeout\` / \`clearTimeout\`).

Show \`Results for: {{ display }}\` below the input. Label the input **Search**.`,
			pitfalls: [
				"Clear the previous timer before scheduling a new one.",
				"Debounce is a local side effect — `watch` is the right tool.",
			],
			next: "Render collections with `v-for`.",
		}),
		appCode: `<script setup lang="ts">
import { ref, watch } from "vue";

const query = ref("");
const display = ref("");

// TODO: watch query with 300ms debounce updating display
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Debounced search with watch",
		taskPrompt:
			"Watch `query` and update `display` 300ms after the user stops typing. Render a Search input and `Results for: {display}`.",
		taskRequirements: [
			"Use `watch` on `query`.",
			"Debounce updates to `display` by 300ms using `setTimeout`.",
			"Show the exact prefix `Results for:` before the debounced value.",
		],
		taskSolution: `<script setup lang="ts">
import { ref, watch } from "vue";

const query = ref("");
const display = ref("");

let timer: ReturnType<typeof setTimeout> | undefined;

watch(query, (value) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    display.value = value;
  }, 300);
});
</script>

<template>
  <div>
    <input v-model="query" aria-label="Search" />
    <p>Results for: {{ display }}</p>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(6),
				1,
				"renders search input and results label",
				`const wrapper = mount(App);
expect(wrapper.find('[aria-label="Search"]').exists()).toBe(true);
expect(wrapper.text()).toContain("Results for:");`
			),
			vitestVueTest(
				taskId(6),
				2,
				"debounces display update",
				`vi.useFakeTimers();
const wrapper = mount(App);
await wrapper.find('[aria-label="Search"]').setValue("vue");
expect(wrapper.text()).toContain("Results for:");
vi.advanceTimersByTime(299);
await wrapper.vm.$nextTick();
expect(wrapper.text()).not.toContain("Results for: vue");
vi.advanceTimersByTime(1);
await wrapper.vm.$nextTick();
expect(wrapper.text()).toContain("Results for: vue");
vi.useRealTimers();`
			),
			vitestVueTest(
				taskId(6),
				3,
				"resets timer on rapid typing",
				`vi.useFakeTimers();
const wrapper = mount(App);
const input = wrapper.find('[aria-label="Search"]');
await input.setValue("v");
vi.advanceTimersByTime(200);
await input.setValue("vue");
vi.advanceTimersByTime(300);
await wrapper.vm.$nextTick();
expect(wrapper.text()).toContain("Results for: vue");
vi.useRealTimers();`
			),
			vitestVueTest(
				taskId(6),
				4,
				"shows empty results initially",
				`const wrapper = mount(App);
expect(wrapper.text()).toMatch(/Results for:\\s*$/);`
			),
		],
		idiomHint:
			"Use `watch` for imperative side effects; debounce expensive updates locally when needed.",
	},
	{
		n: 7,
		slug: "v-for-todo-list",
		title: "Lists with v-for",
		description: "Render a todo list with v-for and keys.",
		content: lessonMarkdown({
			title: "Lists with v-for",
			objective:
				"Iterate arrays in templates with `v-for` and stable `:key` bindings.",
			body: `Use \`v-for\` to render a \`ul\` of todos. Start with \`['Learn templates', 'Learn reactivity', 'Learn components']\`. Each item should be an \`li\` showing the todo text. Bind \`:key\` to the todo string.

\`\`\`vue
<li v-for="todo in todos" :key="todo">{{ todo }}</li>
\`\`\``,
			pitfalls: [
				"Always provide `:key` — use a stable unique value, not the index.",
				"`v-for` belongs on the element being repeated (`li`, not `ul`).",
			],
			next: "Bind inputs two-way with `v-model`.",
		}),
		appCode: `<script setup lang="ts">
const todos = ["Learn templates", "Learn reactivity", "Learn components"];
</script>

<template>
  <!-- TODO: ul/li list with v-for -->
</template>
`,
		taskTitle: "Todo list with v-for",
		taskPrompt:
			"Render each string in `todos` as an `li` inside a `ul` using `v-for` with `:key`.",
		taskRequirements: [
			"Use `v-for` on `li` elements.",
			"Set `:key` to each todo string.",
			"Preserve the three starter todos in the script.",
		],
		taskSolution: `<script setup lang="ts">
const todos = ["Learn templates", "Learn reactivity", "Learn components"];
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo">{{ todo }}</li>
  </ul>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(7),
				1,
				"renders all todo items",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Learn templates");
expect(wrapper.text()).toContain("Learn reactivity");
expect(wrapper.text()).toContain("Learn components");`
			),
			vitestVueTest(
				taskId(7),
				2,
				"renders three list items",
				`const wrapper = mount(App);
expect(wrapper.findAll("li")).toHaveLength(3);`
			),
			vitestVueTest(
				taskId(7),
				3,
				"lists items in order",
				`const wrapper = mount(App);
const items = wrapper.findAll("li");
expect(items[0]?.text()).toBe("Learn templates");
expect(items[2]?.text()).toBe("Learn components");`
			),
		],
		idiomHint:
			"Use `v-for` with meaningful `:key` values; keep list data in reactive arrays.",
	},
	{
		n: 8,
		slug: "v-model-input",
		title: "Two-Way Binding",
		description: "Sync an input with v-model.",
		content: lessonMarkdown({
			title: "Two-Way Binding",
			objective: "Use `v-model` to keep an input and displayed text in sync.",
			body: `\`v-model\` is sugar for a \`:value\` plus \`@input\` binding. Store the message in a \`ref\`, bind the input with \`v-model="message"\`, and show \`You typed: {{ message }}\` below.

Label the input **Message**.`,
			pitfalls: [
				"`v-model` on native inputs binds to `value` / `input` automatically.",
				'Initialize the ref to `""` so the preview starts empty.',
			],
			next: "Notify parents from child components with `emit`.",
		}),
		appCode: `<script setup lang="ts">
import { ref } from "vue";

// TODO: message ref, v-model input, echo line
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "v-model message echo",
		taskPrompt:
			"Bind an input to a `message` ref with `v-model` and display `You typed: {message}` that updates as the user types.",
		taskRequirements: [
			"Use `ref` and `v-model` on the input.",
			"Label the input `Message`.",
			"Show the exact prefix `You typed:` before the value.",
		],
		taskSolution: `<script setup lang="ts">
import { ref } from "vue";

const message = ref("");
</script>

<template>
  <div>
    <input v-model="message" aria-label="Message" />
    <p>You typed: {{ message }}</p>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(8),
				1,
				"renders message input",
				`const wrapper = mount(App);
expect(wrapper.find('[aria-label="Message"]').exists()).toBe(true);`
			),
			vitestVueTest(
				taskId(8),
				2,
				"shows empty typed prefix initially",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("You typed:");`
			),
			vitestVueTest(
				taskId(8),
				3,
				"echoes typed text",
				`const wrapper = mount(App);
await wrapper.find('[aria-label="Message"]').setValue("Hello Vue");
expect(wrapper.text()).toContain("You typed: Hello Vue");`
			),
			vitestVueTest(
				taskId(8),
				4,
				"updates on each keystroke",
				`const wrapper = mount(App);
const input = wrapper.find('[aria-label="Message"]');
await input.setValue("Hi");
await input.setValue("Hi there");
expect(wrapper.text()).toContain("You typed: Hi there");`
			),
		],
		idiomHint:
			"Prefer `v-model` over manual `:value` + `@input` for form controls.",
	},
	{
		n: 9,
		slug: "emit-notify-parent",
		title: "Emits & Events",
		description: "Child component emits an event the parent handles.",
		content: lessonMarkdown({
			title: "Emits & Events",
			objective: "Declare emits on a child and handle them in the parent.",
			body: `Child components communicate upward with emits. Create a \`NotifyButton\` that renders a button labeled \`Notify\` and emits \`notify\` on click.

The parent starts with status \`Waiting\` and updates to \`Notified!\` when the child fires \`notify\`. Display the status in a \`p\` tag.

Define \`NotifyButton\` inline with \`defineComponent\` in the same file.`,
			pitfalls: [
				"Declare emits explicitly with `emits: ['notify']` or `defineEmits`.",
				"Listen with `@notify` on the child in the parent template.",
			],
			next: "Share values deep in the tree with provide/inject.",
		}),
		appCode: `<script setup lang="ts">
import { ref, defineComponent } from "vue";

const NotifyButton = defineComponent({
  emits: ["notify"],
  template: \`
    <!-- TODO: button that emits notify -->
  \`,
});

const status = ref("Waiting");

const onNotify = () => {
  // TODO: update status
};
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Child emit notifies parent",
		taskPrompt:
			"Implement `NotifyButton` to emit `notify` when clicked. The parent should show `Waiting` initially and `Notified!` after the button is clicked.",
		taskRequirements: [
			"Child button text must be `Notify`.",
			"Emit `notify` from the child on click.",
			"Parent status text updates from `Waiting` to `Notified!`.",
		],
		taskSolution: `<script setup lang="ts">
import { ref, defineComponent } from "vue";

const NotifyButton = defineComponent({
  emits: ["notify"],
  template: \`
    <button type="button" @click="$emit('notify')">Notify</button>
  \`,
});

const status = ref("Waiting");

const onNotify = () => {
  status.value = "Notified!";
};
</script>

<template>
  <div>
    <NotifyButton @notify="onNotify" />
    <p>{{ status }}</p>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(9),
				1,
				"starts with Waiting status",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Waiting");`
			),
			vitestVueTest(
				taskId(9),
				2,
				"renders Notify button",
				`const wrapper = mount(App);
expect(wrapper.get("button").text()).toBe("Notify");`
			),
			vitestVueTest(
				taskId(9),
				3,
				"updates status on notify",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.text()).toContain("Notified!");`
			),
			vitestVueTest(
				taskId(9),
				4,
				"hides Waiting after notify",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.text()).not.toContain("Waiting");`
			),
		],
		idiomHint:
			"Use `emit` for child-to-parent communication; keep event names verb-based.",
	},
	{
		n: 10,
		slug: "provide-inject-theme",
		title: "Provide & Inject",
		description: "Toggle theme via provide/inject across components.",
		content: lessonMarkdown({
			title: "Provide & Inject",
			objective: "Share reactive state with descendants using provide/inject.",
			body: `Provide/inject skips prop drilling. In \`App\`, create a \`theme\` ref starting at \`light\` and a \`toggleTheme\` function that switches between \`light\` and \`dark\`. \`provide\` both under a \`ThemeKey\` symbol.

Build a \`ThemePanel\` child (inline) that \`inject\`s the context, renders a **Toggle theme** button, and shows \`Theme: {{ theme }}\`.`,
			pitfalls: [
				"Use a typed `InjectionKey` or `Symbol` for provide/inject keys.",
				"Provide reactive refs — descendants see live updates.",
			],
			next: "Extract reusable logic into composables.",
		}),
		appCode: `<script setup lang="ts">
import {
  ref,
  provide,
  inject,
  defineComponent,
  type InjectionKey,
  type Ref,
} from "vue";

type ThemeContext = {
  theme: Ref<string>;
  toggleTheme: () => void;
};

const ThemeKey: InjectionKey<ThemeContext> = Symbol("theme");

// TODO: theme ref, toggleTheme, provide, ThemePanel with inject
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Theme toggle with provide/inject",
		taskPrompt:
			"Provide a reactive `theme` (starting at `light`) and `toggleTheme` function. `ThemePanel` should inject them, show `Theme: {theme}`, and toggle on button click.",
		taskRequirements: [
			"Use `provide` / `inject` with a symbol key.",
			"Initial theme text is `Theme: light`.",
			"Button labeled `Toggle theme` switches to `Theme: dark` and back.",
		],
		taskSolution: `<script setup lang="ts">
import {
  ref,
  provide,
  inject,
  defineComponent,
  type InjectionKey,
  type Ref,
} from "vue";

type ThemeContext = {
  theme: Ref<string>;
  toggleTheme: () => void;
};

const ThemeKey: InjectionKey<ThemeContext> = Symbol("theme");

const theme = ref("light");
const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};

provide(ThemeKey, { theme, toggleTheme });

const ThemePanel = defineComponent({
  setup() {
    const ctx = inject(ThemeKey)!;
    return { ctx };
  },
  template: \`
    <div>
      <button type="button" @click="ctx.toggleTheme()">Toggle theme</button>
      <p>Theme: {{ ctx.theme }}</p>
    </div>
  \`,
});
</script>

<template>
  <ThemePanel />
</template>
`,
		tests: [
			vitestVueTest(
				taskId(10),
				1,
				"starts with light theme",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Theme: light");`
			),
			vitestVueTest(
				taskId(10),
				2,
				"renders toggle button",
				`const wrapper = mount(App);
expect(wrapper.get("button").text()).toBe("Toggle theme");`
			),
			vitestVueTest(
				taskId(10),
				3,
				"toggles to dark theme",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.text()).toContain("Theme: dark");`
			),
			vitestVueTest(
				taskId(10),
				4,
				"toggles back to light",
				`const wrapper = mount(App);
const btn = wrapper.get("button");
await btn.trigger("click");
await btn.trigger("click");
expect(wrapper.text()).toContain("Theme: light");`
			),
		],
		idiomHint:
			"Use provide/inject for cross-cutting context; prefer symbols for injection keys.",
	},
	{
		n: 11,
		slug: "composable-use-counter",
		title: "Composables",
		description: "Extract counter logic into a useCounter composable.",
		content: lessonMarkdown({
			title: "Composables",
			objective:
				"Reuse stateful logic with a `useCounter` composable function.",
			body: `Composables are functions that encapsulate reactive logic. Implement \`useCounter(initial = 0)\` returning \`count\` and \`increment\`. Use it in \`App\` to show \`Count: {{ count }}\` and an **Increment** button.

\`\`\`ts
function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => { count.value++; };
  return { count, increment };
}
\`\`\``,
			pitfalls: [
				"Composables must be called during `setup` (top-level in `<script setup>`).",
				"Return refs directly — callers auto-unwrap in templates.",
			],
			next: "Load remote data with async setup patterns.",
		}),
		appCode: `<script setup lang="ts">
import { ref } from "vue";

// TODO: useCounter composable and UI
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "useCounter composable",
		taskPrompt:
			"Create `useCounter` composable and use it to display `Count: 0` with an `Increment` button that adds one per click.",
		taskRequirements: [
			"Extract logic into a `useCounter` function.",
			"Display text as `Count: N`.",
			"Button accessible name is `Increment`.",
		],
		taskSolution: `<script setup lang="ts">
import { ref } from "vue";

function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => {
    count.value++;
  };
  return { count, increment };
}

const { count, increment } = useCounter(0);
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button type="button" @click="increment">Increment</button>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(11),
				1,
				"starts at Count: 0",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Count: 0");`
			),
			vitestVueTest(
				taskId(11),
				2,
				"increments on button click",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.text()).toContain("Count: 1");`
			),
			vitestVueTest(
				taskId(11),
				3,
				"increments multiple times",
				`const wrapper = mount(App);
const btn = wrapper.get("button");
await btn.trigger("click");
await btn.trigger("click");
await btn.trigger("click");
expect(wrapper.text()).toContain("Count: 3");`
			),
			vitestVueTest(
				taskId(11),
				4,
				"button label is Increment",
				`const wrapper = mount(App);
expect(wrapper.get("button").text()).toBe("Increment");`
			),
		],
		idiomHint:
			"Extract reusable reactive logic into composables; name them `useX` by convention.",
	},
	{
		n: 12,
		slug: "async-user-fetch",
		title: "Async Data Loading",
		description: "Fetch a user and show loading and error states.",
		content: lessonMarkdown({
			title: "Async Data Loading",
			objective: "Load remote data on mount and surface loading/error UI.",
			body: `On mount, \`fetch('https://api.example.com/user')\` and parse JSON \`{ name: string }\`. While loading, show \`Loading...\`. On failure, show \`Could not load user\`. On success, show \`User: {{ user.name }}\`.

Use \`onMounted\` with async/await and track \`loading\`, \`error\`, and \`user\` refs.`,
			pitfalls: [
				"Set `loading` to false in a `finally` block.",
				"Handle non-OK responses by throwing or setting error state.",
			],
			next: "Animate enter/leave with `<Transition>`.",
		}),
		appCode: `<script setup lang="ts">
import { ref, onMounted } from "vue";

const loading = ref(true);
const error = ref("");
const user = ref<{ name: string } | null>(null);

// TODO: onMounted fetch with loading/error/success UI
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Async user fetch with states",
		taskPrompt:
			"Fetch `https://api.example.com/user` on mount. Show `Loading...` while pending, `Could not load user` on error, and `User: {name}` on success.",
		taskRequirements: [
			"Use `onMounted` to trigger the fetch.",
			"Show exact copy for loading, error, and success states.",
			"Parse JSON `{ name: string }` from a successful response.",
		],
		taskSolution: `<script setup lang="ts">
import { ref, onMounted } from "vue";

const loading = ref(true);
const error = ref("");
const user = ref<{ name: string } | null>(null);

onMounted(async () => {
  try {
    const res = await fetch("https://api.example.com/user");
    if (!res.ok) throw new Error("Failed");
    user.value = await res.json();
  } catch {
    error.value = "Could not load user";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="user">User: {{ user.name }}</p>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(12),
				1,
				"shows loading initially then user",
				`global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ name: "Alex Morgan" }),
});
const wrapper = mount(App);
expect(wrapper.text()).toContain("Loading...");
await vi.waitFor(() => {
  expect(wrapper.text()).toContain("User: Alex Morgan");
});`
			),
			vitestVueTest(
				taskId(12),
				2,
				"shows error on failed fetch",
				`global.fetch = vi.fn().mockResolvedValue({ ok: false });
const wrapper = mount(App);
await vi.waitFor(() => {
  expect(wrapper.text()).toContain("Could not load user");
});`
			),
			vitestVueTest(
				taskId(12),
				3,
				"shows error on network failure",
				`global.fetch = vi.fn().mockRejectedValue(new Error("network"));
const wrapper = mount(App);
await vi.waitFor(() => {
  expect(wrapper.text()).toContain("Could not load user");
});`
			),
			vitestVueTest(
				taskId(12),
				4,
				"clears loading after success",
				`global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ name: "Alex" }),
});
const wrapper = mount(App);
await vi.waitFor(() => {
  expect(wrapper.text()).not.toContain("Loading...");
});`
			),
		],
		idiomHint:
			"Model async UI with explicit loading/error/data refs; fetch in `onMounted`.",
	},
	{
		n: 13,
		slug: "transition-toggle",
		title: "Transitions",
		description: "Toggle visibility with Vue Transition.",
		content: lessonMarkdown({
			title: "Transitions",
			objective:
				"Wrap conditional content in `<Transition>` for enter/leave effects.",
			body: `Vue's \`<Transition>\` animates elements entering and leaving the DOM. Store \`visible\` in a ref (starting \`true\`). Wrap a \`p\` containing \`Hello transition\` in \`<Transition>\` with \`v-if="visible"\`. Add a **Toggle** button that flips \`visible\`.

The element should mount/unmount when toggled (tested via text presence).`,
			pitfalls: [
				"`<Transition>` expects a single direct child with `v-if` or `v-show`.",
				"Name your transition with the `name` prop if you add CSS classes later.",
			],
			next: "Customize layout with named slots.",
		}),
		appCode: `<script setup lang="ts">
import { ref } from "vue";

const visible = ref(true);

// TODO: Toggle button and Transition wrapper
</script>

<template>
  <div></div>
</template>
`,
		taskTitle: "Transition visibility toggle",
		taskPrompt:
			"Wrap `Hello transition` in `<Transition>` with `v-if`. Add a `Toggle` button that shows/hides the paragraph.",
		taskRequirements: [
			"Use `<Transition>` around the conditional paragraph.",
			"Paragraph text is exactly `Hello transition`.",
			"Button labeled `Toggle` switches visibility.",
		],
		taskSolution: `<script setup lang="ts">
import { ref } from "vue";

const visible = ref(true);
</script>

<template>
  <div>
    <button type="button" @click="visible = !visible">Toggle</button>
    <Transition name="fade">
      <p v-if="visible">Hello transition</p>
    </Transition>
  </div>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(13),
				1,
				"shows transition text initially",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Hello transition");`
			),
			vitestVueTest(
				taskId(13),
				2,
				"renders toggle button",
				`const wrapper = mount(App);
expect(wrapper.get("button").text()).toBe("Toggle");`
			),
			vitestVueTest(
				taskId(13),
				3,
				"hides text after toggle",
				`const wrapper = mount(App);
await wrapper.get("button").trigger("click");
expect(wrapper.text()).not.toContain("Hello transition");`
			),
			vitestVueTest(
				taskId(13),
				4,
				"shows text again on second toggle",
				`const wrapper = mount(App);
const btn = wrapper.get("button");
await btn.trigger("click");
await btn.trigger("click");
expect(wrapper.text()).toContain("Hello transition");`
			),
		],
		idiomHint:
			"Use `<Transition>` for enter/leave animations; pair with `v-if` for mount toggles.",
	},
	{
		n: 14,
		slug: "slots-card-layout",
		title: "Slots",
		description: "Compose a Card layout with named and default slots.",
		content: lessonMarkdown({
			title: "Slots",
			objective: "Project parent content into child layout regions with slots.",
			body: `Slots make components composable. Build a \`Card\` component with a **header** named slot and a default slot for body content.

Render:

\`\`\`vue
<Card>
  <template #header><h2>Profile</h2></template>
  <p>Member since 2024</p>
</Card>
\`\`\`

The card should wrap content in an \`article\` with \`header\` and \`main\` sections.`,
			pitfalls: [
				"Named slots use `#header` shorthand for `v-slot:header`.",
				"Default slot content goes between `<Card>` tags without a template wrapper.",
			],
			next: "Combine everything in a task board capstone.",
		}),
		appCode: `<script setup lang="ts">
import { defineComponent } from "vue";

const Card = defineComponent({
  template: \`
    <article>
      <!-- TODO: header slot and default slot -->
    </article>
  \`,
});
</script>

<template>
  <Card>
    <template #header><h2>Profile</h2></template>
    <p>Member since 2024</p>
  </Card>
</template>
`,
		taskTitle: "Card layout with slots",
		taskPrompt:
			"Implement `Card` with a `#header` named slot and default body slot. Render the provided Profile card content.",
		taskRequirements: [
			'Use `<slot name="header" />` and default `<slot />`.',
			"Wrap slots in semantic `header` and `main` inside `article`.",
			"Display `Profile` heading and `Member since 2024` body text.",
		],
		taskSolution: `<script setup lang="ts">
import { defineComponent } from "vue";

const Card = defineComponent({
  template: \`
    <article>
      <header><slot name="header" /></header>
      <main><slot /></main>
    </article>
  \`,
});
</script>

<template>
  <Card>
    <template #header><h2>Profile</h2></template>
    <p>Member since 2024</p>
  </Card>
</template>
`,
		tests: [
			vitestVueTest(
				taskId(14),
				1,
				"renders profile heading",
				`const wrapper = mount(App);
expect(wrapper.find("h2").text()).toBe("Profile");`
			),
			vitestVueTest(
				taskId(14),
				2,
				"renders body slot content",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Member since 2024");`
			),
			vitestVueTest(
				taskId(14),
				3,
				"uses article wrapper",
				`const wrapper = mount(App);
expect(wrapper.find("article").exists()).toBe(true);`
			),
			vitestVueTest(
				taskId(14),
				4,
				"has header and main sections",
				`const wrapper = mount(App);
expect(wrapper.find("header").exists()).toBe(true);
expect(wrapper.find("main").exists()).toBe(true);`
			),
		],
		idiomHint:
			"Use slots for flexible composition; named slots for distinct layout regions.",
	},
	{
		n: 15,
		slug: "task-board-capstone",
		title: "Task Board Capstone",
		description: "Compose TaskCard components into a task board.",
		content: lessonMarkdown({
			title: "Task Board Capstone",
			objective:
				"Combine components, props, and lists into a cohesive task board screen.",
			body: `Build \`TaskCard\` accepting \`title\` and \`status\` props (render title in \`h3\`, status in \`span\`). Build \`TaskBoard\` rendering a \`Task Board\` heading plus three cards:

| Title | Status |
|-------|--------|
| Setup project | Todo |
| Build UI | In Progress |
| Write tests | Done |

Reuse \`TaskCard\` for each row — no duplicated markup.`,
			pitfalls: [
				"Extract `TaskCard` instead of repeating markup three times.",
				"Pass props explicitly — avoid hard-coding inside the card.",
			],
			next: "You have completed the Vue fundamentals track — explore advanced patterns next!",
		}),
		appCode: `<script setup lang="ts">
import { defineComponent } from "vue";

const TaskCard = defineComponent({
  props: {
    title: { type: String, required: true },
    status: { type: String, required: true },
  },
  template: \`
    <article>
      <!-- TODO: title and status -->
    </article>
  \`,
});

const TaskBoard = defineComponent({
  components: { TaskCard },
  template: \`
    <section>
      <!-- TODO: heading and three TaskCards -->
    </section>
  \`,
});
</script>

<template>
  <TaskBoard />
</template>
`,
		taskTitle: "Task board capstone",
		taskPrompt:
			"Implement `TaskCard` and `TaskBoard`. The board shows a `Task Board` heading and three task cards with the specified titles and statuses.",
		taskRequirements: [
			"Reuse `TaskCard` for each task.",
			"Display exact statuses: `Todo`, `In Progress`, `Done`.",
			"Each card exposes its title and status in the DOM.",
		],
		taskSolution: `<script setup lang="ts">
import { defineComponent } from "vue";

const TaskCard = defineComponent({
  props: {
    title: { type: String, required: true },
    status: { type: String, required: true },
  },
  template: \`
    <article>
      <h3>{{ title }}</h3>
      <span>{{ status }}</span>
    </article>
  \`,
});

const TaskBoard = defineComponent({
  components: { TaskCard },
  template: \`
    <section>
      <h1>Task Board</h1>
      <TaskCard title="Setup project" status="Todo" />
      <TaskCard title="Build UI" status="In Progress" />
      <TaskCard title="Write tests" status="Done" />
    </section>
  \`,
});
</script>

<template>
  <TaskBoard />
</template>
`,
		tests: [
			vitestVueTest(
				taskId(15),
				1,
				"renders task board heading",
				`const wrapper = mount(App);
expect(wrapper.find("h1").text()).toBe("Task Board");`
			),
			vitestVueTest(
				taskId(15),
				2,
				"shows all task titles",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Setup project");
expect(wrapper.text()).toContain("Build UI");
expect(wrapper.text()).toContain("Write tests");`
			),
			vitestVueTest(
				taskId(15),
				3,
				"shows all task statuses",
				`const wrapper = mount(App);
expect(wrapper.text()).toContain("Todo");
expect(wrapper.text()).toContain("In Progress");
expect(wrapper.text()).toContain("Done");`
			),
			vitestVueTest(
				taskId(15),
				4,
				"uses three task cards",
				`const wrapper = mount(App);
expect(wrapper.findAll("h3")).toHaveLength(3);`
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
	vueSandboxTask({
		id: taskId(seed.n),
		lessonId: lessonId(seed.n),
		description:
			taskSpec({
				title: seed.taskTitle,
				prompt: seed.taskPrompt,
				requirements: seed.taskRequirements,
				solution: seed.taskSolution,
				lang: "vue",
			}) + FRAMEWORK_TASK_TESTING_HINT,
		appCode: seed.appCode,
	})
);

const taskTests: TaskTestRow[] = lessonSeeds.flatMap((seed) => seed.tests);

const gradingCriteria: GradingCriteriaRow[] = lessonSeeds.flatMap((seed) =>
	defaultCriteria(taskId(seed.n), seed.idiomHint)
);

export const vueSeed: CourseSeedBundle = {
	course,
	lessons,
	tasks,
	taskTests,
	gradingCriteria,
};

assertCourseBundle(vueSeed);
