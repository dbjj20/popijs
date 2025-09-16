// src/core/template.ts
function template(template2, values) {
  let count = 0;
  let counterRes = false;
  if (!values)
    return template2;
  const result = template2.replace(/{(.*?)}/g, (_, key) => {
    const res = String(key ? values[key] : "");
    if (res) {
      count += 1;
      counterRes = true;
      return res;
    }
    return template2;
  });
  return count >= 1 && counterRes ? result : template2;
}

// src/render/propsApplier.ts
function applyPropsToElement(vNode, action, state = {}, flatNode, setFlatNode) {
  if (action === "update") {}
  const { elementProperties, id } = vNode;
  const { node, events, events_map } = flatNode()[id];
  const props = elementProperties;
  if (props.className)
    node.className = props.className;
  if (props.style) {
    Object.entries(props.style).forEach(([k, v]) => {
      node.style[k] = v;
    });
  }
  const excludeList = ["style", "className", "text", "children"];
  Object.keys(props).forEach((k) => {
    if (!excludeList.includes(k)) {
      node[k] = props[k];
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
        node.addEventListener(eventName, (event) => {
          const promise = new Promise((resolve) => {
            if (!fn(event, node))
              resolve("after action");
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

// src/store/tinyStore.ts
var treeSaver = (initialState, options) => {
  if (options?.beforeInit && typeof options.beforeInit === "function") {
    options.beforeInit();
  }
  let tinyStoreState = initialState;
  const copyObj = (obj) => {
    return { ...obj };
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
    setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: {} } }));
  }
  if (tree.tagName === "fragment" && !flatNode()[tree.id]) {
    const node = document.createDocumentFragment();
    node.key = tree.id;
    setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: {} } }));
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
    root = root.parentElement;
    const existingNode = flatNode()[root.key];
    if (existingNode) {
      findNodeIterative(tree, root.key, (foundNode) => {
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
