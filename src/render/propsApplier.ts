
import { template } from "../core/template";
import { VNode } from "../types/vnode";

type StoredListener = {
  original: (e: Event, node: HTMLElement) => void;
  wrapped: EventListener;
};

type EventRegistry = Map<string, StoredListener>;

export function applyPropsToElement(
  vNode: VNode,
  action: "create" | "update",
  state: Record<string, any> = {},
  flatNode: () => Record<number, any>,
  setFlatNode: (updater: (prev: Record<number, any>) => Record<number, any>) => void
): Node {
  if (action === "update") {
   // debugger
  }
  const { elementProperties, id } = vNode;
  const { node, events, events_map } = flatNode()[id];
  const props = elementProperties;

  if (node instanceof HTMLElement && props.className) {
    node.className = props.className;
  }

  if (props.style) {
    Object.entries(props.style).forEach(([k, v]) => {
      if (node instanceof HTMLElement) {
        (node.style as any)[k] = v;
      }
    });
  }

  const excludeList = ["style", "className", "text", "children"];
  Object.keys(props).forEach((k) => {
    if (!excludeList.includes(k)) {
      (node as any)[k] = (props as any)[k];
    }
  });

  if (props.text) {
    const renderedText = String(template(props.text, state));
    const text = new Text(renderedText);
    if (action === "update" && node.childNodes[0]?.nodeName === "#text") {
      node.childNodes[0].replaceWith(text);
    } else if (action === "create") {
      node.appendChild(text);
    }
  }

  if (events) {
    const registry: EventRegistry = events_map instanceof Map ? events_map : new Map();

    // Remove listeners that are no longer present or changed
    registry.forEach((stored, eventName) => {
      if (!events[eventName] || events[eventName] !== stored.original) {
        node.removeEventListener(eventName, stored.wrapped);
        registry.delete(eventName);
      }
    });

    Object.entries(events).forEach(([eventName, fn]) => {
      const stored = registry.get(eventName);
      if (stored && stored.original === fn) {
        return;
      }

      if (stored) {
        node.removeEventListener(eventName, stored.wrapped);
      }

      const wrapped: EventListener = (event: Event) => {
        fn(event, node as HTMLElement);
      };

      node.addEventListener(eventName, wrapped);

      registry.set(eventName, { original: fn, wrapped });
    });

    setFlatNode((p) => ({
      ...p,
      [id]: { ...p[id], events_map: registry }
    }));
  }

  if (action === "update" && Array.isArray(props.children)) {
    props.children.forEach((child) => {
      applyPropsToElement(child, action, state, flatNode, setFlatNode);
    });
  }
  return node;
}
