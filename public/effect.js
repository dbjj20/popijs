/* eslint-disable consistent-return */
// globalRender<bool false> | partialRender<bool false> | multiDeps <bool true> | store <tinyStore>
import { observer, didChange } from "./lib.js";

const optionsDefinition = {
  globalRender: false,
  partialRender: false,
  multiDeps: true,
  store: {},
};

/*
  # globalRender true
  the fn passed to effect will trigger window.render();
  the programmer can wrap window.render() in a function
  eg: effect(()=>{}, [one, two, etc...], () => {window.render()}, { multiDeps: false })
  globalRender will execute if globalRender == true
*/

/*
  # partialRender true
  the fn passed to effect will trigger init(mainEl, [returnStatement()]);
  the programmer can wrap init(mainEl, [returnStatement()]) in a function
  eg: effect(()=>{}, [one, two, etc...], () => {init(mainEl, [returnStatement()])}, { multiDeps: false })
  partialRender will execute if partialRender == true
*/

/*
  # multiDeps true
  consider effect(()=>{}, [one, two, etc...], {multiDeps: true}) then execute all have changed
  
  # multiDeps false
  consider effect(()=>{}, [one, two, etc...], {multiDeps: false}) then execute one have changed
*/

/*
  # store
  needed to preserve the internal state when rendering
  const [state, setState] => tinyStore(dep)
  eg: effect(()=>{}, [one, two, etc...], () => {window.render()}, { multiDeps: false })
*/

function compare(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function effect(func, arr, old, callback) {
  if (typeof func === "function") {
    if (typeof arr === "undefined") {
      return func();
    }
    callback(arr);
    const res = compare(arr, old);
    if (res) {
      return;
    }
    return func();
  }
}

const effectV2 = (options = optionsDefinition) => {
  let tinyStoreState;
  let interFunc;

  const setEffect = (func, arr) => {
    if (typeof func === "function") {
      interFunc = func;
      effect(func, arr, tinyStoreState, (deps) => {
        tinyStoreState = deps;
      });
    }
  };

  const execute = (arr, el) => {
    try {
      if (typeof interFunc === "function") {
        const res = compare(arr, tinyStoreState);
        if (res) {
          return;
        }
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

export default effectV2;
