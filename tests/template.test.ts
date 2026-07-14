import { describe, expect, test } from "bun:test";
import { template } from "../src/core/template";

describe("template", () => {
  test("replaces keys from state", () => {
    expect(template("Count: {count}", { count: 7 })).toBe("Count: 7");
  });

  test("uses fallback when a key is missing or nullish", () => {
    expect(template("Echo: {echo:empty}", {})).toBe("Echo: empty");
    expect(template("Echo: {echo:empty}", { echo: null })).toBe("Echo: empty");
  });

  test("keeps falsy values that are not nullish", () => {
    expect(template("Count: {count:1}", { count: 0 })).toBe("Count: 0");
    expect(template("Ready: {ready:true}", { ready: false })).toBe("Ready: false");
  });
});
