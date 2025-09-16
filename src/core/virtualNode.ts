
import { sequentialId } from "./sequentialId";
import { VNode, VNodeProps } from "../types/vnode";

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
  const node = createCompoundVirtualNode(tagName, props);
  return node[node.id];
}

export const div = (props: VNodeProps) => createElement("div", props);
export const button = (props: VNodeProps) => createElement("button", props);
export const h1 = (props: VNodeProps) => createElement("h1", props);
export const fragment = (props: VNodeProps) => createElement("fragment", props);
export const t = (tagName: string, props: VNodeProps) => createElement(tagName, props);
