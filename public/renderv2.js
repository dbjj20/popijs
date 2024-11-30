/* eslint-disable consistent-return,react-hooks/rules-of-hooks */
import tinyStore, { treeSaver } from "./tinyStore.js";

// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"
// "i just found that i was replicating same react flaws"

// a decentralized rendering arch

const [seq, setSeq] = tinyStore(0);

const sequentialId = () => {
  setSeq((p) => p + 1);
  return seq();
};
//
// const resetCounter = (n) => {
//   if (n) {
//     setSeq((p) => p - n);
//   }
//   if (!n) {
//     setSeq(0);
//   }
//   return seq();
// };

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

function addUpdateProperty(tree, nodeId, propertyName, propertyValue) {
  // Creamos una copia simple
  const updatedTree = { ...tree };

  function updateNode(node) {
    node[propertyName] = propertyValue;
  }

  // findAndUpdateNode(updatedTree, nodeId, updateNode);
  findNodeIterative(updatedTree, nodeId, updateNode);
  return updatedTree;
}

const optionsDefinition = {
  globalRender: false,
  partialRender: false,
  multiDeps: true,
  store: {},
};

function compare(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function effect(func, arr, old, callback) {
  if (typeof func === "function") {
    if (typeof arr === "undefined") {
      return func();
    }
    callback(arr);
    const res = compare(arr, old);
    if (res) {
      return;
    }
    return func();
  }
}

const effectV2 = (options = optionsDefinition) => {
  let state;
  let interFunc;

  const setEffect = (func, arr) => {
    if (typeof func === "function") {
      interFunc = func;
      effect(func, arr, state, (deps) => {
        state = deps;
      });
    }
  };

  const execute = (arr, el) => {
    try {
      if (typeof interFunc === "function") {
        const res = compare(arr, state);
        if (res) {
          return;
        }
        const result = interFunc();
        if (typeof result === "function" && !el) {
          result();
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return [setEffect, execute];
};

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

function applyPropsToElement({ elementProperties, id }, action) {
  const { node, events, events_map } = flatNode()[id];
  const props = elementProperties;
  if (action) {
    // debugger;
  }
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
    node.innerText = String(props.text);
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
                resolve("camilo");
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
  action = "create"
) {

  function renderChildren(tree, vnode){
    if (
      tree.elementProperties.children &&
      Array.isArray(tree.elementProperties.children) &&
      tree.elementProperties.children[0]
    ) {
      tree.elementProperties.children.forEach((branch) => {
        recursiveRender(branch, vnode);
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
    vnode = applyPropsToElement(tree);
  }

  if (action === "update") {
    // only update and return
    root = root.parentElement;
    findNodeIterative(tree, root.key, (node) => {
      vnode = node;
      applyPropsToElement(node, "update"); // actual update
      // add render children here
    });
    // re-append children when update
    return;
  }
  root.append(vnode);
  renderChildren(tree, vnode);
}

const [componentTree, setComponent] = treeSaver({});
function ComponentFactory(fn, key = "m") {
  // a function that returns a computed value
  const factoryName = `${fn.name}${key}`;
  setComponent((p) => {
    // once defined do not run this again
    if (p[factoryName]) {
      return p;
    }
    return {
      ...p,
      [factoryName]: {
        tree: fn(recursiveRender),
        state: {},
      },
    };
  });

  return componentTree()[factoryName];
}

// test tree section
const [formState, setFormState] = tinyStore({
  name: "name of the user",
});

const formito = (draw) => {
  console.log("executing formito");
  const [useEffect] = effectV2();
  const [lastId, setId] = tinyStore(0);
  // since the component executes once we can add vars that won't change its value during the life cycle of the component
  const handleChange = (e, vNode) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    const { node } = flatNode()[vNode.key];
    draw(render(), node.parentElement);
  };

  const showInputValue = () => {
    // keep this on track
    const { name } = formState();
    const [inputEffect] = effectV2();
    const render = () =>
      t("p", {
        text: `
      name: ${name}
      time: ${new Date()}
      `,
        excluded: { parentId: lastId() },
      });

    inputEffect(render, [name]);
    return render();
  };

  useEffect(() => {
    const res = flatNode()[lastId()];
    if (res) {
      const { node } = res;
      draw(render(), node.parentElement);
    }
  }, [lastId()]);

  const render = () => {
    const { name } = formState();
    const i_tree = div({
      children: [
        ComponentFactory(showInputValue),
        t("input", {
          name: "name",
          value: name,
          events: {
            input: handleChange,
          },
        }),
      ],
    });
    setId(i_tree.id);
    return i_tree;
  };

  return render();
};

const microButton = (event, props) => {
  // const [tree, doTree] = treeSaver(undefined);
  function render() {
    const i_tree = button({ ...props, events: { click: event } });
    setObjTree(i_tree);
    return i_tree;
  }
  return render();
};

const MainComponent = (draw) => {
  const [counter, setCounter] = tinyStore(0);
  // const [tree, doTree] = treeSaver(undefined);

  const increase = (e, vNode) => {
    setCounter((p) => p + 1);
    // en vez de pasar el old tree, execute render and update
    draw(objTree(), vNode, "update");
  };
  const decrease = (e, vNode) => {
    setCounter((p) => p - 1);
    draw(objTree(), vNode, "update");
  };

  return div({
    text: "a div with text",
    children: [
      t("p", {
        text: `show counter ${counter()}`,
        children: [
          t("li", {
            text: "k",
            children: [
              button({ text: "sssss", events: { click: increase } }),
              // button({ text: "sssss", events: { click: increase } }),
              // microButton(increase, { text: "increase v2" }),
              h1({ text: String(new Date()) }),
            ],
          }),
          t("li", {
            children: [
              button({ text: "decrease", events: { click: decrease } }),
              h1({ text: String(new Date()) }),
            ],
          }),
        ],
      }),
      h1({ text: "klk first" }),
      h1({ text: String(new Date()) }),
      h1({ text: "klk" }),
      div({
        children: [
          h1({ text: "klk" }),
          h1({ text: "klk last" }),
          h1({ text: String(new Date()) }),
        ],
      }),
      // ComponentFactory(formito),
    ],
  });
};

// const tree = [MainComponent(), Component];
setObjTree(MainComponent(recursiveRender));
// this uses the concept of the main function of c code or java or any other static typed programing language

function init() {
  recursiveRender(objTree());
}

const renderV2 = init;
const plh = 2;

export { renderV2, plh };
