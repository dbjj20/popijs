declare module "*.pl" {
  import type { VNode } from "./vnode";

  export const CounterActions: (scope?: Record<string, any>) => VNode;
  export const CounterCard: (scope?: Record<string, any>) => VNode;
  export const EchoCard: (scope?: Record<string, any>) => VNode;
  export const OperationsWorkspace: (scope?: Record<string, any>) => VNode;
  export const ServerDataPanel: (scope?: Record<string, any>) => VNode;
  export const WorkspaceSummary: (scope?: Record<string, any>) => VNode;
}
