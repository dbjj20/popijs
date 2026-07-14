
import { div, t, button, h1 } from "../core/virtualNode";
import tinyStore from "../store/tinyStore";
import AnotherComponent from "./AnotherComponent";
import {
  BoundaryCounterComponent,
  CompiledCounterComponent,
  EffectDemoComponent,
  FragmentListComponent,
  InputEchoComponent
} from "./CapabilityComponents";

const MainComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);
  const [inter, setlLastInter] = tinyStore(0);

  const increase = (e: Event, vNode: any) => {
    setCounter((p) => p + 1);
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

  const tree = div({
    text: "a div with text {nT:0}",
    isBoundary: true,
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT:0}",
            children: [
              div({ text: "increase show counter {nT:0}" }),
              button({ text: "increase", events: { click: increase } }),
              h1({ text: String(new Date()) })
            ]
          }),
          t("li", {
            text: "decreaser",
            children: [
              div({ text: "decrease show counter {nT:0}" }),
              button({ text: "decrease", events: { click: decrease } }),
              h1({ text: String(new Date()) }),
              h1({ text: "{myDate:}" })
            ]
          })
        ]
      }),
      BoundaryCounterComponent(draw, objTree),
      InputEchoComponent(draw, objTree),
      FragmentListComponent(draw, objTree),
      EffectDemoComponent(draw, objTree),
      CompiledCounterComponent(draw, objTree),
      AnotherComponent(draw, objTree)
    ]
  });
  return tree;
};

export default MainComponent;
