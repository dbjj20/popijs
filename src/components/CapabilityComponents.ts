import { button, div, fragment, t } from "../core/virtualNode";
import tinyStore from "../store/tinyStore";
import { CounterCard, EchoCard } from "../../compiler/examples/Counter.popi";
import { OperationsWorkspace } from "../../compiler/examples/OperationsWorkspace.popi";
import { ServerDataPanel } from "../../compiler/examples/ServerPanel.popi";

export const FragmentListComponent = (draw: any, objTree: any) => {
  const [selected, setSelected] = tinyStore("none");

  const select = (value: string) => (_event: Event, node: HTMLElement) => {
    setSelected(value);
    draw(objTree(), node, "update", { selectedItem: selected() });
  };

  return div({
    isBoundary: true,
    className: "capability capability-fragment",
    children: [
      t("h2", { text: "Fragment action group" }),
      fragment({
        children: [
          button({ text: "select A", events: { click: select("A") } }),
          button({ text: "select B", events: { click: select("B") } }),
          t("span", { text: " Selected: {selectedItem:none}" })
        ]
      })
    ]
  });
};

export const EffectDemoComponent = (draw: any, objTree: any) => {
  const [runs, setRuns] = tinyStore(0);

  const triggerEffect = (_event: Event, node: HTMLElement) => {
    setRuns((value) => value + 1);
    draw(objTree(), node, "update", { effectRuns: runs() });
  };

  return div({
    isBoundary: true,
    className: "capability capability-effect",
    effect: [
      (node, state, action) => {
        const element = node as HTMLElement;
        const count = Number(state.effectRuns ?? 0);
        element.dataset.effectAction = action;
        element.style.outline = count % 2 === 0 ? "2px solid #4b8f8c" : "2px solid #c56b4f";

        return () => {
          element.style.outline = "";
        };
      },
      (node, state) => {
        const element = node as HTMLElement;
        element.title = `effect runs: ${state.effectRuns ?? 0}`;

        return () => {
          element.removeAttribute("title");
        };
      }
    ],
    children: [
      t("h2", { text: "Effect demo" }),
      div({ text: "Effect runs: {effectRuns:0}" }),
      button({ text: "run effect", events: { click: triggerEffect } })
    ]
  });
};

export const CompiledCounterComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);

  const increase = (_event: Event, node: HTMLElement) => {
    setCounter((value) => value + 1);
    draw(objTree(), node, "update", { count: counter() });
  };

  const decrease = (_event: Event, node: HTMLElement) => {
    setCounter((value) => value - 1);
    draw(objTree(), node, "update", { count: counter() });
  };

  return CounterCard({ increase, decrease });
};

export const CompiledEchoComponent = (draw: any, objTree: any) => {
  return EchoCard({ draw, objTree });
};

export const CompiledServerDataComponent = (draw: any, objTree: any) => {
  return ServerDataPanel({ draw, objTree });
};

export const CompiledOperationsWorkspaceComponent = (draw: any, objTree: any) => {
  return OperationsWorkspace({ draw, objTree });
};
