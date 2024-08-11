export const observer = (initialState, externalFunc = () => {}) => {
  let tinyStoreState = initialState;

  const copyObj = (obj) => {
    onChange(obj, tinyStoreState);
    return JSON.parse(JSON.stringify(obj));
  };

  const getProps = () => {
    // assuming the state only contains data and not functions
    return copyObj(tinyStoreState);
  };

  const onChange = (obj) => {
    if (
      tinyStoreState &&
      JSON.stringify(obj) !== JSON.stringify(tinyStoreState)
    ) {
      if (typeof externalFunc === "function") {
        externalFunc();
      }
    }
  };

  const setProps = (propsOrSetter) => {
    tinyStoreState = copyObj(propsOrSetter);
  };

  return [getProps, setProps];
};

export const didChange = (initialState) => {
  let tinyStoreState = initialState;
  let changed = false;

  const copyObj = (obj) => {
    onChange(obj, tinyStoreState);
    return JSON.parse(JSON.stringify(obj));
  };

  const getProps = () => {
    return changed;
  };

  const onChange = (obj) => {
    changed = false;
    if (
      tinyStoreState &&
      JSON.stringify(obj) !== JSON.stringify(tinyStoreState)
    ) {
      changed = true;
    }
  };

  const setProps = (propsOrSetter) => {
    tinyStoreState = copyObj(propsOrSetter);
  };

  return [getProps, setProps];
};
