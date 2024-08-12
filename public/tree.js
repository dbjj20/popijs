/* eslint-disable no-sparse-arrays,react-hooks/rules-of-hooks */
import init from "./render.js";
import tinyStore from "./tinyStore.js";
import effect from "./effect.js";

// the basics

// const testFn = () => console.log("yay!");
// const testFn1 = () => console.log("camilo!");
//
// const testTagProperties = ["text", { popiJs: true }, [["click", testFn]]];
// const testTagProperties1 = ["yay!", { popiJs: true }, [["click", testFn1]]];

const useEvent = () => {
  // this is just an event definition table ... etc...
  return {
    onClick: (e) => ["click", e],
  };
};

const tag = (tagName, propsOrChildren, children, callback) => {
  if (!tagName) {
    return [];
  }
  // debugger
  return [tagName, propsOrChildren, children, callback];
};

const div = (propsOrChildren, children, callback) => {
  // return ["div", props, children];
  return tag("div", propsOrChildren, children, callback);
};

// a custom tree
const component = (props) => {
  const [state, addState] = tinyStore(0);
  const [colorState, setColor] = tinyStore("blue");
  const [colorEffect] = effect();
  const colorList = [
    "red",
    "yellow",
    "white",
    "magenta",
    "green",
    "orange",
    "purple",
    "pink",
    "brown",
    "gray",
    "cyan",
    "lime",
    "teal",
    "maroon",
    "olive",
    "silver",
    "gold",
    "indigo",
    "violet",
    "beige",
    "turquoise",
  ];
  let mainEl;
  const { onClick } = useEvent();
  const defaultProps = ["", { index: true }, []];

  const print = () => {
    // console.log(state());
  };

  const add = (e) => {
    // console.log(props);
    // console.log(props.propFunc());
    // console.log(mainEl, e);
    // debugger;
    addState((pre) => {
      const result = pre + 1;
      if (colorList[result]) {
        setColor(colorList[result]);
      }
      return result;
    });
    init(mainEl, [returnStatement()]);
    // this is crazy but works
    // debugger
    props.setParentState(); // set parent state
  };
  props.setParentState();

  const decrement = (e) => {
    addState((pre) => {
      const result = pre - 1;
      if (colorList[result]) {
        setColor(colorList[result]);
      }
      return result;
    });
    init(mainEl, [returnStatement()]);
    // this is crazy but works
    // debugger
  };

  // (() => {
  //   // effect function?
  //   setInterval(() => {
  //     addState((pre) => {
  //       const result = pre + 1;
  //       if (colorList[result]) {
  //         setColor(colorList[result]);
  //       }
  //       if (!colorList[result]) {
  //         setColor(colorList[0]);
  //         return 0;
  //       }
  //       return result;
  //     });
  //     // console.log('klk')
  //     if (mainEl) {
  //       // debugger
  //       init(mainEl, [returnStatement()]);
  //     }
  //     // this works but if run more than one time then this gets bad
  //   }, 500);
  // })();
  const returnStatement = () => {
    const color = colorState();
    colorEffect(() => {
      setTimeout(() => {
        console.log("executing effect");
        addState((pre) => {
          const result = pre + 1;
          if (colorList[result]) {
            setColor(colorList[result]);
          }
          if (!colorList[result]) {
            setColor(colorList[0]);
            return 0;
          }
          return result;
        });
        // console.log('klk')
        if (mainEl) {
          // debugger
          init(mainEl, [returnStatement()]);
        }
      }, 500);
    }, [color]);

    const compo = tag("span", () => [
      "colorized el",
      { style: { background: color } },
    ]);

    // debugger;
    return div(
      () => defaultProps,
      [
        tag("p", compo),
        tag("button", () => [
          "increment",
          { popiJs: true, className: "cssclass", style: { background: color } },
          [onClick((e) => add(e))],
        ]),
        tag("button", () => ["decrement", , [onClick((e) => decrement(e))]]),
        tag("p", [
          tag("li", [
            tag("span", () => [`${new Date()}`, , [["click", print]]]),
          ]),
          tag("li", [
            tag("span", () => [`${new Date()}`, , [["click", print]]]),
          ]),
        ]),
      ],
      (el, root) => {
        mainEl = el;
      }
    );
  };
  return returnStatement();
};

const HelloWorld = ({ children, props }) => {
  return div([tag("h1", "head tag h1"), children]);
};

const [parentState, addParentState] = tinyStore({ klk: true });
const cluster = () =>
  div(null, () => {
    return [
      div(),
      div(tag("span", "tag fn")),
      div([
        tag("span", "juana no es maria"),
        tag("hr"),
        tag("span", "juana no es maria2", (props) => {
          // debugger
          // props here is the default prop in the render
          const propFunc = () => {
            return parentState();
          };
          const setParentState = (e) => {
            addParentState((p) => {
              return {
                ...p,
                showDate: new Date(),
              };
            });
            // debugger;
            // e does not work because this method does not belong an event listener
            // but we can get the main element and the render from that element
            // init(e, [returnStatement()]);
            // rendering the entire app again
            // window.render(); // provisional re-rendering
          };

          // (() => {
          //   setTimeout(() => {
          //     addParentState((p) => {
          //       return {
          //         ...p,
          //         showDate: new Date(),
          //       };
          //     });
          //     // console.log('klk')
          //     window.render();
          // this works but if run more than one time then this gets bad
          //   }, 500);
          // })();

          const returnStatement = () =>
            div(props, [
              tag("h4", `state of parent ${JSON.stringify(parentState())}`),
              tag("span", "juana no es maria"),
              tag("hr"),
              tag("span"),
              component({ passingProps: true, propFunc, setParentState }),
            ]);
          return returnStatement();
        }),
      ]),
    ];
  });

// the basic tree

export const manyClusters = [];
// let counter = 0;
// while (counter < 100) {
//   manyClusters.push(cluster);
//   counter += 1;
// }
export const treeV1 = [...manyClusters, HelloWorld({ children: cluster })];