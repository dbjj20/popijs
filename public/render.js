const [state, setState] = tinyStore({ comida: 0 });
const [com, setComida] = tinyStore(0);
// window.document.popijs_STATE = c;
let comida = 0;
const eventsHolder = [];
function updateTextElement(el, text, value) {
  // function to update element text
  const str = String(value)
  el.innerText = `${text}${str ? str : ''}`
}

function doClick() {
  debugger
  // function to do logic
  // do front or back logic
  setComida((p) => p += 1)
}
const fragment = (arr) => [['div', '', {children: arr}]]

const htmlTree = [
  ["h1", "klk h1", { events: [], children: [], props: {} }],
  ["h2", "klk h2", { events: [], children: [], props: {} }],
  [
    "button",
    "click me one",
    {
      events: [["clicks", () => {console.log('ckick')}]],
      children: [],
      props: {},
    },
  ],
  ['li', com],
  ["p", "", { events: [], children: [], props: {} }],
  ["p", "", { events: [], children: [], props: {} }],
  [
    "div",
    "un div",
    {
      events: [
        [
          "click",
          () => {
            alert("el div");
          },
        ],
      ],
      children: [
        [
          "button",
          "underff div",
          {
            events: [
              [
                "click",
                () => {
                  console.log("ui");
                },
              ],
            ],
            children: [],
            props: {},
          },
        ],
        ["ul", "", { children: [
            ["li", "", {children: [['p', 'texto para 1']]}],
            ["li", "", {children: [['p', 'texto para 2', {children: [['button', 'klk']]}]]}],
            ["li", "3"],
            ["li", "4"],
            ["li", "5"],
          ] }],
      ],
      props: {},
    },
  ],
];

function render(tree, node = "root") {
  console.log('rendering')
  
  tree.forEach((treeElement) => {
    // debugger
    // 0 = tag name
    // 1 = element text
    // 2 = element events|children|props
    let el;
    let first_child;
    if (Array.isArray(treeElement[2]?.children) && treeElement[2].children[0]) {
      // create the fragment, then append the element, the append the child el...
      // then append to root element
      el = document.createDocumentFragment();
      first_child = document.createElement(treeElement[0]);
      let value = treeElement[1];
      if (typeof treeElement[1] === 'function'){
        let p = treeElement[1]
        value = p()
      }
      first_child.innerText = value;
      el.appendChild(first_child);
    }

    if (!el) {
      el = document.createElement(treeElement[0]);
    }
    // debugger;
    if (
      treeElement[2]?.events &&
      Array.isArray(treeElement[2].events) &&
      treeElement[2]?.events[0]
    ) {
      
      treeElement[2].events.forEach((event) => {
        // debugger;
        if (event[0]){
          eventsHolder.push([el, event[0], () => {
            console.log('executing', event[0])
            const fn = event[1];
            let value = event[2];
  
            if (typeof event[2] === 'function'){
              const stateFn = event[2];
              value = stateFn()
            }
  
            fn();
            // pass the state value
            debugger
            updateTextElement(el, treeElement[1], value);
          }])
          // el.addEventListener(event[0], () => {
          //   console.log('executing', event[0])
          //   const fn = event[1];
          //   let value = event[2];
          //
          //   if (typeof event[2] === 'function'){
          //     const stateFn = event[2];
          //     value = stateFn()
          //   }
          //
          //   fn();
          //   // pass the state value
          //   debugger
          //   updateTextElement(el, treeElement[1], value);
          // });
        }
      });
    }

    // debugger;
    if (Array.isArray(treeElement[2]?.children) && treeElement[2].children[0]) {
      treeElement[2].children.forEach((c_el) => {
        // debugger;
        if (first_child) {
          let fe = document.createDocumentFragment();
          let fu = document.createElement(c_el[0]);
          let value = c_el[1]
          if (typeof c_el[1] === 'function') {
            let p = c_el[1]
             value = p();
          }
          fu.innerText = value;
          // debugger
          fe = fe.appendChild(fu);
          first_child.appendChild(fe);
          if (Array.isArray(c_el[2]?.children) && c_el[2].children[0]) {
            // debugger
            render(c_el[2].children, fe);
          }
        }
      });
    }

    el.innerText = treeElement[1];
    if (node === "root") {
      // let frag = document.createDocumentFragment()
      // frag.appendChild(el)
      // const rootDiv = document.createElement('div');
      // rootDiv.id = 'root'
      // document.body.appendChild(rootDiv)
      // rootDiv.appendChild(el)
      // const bodyNodes = document.body.childNodes
      //
      // const rootDiv = document.createElement('div');
      // rootDiv.id = 'root'
      //
      // bodyNodes.forEach((bodyNode) => {
      //   if (bodyNode?.id === "root"){
      //     document.body.removeChild(bodyNode)
      //     document.body.appendChild(rootDiv)
      //   }
      // })
      // debugger;
      // rootDiv.appendChild(frag)
      document.getElementById(node).appendChild(el)
      
      return;
    }
    // debugger
    node.appendChild(el);
  });
}
export default function init() {
  render(htmlTree); // render
  // add event listeners
  document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    console.log(eventsHolder)
    eventsHolder.forEach((el) => {
      const element = el[0]
      const eventName = el[1]
      const fn = el[2]
      // debugger
      element.addEventListener(eventName, fn)
    })
  });
}
