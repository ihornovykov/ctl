import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
	it("renders task board heading", () => {
		const wrapper = mount(App);
		expect(wrapper.find("h1").text()).toBe("Task Board");
	});
});

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
	it("shows all task titles", () => {
		const wrapper = mount(App);
		expect(wrapper.text()).toContain("Setup project");
		expect(wrapper.text()).toContain("Build UI");
		expect(wrapper.text()).toContain("Write tests");
	});
});

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
	it("shows all task statuses", () => {
		const wrapper = mount(App);
		expect(wrapper.text()).toContain("Todo");
		expect(wrapper.text()).toContain("In Progress");
		expect(wrapper.text()).toContain("Done");
	});
});

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
	it("uses three task cards", () => {
		const wrapper = mount(App);
		expect(wrapper.findAll("h3")).toHaveLength(3);
	});
});
