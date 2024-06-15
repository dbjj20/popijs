export const isObject = function(a) {
  return (!!a) && (a.constructor === Object);
};

export const isPopiProperty = (p) => {
  let isPopiProp = false;
  if (Array.isArray(p) && p[0]){
    // destructure p
    const [str, props, events] = p;
    if (typeof str !== "string"){
      isPopiProp = false
    }
    if (isObject(props)){
      isPopiProp = true
    }
    if (!Array.isArray(events)){
      isPopiProp = false
    }
  }
  
  return isPopiProp
}
