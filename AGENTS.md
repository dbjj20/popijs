# PulseDOM Agent Notes

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

- `compiler/compilePL.ts`: standalone tokenizer, parser, and code generator.
- `compiler/plPlugin.ts`: Bun build plugin for importing `.pl` files from
  TypeScript.
- `compiler/examples/*.pl`: source examples.

The compiler must remain independent from the runtime bundle. Do not import
compiler files from `src/index.ts` or runtime modules. Importing `.pl` from
demo components is okay because `build.ts` transforms it at build time.

`build.ts` does two compiler-related things:

- Compiles `.pl` files from `compiler/examples` into `generated/pl`.
- Registers the Bun `.pl` plugin so TypeScript can import `.pl` directly.

`build/` and `generated/` are ignored artifacts.

## .pl Syntax

Example:

```text
component CounterCard {
  div(isBoundary, className="capability capability-counter") {
    h2("Compiled counter")
    div("Count: {count:0}")
    button("+", on:click=increase)
    button("-", on:click=decrease)
  }
}
```

Components in the same `.pl` file can be used as tags. The compiler resolves
those tags to local function calls and passes `scope` through automatically:

```text
component CounterActions {
  fragment {
    button("+", on:click=increase)
    button("-", on:click=decrease)
  }
}

component CounterCard {
  div(isBoundary) {
    div("Count: {count:0}")
    CounterActions(increase=increase, decrease=decrease)
  }
}
```

Local handlers can be declared before the root element:

```text
component EchoCard {
  handler updateMessage {
    update { echo: event.target.value }
  }

  div(isBoundary) {
    input(on:input=updateMessage)
    div("Echo: {echo:}")
  }
}
```

Handlers compile into local functions inside the generated component. If params
are omitted, the compiler uses `(event, node)`. The magic `update { ... }`
statement compiles to `scope.draw(scope.objTree(), node, "update", { ... })`.
`scope` remains available inside handler bodies for external values such as
stores or services.

Handlers containing `await` compile as async functions. See
`compiler/examples/ServerPanel.pl` for the request/update demo that calls the
mock `/api/mock/users` endpoint in `index.js`.

Local `.pl` effects use `effect name { ... }`. If params are omitted, the
compiler uses `(node, state, action)`. Multiple local effects are injected into
the component root as `effect: [firstEffect, secondEffect]`. See
`compiler/examples/OperationsWorkspace.pl` for a larger example with multiple
effects, async handlers, same-file component composition, and update statements.

Compiled output is normal TS that imports only used VNode helpers:

```ts
import { button, div, t } from "@xdstriker/pulsedom/virtual-node";
```

Rules currently supported:

- `component Name { ... }`
- One root element per component.
- String text as the first positional arg: `button("+")`.
- Boolean props: `div(isBoundary)`.
- Value props: `input(placeholder="type here")`.
- Events: `button("+", on:click=increase)`.
- Local handlers: `handler updateMessage { ... }` or `handler updateMessage(event, node) { ... }`.
- Magic update statements inside handlers: `update { echo: event.target.value }`.
- Local effects: `effect syncDom { ... }`.
- Same-file components as tags: `CounterActions(increase=increase)`.
- Nested children using braces.
- Known helper tags: `div`, `button`, `h1`, `fragment`.
- Unknown tags compile through `t("tag", props)`.

If expanding syntax, keep generated imports minimal and avoid adding runtime
dependencies.

## Build And Validation

Use these checks after meaningful edits:

```bash
bun test
bun build.ts
git diff --check
```

To test the standalone compiler:

```bash
bun run compile:pl compiler/examples/Counter.pl /tmp/pulsedom-counter.ts
```

To run the demo server:

```bash
bun dev
```

If port `1420` is busy, set `PULSEDOM_PORT`.

```bash
PULSEDOM_PORT=1421 bun index.js
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
