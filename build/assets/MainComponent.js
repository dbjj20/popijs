// src/store/tinyStore.ts
var tinyStore = (initialState, options = { name: "", isStateOnly: true }) => {
  const { name = "", isStateOnly = true } = options;
  let tinyStoreState = initialState;
  let didWarnStructuredClone = false;
  const cloneState = (value) => {
    if (!isStateOnly) {
      return value;
    }
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value);
      } catch (error) {
        if (!didWarnStructuredClone) {
          console.warn("structuredClone fallback triggered", error);
          didWarnStructuredClone = true;
        }
      }
    }
    if (Array.isArray(value)) {
      return [...value];
    }
    if (value && typeof value === "object") {
      return { ...value };
    }
    return value;
  };
  const getProps = () => {
    return cloneState(tinyStoreState);
  };
  const logState = (state) => {
    if (name && name.includes("PRINT")) {
      console.log(`======INCOMING VALUE/s to => ${name.replace("PRINT", "") || ""}`, state);
    }
  };
  const setProps = (propsOrSetter) => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = cloneState(propsOrSetter(tinyStoreState));
      logState(tinyStoreState);
      return;
    }
    tinyStoreState = cloneState(propsOrSetter);
    logState(tinyStoreState);
  };
  return [getProps, setProps];
};
var tinyStore_default = tinyStore;
var effectV2 = (options = {}) => {
  let cleanup;
  let interFunc;
  let previousDeps;
  const haveDepsChanged = (nextDeps = [], prevDeps) => {
    if (!prevDeps) {
      return true;
    }
    if (nextDeps.length !== prevDeps.length) {
      return true;
    }
    return nextDeps.some((value, index) => !Object.is(value, prevDeps[index]));
  };
  const runEffect = (deps = []) => {
    if (typeof interFunc !== "function") {
      return;
    }
    if (!haveDepsChanged(deps, previousDeps)) {
      return;
    }
    cleanup?.();
    const result = interFunc();
    cleanup = typeof result === "function" ? result : undefined;
    previousDeps = [...deps];
  };
  const setEffect = (func, deps = []) => {
    if (typeof func !== "function") {
      return;
    }
    cleanup?.();
    cleanup = undefined;
    previousDeps = undefined;
    interFunc = func;
    runEffect(deps);
  };
  const execute = (deps = [], el) => {
    runEffect(deps);
    if (el && typeof cleanup === "function" && options?.autoCleanup) {
      cleanup();
      cleanup = undefined;
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
var buildControlsTree = (depth, handlers, extra) => {
  const createLayer = (currentDepth) => {
    const nested = currentDepth > 1 ? createLayer(currentDepth - 1) : undefined;
    const increaseChildren = [
      div({ text: "increase show counter {nT}" }),
      button({ text: "increase", events: { click: handlers.increase } }),
      ...nested ? [nested] : [],
      ...extra ? extra({ depth: currentDepth, type: "increase" }) : []
    ];
    const decreaseChildren = [
      div({ text: "decrease show counter {nT}" }),
      button({ text: "decrease", events: { click: handlers.decrease } }),
      ...extra ? extra({ depth: currentDepth, type: "decrease" }) : []
    ];
    return t("p", {
      children: [
        t("li", { text: "increaser {nT}", children: increaseChildren }),
        t("li", { text: "decreaser  {nT}", children: decreaseChildren })
      ]
    });
  };
  return createLayer(depth);
};
var DuplicateAnotherComponent = (draw, objTree) => {
  const [counter, setCounter] = tinyStore_default(0);
  const increase = (e, node) => {
    setCounter((p) => p + 1);
    draw(objTree(), node, "update", { nT: counter() });
  };
  const decrease = (e, node) => {
    setCounter((p) => p - 1);
    draw(objTree(), node, "update", { nT: counter() });
  };
  const extraNodes = ({ depth, type }) => {
    if (depth === 1 && type === "decrease") {
      return [t("h3", { text: String(new Date) })];
    }
    return [];
  };
  return div({
    text: "Another component",
    isParent: true,
    children: [buildControlsTree(3, { increase, decrease }, extraNodes)]
  });
};
var AnotherComponent = (draw, objTree) => {
  const [counter, setCounter] = tinyStore_default(0);
  const increase = (e, node) => {
    setCounter((p) => p + 1);
    draw(objTree(), node, "update", { nT: counter() });
  };
  const decrease = (e, node) => {
    setCounter((p) => p - 1);
    draw(objTree(), node, "update", { nT: counter() });
  };
  return div({
    text: "Another component",
    children: [
      buildControlsTree(3, { increase, decrease }),
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
