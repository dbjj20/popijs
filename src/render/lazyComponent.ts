import { t } from "../core/virtualNode";
import { replaceBoundary } from "../index";
import type { EffectFunction, VNode, VNodeProps } from "../types/vnode";

type ComponentFactory<TArgs extends any[]> = (...args: TArgs) => VNode;

export interface LazyComponentOptions {
  tagName?: string;
  props?: VNodeProps;
  loadingText?: string;
  errorText?: string;
  state?: Record<string, any>;
  onError?: (error: unknown) => void;
}

function appendEffect(
  existing: VNodeProps["effect"],
  next: EffectFunction
): VNodeProps["effect"] {
  if (!existing) return next;
  if (Array.isArray(existing)) return [next, ...existing];
  return [next, existing];
}

export function lazyComponent<TArgs extends any[]>(
  loader: () => Promise<ComponentFactory<TArgs>>,
  options: LazyComponentOptions = {}
): ComponentFactory<TArgs> {
  let loaded: ComponentFactory<TArgs> | undefined;
  let pending: Promise<ComponentFactory<TArgs>> | undefined;

  return (...args: TArgs) => {
    if (loaded) return loaded(...args);

    const loadEffect: EffectFunction = (node) => {
      let cancelled = false;
      const request = pending || (pending = loader().then((component) => {
        loaded = component;
        return component;
      }));

      request
        .then((component) => {
          if (!cancelled) {
            replaceBoundary(node as HTMLElement, component(...args), options.state);
          }
        })
        .catch((error) => {
          if (options.onError) options.onError(error);
          if (!cancelled && options.errorText != null) {
            node.textContent = options.errorText;
          }
        });

      return () => {
        cancelled = true;
      };
    };

    const props = options.props || {};

    return t(options.tagName || "div", {
      ...props,
      isBoundary: true,
      text: props.text ?? options.loadingText ?? "",
      effect: appendEffect(props.effect, loadEffect)
    });
  };
}
