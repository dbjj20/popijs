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

To install dependencies:

```bash
bun install
```

To run:

```bash
bun index.js
```

This project was created using `bun init` in bun v1.1.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
