
export type EffectFunction = (
  node: Node,
  state: Record<string, any>,
  action: "create" | "update"
) => void | (() => void);

export interface VNodeProps {
  [domProp: string]: any;
  className?: string;
  text?: string;
  events?: Record<string, (e: Event, node: HTMLElement) => void>;
  style?: Partial<CSSStyleDeclaration>;
  tagDomProps?: Record<string, any>;
  children?: VNode[];
  effect?: EffectFunction | EffectFunction[];
  isParent?: boolean;
  isBoundary?: boolean;
}

export interface VNode {
  id: number;
  tagName: string;
  isFragment?: boolean;
  elementProperties: VNodeProps;
}

export type FvNode = () => VNode;
