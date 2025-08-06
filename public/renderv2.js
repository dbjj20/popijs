/* eslint-disable consistent-return,react-hooks/rules-of-hooks */
import tinyStore, { treeSaver } from "./tinyStore.js";

function template(template, values) {
  let count = 0;
  let counterRes = false;

  if (!values){
    return template
  }

  const result = template.replace(/{(.*?)}/g, (_, key) => {
    // debugger
    const res = String(key ? values[key] : "");
    if (res) {
      count += 1;
      counterRes = true;
      return res;
    }
    return template;
  });

  if (count > 1) {
    return result;
  }
  if (count === 1 && counterRes) {
    return result;
  }
  return template;
}

const [seq, setSeq] = tinyStore(0);
const sequentialId = () => {
  setSeq((p) => p + 1);
  return seq();
};

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

const propsDefinition = {
  className: "", // some class name
  text: null, // some text
  events: {},
  styles: {},
  tagDomProps: {},
  children: [],
};

// define c_v_node? => compound virtual node
const createCompoundVirtualNode = (tagName, props = propsDefinition) => {
  const id = sequentialId();
  if (tagName && tagName !== "fragment") {
    return {
      id,
      [id]: {
        id,
        elementProperties: { ...props },
        tagName,
      },
    };
  }
  const fragment = {
    id,
    [id]: {
      id,
      isFragment: true, // explicit key/value for later check
      elementProperties: { ...props },
      tagName: "fragment",
    },
  };
  // why? because yes :D
  if (tagName && tagName === "fragment") {
    return fragment;
  }

  return fragment;
};

const createElement = (tagName, props) => {
  // this is to keep consistency
  // create raw element with dom element?
  const node = createCompoundVirtualNode(tagName, props);
  return node[node.id];
};

export const div = (props) => createElement("div", props);
export const button = (props) => createElement("button", props);
export const h1 = (props) => createElement("h1", props);
export const fragment = (props) => createElement("fragment", props);
export const t = (n, p) => createElement(n, p);

const isArr = (a) => Array.isArray(a) && a[0];

function applyPropsToElement({ elementProperties, id }, action, state) {
  const { node, events, events_map } = flatNode()[id];
  const props = elementProperties;
  const propsKeys = Object.keys(props || {});
  if (isArr(propsKeys) && propsKeys[0]) {
    if (props.className) {
      node.className = props.className;
    }
    if (props.style) {
      const styleKeys = Object.keys(props.style);
      if (styleKeys[0]) {
        styleKeys.forEach((name) => {
          node.style[name] = props.style[name];
        });
      }
    }
    const excludeList = ["style", "className", "text", "children", "excluded"];
    const propKeys = Object.keys(props);
    if (propKeys[0]) {
      propKeys.forEach((name) => {
        if (excludeList.includes(name)) {
          return;
        }
        node[name] = props[name];
      });
    }
  }
  // apply raw text
  if (props.text) {
    // node.append(document.createTextNode(String(props.text)));
    if (action === "update") {
      if (node.childNodes[0].nodeName === "#text"){
        node.childNodes[0].replaceWith(new Text(String(template(props.text, state))))
      }
      // debugger
      // return;
    }
    // debugger
    if (action === "create") {
      node.appendChild(new Text(String(template(props.text, state))))
    }
  }

  // add event listeners
  if (events && Object.keys(events)) {
    const event_keys = Object.keys(events);
    if (Array.isArray(event_keys) && event_keys[0]) {
      event_keys.forEach((event_name) => {
        const fn = events[event_name];
        // todo: define once same event
        if (events_map && !events_map[fn.name]) {
          node.addEventListener(event_name, (event) => {
            const promise = new Promise((resolve) => {
              // eslint-disable-next-line no-constant-condition
              if (!fn(event, node)) {
                // is this a good trick?
                resolve("camilo?");
              }
            });
            promise.then((res) => {
              // element.innerText = String(new Date())
              // res wil be 'camilo'
              // window.render(); // provisional auto re-rendering
              // we can schedule a re-rendering method here and pass the node
              console.log("executed after action", res);
            });
          });
          setFlatNode((p) => ({
            ...p,
            [id]: { ...p[id], events_map: { [fn.name]: true } },
          }));
        }
      });
    }
  }
  if (action === "update") {
    if (Array.isArray(elementProperties.children) && elementProperties.children.length > 0) {
      elementProperties.children.forEach((child) => {
        applyPropsToElement(child, action, state);
      })
    }
  }
  return node;
}
const [flatNode, setFlatNode] = treeSaver({});
const [objTree, setObjTree] = treeSaver({});

function addNode(tree) {
  if (tree.tagName && tree.tagName !== "fragment" && !tree.node) {
    if (!flatNode()[tree.id]) {
      const node = document.createElement(tree.tagName);
      node.key = tree.id;
      setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: {} } }));
      // tree.node = node;
    }
  }
  if (tree.tagName && tree.tagName !== "fragment" && !tree.node) {
    if (!flatNode()[tree.id]) {
      const node = document.createDocumentFragment();
      node.id = tree.id;
      setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: {} } }));
      // tree.node = node;
    }
  }
}

const addEvents = (tree) => {
  const { events } = tree.elementProperties;
  setFlatNode((p) => {
    return { ...p, [tree.id]: { ...p[tree.id], events } };
  });
};
const extractIfCfTree = (tree) => {
  if (tree?.tree) {
    return tree?.tree;
  }
  return tree;
};

function recursiveRender(
  vTree,
  root = document.getElementById("v2render"),
  action = "create",
  state
) {
  function renderChildren(tree, vnode, action='create'){
    if (
      tree.elementProperties.children &&
      Array.isArray(tree.elementProperties.children) &&
      tree.elementProperties.children[0]
    ) {
      tree.elementProperties.children.forEach((branch) => {
        if(action === "update") {
          return recursiveRender(branch, flatNode()[branch.id].node, action, state);
        }

        recursiveRender(branch, vnode, action, state);
      });
    }
  }
  if (!vTree) {
    return;
  }
  const tree = extractIfCfTree(vTree);
  let vnode;
  if (action === "create") {
    addNode(tree);
    addEvents(tree);
    vnode = applyPropsToElement(tree,"create", state);
  }

  if (action === "update") {
    // only update and return
    root = root.parentElement;
    findNodeIterative(tree, root.key, (nodeTree) => {
      console.log("updating")
      // debugger
      // determinar que cambio para hacer el update solo al node correspondiente
      applyPropsToElement(nodeTree, "update", state); // actual update
      // add render children here
      renderChildren(nodeTree, root, "update");
    });
    // re-append children when update
    return;
  }

  root.append(vnode);
  renderChildren(tree, vnode);
}

const factory = (tName, props) => {
  const [state, setState] = tinyStore({});
  return t(tName, {...props, draw: recursiveRender, state, setState})
}

const AnotherComponet = (draw) => {
  const [counter, setCounter] = tinyStore(0);
  // const [tree, doTree] = treeSaver(undefined);
  const increase = (e, vNode) => {
    setCounter((p) => p + 1);
    // en vez de pasar el old tree, execute render and update
    const nT = counter();
    draw(objTree(), vNode, "update", {nT});
  };

  const decrease = (e, vNode) => {
    setCounter((p) => p - 1);
    const nT = counter();
    draw(objTree(), vNode, "update", {nT});
  };

  return div({
    text: "Another component",
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({text: `increase show counter {nT}`}),
              button({ text: "increase", events: { click: increase } }),
            ],
          }),
          t("li", {
            text: "decreaser  {nT}",
            children: [
              div({text: `decrease show counter {nT}`}),
              button({ text: "decrease", events: { click: decrease } }),
            ],
          }),
        ],
      }),
    ],
  });
};

const MainComponent = (draw) => {
  const [counter, setCounter] = tinyStore(0);
  // const [tree, doTree] = treeSaver(undefined);
  const increase = (e, vNode) => {
    setCounter((p) => p + 1);
    // en vez de pasar el old tree, execute render and update
    const nT = counter();
    draw(objTree(), vNode, "update", {nT});
  };

  const decrease = (e, vNode) => {
    setCounter((p) => p - 1);
    const nT = counter();
    // debugger
    setInterval(() => {
      console.log("pero y klk")
      draw(objTree(), vNode, "update", {myDate: String(new Date()), nT});
    }, 1000)
    draw(objTree(), vNode, "update", {nT});
  };

  return div({
    text: "a div with text {nT}",
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({text: `increase show counter {nT}`}),
              button({ text: "increase", events: { click: increase } }),
              h1({ text: String(new Date()) }),
            ],
          }),
          t("li", {
            text: "decreaser",
            children: [
              div({text: `decrease show counter {nT}`}),
              button({ text: "decrease", events: { click: decrease } }),
              h1({ text: String(new Date()) }),
              h1({ text: "{myDate}"}),
            ],
          }),
        ],
      }),
      AnotherComponet(recursiveRender)
    ],
  });
};

setObjTree(MainComponent(recursiveRender));
// this uses the concept of the main function of c code or java or any other static typed programing language

function init() {
  recursiveRender(objTree());
}

const renderV2 = init;
const plh = 2;

export { renderV2, plh };
