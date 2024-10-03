import tinyStore from "./tinyStore";

// a decentralized rendering arch

const treeV2 = {
  div: {
    p: {
      li: {
        propsOn: true,
        className: "some class name",
        innerText: "KLK",
        events: {
          click: () => {
            // execute event fn
            console.log("in click event");
          },
        },
        styles: {},
        tagDomProps: {},
      },
    },
    h1: "random text",
    fragment: "random text",
  },
};

function init() {
  console.log("render v2");
}

const renderV2 = init;
const plh = 2;

export { renderV2, plh };
