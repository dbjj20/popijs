
import { sequentialId } from "./sequentialId";
import { VNode, VNodeProps } from "../types/vnode";

export const SVG_NS = "http://www.w3.org/2000/svg";

export const propsDefinition: VNodeProps = {
  className: "",
  text: undefined,
  events: {},
  style: {},
  tagDomProps: {},
  children: [],
  isParent: false
};

export function createCompoundVirtualNode(tagName: string, props: VNodeProps = propsDefinition): Record<number, VNode> & { id: number } {
  const id = sequentialId();

  const node: VNode = {
    id,
    tagName: tagName === "fragment" ? "fragment" : tagName,
    isFragment: tagName === "fragment",
    elementProperties: { ...props }
  };

  return { id, [id]: node };
}

export function createElement(tagName: string, props: VNodeProps): VNode {
  const hasChildren = Array.isArray(props?.children) && props.children.length > 0;
  const isFragment = tagName === "fragment";

  return {
    id: sequentialId(),
    tagName: isFragment ? "fragment" : tagName,
    isFragment,
    elementProperties: {
      ...props,
      // A "nano component" is any element that has children (leaf nodes are plain elements).
      isParent: props?.isParent ?? hasChildren
    }
  };
}

export const div = (props: VNodeProps) => createElement("div", props);
export const button = (props: VNodeProps) => createElement("button", props);
export const h1 = (props: VNodeProps) => createElement("h1", props);
export const fragment = (props: VNodeProps) => createElement("fragment", props);
export const t = (tagName: string, props: VNodeProps) => createElement(tagName, props);
export const svg = (props: VNodeProps) => createElement("svg", { ...props, namespace: SVG_NS });
export const ns = (tagName: string, props: VNodeProps, namespace = SVG_NS) =>
  createElement(tagName, { ...props, namespace });

// Marks the node as an isolated boundary (state/update scope) without requiring a re-render model.
export const component = (tagName: string, props: VNodeProps) =>
  createElement(tagName, { ...props, isBoundary: true });

// Semantic alias for dynamic list/conditional roots that should be replaced as a unit.
export const island = component;
