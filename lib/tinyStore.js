const tinyStore = (initialState, name = "") => {
  let tinyStoreState = initialState;

  const copyObj = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  const getProps = () => {
    // assuming the state only contains data and not functions
    return copyObj(tinyStoreState);
  };

  const logState = (state) => {
    if (name && name.match("PRINT")) {
      console.log(
        `======INCOMING VALUE/s to => ${name.replace("PRINT", "") || ""}`,
        state
      );
    }
  };

  const setProps = (propsOrSetter) => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = copyObj(propsOrSetter(tinyStoreState));
      logState(tinyStoreState);
      return;
    }
    if (Array.isArray(propsOrSetter) && typeof propsOrSetter !== "function") {
      tinyStoreState = copyObj([...propsOrSetter]);
      logState(tinyStoreState);
      return;
    }
    if (!Array.isArray(propsOrSetter) && typeof propsOrSetter !== "function") {
      tinyStoreState = copyObj({ ...tinyStoreState, ...propsOrSetter });
      logState(tinyStoreState);
    }
  };

  return [getProps, setProps];
};
export default tinyStore;
