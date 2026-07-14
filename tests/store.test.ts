import { describe, expect, test } from "bun:test";
import tinyStore, { treeSaver } from "../src/store/tinyStore";

describe("tinyStore", () => {
  test("stores direct values and updater results", () => {
    const [count, setCount] = tinyStore(1);

    setCount((value) => value + 1);
    expect(count()).toBe(2);

    setCount(10);
    expect(count()).toBe(10);
  });

  test("returns cloned state by default", () => {
    const [state] = tinyStore({ nested: { value: 1 } });
    const snapshot = state();

    snapshot.nested.value = 99;

    expect(state().nested.value).toBe(1);
  });
});

describe("treeSaver", () => {
  test("keeps object identity for hot render internals", () => {
    const initial = { id: 1 };
    const [tree, setTree] = treeSaver(initial);

    expect(tree()).toBe(initial);

    setTree((value) => {
      value.id = 2;
      return value;
    });

    expect(tree()).toBe(initial);
    expect(tree().id).toBe(2);
  });
});
