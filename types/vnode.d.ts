export type RenderAction = "create" | "update";

export type EffectFunction = (
  node: Node,
  state: Record<string, any>,
  action: RenderAction
) => void | (() => void);

export interface VNodeProps {
  [domProp: string]: any;
  className?: string;
  text?: string;
  events?: Record<string, (event: Event, node: HTMLElement) => void>;
  style?: Partial<CSSStyleDeclaration>;
  tagDomProps?: Record<string, any>;
  children?: VNode[];
  effect?: EffectFunction | EffectFunction[];
  isParent?: boolean;
  isBoundary?: boolean;
  namespace?: string;
}

export interface VNode {
  id: number;
  tagName: string;
  isFragment?: boolean;
  elementProperties: VNodeProps;
}

export type FvNode = () => VNode;
