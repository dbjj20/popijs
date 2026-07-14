# PulseDOM

Tiny ESM render library focused on extreme DOM update efficiency, minimal bundle
size, and tree-shakable imports.

The runtime is intentionally small. The optional `.popi` compiler is a build-time
tool and is exposed through separate package paths so it does not enter the
render bundle unless you import it.

## Install

```bash
npm install @xdstriker/pulsedom
```

With Bun:

```bash
bun add @xdstriker/pulsedom
```

## Why it exists

PulseDOM is built around a simple rule: render only what is needed, ship only what
is imported.

- Scoped updates through boundary nodes.
- Reused event listeners where possible.
- Text templates update only when their referenced keys change.
- Runtime helpers are split into subpath exports for tree-shaking.
- The `.popi` syntax compiler is optional and separate from the runtime.

This package currently ships TypeScript source as ESM. It is designed for Bun or
modern bundlers that can consume TS/ESM package exports.

## Basic Usage

```ts
import render, { objTree, setObjTree } from "@xdstriker/pulsedom";
import { button, component, div } from "@xdstriker/pulsedom/virtual-node";

let count = 0;

function Counter() {
  return component("section", {
    className: "counter",
    children: [
      div({ text: "Count: {count:0}" }),
      button({
        text: "+",
        events: {
          click: (_event, node) => {
            count += 1;
            render(objTree(), node, "update", { count });
          }
        }
      })
    ]
  });
}

setObjTree(Counter());
render(objTree(), document.getElementById("app")!);
```

`component(tag, props)` creates an update boundary. When an event calls
`render(objTree(), node, "update", state)`, PulseDOM finds the nearest boundary and
updates that scope.

## Runtime Exports

```ts
import render, { objTree, setObjTree } from "@xdstriker/pulsedom";
import { component, div, button, h1, fragment, t } from "@xdstriker/pulsedom/virtual-node";
import { template } from "@xdstriker/pulsedom/template";
import tinyStore from "@xdstriker/pulsedom/store";
```

Available package paths:

- `@xdstriker/pulsedom`: render function and root tree store.
- `@xdstriker/pulsedom/virtual-node`: VNode creation helpers.
- `@xdstriker/pulsedom/template`: small `{key:fallback}` text template helper.
- `@xdstriker/pulsedom/store`: tiny state helpers.
- `@xdstriker/pulsedom/compiler`: optional `.popi` compiler.
- `@xdstriker/pulsedom/popi-plugin`: optional Bun build plugin for direct `.popi` imports.

## Text Templates

Text can reference state with an optional fallback:

```ts
div({ text: "Echo: {echo:empty}" });
```

If `echo` is missing, the rendered text is `Echo: empty`. On update, PulseDOM only
recomputes template text when the changed state keys are referenced by that text.

## Effects

Effects run after create and update. A node can receive one effect or multiple
effects.

```ts
component("section", {
  text: "Status: {status:idle}",
  effect: [
    (node, state, action) => {
      (node as HTMLElement).dataset.action = action;
      (node as HTMLElement).dataset.status = String(state.status ?? "idle");
    },
    (node) => {
      const el = node as HTMLElement;
      el.title = "Managed by PulseDOM";
      return () => {
        el.removeAttribute("title");
      };
    }
  ]
});
```

Returning a function registers cleanup for the next effect run.

## Optional .popi Compiler

`.popi` is a friendlier component syntax that compiles into the current VNode
structure. The compiler is independent from the final render runtime.

```popi
component CounterActions {
  fragment {
    button("+", on:click=increase)
    button("-", on:click=decrease)
  }
}

component CounterCard {
  div(isBoundary, className="counter") {
    h2("Compiled counter")
    div("Count: {count:0}")
    CounterActions(increase=increase, decrease=decrease)
  }
}
```

Handlers can be declared inside the component:

```popi
component EchoCard {
  handler updateMessage {
    update { echo: event.target.value }
  }

  div(isBoundary, className="echo") {
    input(placeholder="type here", on:input=updateMessage)
    div("Echo: {echo:}")
  }
}
```

`update { ... }` compiles to a scoped render update for the current boundary.
Handlers can also use regular JavaScript and `await`.

```popi
handler loadUsers {
  update { serverStatus: "loading" }
  const response = await fetch("/api/mock/users");
  const payload = await response.json();
  update { serverStatus: "loaded", userCount: payload.users.length }
}
```

Effects are also supported:

```popi
component OperationsWorkspace {
  effect syncStatusStyle {
    const element = node as HTMLElement;
    element.dataset.status = String(state.workflowStatus ?? "idle");
  }

  effect mirrorTitle {
    const element = node as HTMLElement;
    element.title = `status: ${state.workflowStatus ?? "idle"}`;
  }

  div(isBoundary) {
    div("Status: {workflowStatus:idle}")
  }
}
```

Compile a `.popi` file in this repository:

```bash
bun run compile:popi compiler/examples/Counter.popi generated/Counter.ts
```

Use the compiler from code:

```ts
import { compilePopi } from "@xdstriker/pulsedom/compiler";

const output = compilePopi(source);
```

Use direct `.popi` imports in a Bun build:

```ts
import { popiPlugin } from "@xdstriker/pulsedom/popi-plugin";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./build",
  plugins: [popiPlugin()]
});
```

Then TypeScript can import compiled `.popi` components at build time:

```ts
import { CounterCard, EchoCard } from "./components/Counter.popi";
```

## Local Demo

Install dependencies:

```bash
bun install
```

Run the demo server:

```bash
bun dev
```

`bun dev` runs `build.ts`, compiles the `.popi` examples into `generated/popi`,
builds the demo bundle, and starts `index.js`.

## Publishing Checklist

Before publishing to npm:

```bash
bun install
bun run compile:popi compiler/examples/Counter.popi generated/Counter.ts
npm pack --dry-run
npm publish --access public
```

Use `npm pack --dry-run` to verify that the package contains only the runtime
source, compiler source, examples, docs, license, and demo files expected by the
`files` field in `package.json`.

## Notes For Maintainers

The performance and bundle goals are part of the design contract. When adding
features, prefer small exported helpers, optional imports, scoped DOM work, and
compiler output that stays close to the runtime VNode structure.

Implementation notes for future LLM/code agents live in `AGENTS.md`.
