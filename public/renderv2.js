import tinyStore from "./tinyStore.js";

// a decentralized rendering arch
const [getNode, setNode] = tinyStore({}, { isStateOnly: false });
let counter = -1;

const sequentialId = () => {
  counter += 1;
  return counter;
};

const copyObj = (val) => {
  return JSON.parse(JSON.stringify(val));
};

const propsDefinition = {
  className: "", // some class name
  text: null, // some text
  events: {},
  styles: {},
  tagDomProps: {},
  children: [],
};

// define c_v_node? => compound virtual node
const createCompoundVirtualNode = (tagName, props = propsDefinition) => {
  const id = sequentialId();
  if (tagName && tagName !== "fragment") {
    return {
      id,
      [id]: {
        id,
        elementProperties: { ...props },
        c_v_node: document.createElement(tagName),
      },
    };
  }
  const fragment = {
    id,
    [id]: {
      id,
      isFragment: true, // explicit key/value for later check
      c_v_node: document.createDocumentFragment(),
    },
  };
  // why? because yes :D
  if (tagName && tagName === "fragment") {
    return fragment;
  }

  return fragment;
};

const createElement = (tagName, props) => {
  // this is to keep consistency
  // create raw element with dom element?
  const node = createCompoundVirtualNode(tagName, props);
  // setNode((prev) => {
  //   // do other preparation stuff
  //   return { ...prev, [node.id]: node[node.id] };
  // });
  return node[node.id];
};

const component = () => {
  const [tree, setTree] = tinyStore(undefined, { isStateOnly: false });

  setTree(
    createElement("div", {
      text: "a div with text",
      children: [
        createElement("h1", { text: "klk" }),
        createElement("h1", { text: "klk" }),
        createElement("div", {
          children: [
            createElement("h1", { text: "klk" }),
            createElement("h1", { text: "klk" }),
          ],
        }),
      ],
    })
  );
  return tree();
};

// const treeV2 = {
//   div: {
//     p: {
//       memo: {
//         count: 0,
//       },
//       _setState: (state) => {
//         // never set functions, state only func
//         this.memo = copyObj({ ...this.memo, ...state });
//       },
//       _getState: () => {
//         return copyObj({ ...this.memo });
//       },
//       text: `p KLK ${this.memo.count}`,
//       children: {
//         li_1: {
//           propsOn: true,
//           className: "some class name",
//           text: "KLK",
//           events: {
//             click: () => {
//               // execute event fn
//               console.log("in click event");
//             },
//           },
//           styles: {},
//           tagDomProps: {},
//         },
//         li_2: {
//           propsOn: true,
//           className: "some class name",
//           text: "KLK",
//           events: {
//             click: () => {
//               // execute event fn
//               console.log("in click event");
//             },
//           },
//           styles: {},
//           tagDomProps: {},
//         },
//       },
//     },
//     h1: "random text",
//     fragment: "random text",
//   },
// };

const tree = component();

function init() {
  console.log("render v2", tree);

  debugger;
}

const renderV2 = init;
const plh = 2;

export { renderV2, plh };
