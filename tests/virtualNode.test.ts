import { describe, expect, test } from "bun:test";
import { button, component, div, fragment, t } from "../src/core/virtualNode";

describe("virtual node helpers", () => {
  test("creates element nodes with tag, props, and generated id", () => {
    const node = div({ className: "box", text: "Hello" });

    expect(node.tagName).toBe("div");
    expect(typeof node.id).toBe("number");
    expect(node.elementProperties.className).toBe("box");
    expect(node.elementProperties.text).toBe("Hello");
  });

  test("marks parent nodes when children are present", () => {
    const node = div({
      children: [
        button({ text: "click" })
      ]
    });

    expect(node.elementProperties.isParent).toBe(true);
  });

  test("creates fragments and custom tags", () => {
    expect(fragment({ children: [] }).isFragment).toBe(true);
    expect(t("input", { value: "x" }).tagName).toBe("input");
  });

  test("component helper creates an update boundary", () => {
    const node = component("section", { text: "Scoped" });

    expect(node.tagName).toBe("section");
    expect(node.elementProperties.isBoundary).toBe(true);
  });
});
