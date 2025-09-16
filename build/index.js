// src/core/template.ts
function template(template2, values) {
  if (!values)
    return template2;
  let replaced = false;
  const result = template2.replace(/{(.*?)}/g, (_, key) => {
    const value = key ? values[key] : undefined;
    if (value === undefined || value === null) {
      return `{${key}}`;
    }
    replaced = true;
    return String(value);
  });
  return replaced ? result : template2;
}

// src/render/propsApplier.ts
function applyPropsToElement(vNode, action, state = {}, flatNode, setFlatNode) {
  if (action === "update") {}
  const { elementProperties, id } = vNode;
  const { node, events, events_map } = flatNode()[id];
  const props = elementProperties;
  if (node instanceof HTMLElement && props.className) {
    node.className = props.className;
  }
  if (props.style) {
    Object.entries(props.style).forEach(([k, v]) => {
      if (node instanceof HTMLElement) {
        node.style[k] = v;
      }
    });
  }
  const excludeList = ["style", "className", "text", "children"];
  Object.keys(props).forEach((k) => {
    if (!excludeList.includes(k)) {
      node[k] = props[k];
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
    const registry = events_map instanceof Map ? events_map : new Map;
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
      const wrapped = (event) => {
        fn(event, node);
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

// src/store/tinyStore.ts
var treeSaver = (initialState, options) => {
  if (options?.beforeInit && typeof options.beforeInit === "function") {
    options.beforeInit();
  }
  let tinyStoreState = initialState;
  const copyObj = (obj) => {
    if (obj && typeof obj === "object") {
      return { ...obj };
    }
    return obj;
  };
  const getProps = () => {
    return copyObj(tinyStoreState);
  };
  const setProps = (propsOrSetter) => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = copyObj(propsOrSetter(tinyStoreState));
      return;
    }
    tinyStoreState = copyObj(propsOrSetter);
  };
  return [getProps, setProps];
};

// src/index.ts
var [flatNode, setFlatNode] = treeSaver({});
function addNode(tree) {
  if (tree.tagName !== "fragment" && !flatNode()[tree.id]) {
    const node = document.createElement(tree.tagName);
    node.key = tree.id;
    setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: new Map } }));
  }
  if (tree.tagName === "fragment" && !flatNode()[tree.id]) {
    const node = document.createDocumentFragment();
    node.key = tree.id;
    setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: new Map } }));
  }
}
function addEvents(tree) {
  const { events } = tree.elementProperties;
  setFlatNode((p) => ({
    ...p,
    [tree.id]: { ...p[tree.id], events }
  }));
}
function extractIfCfTree(tree) {
  return tree?.tree || tree;
}
function renderChildren(tree, vnode, action, state) {
  const children = tree.elementProperties.children;
  if (Array.isArray(children) && children.length > 0) {
    children.forEach((branch) => {
      if (action === "update") {
        return recursiveRender(branch, flatNode()[branch.id].node, action, state);
      }
      recursiveRender(branch, vnode, action, state);
    });
  }
}
function findNodeIterative(tree, targetId, updateFunc) {
  const stack = [tree];
  while (stack.length > 0) {
    const currentNode = stack.pop();
    if (currentNode.id === targetId) {
      updateFunc(currentNode, "update");
      return;
    }
    if (currentNode.children) {
      stack.push(...currentNode.children);
    }
    if (currentNode?.elementProperties?.children) {
      stack.push(...currentNode?.elementProperties?.children);
    }
  }
}
var [objTree, setObjTree] = treeSaver({});
setObjTree({});
objTree();
function recursiveRender(vTree, root = document.getElementById("v2render"), action = "create", state) {
  if (!vTree)
    return;
  const tree = extractIfCfTree(vTree);
  let vnode;
  if (action === "create") {
    addNode(tree);
    addEvents(tree);
    vnode = applyPropsToElement(tree, "create", state, flatNode, setFlatNode);
  }
  if (action === "update") {
    const domNode = root;
    const key = domNode?.key;
    if (key == null) {
      return;
    }
    const existingNode = flatNode()[key];
    if (existingNode) {
      findNodeIterative(tree, key, (foundNode) => {
        applyPropsToElement(foundNode, "update", state, flatNode, setFlatNode);
      });
    }
    return;
  }
  root.appendChild(vnode);
  renderChildren(tree, vnode, "create", state);
}
export {
  setObjTree,
  objTree,
  recursiveRender as default
};
