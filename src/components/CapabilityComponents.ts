import { button, div, fragment, t } from "../core/virtualNode";
import tinyStore from "../store/tinyStore";

export const BoundaryCounterComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);

  const increment = (_event: Event, node: HTMLElement) => {
    setCounter((value) => value + 1);
    draw(objTree(), node, "update", { boundaryClicks: counter() });
  };

  const decrement = (_event: Event, node: HTMLElement) => {
    setCounter((value) => value - 1);
    draw(objTree(), node, "update", { boundaryClicks: counter() });
  };

  return div({
    isBoundary: true,
    className: "capability capability-counter",
    style: {
      border: "1px solid #ddd",
      padding: "12px",
      marginTop: "12px"
    },
    children: [
      t("h2", { text: "Independent boundary counter" }),
      div({ text: "Boundary value: {boundaryClicks:0}" }),
      button({ text: "+", events: { click: increment } }),
      button({ text: "-", events: { click: decrement } }),
      div({ text: "Static text should not change during updates." })
    ]
  });
};

export const InputEchoComponent = (draw: any, objTree: any) => {
  const [message, setMessage] = tinyStore("");

  const updateMessage = (event: Event, node: HTMLElement) => {
    const value = (event.target as HTMLInputElement).value;
    setMessage(value);
    draw(objTree(), node, "update", { echo: message() });
  };

  return div({
    isBoundary: true,
    className: "capability capability-input",
    style: {
      border: "1px solid #ddd",
      padding: "12px",
      marginTop: "12px"
    },
    effect: (node, state) => {
      const element = node as HTMLElement;
      const value = String(state.echo ?? "");
      element.dataset.echoLength = String(value.length);
      element.style.borderColor = value.length > 0 ? "#4b8f8c" : "#d9dde3";

      return () => {
        element.style.borderColor = "";
      };
    },
    children: [
      t("h2", { text: "Input echo" }),
      t("input", {
        placeholder: "type here",
        events: { input: updateMessage }
      }),
      div({ text: "Echo: {echo:}" })
    ]
  });
};

export const FragmentListComponent = (draw: any, objTree: any) => {
  const [selected, setSelected] = tinyStore("none");

  const select = (value: string) => (_event: Event, node: HTMLElement) => {
    setSelected(value);
    draw(objTree(), node, "update", { selectedItem: selected() });
  };

  return div({
    isBoundary: true,
    className: "capability capability-fragment",
    style: {
      border: "1px solid #ddd",
      padding: "12px",
      marginTop: "12px"
    },
    children: [
      t("h2", { text: "Fragment children" }),
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
    style: {
      border: "1px solid #ddd",
      padding: "12px",
      marginTop: "12px"
    },
    effect: (node, state, action) => {
      const element = node as HTMLElement;
      const count = Number(state.effectRuns ?? 0);
      element.dataset.effectAction = action;
      element.style.outline = count % 2 === 0 ? "2px solid #4b8f8c" : "2px solid #c56b4f";

      return () => {
        element.style.outline = "";
      };
    },
    children: [
      t("h2", { text: "Effect demo" }),
      div({ text: "Effect runs: {effectRuns:0}" }),
      button({ text: "run effect", events: { click: triggerEffect } })
    ]
  });
};
