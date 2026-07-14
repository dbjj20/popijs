import { describe, expect, test } from "bun:test";
import { resetRender, unmount } from "../src/index";

describe("render lifecycle helpers", () => {
  test("resetRender and unmount are safe with an empty registry", () => {
    expect(() => resetRender()).not.toThrow();
    expect(() => unmount(null)).not.toThrow();
  });
});
