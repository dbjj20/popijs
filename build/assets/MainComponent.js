// src/store/tinyStore.ts
var tinyStore = (initialState, options = { name: "", isStateOnly: true }) => {
  const { name = "", isStateOnly = true } = options;
  let tinyStoreState = initialState;
  const copyObj = (obj) => {
    if (isStateOnly) {
      return JSON.parse(JSON.stringify(obj));
    }
    if (Array.isArray(obj)) {
      return [...obj];
    }
    return { ...obj };
  };
  const getProps = () => {
    return copyObj(tinyStoreState);
  };
  const logState = (state) => {
    if (name && name.includes("PRINT")) {
      console.log(`======INCOMING VALUE/s to => ${name.replace("PRINT", "") || ""}`, state);
    }
  };
  const setProps = (propsOrSetter) => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = copyObj(propsOrSetter(tinyStoreState));
      logState(tinyStoreState);
      return;
    }
    tinyStoreState = copyObj(propsOrSetter);
    logState(tinyStoreState);
  };
  return [getProps, setProps];
};
var tinyStore_default = tinyStore;
var effectV2 = (options = {}) => {
  let tinyStoreState;
  let interFunc;
  const setEffect = (func, arr) => {
    if (typeof func === "function") {
      interFunc = func;
      console.log("`effect` function placeholder called.");
    }
  };
  const execute = (arr, el) => {
    try {
      if (typeof interFunc === "function") {
        console.log("`compare` function placeholder called.");
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

// src/core/sequentialId.ts
var [seq, setSeq] = tinyStore_default(0);
var sequentialId = () => {
  setSeq((p) => p + 1);
  return seq();
};

// src/core/virtualNode.ts
var propsDefinition = {
  className: "",
  text: undefined,
  events: {},
  style: {},
  tagDomProps: {},
  children: [],
  isParent: false
};
function createCompoundVirtualNode(tagName, props = propsDefinition) {
  const id = sequentialId();
  const node = {
    id,
    tagName: tagName === "fragment" ? "fragment" : tagName,
    isFragment: tagName === "fragment",
    elementProperties: { ...props }
  };
  return { id, [id]: node };
}
function createElement(tagName, props) {
  const node = createCompoundVirtualNode(tagName, props);
  return node[node.id];
}
var div = (props) => createElement("div", props);
var button = (props) => createElement("button", props);
var h1 = (props) => createElement("h1", props);
var t = (tagName, props) => createElement(tagName, props);

// src/components/AnotherComponent.ts
var DuplicateAnotherComponent = (draw, objTree) => {
  const [counter, setCounter] = tinyStore_default(0);
  const increase = (e, vNode) => {
    setCounter((p) => p + 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  const decrease = (e, vNode) => {
    setCounter((p) => p - 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  return div({
    text: "Another component",
    isParent: true,
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({ text: "increase show counter {nT}" }),
              button({ text: "increase", events: { click: increase } }),
              t("p", {
                children: [
                  t("li", {
                    text: "increaser {nT}",
                    children: [
                      div({ text: "increase show counter {nT}" }),
                      button({ text: "increase", events: { click: increase } }),
                      t("p", {
                        children: [
                          t("li", {
                            text: "increaser {nT}",
                            children: [
                              div({ text: "increase show counter {nT}" }),
                              button({ text: "increase", events: { click: increase } })
                            ]
                          }),
                          t("li", {
                            text: "decreaser  {nT}",
                            children: [
                              div({ text: "decrease show counter {nT}" }),
                              button({ text: "decrease", events: { click: decrease } }),
                              t("h3", { text: String(new Date) })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  t("li", {
                    text: "decreaser  {nT}",
                    children: [
                      div({ text: "decrease show counter {nT}" }),
                      button({ text: "decrease", events: { click: decrease } })
                    ]
                  })
                ]
              })
            ]
          }),
          t("li", {
            text: "decreaser  {nT}",
            children: [
              div({ text: "decrease show counter {nT}" }),
              button({ text: "decrease", events: { click: decrease } })
            ]
          })
        ]
      })
    ]
  });
};
var AnotherComponent = (draw, objTree) => {
  const [counter, setCounter] = tinyStore_default(0);
  const increase = (e, vNode) => {
    setCounter((p) => p + 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  const decrease = (e, vNode) => {
    setCounter((p) => p - 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  return div({
    text: "Another component",
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({ text: "increase show counter {nT}" }),
              button({ text: "increase", events: { click: increase } }),
              t("p", {
                children: [
                  t("li", {
                    text: "increaser {nT}",
                    children: [
                      div({ text: "increase show counter {nT}" }),
                      button({ text: "increase", events: { click: increase } }),
                      t("p", {
                        children: [
                          t("li", {
                            text: "increaser {nT}",
                            children: [
                              div({ text: "increase show counter {nT}" }),
                              button({ text: "increase", events: { click: increase } })
                            ]
                          }),
                          t("li", {
                            text: "decreaser  {nT}",
                            children: [
                              div({ text: "decrease show counter {nT}" }),
                              button({ text: "decrease", events: { click: decrease } })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  t("li", {
                    text: "decreaser  {nT}",
                    children: [
                      div({ text: "decrease show counter {nT}" }),
                      button({ text: "decrease", events: { click: decrease } })
                    ]
                  })
                ]
              })
            ]
          }),
          t("li", {
            text: "decreaser  {nT}",
            children: [
              div({ text: "decrease show counter {nT}" }),
              button({ text: "decrease", events: { click: decrease } })
            ]
          })
        ]
      }),
      DuplicateAnotherComponent(draw, objTree)
    ]
  });
};
var AnotherComponent_default = AnotherComponent;

// src/components/MainComponent.ts
var MainComponent = (draw, objTree) => {
  const [counter, setCounter] = tinyStore_default(0);
  const [inter, setlLastInter] = tinyStore_default(0);
  const increase = (e, vNode) => {
    setCounter((p) => p + 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  const decrease = (e, vNode) => {
    setCounter((p) => p - 1);
    if (inter()) {
      clearInterval(inter());
    }
    const interval = setInterval(() => {
      draw(objTree(), vNode, "update", { myDate: String(new Date), nT: counter() });
    }, 1000);
    setlLastInter(interval);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  const [setEffect, execute] = effectV2();
  const tree = div({
    effect: () => setEffect,
    text: "a div with text {nT}",
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({ text: "increase show counter {nT}" }),
              button({ text: "increase", events: { click: increase } }),
              h1({ text: String(new Date) })
            ]
          }),
          t("li", {
            text: "decreaser",
            children: [
              div({ text: "decrease show counter {nT}" }),
              button({ text: "decrease", events: { click: decrease } }),
              h1({ text: String(new Date) }),
              h1({ text: "{myDate}" })
            ]
          })
        ]
      }),
      AnotherComponent_default(draw, objTree)
    ]
  });
  return tree;
};
var MainComponent_default = MainComponent;
export {
  MainComponent_default as default
};
