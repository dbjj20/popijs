
import { FvNode, VNode } from "./types/vnode";
import { applyPropsToElement, runEffect } from "./render/propsApplier";
import { treeSaver } from "./store/tinyStore";

const SVG_NS = "http://www.w3.org/2000/svg";
const [flatNode, setFlatNode] = treeSaver<Record<number, any>>({});

function addNode(tree: VNode, parentId?: number) {
  if (flatNode()[tree.id]) return;

  const parentEntry = parentId == null ? undefined : flatNode()[parentId];
  const namespace = tree.elementProperties?.namespace
    || (parentEntry?.namespace === SVG_NS && tree.tagName !== "foreignObject" ? SVG_NS : undefined);
  const node = tree.tagName === "fragment"
    ? document.createDocumentFragment()
    : namespace
    ? document.createElementNS(namespace, tree.tagName)
    : document.createElement(tree.tagName);

  (node as any).key = tree.id;

  setFlatNode((p) => {
    p[tree.id] = {
      node,
      vNode: tree,
      parentId,
      namespace,
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
setObjTree({});
objTree();
export { objTree, setObjTree };

function cleanupEntry(entry: any): void {
  if (!entry) return;

  if (Array.isArray(entry.effect_cleanup)) {
    for (let i = 0; i < entry.effect_cleanup.length; i += 1) {
      entry.effect_cleanup[i]();
    }
  } else if (typeof entry.effect_cleanup === "function") {
    entry.effect_cleanup();
  }

  const registry = entry.events_map;
  if (registry instanceof Map) {
    registry.forEach((stored, eventName) => {
      entry.node.removeEventListener(eventName, stored.wrapped);
    });
    registry.clear();
  }
}

function cleanupSubtree(rootId: number): void {
  const nodes = flatNode();

  for (const id in nodes) {
    if (nodes[id].parentId === rootId) {
      cleanupSubtree(Number(id));
    }
  }

  cleanupEntry(nodes[rootId]);
  delete nodes[rootId];
}

export function resetRender(): void {
  const nodes = flatNode();

  for (const id in nodes) {
    cleanupEntry(nodes[id]);
  }

  setFlatNode({});
  setObjTree({});
}

export function unmount(
  root: HTMLElement | DocumentFragment | null = typeof document === "undefined"
    ? null
    : document.getElementById("v2render")
): void {
  resetRender();
  if (root) root.textContent = "";
}

export function replaceBoundary(
  node: HTMLElement,
  nextTree: FvNode | VNode,
  state?: Record<string, any>
): void {
  const key = (node as any)?.key;
  if (key == null) return;

  const nodes = flatNode();
  const boundaryId = findNearestUpdateScopeId(nodes, key);
  const boundaryEntry = nodes[boundaryId];
  const parentNode = boundaryEntry?.node?.parentNode;
  if (!boundaryEntry || !parentNode) return;

  const next = extractIfCfTree(nextTree);
  const fragment = document.createDocumentFragment();
  const parentId = boundaryEntry.parentId;
  const oldNode = boundaryEntry.node;

  cleanupSubtree(boundaryId);
  recursiveRender(next, fragment, "create", state, parentId);
  parentNode.replaceChild(fragment, oldNode);
}

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
