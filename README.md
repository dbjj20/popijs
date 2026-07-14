# popijs

## Project goal

The goal of this render library is extreme rendering efficiency with the smallest
practical bundle size. Design decisions should favor minimal DOM work, scoped
updates, event reuse, avoiding unnecessary tree traversal or text replacement,
and keeping abstractions small enough to compile into compact output.

The library should also stay tree-shakable: consumers should only bundle the
functions they import. Unused helpers, components, and optional APIs should be
ignored by the final bundle, similar to how Tailwind only emits the CSS that is
actually used.

For implementation notes aimed at future LLM/code agents, see `AGENTS.md`.

## Optional syntax compiler

The `.popi` compiler is a build-time tool. It is not imported by the render
runtime and should not be part of the final renderlib bundle.

Example syntax:

```popi
component CounterCard {
  div(isBoundary, className="capability") {
    h2("Compiled counter")
    div("Count: {count:0}")
    button("+", on:click=increase)
  }
}
```

Components in the same `.popi` file can call each other as tags:

```popi
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

Handlers can also live inside `.popi` components:

```popi
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

Handlers can use `await`; the compiler emits an async function when needed. A
more real component can request demo server data and update its boundary:

```popi
handler loadUsers {
  update { serverStatus: "loading" }
  const response = await fetch("/api/mock/users");
  const payload = await response.json();
  update { serverStatus: "loaded", userCount: payload.users.length }
}
```

Components can also define local effects. Multiple `effect` blocks are compiled
into the root VNode as `effect: [firstEffect, secondEffect]`:

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

Compile it into the current VNode structure:

```bash
bun run compile:popi compiler/examples/Counter.popi generated/Counter.ts
```

The generated component imports from `dadyjs/virtual-node`, so bundlers can keep
tree-shaking runtime helpers independently from the compiler.

During local builds you can also import `.popi` files directly from TypeScript:

```ts
import { CounterCard } from "../../compiler/examples/Counter.popi";
```

`build.ts` registers a Bun plugin that converts that import at build time. The
plugin is tooling only; it is not imported by `src/index.ts`.

`bun dev` also runs the compiler automatically through `build.ts`, compiling
`.popi` files from `compiler/examples` into `generated/popi` before building the
demo bundle.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun index.js
```

This project was created using `bun init` in bun v1.1.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
