const isFn = (fn) => {
  return typeof fn === "function";
};

const isArr = (a) => Array.isArray(a) && a[0];

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
  // element build
  let element;
  if (!tagName) {
    element = document.createDocumentFragment();
  }

  if (tagName && tagName === "fragment") {
    element = document.createDocumentFragment();
  }

  if (tagName && tagName !== "fragment") {
    element = document.createElement(tagName);
  }

  // element text assigment
  if (typeof properties !== "undefined" && typeof properties === "string") {
    element.innerText = String(properties);
  }
  if (typeof children !== "undefined" && typeof children === "string") {
    element.innerText = String(children);
  }

  // props assigment

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
      const excludeList = ["style", "className"];
      const propKeys = Object.keys(props);
      if (propKeys[0]) {
        propKeys.forEach((name) => {
          if (excludeList.includes(name)) {
            return;
          }
          element[name] = props[name];
        });
      }
    }
    // apply raw text
    element.innerText = String(str); // todo: validate innerText text

    // add event listeners
    if (Array.isArray(events) && events[0]) {
      events.forEach(([eventName, fn]) => {
        element.addEventListener(eventName, (event) => {
          // const elName = element.tagName;
          const promise = new Promise((resolve) => {
            // if (elName === "INPUT") {
            //   element.preventDefault();
            // }
            // if (elName === "FORM") {
            //   element.preventDefault();
            // }
            if (typeof fn(event, element)) {
              resolve("camilo");
            }
          });
          promise.then((res) => {
            // element.innerText = String(new Date())
            // debugger
            // res wil be 'camilo'
            // window.render(); // provitional auto re-rendering
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
  if (isArr(tree)) {
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
  }

  // debugger
  if (isArr(provisional)) {
    provisional.forEach((el) => {
      mainElement.appendChild(el);
    });
  }
  // childNodes is not an array, see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
  // if (isArr(mainElement.childNodes)) {
  root.appendChild(mainElement);
  // }
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
