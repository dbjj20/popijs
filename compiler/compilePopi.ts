import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

type TokenType = "identifier" | "string" | "number" | "symbol" | "eof";

type Token = {
  type: TokenType;
  value: string;
  index: number;
};

type ValueNode =
  | { kind: "string"; value: string }
  | { kind: "number"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "identifier"; value: string };

type PropNode = {
  name: string;
  value: ValueNode;
};

type EventNode = {
  name: string;
  handler: string;
};

type ElementNode = {
  tag: string;
  text?: string;
  props: PropNode[];
  events: EventNode[];
  children: ElementNode[];
};

type ComponentNode = {
  name: string;
  root: ElementNode;
};

const helperTags = new Set(["div", "button", "h1", "fragment"]);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "/" && source[index + 1] === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }

    if (char === "#") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }

    if ("{}(),=:".includes(char)) {
      tokens.push({ type: "symbol", value: char, index });
      index += 1;
      continue;
    }

    if (char === "\"" || char === "'") {
      const quote = char;
      const start = index;
      let value = "";
      index += 1;

      while (index < source.length && source[index] !== quote) {
        if (source[index] === "\\" && index + 1 < source.length) {
          value += source[index + 1];
          index += 2;
          continue;
        }
        value += source[index];
        index += 1;
      }

      if (source[index] !== quote) {
        throw new Error(`Unterminated string at ${start}`);
      }

      index += 1;
      tokens.push({ type: "string", value, index: start });
      continue;
    }

    if (/[0-9]/.test(char)) {
      const start = index;
      while (index < source.length && /[0-9.]/.test(source[index])) index += 1;
      tokens.push({ type: "number", value: source.slice(start, index), index: start });
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      const start = index;
      while (index < source.length && /[A-Za-z0-9_$-]/.test(source[index])) index += 1;
      tokens.push({ type: "identifier", value: source.slice(start, index), index: start });
      continue;
    }

    throw new Error(`Unexpected character "${char}" at ${index}`);
  }

  tokens.push({ type: "eof", value: "", index: source.length });
  return tokens;
}

class Parser {
  private current = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): ComponentNode[] {
    const components: ComponentNode[] = [];

    while (!this.matchType("eof")) {
      components.push(this.parseComponent());
    }

    return components;
  }

  private parseComponent(): ComponentNode {
    this.expectIdentifier("component");
    const name = this.expectType("identifier").value;
    this.expectSymbol("{");
    const root = this.parseElement();
    this.expectSymbol("}");
    return { name, root };
  }

  private parseElement(): ElementNode {
    const tag = this.expectType("identifier").value;
    const element: ElementNode = { tag, props: [], events: [], children: [] };

    if (this.matchSymbol("(")) {
      this.consumeSymbol("(");
      if (!this.matchSymbol(")")) {
        this.parseArgs(element);
      }
      this.expectSymbol(")");
    }

    if (this.matchSymbol("{")) {
      this.consumeSymbol("{");
      while (!this.matchSymbol("}")) {
        element.children.push(this.parseElement());
      }
      this.expectSymbol("}");
    }

    return element;
  }

  private parseArgs(element: ElementNode): void {
    while (true) {
      if (this.matchType("string")) {
        element.text = this.expectType("string").value;
      } else if (this.matchIdentifier("on")) {
        this.consumeType("identifier");
        this.expectSymbol(":");
        const eventName = this.expectType("identifier").value;
        this.expectSymbol("=");
        const handler = this.expectType("identifier").value;
        element.events.push({ name: eventName, handler });
      } else {
        const name = this.expectType("identifier").value;
        if (this.matchSymbol("=")) {
          this.consumeSymbol("=");
          element.props.push({ name, value: this.parseValue() });
        } else {
          element.props.push({ name, value: { kind: "boolean", value: true } });
        }
      }

      if (!this.matchSymbol(",")) break;
      this.consumeSymbol(",");
    }
  }

  private parseValue(): ValueNode {
    if (this.matchType("string")) {
      return { kind: "string", value: this.expectType("string").value };
    }

    if (this.matchType("number")) {
      return { kind: "number", value: this.expectType("number").value };
    }

    const identifier = this.expectType("identifier").value;
    if (identifier === "true") return { kind: "boolean", value: true };
    if (identifier === "false") return { kind: "boolean", value: false };
    return { kind: "identifier", value: identifier };
  }

  private matchType(type: TokenType): boolean {
    return this.tokens[this.current].type === type;
  }

  private matchSymbol(value: string): boolean {
    const token = this.tokens[this.current];
    return token.type === "symbol" && token.value === value;
  }

  private matchIdentifier(value: string): boolean {
    const token = this.tokens[this.current];
    return token.type === "identifier" && token.value === value;
  }

  private consumeType(type: TokenType): Token {
    return this.expectType(type);
  }

  private consumeSymbol(value: string): Token {
    return this.expectSymbol(value);
  }

  private expectType(type: TokenType): Token {
    const token = this.tokens[this.current];
    if (token.type !== type) {
      throw new Error(`Expected ${type} at ${token.index}, got "${token.value}"`);
    }
    this.current += 1;
    return token;
  }

  private expectSymbol(value: string): Token {
    const token = this.tokens[this.current];
    if (token.type !== "symbol" || token.value !== value) {
      throw new Error(`Expected "${value}" at ${token.index}, got "${token.value}"`);
    }
    this.current += 1;
    return token;
  }

  private expectIdentifier(value: string): Token {
    const token = this.tokens[this.current];
    if (token.type !== "identifier" || token.value !== value) {
      throw new Error(`Expected "${value}" at ${token.index}, got "${token.value}"`);
    }
    this.current += 1;
    return token;
  }
}

function printValue(value: ValueNode, refs: Set<string>): string {
  if (value.kind === "string") return JSON.stringify(value.value);
  if (value.kind === "number") return value.value;
  if (value.kind === "boolean") return value.value ? "true" : "false";
  refs.add(value.value);
  return value.value;
}

function printElement(element: ElementNode, refs: Set<string>, indent = 2): string {
  const pad = " ".repeat(indent);
  const nextPad = " ".repeat(indent + 2);
  const props: string[] = [];

  if (element.text != null) {
    props.push(`text: ${JSON.stringify(element.text)}`);
  }

  for (let i = 0; i < element.props.length; i += 1) {
    const prop = element.props[i];
    props.push(`${prop.name}: ${printValue(prop.value, refs)}`);
  }

  if (element.events.length > 0) {
    const events = element.events.map((event) => {
      refs.add(event.handler);
      return `${event.name}: ${event.handler}`;
    });
    props.push(`events: { ${events.join(", ")} }`);
  }

  if (element.children.length > 0) {
    const children = element.children
      .map((child) => printElement(child, refs, indent + 4))
      .join(",\n");
    props.push(`children: [\n${children}\n${nextPad}]`);
  }

  const callee = helperTags.has(element.tag) ? element.tag : `t(${JSON.stringify(element.tag)}`;
  const propsText = props.length > 0 ? `{\n${nextPad}${props.join(`,\n${nextPad}`)}\n${pad}}` : "{}";

  if (helperTags.has(element.tag)) {
    return `${pad}${callee}(${propsText})`;
  }

  return `${pad}${callee}, ${propsText})`;
}

function printComponent(component: ComponentNode): string {
  const refs = new Set<string>();
  const root = printElement(component.root, refs, 2);
  const refList = [...refs].sort();
  const destructure = refList.length > 0
    ? `\n  const { ${refList.join(", ")} } = scope;\n`
    : "";

  return `export const ${component.name} = (scope: Record<string, any> = {}) => {${destructure}\n  return ${root.trim()};\n};`;
}

function collectImports(element: ElementNode, imports: Set<string>): void {
  imports.add(helperTags.has(element.tag) ? element.tag : "t");

  for (let i = 0; i < element.children.length; i += 1) {
    collectImports(element.children[i], imports);
  }
}

export function compilePopi(source: string): string {
  const components = new Parser(tokenize(source)).parse();
  const imports = new Set<string>();

  for (let i = 0; i < components.length; i += 1) {
    collectImports(components[i].root, imports);
  }

  const importList = [...imports].sort().join(", ");
  const body = components.map(printComponent).join("\n\n");

  return `import { ${importList} } from "dadyjs/virtual-node";\n\n${body}\n`;
}

if (import.meta.main) {
  const [, , inputPath, outputPath] = Bun.argv;

  if (!inputPath || !outputPath) {
    console.error("Usage: bun compiler/compilePopi.ts <input.popi> <output.ts>");
    process.exit(1);
  }

  const source = await Bun.file(inputPath).text();
  await mkdir(dirname(outputPath), { recursive: true });
  await Bun.write(outputPath, compilePopi(source));
}
