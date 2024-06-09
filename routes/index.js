import tinyStore from "../lib/tinyStore";

export function TestComponent({maria}){
  const [getState, addToState] = tinyStore({count: 0})
  return`
    <button id="TestComponent/addToState" onClick=${() => addToState((prev) => prev.count + 1)}>click me - ${getState().count} - ${maria ? maria : ''}</button>`
}