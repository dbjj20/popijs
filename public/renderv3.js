// basic closure

import { div, h1 } from "./renderv2.js";
import tinyStore from "./tinyStore.js";

function randomString(strLength, charSet) {
  const result = [];

  strLength = strLength || 5;
  charSet =
    charSet ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  while (strLength) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    strLength -= 1;
  }

  return result.join("");
}

const holder = {};

const eg = (elName, props) => {
  // eg = Element Generator
  const id = randomString();
  holder[id] = tinyStore({ text: "juana" });
  const els = {
    div,
  };
  return () => {
    // const [state] = holder[id];
    // const { text } = state();
    return {
      holder_id: id,
      view: els[elName]({ ...props, holder_id: id }),
    };
  };
};
const place = () => {
  // fake render
  const res = eg(div);
  // debugger;
};

place();

export { place };
