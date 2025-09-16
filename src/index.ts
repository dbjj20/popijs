
import {FvNode, VNode} from "./types/vnode";
import { applyPropsToElement } from "./render/propsApplier";
import { treeSaver } from "./store/tinyStore";

const [flatNode, setFlatNode] = treeSaver<Record<number, any>>({});

function addNode(tree: VNode) {
  if (tree.tagName !== "fragment" && !flatNode()[tree.id]) {
    const node = document.createElement(tree.tagName);
    (node as any).key = tree.id;
    setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: new Map() } }));
  }

  if (tree.tagName === "fragment" && !flatNode()[tree.id]) {
    const node = document.createDocumentFragment();
    (node as any).key = tree.id;
    setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: new Map() } }));
  }
}

function addEvents(tree: VNode) {
  const { events } = tree.elementProperties;
  setFlatNode((p) => ({
    ...p,
    [tree.id]: { ...p[tree.id], events }
  }));
}

function extractIfCfTree(tree: any): VNode {
  return tree?.tree || tree;
}

function renderChildren(tree: VNode, vnode: any, action: "create" | "update", state?: any) {
  const children = tree.elementProperties.children;
  if (Array.isArray(children) && children.length > 0) {
    children.forEach((branch) => {
      if (action === "update") {
        return recursiveRender(branch, flatNode()[branch.id].node, action, state);
      }
      recursiveRender(branch, vnode, action, state);
    });
  }
}

function findNodeIterative(tree, targetId, updateFunc) {
  const stack = [tree];
  while (stack.length > 0) {
    const currentNode = stack.pop();
    if (currentNode.id === targetId) {
      updateFunc(currentNode, "update");
      return;
    }
    
    if (currentNode.children) {
      stack.push(...currentNode.children);
    }
    
    if (currentNode?.elementProperties?.children) {
      stack.push(...currentNode?.elementProperties?.children);
    }
  }
}
const [objTree, setObjTree] = treeSaver<any>({});
setObjTree({})
objTree()
export { objTree, setObjTree };

export default function recursiveRender(
  vTree: FvNode | VNode,
  root: HTMLElement | DocumentFragment = document.getElementById("v2render")!,
  action: "create" | "update" = "create",
  state?: Record<string, any>
): void {
  if (!vTree) return;

  const tree = extractIfCfTree(vTree);
  let vnode;

  if (action === "create") {
    addNode(tree);
    addEvents(tree);
    vnode = applyPropsToElement(tree, "create", state, flatNode, setFlatNode);
  }

  if (action === "update") {
    const domNode = root as HTMLElement;
    const key = (domNode as any)?.key;
    if (key == null) {
      return;
    }

    const existingNode = flatNode()[key];
    if (existingNode) {
      findNodeIterative(tree, key, (foundNode) => {
        applyPropsToElement(foundNode, "update", state, flatNode, setFlatNode);
      });
    }
    return;
  }

  root.appendChild(vnode);
  renderChildren(tree, vnode, "create", state);
}
