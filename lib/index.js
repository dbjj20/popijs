import tinyStore from "./tinyStore";
// server version of render 1
const testFn = () => console.log("yay!");
const testFn1 = () => console.log("camilo!");

const isFn = (fn) => {
  return typeof fn === "function";
};

const isArr = (a) => Array.isArray(a);

const testTagProperties = ["text", { popiJs: true }, [["click", testFn]]];
const testTagProperties1 = ["yay!", { popiJs: true }, [["click", testFn1]]];

const useEvent = () => {
  // this is just an event definition table ... etc...
  return {
    onClick: (e) => ["click", e],
  };
};

const tag = (tagName, props, children) => {
  if (!tagName) {
    return [];
  }
  // debugger
  return [tagName, props, children];
};

const div = (props, children) => {
  return ["div", props, children];
};

// a custom tree
const component = () => {
  const { onClick } = useEvent();
  const [state, addState] = tinyStore(0);

  const print = () => {
    console.log(state());
  };

  const add = () => {
    addState((pre) => pre + 1);
  };

  return div([
    tag("button", () => ["add to counter", , [onClick(add)]], [
      tag("button", () => ["add to counter2", , [["click", add]]]), // this is crazy but works
    ]),
    tag("button", () => ["print counter", , [["click", print]]]),
  ]);
};

const HelloWorld = ({ children, props }) => {
  return div([tag("h1", "head tag h1"), children]);
};

const cluster = () =>
  div(null, () => {
    return [
      div(),
      div(tag("span", "tag fn")),
      div([
        tag("span", "juana no es maria"),
        tag("hr"),
        tag("span", "juana no es maria2", (props) => {
          // debugger
          // props here is the default prop in the render method
          return div(props, [
            tag("span", "juana no es maria"),
            tag("hr"),
            tag("span", "<script>window.location.path</script>"),
            component,
          ]);
        }),
      ]),
    ];
  });

// the basic tree

export const treeV1 = [
  cluster,
  [
    "div",
    [
      "div",
      [
        ["button", () => testTagProperties],
        ["button", () => testTagProperties],
        ["button", () => testTagProperties1],
        ["h1", "klk"],
      ],
    ],
  ],
  [
    "div",
    [
      "div",
      [
        ["h1", "klk"],
        ["h1", "klk"],
      ],
    ],
  ],
  [
    "div",
    [
      "div",
      [
        ["h1", "klk"],
        ["h1", "klk"],
      ],
    ],
  ],
  [
    "div",
    [
      "div",
      [
        ["h1", "klk"],
        ["h1", "klk"],
      ],
    ],
  ],
  HelloWorld({ children: cluster }),
];

const verifyChildrenServer = (children, element) => {
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    Array.isArray(children) &&
    !Array.isArray(children[0])
  ) {
    serverRender([children], element);
  }
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    Array.isArray(children) &&
    Array.isArray(children[0])
  ) {
    serverRender(children, element);
  }
};

export function rawTag(name = "meta", attributes = []) {
  // attributes = [{ key: 'id', value: 'meta-author' }, { key: 'name', value: 'author' }, { key: 'content', value: 'https://innovacode.co' }]
  // example: rawTag('div', attributes)
  let innerText = "";
  const attributesStr = attributes
    .map((attr) => {
      if (attr.key === "innerText") {
        innerText = attr.value;
        return;
      }
      `${attr.key}="${attr.value}"`;
    })
    .filter((el) => el !== undefined)
    .join(" ");

  return `<${name} ${attributesStr}>${innerText}`;
}

export function createHtmlFromArray(arr) {
  let html = "";

  arr.forEach((item) => {
    const [tagName, properties] = Object.entries(item)[0];
    const attributes = [];

    // Añadir atributos
    if (properties.listeners && properties.listeners.length > 0) {
      properties.listeners.forEach((listener) => {
        if (listener[0] && listener[1] !== null) {
          attributes.push({ key: `${listener[0]}`, value: "" });
        }
      });
    }

    if (properties.innerText) {
      attributes.push({ key: "innerText", value: properties.innerText });
    }

    // Crear la etiqueta
    html += rawTag(tagName, attributes);

    // Procesar hijos recursivamente
    // debugger;
    if (item.children) {
      html += createHtmlFromArray([...item.children]);
    }

    // Cerrar la etiqueta
    html += `</${tagName}>`;
  });

  return html;
}

export function serverRender(tree, root = []) {
  const mainElement = [];

  const provisional = [];
  tree.forEach((treObj) => {
    let [tagName, properties, children] = [1, 2, 3]; // place holder to avoid crash

    if (typeof treObj === "function") {
      [tagName, properties, children] = treObj();
    }
    if (isArr(treObj)) {
      [tagName, properties, children] = treObj;
    }

    const element = {
      [tagName]: {
        listeners: [],
      },
    };

    if (typeof properties !== "undefined" && typeof properties === "string") {
      element[tagName].innerText = properties;
    }

    if (isFn(properties)) {
      const [str, props, events] = properties();
      element[tagName].innerText = str;
      events.forEach(([eventName, fn]) => {
        element[tagName].listeners = [
          ...element[tagName].listeners,
          [eventName, fn],
        ];
      });
    }

    if (properties) {
      verifyChildrenServer(properties, element);
    }

    if (children) {
      let p = children;
      if (isFn(children)) {
        // we can pass default props to any child
        p = children({ defaultProp: "klk" });
      }
      verifyChildrenServer(p, element);
    }

    provisional.push(element);
  });

  provisional.forEach((el) => {
    mainElement.push(el);
  });
  // debugger
  root.children = mainElement;
  return mainElement;
}
