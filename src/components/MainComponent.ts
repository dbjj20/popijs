
import { div, t, button, h1 } from "../core/virtualNode";
import tinyStore, {effectV2} from "../store/tinyStore";
import AnotherComponent from "./AnotherComponent";

const MainComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);
  const [inter, setlLastInter] = tinyStore(0);
  // debugger

  const increase = (e: Event, vNode: any) => {
    setCounter((p) => p + 1);
    // debugger
    draw(objTree(), vNode, "update", { nT: counter() });
  };

  const decrease = (e: Event, vNode: any) => {
    setCounter((p) => p - 1);
    if (inter()){
      clearInterval(inter())
    }
    const interval = setInterval(() => {
      draw(objTree(), vNode, "update", { myDate: String(new Date()), nT: counter() });
    }, 1000);
    setlLastInter(interval);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  const [setEffect, execute] = effectV2()

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
              h1({ text: String(new Date()) })
            ]
          }),
          t("li", {
            text: "decreaser",
            children: [
              div({ text: "decrease show counter {nT}" }),
              button({ text: "decrease", events: { click: decrease } }),
              h1({ text: String(new Date()) }),
              h1({ text: "{myDate}" })
            ]
          })
        ]
      }),
      AnotherComponent(draw, objTree)
    ]
  });
  return tree;
};

export default MainComponent;
