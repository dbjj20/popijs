
import tinyStore from "../store/tinyStore";

export const factory = (tName: string, props: any) => {
  const [state, setState] = tinyStore({});
  return {
    ...props,
    draw: () => {},
    state,
    setState,
    tagName: tName
  };
};
