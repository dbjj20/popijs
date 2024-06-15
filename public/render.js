// tag properties order
// text => str | props => obj => any | events => arr => eventName / fn | children => arr of tags the repeat
const testFn = () => console.log("yay!")
const testFn1 = () => console.log("yay1!")

const testTagProperties = ['text', { popiJs: true }, [['click', testFn]]]
const testTagProperties1 = ['yay!', { popiJs: true }, [['click', testFn1]]]

const isObject = function(a) {
  return (!!a) && (a.constructor === Object);
};

const isPopiProperty = (p) => {
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

const tag = (name, props, children) => {
  if (!name) {
    return []
  }
  return [name, props, children]
}

const div = (props, children) => {
  return ['div', props, children]
}

const component = div(() => testTagProperties, [
  div(),
  div(),
  div([
    tag('span', 'juana no es maria'),
    tag('hr'),
    tag('span', 'juana no es maria2')
  ])
])

const treeV1 = [
  component,
  ['div', ['div', [
    ['button', () => testTagProperties],
    ['button', () => testTagProperties],
    ['button', () => testTagProperties1]
    ,['h1', 'klk']]]],
  ['div', ['div', [['h1', 'klk'], ['h1', 'klk']]]],
  ['div', ['div', [['h1', 'klk'], ['h1', 'klk']]]],
  ['div', ['div', [['h1', 'klk'], ['h1', 'klk']]]],
];

const verifyChildren = (children, element) => {
  if (typeof children !== "undefined" && typeof children === "object" && Array.isArray(children) && !Array.isArray(children[0])){
    renderV1([children], element)
  }
  if (typeof children !== "undefined" && typeof children === "object" && Array.isArray(children) && Array.isArray(children[0])){
    renderV1(children, element)
  }
}

function renderV1(tree, root = document.getElementById("root")){
  const mainElement = document.createDocumentFragment()
  
  const provisional = []
  
  tree.forEach(([tagName, properties, children]) => {
    const element = document.createElement(tagName)
    let skipRenderFn = false;
    
    if (typeof properties !== "undefined" && typeof properties === "string"){
      element.innerText = properties
    }
    
    if (typeof properties === "function"){
      const [str, props, events] = properties();
      element.innerText = str
      events.forEach(([eventName, fn]) => {
        element.addEventListener(eventName, fn)
      })
    }
    if (properties){
      verifyChildren(properties, element)
    }
    if (children){
      verifyChildren(children, element)
    }
    
    provisional.push(element)
  })
  
  provisional.forEach((el) => {
    mainElement.appendChild(el)
  })
  
  root.appendChild(mainElement)
}

export default function init() {
  renderV1(treeV1)
}
