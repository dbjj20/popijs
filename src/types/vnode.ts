
export interface VNodeProps {
  className?: string;
  text?: string;
  events?: Record<string, (e: Event, node: HTMLElement) => void>;
  style?: Partial<CSSStyleDeclaration>;
  tagDomProps?: Record<string, any>;
  children?: VNode[];
  effect?: () => void;
  isParent?: boolean;
}

export interface VNode {
  id: number;
  tagName: string;
  isFragment?: boolean;
  elementProperties: VNodeProps;
}

export type FvNode = () => VNode;
