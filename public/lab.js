import tinyStore from "./tinyStore";

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
export const dd = 2;

export const fni = (f) => {
  const instate = {};
  const ifn = (name, val) => {
    const id = randomString();
    // name is a placeholder
    instate[id] = f(randomString(), val);
    return id;
  };

  const getter = () => {
    return instate;
  };

  return [getter, ifn];
};

export const fnc = (id, instate = 'klk') => {
  const ifn = () => {
    return instate;
  };
  const g = () => {
    return id;
  };
  return [g, ifn];
};

const brs = (state) => {
  let state = {};
  
  const getState = () => {
    return state
  }
  
  const setState = (data => {
    state = {...state, ...data}
  };
  return [getState, setState]
}

export const basicRender = () => {
  const [getState, setState] = brs();
  
  
  const component = () => {
  
  }
}
