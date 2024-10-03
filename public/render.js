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

const normalizeChildren = (children) => {
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    isArr(children) &&
    !isArr(children[0])
  ) {
    return [children];
  }
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    isArr(children) &&
    isArr(children[0])
  ) {
    return children;
  }
};

export const elementTracker = (initialState) => {
  // does this comply with live dom nodes?
  let tinyStoreState = initialState;

  const getStore = () => ({ ...tinyStoreState });

  const setStore = (data) => {
    tinyStoreState = { ...tinyStoreState, ...data };
  };

  return [getStore, setStore];
};

export const event = () => {
  // this is just an event definition table ... etc...
  return {
    click: (fn) => ["click", fn],
    submit: (fn) => ["submit", fn],
    input: (fn) => ["input", fn],
  };
};

export function randomString(strLength, charSet) {
  const result = [];

  strLength = strLength || 5;
  charSet =
    charSet ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  while (strLength) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    strLength -= 1;
  }

  return result.join("");
}

export const tag = (tagName, propsOrChildren, children, callback) => {
  if (!tagName) {
    return [];
  }
  const [innerElement, setInnerElement] = elementTracker();
  // debugger
  return [
    tagName,
    propsOrChildren,
    children,
    callback,
    innerElement,
    setInnerElement,
  ];
};

export const fragment = (
  propsOrChildren,
  children,
  callback,
  innerElement,
  setInnerElement
) => {
  return tag(
    "fragment",
    propsOrChildren,
    children,
    callback,
    innerElement,
    setInnerElement
  );
};

export const div = (
  propsOrChildren,
  children,
  callback,
  innerElement,
  setInnerElement
) => {
  // return ["div", props, children];
  return tag(
    "div",
    propsOrChildren,
    children,
    callback,
    innerElement,
    setInnerElement
  );
};

const [getElements, setElement] = elementTracker();

function branch(options) {
  const {
    tagName,
    properties,
    children,
    provisional,
    callback,
    root,
    index,
    innerElement,
    setInnerElement,
  } = options;
  // element build
  // properties = propsOrChildren
  let element;
  if (typeof innerElement === "function") {
    const { el } = innerElement();
    // debugger
    if (el && el.tagName) {
      // debugger;
      element = el;
    }
  }
  if (!element) {
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
  }
  if (typeof setInnerElement === "function") {
    console.log("setting");
    setInnerElement({ el: element });
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
    if (str) {
      element.innerText = String(str); // todo: validate innerText text
    }

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
              // debugger
              console.log(properties);
            }
          });
          promise.then((res) => {
            // element.innerText = String(new Date())
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

let counter = 0; // pass this logic to a function
function isFr(el) {
  // checks if el tag name is fragment or not
  // document.createDocumentFragment() does not have the prop tagName
  if (el && el.tagName) {
    return el.tagName.toLocaleLowerCase();
  }
  return "fr";
}

function browserRender(tree, root = document.getElementById("root")) {
  // recursive render
  // return
  counter += 1;
  const mainElement = document.createDocumentFragment();

  const provisional = [];
  // debugger
  if (isArr(tree)) {
    // debugger
    tree.forEach((treObj, index) => {
      if (typeof treObj === "function") {
        const [
          tagName,
          properties,
          children,
          callback,
          innerElement,
          setInnerElement,
        ] = treObj();
        branch({
          tagName,
          properties,
          children,
          provisional,
          callback,
          root,
          index,
        });
      }
      if (isArr(treObj)) {
        const [
          tagName,
          properties,
          children,
          callback,
          innerElement,
          setInnerElement,
        ] = treObj;
        branch({
          tagName,
          properties,
          children,
          provisional,
          callback,
          root,
          index,
          innerElement,
          setInnerElement,
        });
      }
    });
  }

  // debugger
  if (isArr(provisional)) {
    provisional.forEach((el) => {
      // const id = `${isFr(root)}-${isFr(el)}-${counter}`;
      // setElement({ [id]: el });
      // el.popiId = id;
      mainElement.append(el);
    });
  }
  // childNodes is not an array, see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
  // if (isArr(mainElement.childNodes)) {
  // const id = `${isFr(root)}-${counter}`;

  // setElement({ [id]: root });
  // root.popiId = id;
  // root.popiChildren = tree; // the source of true may be outdated
  root.append(mainElement);
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
    browserRender(children, root);
    counter = 0;
    return;
  }
  const root = bruteCleanElement(document.getElementById("root"));

  browserRender(treeV1, root);
  counter = 0;
}

/* EXPERIMENTAL ELEMENT UPDATE */
// get the element and then apply the update

function applyPropToElement(element, tree) {
  const [tagName, propsOrChildren, children, callback] = tree;
  if (isFr(element) === tagName) {
    // intended duplication of code
    // element text assigment
    if (
      typeof propsOrChildren !== "undefined" &&
      typeof propsOrChildren === "string"
    ) {
      element.innerText = String(propsOrChildren);
    }
    if (typeof children !== "undefined" && typeof children === "string") {
      element.innerText = String(children);
    }
    if (isFn(propsOrChildren)) {
      const [str, props, events] = propsOrChildren();
      if (props?.index) {
        element.isIndexParent = true; // do i still need this?
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
      if (str) {
        element.innerText = String(str); // todo: validate innerText text
      }
    }
  }
}

let updateCounter = 0; // pass this logic to a function

function updateEl(element, tree) {
  updateCounter += 1;
  const [tagName, propsOrChildren, children, callback] = tree;
  const juana = document.createElement("p");
  const normalizedChildren = normalizeChildren(children);
  console.log(getElements());
  // the idea behind ids in element its because its more easy to apply changes when an object is flat

  // debugger;
  // const exec = () => {
  //   if (
  //     typeof element.childNodes === "object" &&
  //     typeof element.childNodes[0] === "object" &&
  //     element.childNodes[0].tagName !== "#text"
  //   ) {
  //     // has children and element is not a nodeList
  //     element.childNodes.forEach((child) => {
  //       updateEl();
  //     });
  //   }
  // };

  if (isArr(tree)) {
    // debugger;
    tree.forEach((treObj) => {
      console.log(element);
      // debugger;
      // if (typeof treObj === "function") {
      //   const [tagName, properties, children, callback] = treObj();
      //   applyPropToElement(element, [tagName, properties, children, callback]);
      // }
      // if (isArr(treObj)) {
      //   const [tagName, properties, children, callback] = treObj;
      //   applyPropToElement(element, [tagName, properties, children, callback]);
      // }
    });
  }
}

/* END */

export { updateEl };
