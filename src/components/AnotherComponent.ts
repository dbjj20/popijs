
import { div, t, button } from "../core/virtualNode";
import tinyStore from "../store/tinyStore";
import type { VNode } from "../types/vnode";

type BranchContext = {
  depth: number;
  type: "increase" | "decrease";
};

type ExtraFactory = (context: BranchContext) => VNode[];

const buildControlsTree = (
  depth: number,
  handlers: {
    increase: (e: Event, node: HTMLElement) => void;
    decrease: (e: Event, node: HTMLElement) => void;
  },
  extra?: ExtraFactory
) : VNode => {
  const createLayer = (currentDepth: number): VNode => {
    const nested = currentDepth > 1 ? createLayer(currentDepth - 1) : undefined;

    const increaseChildren = [
      div({ text: "increase show counter {nT}" }),
      button({ text: "increase", events: { click: handlers.increase } }),
      ...(nested ? [nested] : []),
      ...(extra ? extra({ depth: currentDepth, type: "increase" }) : [])
    ];

    const decreaseChildren = [
      div({ text: "decrease show counter {nT}" }),
      button({ text: "decrease", events: { click: handlers.decrease } }),
      ...(extra ? extra({ depth: currentDepth, type: "decrease" }) : [])
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

const DuplicateAnotherComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);

  const increase = (e: Event, node: HTMLElement) => {
    setCounter((p) => p + 1);
    draw(objTree(), node, "update", { nT: counter() });
  };

  const decrease = (e: Event, node: HTMLElement) => {
    setCounter((p) => p - 1);
    draw(objTree(), node, "update", { nT: counter() });
  };

  const extraNodes: ExtraFactory = ({ depth, type }) => {
    if (depth === 1 && type === "decrease") {
      return [t("h3", { text: String(new Date()) })];
    }
    return [];
  };

  return div({
    text: "Another component",
    isParent: true,
    children: [buildControlsTree(3, { increase, decrease }, extraNodes)]
  });
};

const AnotherComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);

  const increase = (e: Event, node: HTMLElement) => {
    setCounter((p) => p + 1);
    draw(objTree(), node, "update", { nT: counter() });
  };

  const decrease = (e: Event, node: HTMLElement) => {
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

export default AnotherComponent;
