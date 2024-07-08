// tag properties order
// text => str | props => obj => any | events => arr => eventName / fn | children => arr of tags the repeat
const testFn = () => console.log("yay!")
const testFn1 = () => console.log("camilo!")

const isFn = (fn) => {
  return typeof fn === "function"
}

const isArr = (a) => Array.isArray(a)

const testTagProperties = ['text', { popiJs: true }, [['click', testFn]]]
const testTagProperties1 = ['yay!', { popiJs: true }, [['click', testFn1]]]

const useEvent = () => {
  // this is just an event definition table ... etc...
  return {
    onClick: (e) => ['click', e]
  }
}

const tag = (tagName, props, children) => {
  if (!tagName) {
    return []
  }
  // debugger
  return [tagName, props, children]
}

const div = (props, children) => {
  return ['div', props, children]
}

// a custom tree
const component = () => {
  const defaultProps = ['', { index: true }, []]
  const { onClick } = useEvent()
  const [state, addState] = tinyStore(0)
  
  const print = () => {
    console.log(state())
  }
  
  const add = (e) => {
    // setInterval(() => {
      addState((pre) => {
        const res = pre + 1
        // debugger;
        // e.innerText = `counter ${res}`
        return res
      })
    // }, 300)
    // this is crazy but works
    // debugger
    return init(e, [returnStatement()])
  }
  
  const returnStatement = () => div(() => defaultProps, [
    tag('button', () => [`add to counter ${state()}`,, [
        onClick((e) => add(e))
    ]]),
    tag('button', () => ['print counter',, [['click', print]]])
  ])
  return returnStatement()
}

const HelloWorld = ({children, props}) => {
  return div([
    tag('h1', "head tag h1"),
    children
  ])
}

const cluster = () => div( null,() => {
  return [
    div(),
    div(tag('span', 'tag fn')),
    div([
      tag('span', 'juana no es maria'),
      tag('hr'),
      tag('span', 'juana no es maria2', (props) => {
        // debugger
        // props here is the default prop in the render method
        return div(props,[
          tag('span', 'juana no es maria'),
          tag('hr'),
          tag('span', ''),
          component
        ])
      })
    ])
  ]
})

// the basic tree

export const treeV1 = [
  cluster,
  ['div', ['div', [
    ['button', () => testTagProperties],
    ['button', () => testTagProperties],
    ['button', () => testTagProperties1],['h1', 'klk']]]],
  ['div', ['div', [['h1', 'klk'], ['h1', 'klk']]]],
  ['div', ['div', [['h1', 'klk'], ['h1', 'klk']]]],
  ['div', ['div', [['h1', 'klk'], ['h1', 'klk']]]],
  HelloWorld({children: cluster})
];

const verifyChildren = (children, element) => {
  if (typeof children !== "undefined" && typeof children === "object" && Array.isArray(children) && !Array.isArray(children[0])){
    browserRender([children], element)
  }
  if (typeof children !== "undefined" && typeof children === "object" && Array.isArray(children) && Array.isArray(children[0])){
    browserRender(children, element)
  }
}

function browserRender(tree, root = document.getElementById("root")){
  const mainElement = document.createDocumentFragment()
  
  const provisional = []
  // debugger;
  tree.forEach((treObj) => {
    // debugger;
    let [tagName, properties, children] = [1,2,3]; // place holder to avoid crash
    
    if (typeof treObj === 'function'){
       [tagName, properties, children] = treObj()
    }
    if (isArr(treObj)){
      [tagName, properties, children] = treObj
    }
    
    const element = document.createElement(tagName)
    
    if (typeof properties !== "undefined" && typeof properties === "string"){
      element.innerText = properties
    }
    
    if (isFn(properties)){
      const [str, props, events] = properties();
      if (props?.index){
        element.isIndexParent = true
      }
      element.innerText = str // valid innerText action
      events.forEach(([eventName, fn]) => {
        element.addEventListener(eventName, () => {
          const pro = new Promise((resolve) => {
            if (typeof fn(element, eventName)){
              resolve('camilo')
            }
          })
          pro.then((res) => {
            // element.innerText = String(new Date())
            // debugger
            // res wil be 'camilo'
            console.log('executed after action', )
          })
        })
      })
    }
    
    if (properties){
      verifyChildren(properties, element)
    }
    
    if (children){
      let p = children
      if (isFn(children)){
        // we can pass default props to any child
        p = children({defaultProp: 'klk'})
      }
      verifyChildren(p, element)
    }
    
    provisional.push(element)
  })
  
  // debugger
  provisional.forEach((el) => {
    mainElement.appendChild(el)
  })
  // debugger
  root.appendChild(mainElement)
}

function bruteCleanElement(element){
  // is this a "safe way" of cleaning an element?
  if (!element){
    return;
  }
  // debugger;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
}

function bruteRemoveElement(element){
  // is this a "safe way" of cleaning an element?
  if (!element){
    return;
  }
  let parent = element.parentElement
  while(element?.isIndexParent){
    debugger
    parent = parent.parentElement
  }
  
  element.remove();
  return bruteCleanElement(parent)
}

export default function init(el, children) {
  if (isArr(children) && children){
    const root = bruteRemoveElement(el)
    return browserRender(children, root)
  }
  const root = bruteCleanElement(document.getElementById("root"))
  browserRender(treeV1, root)
}
