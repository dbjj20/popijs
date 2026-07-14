/// <reference path="./pl.d.ts" />

import type { FvNode, VNode } from "./vnode";

export type { FvNode, VNode };

export declare const objTree: () => any;
export declare const setObjTree: (propsOrSetter: any | ((state: any) => any)) => void;

export default function render(
  vTree: FvNode | VNode,
  root?: HTMLElement | DocumentFragment,
  action?: "create" | "update",
  state?: Record<string, any>,
  parentId?: number
): void;

export declare function resetRender(): void;
export declare function unmount(root?: HTMLElement | DocumentFragment | null): void;
export declare function replaceBoundary(
  node: HTMLElement,
  nextTree: FvNode | VNode,
  state?: Record<string, any>
): void;
