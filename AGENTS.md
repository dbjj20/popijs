# popijs Agent Notes

This file is for future LLM/code agents working on this repository. Read it
before changing runtime or compiler code.

## Primary Goals

- Runtime rendering must be extremely efficient.
- Bundle size must stay as small as practical.
- The compiler is tooling only. It must not be imported by the render runtime.
- Runtime code should remain tree-shakable. Prefer named exports and small
  modules. Avoid adding central exports that pull unrelated features together.

## Runtime Architecture

Runtime source lives under `src/`.

- `src/index.ts`: public renderer. Creates DOM nodes, stores a flat node
  registry, finds update scopes, and calls prop/effect application.
- `src/render/propsApplier.ts`: applies props, styles, text, events, child
  updates, and effects to existing DOM nodes.
- `src/core/virtualNode.ts`: VNode factory helpers such as `div`, `button`,
  `h1`, `fragment`, and generic `t(tagName, props)`.
- `src/core/template.ts`: tiny string template helper. Supports defaults such
  as `{count:0}` and `{echo:}`.
- `src/store/tinyStore.ts`: small state helpers. `treeSaver` intentionally keeps
  references instead of cloning because the renderer stores DOM nodes, Maps, and
  functions.
- `src/types/vnode.ts`: VNode and prop types.
- `src/components/*`: demo/capability components, not core runtime API.

The renderer stores nodes by VNode id in a flat registry. Registry entries are
mutable on purpose to avoid copying large maps on every render/update.

Important registry fields:

- `node`: real DOM node or `DocumentFragment`.
- `vNode`: source VNode for direct update without walking the tree.
- `parentId`: parent registry id.
- `isParent`: fallback update scope marker for nodes with children.
- `isBoundary`: explicit isolated update scope.
- `events_map`: Map of event names to wrapped listeners.
- `effect_cleanup`: cleanup function array created by effects.

## Update Model

Events call `draw(objTree(), node, "update", patch)`.

Update flow:

1. Read the DOM node key.
2. Find nearest update scope by walking registry parents.
3. Prefer `isBoundary`; fallback to nearest `isParent`.
4. Merge the patch into the boundary state in place.
5. Apply props only under that scope.
6. Skip nested `isBoundary` children so parent updates do not leak into isolated
   child components.

Avoid reintroducing full-tree searches in the update path. If a lookup can be
stored in the registry, store it there.

## Effects

`VNodeProps.effect` supports either one function or an array of functions:

```ts
effect: (node, state, action) => {}

effect: [
  (node, state, action) => {},
  (node, state, action) => {}
]
```

Each effect may return a cleanup function. Cleanups run before the next effect
cycle for that same node.

There is intentionally no dependency array or `effectKeys`. Effects execute when
the renderer reaches that node on create/update. The effect function decides
arbitrarily whether to do work.

## Compiler Architecture

Compiler source lives under `compiler/`.

- `compiler/compilePopi.ts`: standalone tokenizer, parser, and code generator.
- `compiler/popiPlugin.ts`: Bun build plugin for importing `.popi` files from
  TypeScript.
- `compiler/examples/*.popi`: source examples.

The compiler must remain independent from the runtime bundle. Do not import
compiler files from `src/index.ts` or runtime modules. Importing `.popi` from
demo components is okay because `build.ts` transforms it at build time.

`build.ts` does two compiler-related things:

- Compiles `.popi` files from `compiler/examples` into `generated/popi`.
- Registers the Bun `.popi` plugin so TypeScript can import `.popi` directly.

`build/` and `generated/` are ignored artifacts.

## .popi Syntax

Example:

```popi
component CounterCard {
  div(isBoundary, className="capability capability-counter") {
    h2("Compiled counter")
    div("Count: {count:0}")
    button("+", on:click=increase)
    button("-", on:click=decrease)
  }
}
```

Compiled output is normal TS that imports only used VNode helpers:

```ts
import { button, div, t } from "dadyjs/virtual-node";
```

Rules currently supported:

- `component Name { ... }`
- One root element per component.
- String text as the first positional arg: `button("+")`.
- Boolean props: `div(isBoundary)`.
- Value props: `input(placeholder="type here")`.
- Events: `button("+", on:click=increase)`.
- Nested children using braces.
- Known helper tags: `div`, `button`, `h1`, `fragment`.
- Unknown tags compile through `t("tag", props)`.

If expanding syntax, keep generated imports minimal and avoid adding runtime
dependencies.

## Build And Validation

Use these checks after meaningful edits:

```bash
bun build.ts
git diff --check
```

To test the standalone compiler:

```bash
bun run compile:popi compiler/examples/Counter.popi /tmp/popi-counter.ts
```

To run the demo server:

```bash
bun dev
```

If port `1420` is busy, set `POPI_PORT`.

```bash
POPI_PORT=1421 bun index.js
```

## Editing Guidelines

- Keep runtime hot paths allocation-conscious.
- Prefer `for` loops over `Object.entries`, `Object.keys`, and callbacks in
  hot paths when it reduces allocations.
- Do not add broad imports from compiler/tooling into runtime modules.
- Do not commit generated `build/` or `generated/` output.
- Preserve `sideEffects: false` and subpath exports in `package.json`.
- If adding a new runtime feature, add a demo component in `src/components` that
  exercises it.
