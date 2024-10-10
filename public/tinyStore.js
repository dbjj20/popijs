const tinyStore = (initialState, options = { name: "", isStateOnly: true }) => {
  const { name, isStateOnly } = options;
  let tinyStoreState = initialState;

  const copyObj = (obj) => {
    if (isStateOnly) {
      return JSON.parse(JSON.stringify(obj));
    }
    if (Array.isArray(obj)) {
      return [...obj];
    }
    return { ...obj };
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
    if (
      !Array.isArray(propsOrSetter) &&
      typeof propsOrSetter !== "function" &&
      (typeof propsOrSetter !== "string" || typeof propsOrSetter !== "number")
    ) {
      tinyStoreState = copyObj({ ...tinyStoreState, ...propsOrSetter });
      logState(tinyStoreState);
    }
    if (
      typeof propsOrSetter === "string" ||
      typeof propsOrSetter === "number"
    ) {
      tinyStoreState = copyObj(propsOrSetter);
      logState(tinyStoreState);
    }
  };

  return [getProps, setProps];
};
export default tinyStore;
