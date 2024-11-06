import tinyStore, { treeSaver } from "./tinyStore.js";

// a decentralized rendering arch

const [seq, setSeq] = tinyStore(0);

const sequentialId = () => {
  setSeq((p) => p + 1);
  return seq();
};

const resetCounter = (n) => {
  if (n) {
    setSeq((p) => p - n);
  }
  if (!n) {
    setSeq(0);
  }
  return seq();
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

const div = (props) => createElement("div", props);
const button = (props) => createElement("button", props);
const h1 = (props) => createElement("h1", props);
const fragment = (props) => createElement("fragment", props);
const t = (n, p) => createElement(n, p);

const isArr = (a) => Array.isArray(a) && a[0];
function applyPropsToElement({ elementProperties, id }) {
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
    const excludeList = ["style", "className", "text", "children"];
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
    node.innerText = String(props.text); // todo: validate innerText text ??
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
              if (typeof fn(event)) {
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

function addNode(tree) {
  if (tree.tagName && tree.tagName !== "fragment" && !tree.node) {
    if (!flatNode()[tree.id]) {
      const node = document.createElement(tree.tagName);
      node.id = tree.id;
      setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: {} } }));
      tree.node = node;
    }
  }
  if (tree.tagName && tree.tagName !== "fragment" && !tree.node) {
    if (!flatNode()[tree.id]) {
      const node = document.createDocumentFragment();
      node.id = tree.id;
      setFlatNode((p) => ({ ...p, [tree.id]: { node, events_map: {} } }));
      tree.node = node;
    }
  }
}

const addEvents = (tree) => {
  const { events } = tree.elementProperties;
  setFlatNode((p) => {
    return { ...p, [tree.id]: { ...p[tree.id], events } };
  });
};

function recursiveRender(tree, root = document.getElementById("v2render")) {
  addNode(tree);
  addEvents(tree);
  const vnode = applyPropsToElement(tree);
  root.append(vnode);
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

const MainComponent = (draw) => {
  const [counter, setCounter] = tinyStore(0);
  const [lastId, setId] = tinyStore(0);
  // const [tree, doTree] = treeSaver(undefined);

  const increase = () => {
    setCounter((p) => p + 1);
    const { node } = flatNode()[lastId()];
    draw(render(), node.parentElement);
  };
  const decrease = () => {
    setCounter((p) => p - 1);
    const { node } = flatNode()[lastId()];
    draw(render(), node.parentElement);
  };

  function render() {
    resetCounter(lastId());
    const i_tree = div({
      text: "a div with text",
      children: [
        t("p", {
          text: `show counter ${counter()}`,
          children: [
            t("li", {
              children: [
                button({ text: "increase", events: { click: increase } }),
                h1({ text: String(new Date()) }),
              ],
            }),
            t("li", {
              children: [
                button({ text: "decrease", events: { click: decrease } }),
              ],
            }),
          ],
        }),
        h1({ text: "klk first" }),
        h1({ text: "klk" }),
        div({
          children: [h1({ text: "klk" }), h1({ text: "klk last" })],
        }),
      ],
    });
    setId(i_tree.id);
    return i_tree;
  }
  return render();
};

// const tree = [MainComponent(), Component];

const recursiveTree = MainComponent(recursiveRender);
// this uses the concept of the main function of c code or java or any other static typed programing language

function init() {
  recursiveRender(recursiveTree);
}

const renderV2 = init;
const plh = 2;

export { renderV2, plh };
