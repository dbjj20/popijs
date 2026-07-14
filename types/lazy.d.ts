import type { VNode, VNodeProps } from "./vnode";

type ComponentFactory<TArgs extends any[]> = (...args: TArgs) => VNode;

export interface LazyComponentOptions {
  tagName?: string;
  props?: VNodeProps;
  loadingText?: string;
  errorText?: string;
  state?: Record<string, any>;
  onError?: (error: unknown) => void;
}

export declare function lazyComponent<TArgs extends any[]>(
  loader: () => Promise<ComponentFactory<TArgs>>,
  options?: LazyComponentOptions
): ComponentFactory<TArgs>;
