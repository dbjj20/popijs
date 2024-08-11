const isFn = (fn) => {
  return typeof fn === "function";
};

const isArr = (a) => Array.isArray(a);

const verifyChildren = (children, element) => {
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    isArr(children) &&
    !isArr(children[0])
  ) {
    browserRender([children], element);
  }
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    isArr(children) &&
    isArr(children[0])
  ) {
    browserRender(children, element);
  }
};

function branch(options) {
  const { tagName, properties, children, provisional, callback, root } =
    options;
  const element = document.createElement(tagName);
  // setElement(element);
  if (typeof properties !== "undefined" && typeof properties === "string") {
    element.innerText = properties;
  }
  if (typeof children !== "undefined" && typeof children === "string") {
    element.innerText = children;
  }

  if (isFn(properties)) {
    const [str, props, events] = properties();
    if (props?.index) {
      element.isIndexParent = true;
    }
    // apply styles
    const propsKeys = Object.keys(props || {});
    if (isArr(propsKeys) && propsKeys[0]) {
      if (props.className) {
        element.className = props.className;
      }
      if (props.style) {
        const styleKeys = Object.keys(props.style);
        if (styleKeys[0]) {
          styleKeys.forEach((name) => {
            element.style[name] = props.style[name];
          });
        }
      }
    }
    // apply raw text
    element.innerText = str; // valid innerText action

    // add event listeners
    if (Array.isArray(events) && events[0]){
      events.forEach(([eventName, fn]) => {
        element.addEventListener(eventName, () => {
          const pro = new Promise((resolve) => {
            if (typeof fn(element, eventName)) {
              resolve("camilo");
            }
          });
          pro.then((res) => {
            // element.innerText = String(new Date())
            // debugger
            // res wil be 'camilo'
            // window.render(); // provitional re-rendering
            console.log("executed after action");
          });
        });
      });
    }
  }

  if (properties) {
    verifyChildren(properties, element);
  }

  if (typeof children !== "undefined" && typeof children !== "string") {
    let p = children;
    if (isFn(children)) {
      // we can pass default props to any child
      p = children({ defaultProp: "klk" });
    }
    verifyChildren(p, element);
  }
  if (typeof callback === "function") {
    callback(element, root);
  }
  provisional.push(element);
}

function browserRender(tree, root = document.getElementById("root")) {
  // recursive render
  // return
  const mainElement = document.createDocumentFragment();

  const provisional = [];
  // debugger
  tree.forEach((treObj) => {
    if (typeof treObj === "function") {
      const [tagName, properties, children, callback] = treObj();
      branch({ tagName, properties, children, provisional, callback, root });
    }
    if (isArr(treObj)) {
      const [tagName, properties, children, callback] = treObj;
      branch({ tagName, properties, children, provisional, callback, root });
    }
  });

  // debugger
  provisional.forEach((el) => {
    mainElement.appendChild(el);
  });
  // debugger
  root.appendChild(mainElement);
}

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

export default function init(el, children) {
  if (children && isArr(children) && children[0]) {
    const root = bruteRemoveElement(el);
    return browserRender(children, root);
  }
  const root = bruteCleanElement(document.getElementById("root"));

  browserRender(treeV1, root);
}
