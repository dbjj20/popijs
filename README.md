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
