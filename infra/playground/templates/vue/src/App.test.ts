import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("App", () => {
	it("renders", () => {
		const w = mount(App);
		expect(w.text()).toContain("Vue playground");
	});
});
