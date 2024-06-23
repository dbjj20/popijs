// tag properties order
// text => str | props => obj => any | events => arr => eventName / fn | children => arr of tags the repeat
const testFn = () => console.log("yay!")
const testFn1 = () => console.log("yay1!")

const isFn = (fn) => {
  return typeof fn === "function"
}

const verifyProperties = (props) => {
  if (isFn(props)){
    return props()
  }
  props;
}

const isArr = (a) => Array.isArray(a)

const testTagProperties = ['text', { popiJs: true }, [['click', testFn]]]
const testTagProperties1 = ['yay!', { popiJs: true }, [['click', testFn1]]]

const tag = (name, props, children) => {
  if (!name) {
    return []
  }
  return [name, props, children]
}

const div = (props, children) => {
  return ['div', props, children]
}

// a custom tree
const cluster = div( null,() => {
  
  return [
    div(),
    div(1,() => tag('span', 'tag fn')),
    div([
      tag('span', 'juana no es maria'),
      tag('hr'),
      tag('span', 'juana no es maria2', (props) => {
        // debugger
        return div([
          tag('span', 'juana no es maria'),
          tag('hr'),
          tag('span', 'juana no es maria3')
        ])
      })
    ])
  ]
})

// the basic tree
const treeV1 = [
  cluster,
  ['div', ['div', [
    ['button', () => testTagProperties],
    ['button', () => testTagProperties],
    ['button', () => testTagProperties1],['h1', 'klk']]]],
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
    
    if (typeof properties !== "undefined" && typeof properties === "string"){
      element.innerText = properties
    }
    
    if (isFn(properties)){
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
      let p = children
      if (isFn(children)){
        p = children({defaultProp: 'klk'})
      }
      verifyChildren(p, element)
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
