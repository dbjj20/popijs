import tinyStore, { treeSaver } from "./tinyStore.js";

// a decentralized rendering arch
let counter = -1;

const sequentialId = () => {
  counter += 1;
  return counter;
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
        node: document.createElement(tagName),
      },
    };
  }
  const fragment = {
    id,
    [id]: {
      id,
      isFragment: true, // explicit key/value for later check
      elementProperties: { ...props },
      node: document.createDocumentFragment(),
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
  // setNode((prev) => {
  //   // do other preparation stuff
  //   return { ...prev, [node.id]: node[node.id] };
  // });
  return node[node.id];
};

const div = (props) => createElement("div", props);
const button = (props) => createElement("div", props);
const h1 = (props) => createElement("h1", props);
const fragment = (props) => createElement("fragment", props);
const t = (n, p) => createElement(n, p);

/// /////////////////////////////////////////////////////////////////////////////

// function parseCustomSyntax(input) {
//   const lines = input.split("\n");
//   const root = { type: "root", children: [] };
//   const stack = [{ node: root, indent: -1 }];
//
//   function parseAttributes(line) {
//     const parts = line.trim().split(/\s+/);
//     const node = { type: parts[0], children: [] };
//
//     let currentKey = null;
//     let currentValue = [];
//     let inQuotes = false;
//
//     for (let i = 1; i < parts.length; i += 1) {
//       const part = parts[i];
//
//       if (!currentKey) {
//         const [key, ...value] = part.split(":");
//         currentKey = key;
//         currentValue = value;
//         if (value.join(":").startsWith("'")) {
//           inQuotes = true;
//           currentValue = [value.join(":").slice(1)];
//         } else if (value.length > 0) {
//           node[currentKey] = value.join(":");
//           currentKey = null;
//         }
//       } else if (inQuotes) {
//         if (part.endsWith("'")) {
//           currentValue.push(part.slice(0, -1));
//           node[currentKey] = currentValue.join(" ");
//           currentKey = null;
//           inQuotes = false;
//         } else {
//           currentValue.push(part);
//         }
//       } else {
//         node[currentKey] = currentValue.join(":");
//         currentKey = null;
//         i -= 1; // Retroceder para procesar esta parte como una nueva clave
//       }
//     }
//
//     if (currentKey) {
//       node[currentKey] = currentValue.join(" ");
//     }
//
//     return node;
//   }
//
//   lines.forEach((line) => {
//     if (line.trim() === "") return;
//
//     const indent = line.search(/\S/);
//     const node = parseAttributes(line);
//
//     while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
//       stack.pop();
//     }
//
//     const parent = stack[stack.length - 1].node;
//     parent.children.push(node);
//     stack.push({ node, indent });
//   });
//
//   return root.children[0];
// }
function parseCustomSyntax(input) {
  const lines = input.split("\n");
  const root = { type: "root", children: [] };
  const stack = [{ node: root, indent: -1 }];

  function parseAttributes(line) {
    const parts = line.trim().split(/\s+/);
    const node = { type: parts[0], children: [] };
    let currentAttr = null;
    let currentValue = [];
    let inQuotes = false;

    for (let i = 1; i < parts.length; i += 1) {
      const part = parts[i];

      if (!currentAttr) {
        const colonIndex = part.indexOf(":");
        if (colonIndex !== -1) {
          currentAttr = part.slice(0, colonIndex);
          const remainingPart = part.slice(colonIndex + 1);
          if (remainingPart.startsWith('"')) {
            inQuotes = true;
            currentValue = [remainingPart.slice(1)];
          } else if (remainingPart) {
            node[currentAttr] = remainingPart;
            currentAttr = null;
          }
        }
      } else if (inQuotes) {
        if (part.endsWith('"')) {
          currentValue.push(part.slice(0, -1));
          node[currentAttr] = currentValue.join(" ");
          currentAttr = null;
          inQuotes = false;
        } else {
          currentValue.push(part);
        }
      } else {
        debugger
        node[currentAttr] = currentValue.join(" ") || true;
        currentAttr = null;
        i -= 1; // Retroceder para procesar esta parte como un nuevo atributo
      }
    }

    if (currentAttr) {
      node[currentAttr] = currentValue.join(" ") || true;
    }

    return node;
  }

  lines.forEach((line) => {
    if (line.trim() === "") return;

    const indent = line.search(/\S/);
    const node = parseAttributes(line);

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(node);
    stack.push({ node, indent });
  });

  return root.children[0];
}

function generateTreeFunctionToString(node) {
  const props = Object.entries(node)
    .filter(([key]) => key !== "type" && key !== "children")
    .map(([key, value]) => `${key}: "${value}"`)
    .join(", ");

  const children =
    node.children && node.children.length > 0
      ? `, children: [${node.children
          .map(generateTreeFunctionToString)
          .join(", ")}]`
      : "";

  return `${node.type}({ ${props}${children} })`;
}

const tagDefinitions = {
  div,
  h1,
  button,
  t,
};

function generateExecutableTree(node) {
  const props = {};
  Object.entries(node).forEach(([key, value]) => {
    if (key !== "type" && key !== "children") {
      props[key] = value;
    }
  });

  if (node.children && node.children.length > 0) {
    props.children = node.children.map(generateExecutableTree);
  }

  // Asumimos que las funciones de los elementos (div, button, h1, etc.) están definidas
  return tagDefinitions[node.type](props);
}

const customSyntax = `
div className:name onClick:myFunction text: 'a div with text'
  button text: 'click me'
  h1 text: 'klk first'
  h1 text: 'klk'
  div
    h1 text: 'klk'
    h1 text: 'klk last'
`;

const parsedTree = parseCustomSyntax(customSyntax);
const result2 = generateTreeFunctionToString(parsedTree);
const result = generateExecutableTree(parsedTree);

function bruteCleanElement(element) {
  // is this a "safe way" of cleaning an element?
  if (!element) {
    return;
  }
  // debugger;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
}

function bruteRemoveElement(element) {
  // is this a "safe way" of cleaning an element?
  if (!element) {
    return;
  }
  const parent = element.parentElement;
  // debugger
  if (parent) {
    element.remove();
    return parent;
  }
  return document.createDocumentFragment();
}

const isArr = (a) => Array.isArray(a) && a[0];
function applyPropsToElement({ node, elementProperties }, root) {
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
  // if (Array.isArray(props.events) && props.events[0]) {
  //   events.forEach(([eventName, fn]) => {
  //     element.addEventListener(eventName, (event) => {
  //       // const elName = element.tagName;
  //       const promise = new Promise((resolve) => {
  //         // if (elName === "INPUT") {
  //         //   element.preventDefault();
  //         // }
  //         // if (elName === "FORM") {
  //         //   element.preventDefault();
  //         // }
  //         if (typeof fn(event, element)) {
  //           resolve("camilo");
  //           // debugger
  //           console.log(properties);
  //         }
  //       });
  //       promise.then((res) => {
  //         // element.innerText = String(new Date())
  //         // res wil be 'camilo'
  //         // window.render(); // provitional auto re-rendering
  //         console.log("executed after action");
  //       });
  //     });
  //   });
  // }
  return node;
}

function recursiveRender(tree, root = document.getElementById("v2render")) {
  const vnode = applyPropsToElement(tree, root);
  root.append(vnode);
  if (
    tree.elementProperties.children &&
    Array.isArray(tree.elementProperties.children) &&
    tree.elementProperties.children[0]
  ) {
    // const mainElement = document.createDocumentFragment();
    // debugger
    tree.elementProperties.children.forEach((branch) => {
      recursiveRender(branch, vnode);
    });
  }
}

const Component = (parent) => {
  const [tree, setTree] = treeSaver(undefined);

  setTree(
    t("P", {
      text: "a div with text",
      children: [
        t("p", { text: "klk first" }),
        t("p", { text: "klk" }),
        t("p", {
          children: [t("li", { text: "klk" }), t("li", { text: "klk last" })],
        }),
      ],
    })
  );
  return tree();
};

const MainComponent = () => {
  const [tree, setTree] = treeSaver(undefined);

  setTree(
    div({
      text: "a div with text",
      children: [
        t("button", { text: "clickme" }),
        h1({ text: "klk first" }),
        h1({ text: "klk" }),
        div({
          children: [h1({ text: "klk" }), h1({ text: "klk last" })],
        }),
      ],
    })
  );
  return tree();
};

// const tree = [MainComponent(), Component];

const recursiveTree = MainComponent();
// this uses the concept of the main function of c code or java or any other programing language

function init() {
  console.log(result, result2);
  debugger;
  recursiveRender(recursiveTree);
}

const renderV2 = init;
const plh = 2;

export { renderV2, plh };
