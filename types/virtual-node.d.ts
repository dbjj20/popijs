import type { VNode, VNodeProps } from "./vnode";

export type { VNode, VNodeProps };

export declare const SVG_NS = "http://www.w3.org/2000/svg";
export declare const propsDefinition: VNodeProps;

export declare function createCompoundVirtualNode(
  tagName: string,
  props?: VNodeProps
): Record<number, VNode> & { id: number };

export declare function createElement(tagName: string, props: VNodeProps): VNode;

export declare const div: (props: VNodeProps) => VNode;
export declare const button: (props: VNodeProps) => VNode;
export declare const h1: (props: VNodeProps) => VNode;
export declare const fragment: (props: VNodeProps) => VNode;
export declare const t: (tagName: string, props: VNodeProps) => VNode;
export declare const svg: (props: VNodeProps) => VNode;
export declare const ns: (tagName: string, props: VNodeProps, namespace?: string) => VNode;
export declare const component: (tagName: string, props: VNodeProps) => VNode;
export declare const island: (tagName: string, props: VNodeProps) => VNode;
