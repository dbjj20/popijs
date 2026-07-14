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

type HandlerNode = {
  name: string;
  params: string;
  body: string;
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
  handlers: HandlerNode[];
  root: ElementNode;
};

const helperTags = new Set(["div", "button", "h1", "fragment"]);

function findMatchingDelimiter(source: string, openIndex: number, open: string, close: string): number {
  let depth = 0;
  let quote = "";

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (quote) {
      if (char === "\\" && i + 1 < source.length) {
        i += 1;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }

    if ((char === "/" && next === "/") || char === "#") {
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  throw new Error(`Missing "${close}" for "${open}" at ${openIndex}`);
}

function isIdentifierChar(char: string): boolean {
  return /[A-Za-z0-9_$]/.test(char);
}

function startsWithWord(source: string, index: number, word: string): boolean {
  if (!source.startsWith(word, index)) return false;

  const before = source[index - 1] ?? "";
  const after = source[index + word.length] ?? "";
  return !isIdentifierChar(before) && !isIdentifierChar(after);
}

function skipWhitespace(source: string, index: number): number {
  while (index < source.length && /\s/.test(source[index])) index += 1;
  return index;
}

function readIdentifier(source: string, index: number): { value: string; next: number } {
  const start = index;

  if (!/[A-Za-z_$]/.test(source[index] ?? "")) {
    throw new Error(`Expected identifier at ${index}`);
  }

  while (index < source.length && /[A-Za-z0-9_$]/.test(source[index])) index += 1;
  return { value: source.slice(start, index), next: index };
}

function removeHandlers(body: string, handlers: HandlerNode[]): string {
  let output = "";
  let cursor = 0;
  let index = 0;

  while (index < body.length) {
    if (!startsWithWord(body, index, "handler")) {
      index += 1;
      continue;
    }

    let next = skipWhitespace(body, index + "handler".length);
    const handlerName = readIdentifier(body, next);
    next = skipWhitespace(body, handlerName.next);

    let params = "event, node";
    if (body[next] === "(") {
      const paramsEnd = findMatchingDelimiter(body, next, "(", ")");
      params = body.slice(next + 1, paramsEnd).trim();
      next = skipWhitespace(body, paramsEnd + 1);
    }

    if (body[next] !== "{") {
      throw new Error(`Expected handler body at ${next}`);
    }

    const bodyEnd = findMatchingDelimiter(body, next, "{", "}");
    handlers.push({
      name: handlerName.value,
      params,
      body: body.slice(next + 1, bodyEnd).trim()
    });

    output += body.slice(cursor, index);
    cursor = bodyEnd + 1;
    index = cursor;
  }

  return output + body.slice(cursor);
}

function extractHandlers(source: string): { source: string; handlers: Map<string, HandlerNode[]> } {
  const handlers = new Map<string, HandlerNode[]>();
  const componentPattern = /component\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\{/g;
  let output = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = componentPattern.exec(source))) {
    const name = match[1];
    const openIndex = source.indexOf("{", match.index);
    const closeIndex = findMatchingDelimiter(source, openIndex, "{", "}");
    const bodyStart = openIndex + 1;
    const body = source.slice(bodyStart, closeIndex);
    const componentHandlers: HandlerNode[] = [];

    output += source.slice(cursor, bodyStart);
    output += removeHandlers(body, componentHandlers);
    cursor = closeIndex;
    handlers.set(name, componentHandlers);
    componentPattern.lastIndex = closeIndex + 1;
  }

  return {
    source: output + source.slice(cursor),
    handlers
  };
}

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

  constructor(
    private readonly tokens: Token[],
    private readonly handlers: Map<string, HandlerNode[]>
  ) {}

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
    return { name, handlers: this.handlers.get(name) ?? [], root };
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

function printHandlerBody(source: string): string {
  let output = "";
  let cursor = 0;
  let index = 0;
  let quote = "";

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (quote) {
      if (char === "\\" && index + 1 < source.length) {
        index += 2;
        continue;
      }
      if (char === quote) quote = "";
      index += 1;
      continue;
    }

    if ((char === "/" && next === "/") || char === "#") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) index += 1;
      index += 2;
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      index += 1;
      continue;
    }

    if (!startsWithWord(source, index, "update")) {
      index += 1;
      continue;
    }

    const updateStart = index;
    index = skipWhitespace(source, index + "update".length);
    if (source[index] !== "{") {
      continue;
    }

    const patchEnd = findMatchingDelimiter(source, index, "{", "}");
    const patch = source.slice(index + 1, patchEnd).trim();
    let statementEnd = patchEnd + 1;
    if (source[statementEnd] === ";") statementEnd += 1;

    output += source.slice(cursor, updateStart);
    output += `scope.draw(scope.objTree(), node, "update", { ${patch} });`;
    cursor = statementEnd;
    index = statementEnd;
  }

  return output + source.slice(cursor);
}

function printHandler(handler: HandlerNode): string {
  const printedBody = printHandlerBody(handler.body);
  const asyncKeyword = /\bawait\b/.test(printedBody) ? "async " : "";
  const body = printedBody
    .split("\n")
    .map((line) => `    ${line.trim()}`)
    .join("\n");

  return `  const ${handler.name} = ${asyncKeyword}(${handler.params}) => {\n${body}\n  };`;
}

function printComponent(component: ComponentNode): string {
  const refs = new Set<string>();
  const root = printElement(component.root, refs, 2);
  for (let i = 0; i < component.handlers.length; i += 1) {
    refs.delete(component.handlers[i].name);
  }

  const refList = [...refs].sort();
  const destructure = refList.length > 0
    ? `\n  const { ${refList.join(", ")} } = scope;\n`
    : "";
  const handlers = component.handlers.length > 0
    ? `\n${component.handlers.map(printHandler).join("\n\n")}\n`
    : "";

  return `export const ${component.name} = (scope: Record<string, any> = {}) => {${destructure}${handlers}\n  return ${root.trim()};\n};`;
}

function collectImports(element: ElementNode, imports: Set<string>): void {
  imports.add(helperTags.has(element.tag) ? element.tag : "t");

  for (let i = 0; i < element.children.length; i += 1) {
    collectImports(element.children[i], imports);
  }
}

export function compilePopi(source: string): string {
  const extracted = extractHandlers(source);
  const components = new Parser(tokenize(extracted.source), extracted.handlers).parse();
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
