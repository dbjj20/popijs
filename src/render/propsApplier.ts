import { template } from "../core/template";
import { VNode } from "../types/vnode";

type StoredListener = {
  original: (e: Event, node: HTMLElement) => void;
  wrapped: EventListener;
};

type EventRegistry = Map<string, StoredListener>;
type RenderAction = "create" | "update";
type EffectCleanup = () => void;

function syncTextNode(node: Node, nextText: string): void {
  const existingTextNode = node.childNodes[0];

  if (existingTextNode?.nodeName !== "#text") {
    node.insertBefore(new Text(nextText), existingTextNode ?? null);
    return;
  }

  if ((existingTextNode as Text).data !== nextText) {
    existingTextNode.replaceWith(new Text(nextText));
  }
}

export function applyPropsToElement(
  vNode: VNode,
  action: RenderAction,
  state: Record<string, any> = {},
  flatNode: () => Record<number, any>,
  setFlatNode: (updater: (prev: Record<number, any>) => Record<number, any>) => void,
  changedKeys?: Record<string, any>
): Node {
  const { elementProperties, id } = vNode;
  const { node, events, events_map } = flatNode()[id];
  const props = elementProperties;
  const eventsToApply = props.events ?? events;

  if (node instanceof HTMLElement && props.className) {
    node.className = props.className;
  }

  if (props.style) {
    for (const k in props.style) {
      if (node instanceof HTMLElement) {
        (node.style as any)[k] = (props.style as any)[k];
      }
    }
  }

  for (const k in props) {
    switch (k) {
      case "style":
      case "className":
      case "text":
      case "children":
      case "events":
      case "effect":
      case "isParent":
      case "isBoundary":
      case "tagDomProps":
        break;
      default:
        (node as any)[k] = (props as any)[k];
    }
  }

  if (props.text != null) {
    if (action === "update") {
      const templateText = String(props.text);

      if (templateText.includes("{")) {
        let referencesChangedKey = false;
        if (changedKeys) {
          for (const key in changedKeys) {
            if (templateText.includes(`{${key}}`) || templateText.includes(`{${key}:`)) {
              referencesChangedKey = true;
              break;
            }
          }
        }

        if (!changedKeys || referencesChangedKey) {
          const renderedText = String(template(templateText, state));
          syncTextNode(node, renderedText);
        }
      }
    } else if (action === "create") {
      const renderedText = String(template(String(props.text), state));
      node.appendChild(new Text(renderedText));
    }
  }

  if (eventsToApply) {
    const registry: EventRegistry = events_map instanceof Map ? events_map : new Map();

    // Remove listeners that are no longer present or changed
    registry.forEach((stored, eventName) => {
      if (!eventsToApply[eventName] || eventsToApply[eventName] !== stored.original) {
        node.removeEventListener(eventName, stored.wrapped);
        registry.delete(eventName);
      }
    });

    for (const eventName in eventsToApply) {
      const fn = eventsToApply[eventName];
      const stored = registry.get(eventName);
      if (stored && stored.original === fn) {
        continue;
      }

      if (stored) {
        node.removeEventListener(eventName, stored.wrapped);
      }

      const wrapped: EventListener = (event: Event) => {
        fn(event, node as HTMLElement);
      };

      node.addEventListener(eventName, wrapped);

      registry.set(eventName, { original: fn, wrapped });
    }

    setFlatNode((p) => {
      p[id].events_map = registry;
      p[id].events = eventsToApply;
      return p;
    });
  }

  if (action === "update" && Array.isArray(props.children)) {
    for (let i = 0; i < props.children.length; i += 1) {
      const child = props.children[i];
      if (child?.elementProperties?.isBoundary) continue;
      applyPropsToElement(child, action, state, flatNode, setFlatNode, changedKeys);
    }
  }

  if (action === "update") {
    runEffect(vNode, action, state, flatNode, setFlatNode);
  }

  return node;
}

export function runEffect(
  vNode: VNode,
  action: RenderAction,
  state: Record<string, any> = {},
  flatNode: () => Record<number, any>,
  setFlatNode: (updater: (prev: Record<number, any>) => Record<number, any>) => void
): void {
  const effect = vNode.elementProperties.effect;
  const entry = flatNode()[vNode.id];

  if (!entry) return;

  if (Array.isArray(entry.effect_cleanup)) {
    for (let i = 0; i < entry.effect_cleanup.length; i += 1) {
      entry.effect_cleanup[i]();
    }
  } else if (typeof entry.effect_cleanup === "function") {
    entry.effect_cleanup();
  }

  if (typeof effect !== "function" && !Array.isArray(effect)) {
    if (entry.effect_cleanup) {
      setFlatNode((p) => {
        p[vNode.id].effect_cleanup = undefined;
        return p;
      });
    }
    return;
  }

  const cleanups: EffectCleanup[] = [];
  if (Array.isArray(effect)) {
    for (let i = 0; i < effect.length; i += 1) {
      const cleanup = effect[i](entry.node, state, action);
      if (typeof cleanup === "function") cleanups.push(cleanup);
    }
  } else {
    const cleanup = effect(entry.node, state, action);
    if (typeof cleanup === "function") cleanups.push(cleanup);
  }

  setFlatNode((p) => {
    p[vNode.id].effect_cleanup = cleanups.length > 0 ? cleanups : undefined;
    return p;
  });
}
