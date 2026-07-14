declare module "*.popi" {
  import type { VNode } from "./vnode";

  export const CounterCard: (scope?: Record<string, any>) => VNode;
  export const EchoCard: (scope?: Record<string, any>) => VNode;
  export const ServerDataPanel: (scope?: Record<string, any>) => VNode;
}
