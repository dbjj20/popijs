
import {FvNode, VNode} from "./types/vnode";
import { applyPropsToElement, runEffect } from "./render/propsApplier";
import { treeSaver } from "./store/tinyStore";

const [flatNode, setFlatNode] = treeSaver<Record<number, any>>({});

function addNode(tree: VNode, parentId?: number) {
  if (flatNode()[tree.id]) return;

  const node = tree.tagName === "fragment"
    ? document.createDocumentFragment()
    : document.createElement(tree.tagName);

  (node as any).key = tree.id;

  setFlatNode((p) => {
    p[tree.id] = {
      node,
      vNode: tree,
      parentId,
      isParent: Boolean(tree.elementProperties?.isParent),
      isBoundary: Boolean(tree.elementProperties?.isBoundary),
      events: tree.elementProperties.events,
      events_map: new Map()
    };
    return p;
  });
}

function extractIfCfTree(tree: any): VNode {
  return tree?.tree || tree;
}

function renderChildren(tree: VNode, vnode: Node, state?: any) {
  const children = tree.elementProperties.children;
  if (Array.isArray(children) && children.length > 0) {
    for (let i = 0; i < children.length; i += 1) {
      recursiveRender(children[i], vnode, "create", state, tree.id);
    }
  }
}

function findNearestUpdateScopeId(nodes: Record<number, any>, startId: number): number {
  let currentId: number | undefined = startId;
  let nearestParentId: number | undefined;

  while (currentId != null) {
    const entry = nodes[currentId];
    if (!entry) return startId;
    if (entry.isBoundary) return currentId;
    if (entry.isParent && nearestParentId == null) nearestParentId = currentId;
    currentId = entry.parentId;
  }

  return nearestParentId ?? startId;
}

const [objTree, setObjTree] = treeSaver<any>({});
setObjTree({})
objTree()
export { objTree, setObjTree };

export default function recursiveRender(
  vTree: FvNode | VNode,
  root: HTMLElement | DocumentFragment = document.getElementById("v2render")!,
  action: "create" | "update" = "create",
  state?: Record<string, any>,
  parentId?: number
): void {
  if (!vTree) return;

  const tree = extractIfCfTree(vTree);
  let vnode;

  if (action === "create") {
    addNode(tree, parentId);
    vnode = applyPropsToElement(tree, "create", state, flatNode, setFlatNode);
  }

  if (action === "update") {
    const domNode = root as HTMLElement;
    const key = (domNode as any)?.key;
    if (key == null) return;

    const nodes = flatNode();
    const boundaryId = findNearestUpdateScopeId(nodes, key);
    const boundaryEntry = nodes[boundaryId];
    const vNodeToUpdate = boundaryEntry?.vNode;
    if (!vNodeToUpdate) return;

    const mergedState = boundaryEntry.state || (boundaryEntry.state = {});
    let changedKeys: Record<string, any> | undefined;
    if (state) {
      for (const key in state) {
        mergedState[key] = state[key];
        changedKeys = state;
      }
    }

    applyPropsToElement(vNodeToUpdate, "update", mergedState, flatNode, setFlatNode, changedKeys);
    return;
  }

  renderChildren(tree, vnode, state);
  root.appendChild(vnode);
  runEffect(tree, "create", state, flatNode, setFlatNode);
}
