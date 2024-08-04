/* eslint-disable react-hooks/rules-of-hooks,no-undef,no-sparse-arrays,no-constant-condition,no-debugger,consistent-return */
// tag properties order
// text => str | props => obj => any | events => arr => eventName / fn | children => arr of tags the repeat

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

const tag = (tagName, propsOrChildren, children, callback) => {
  if (!tagName) {
    return [];
  }
  // debugger
  return [tagName, propsOrChildren, children, callback];
};

const div = (propsOrChildren, children, callback) => {
  // return ["div", props, children];
  return tag("div", propsOrChildren, children, callback);
};

// a custom tree
const [state, addState] = tinyStore(0);
const component = (props) => {
  let mainEl;
  const { onClick } = useEvent();
  const defaultProps = ["", { index: true }, []];

  const print = () => {
    console.log(state());
  };

  const add = (e) => {
    console.log(props);
    console.log(props.propFunc());
    console.log(mainEl, e);
    // debugger;
    addState((pre) => pre + 1);
    init(e, [returnStatement()]);
    // this is crazy but works
    // debugger
    props.setParentState();
  };
  const decrement = (e) => {
    addState((pre) => pre - 1);
    // debugger;
    init(e, [returnStatement()]);
    // this is crazy but works
    // debugger
  };

  const returnStatement = () =>
    div(
      () => defaultProps,
      [
        tag("button", () => [
          `increment ${state()}`,
          ,
          [onClick((e) => add(e))],
        ]),
        tag("button", () => [
          `decrement ${state()}`,
          ,
          [onClick((e) => decrement(e))],
        ]),
        tag("p", [
          tag("li", [
            tag("span", () => [`${new Date()}`, , [["click", print]]]),
          ]),
          tag("li", [
            tag("span", () => [`${new Date()}`, , [["click", print]]]),
          ]),
        ]),
      ],
      (el, root) => {
        mainEl = el;
      }
    );
  return returnStatement();
};

const HelloWorld = ({ children, props }) => {
  return div([tag("h1", "head tag h1"), children]);
};

const [parentState, addParentState] = tinyStore({ klk: true });
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
          // props here is the default prop in the render
          const propFunc = () => {
            return state();
          };
          const setParentState = (e) => {
            addParentState((p) => {
              return {
                ...p,
                showDate: new Date(),
              };
            });
            // debugger;
            // e does not work because this method does not belong an event listener
            // init(e, [returnStatement()]);
            // rendering the entire app again
            window.render();
          };

          (() => {
            const timer = setInterval(() => {
              addParentState((p) => {
                return {
                  ...p,
                  showDate: new Date(),
                };
              });
              // console.log('klk')
              window.render();
            }, 500);
            // clearInterval(timer);
          })();

          const returnStatement = () =>
            div(props, [
              tag("h4", `state of parent ${JSON.stringify(parentState())}`),
              tag("span", "juana no es maria"),
              tag("hr"),
              tag("span", ""),
              component({ passingProps: true, propFunc, setParentState }),
            ]);
          return returnStatement();
        }),
      ]),
    ];
  });

// the basic tree
// the basic tree
// the basic tree
// the basic tree
// the basic tree// the basic tree
// the basic tree
// the basic tree// the basic tree
// the basic tree
// the basic tree
// the basic tree
// the basic tree// the basic tree
// the basic tree// the basic tree
// the basic tree
// the basic tree
// the basic tree
// the basic tree
// the basic tree

const manyClusters = [];
// let counter = 0;
// while (counter < 1000) {
//   manyClusters.push(cluster);
//   counter += 1;
// }
export const treeV1 = [...manyClusters, HelloWorld({ children: cluster })];

const verifyChildren = (children, element) => {
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    Array.isArray(children) &&
    !Array.isArray(children[0])
  ) {
    browserRender([children], element);
  }
  if (
    typeof children !== "undefined" &&
    typeof children === "object" &&
    Array.isArray(children) &&
    Array.isArray(children[0])
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

  if (isFn(properties)) {
    const [str, props, events] = properties();
    if (props?.index) {
      element.isIndexParent = true;
    }
    element.innerText = str; // valid innerText action
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
          console.log("executed after action");
        });
      });
    });
  }

  if (properties) {
    verifyChildren(properties, element);
  }

  if (children) {
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
  let parent = element.parentElement;
  while (element?.isIndexParent) {
    parent = parent.parentElement;
  }

  element.remove();
  return bruteCleanElement(parent);
}

export default function init(el, children) {
  if (isArr(children) && children) {
    const root = bruteRemoveElement(el);
    return browserRender(children, root);
  }
  const root = bruteCleanElement(document.getElementById("root"));
  browserRender(treeV1, root);
}
