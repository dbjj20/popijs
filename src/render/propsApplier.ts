
import { template } from "../core/template";
import { VNode } from "../types/vnode";

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

  if (props.className) node.className = props.className;

  if (props.style) {
    Object.entries(props.style).forEach(([k, v]) => {
      (node.style as any)[k] = v;
    });
  }

  const excludeList = ["style", "className", "text", "children"];
  Object.keys(props).forEach((k) => {
    if (!excludeList.includes(k)) {
      (node as any)[k] = (props as any)[k];
    }
  });

  if (props.text) {
    const text = new Text(String(template(props.text, state)));
    if (action === "update" && node.childNodes[0]?.nodeName === "#text") {
      node.childNodes[0].replaceWith(text);
    } else if (action === "create") {
      node.appendChild(text);
    }
  }

  if (events) {
    Object.entries(events).forEach(([eventName, fn]) => {
      if (!events_map?.[fn.name]) {
        node.addEventListener(eventName, (event: Event) => {
          const promise = new Promise((resolve) => {
            if (!fn(event, node)) resolve("after action");
          });
          promise.then((res) => console.log("executed", res));
        });
        setFlatNode((p) => ({
          ...p,
          [id]: { ...p[id], events_map: { ...p[id].events_map, [fn.name]: true } }
        }));
      }
    });
  }

  if (action === "update" && Array.isArray(props.children)) {
    props.children.forEach((child) => {
      applyPropsToElement(child, action, state, flatNode, setFlatNode);
    });
  }
  return node;
}
