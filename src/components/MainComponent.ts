import { div, h1, t } from "../core/virtualNode";
import {
  CompiledCounterComponent,
  CompiledEchoComponent,
  CompiledOperationsWorkspaceComponent,
  CompiledServerDataComponent,
  EffectDemoComponent,
  FragmentListComponent
} from "./CapabilityComponents";

const MainComponent = (draw: any, objTree: any) => {
  const tree = div({
    isBoundary: true,
    className: "app-shell",
    children: [
      h1({ text: "popijs capability dashboard" }),
      t("p", {
        text: "Focused examples for scoped updates, compiled .popi views, effects, fragments, and server requests."
      }),
      CompiledServerDataComponent(draw, objTree),
      CompiledOperationsWorkspaceComponent(draw, objTree),
      CompiledEchoComponent(draw, objTree),
      CompiledCounterComponent(draw, objTree),
      FragmentListComponent(draw, objTree),
      EffectDemoComponent(draw, objTree)
    ]
  });
  return tree;
};

export default MainComponent;
