import { describe, expect, test } from "bun:test";
import { lazyComponent } from "../src/render/lazyComponent";
import { div } from "../src/core/virtualNode";

describe("lazyComponent", () => {
  test("creates a boundary placeholder that loads through an effect", () => {
    const LazyCard = lazyComponent(
      async () => () => div({ text: "Loaded" }),
      {
        tagName: "section",
        props: { className: "lazy-card" },
        loadingText: "Loading"
      }
    );

    const node = LazyCard();

    expect(node.tagName).toBe("section");
    expect(node.elementProperties.isBoundary).toBe(true);
    expect(node.elementProperties.className).toBe("lazy-card");
    expect(node.elementProperties.text).toBe("Loading");
    expect(typeof node.elementProperties.effect).toBe("function");
  });
});
