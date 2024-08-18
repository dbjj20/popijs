/* eslint-disable no-sparse-arrays,react-hooks/rules-of-hooks */
import init from "./render.js";
import tinyStore from "./tinyStore.js";
import effect from "./effect.js";

// the basics
// tag name | props | children | callback

// const testFn = () => console.log("yay!");
// const testFn1 = () => console.log("camilo!");
//
// const testTagProperties = ["text", { popiJs: true }, [["click", testFn]]];
// const testTagProperties1 = ["yay!", { popiJs: true }, [["click", testFn1]]];

const event = () => {
  // this is just an event definition table ... etc...
  return {
    click: (e) => ["click", e],
  };
};

const tag = (tagName, propsOrChildren, children, callback) => {
  if (!tagName) {
    return [];
  }
  // debugger
  return [tagName, propsOrChildren, children, callback];
};

const fragment = (propsOrChildren, children, callback) => {
  return tag("fragment", propsOrChildren, children, callback);
};

const div = (propsOrChildren, children, callback) => {
  // return ["div", props, children];
  return tag("div", propsOrChildren, children, callback);
};

// a custom tree
const component = (props) => {
  let returnStatement;
  let mainEl;

  const [state, addState] = tinyStore(0);
  const [colorState, setColor] = tinyStore("blue");
  const [colorEffect, executeColorEffect] = effect();
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
  const { click } = event();
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
    // props.setParentState(); // set parent state
  };
  // props.setParentState();

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

  colorEffect(() => {
    // using a timeout to not execute at machine speed limit xD
    // it is way faster than the atom company lib
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
        // do not mix re-renders with events re-renders
        // it causes timeout to sum and execute at the same time
      }
    }, 500);
  }, [colorState()]);

  returnStatement = () => {
    const color = colorState();
    // executeColorEffect([color]);

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
          [click((e) => add(e))],
        ]),
        tag("button", () => ["decrement", , [click((e) => decrement(e))]]),
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
// while (counter < 500) {
//   manyClusters.push(cluster);
//   counter += 1;
// }

const Game = () => {
  let mainEl;
  let returnStatement;
  // const rows = 100;
  // const cols = 400;
  const rows = 60;
  const cols = 100;
  const pxSize = 4;
  const initial = () =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.round(Math.random()))
    );
  const [state, setGrid] = tinyStore(initial());
  const [gameGridEffect] = effect();

  function updateGrid() {
    const grid = state();
    let counter = 0;
    // const newGrid = Array.from({ length: rows }, () =>
    //   Array.from({ length: cols }, () => 0)
    // );
    const newGrid = grid;
    // debugger
    // Recorrer cada célula en la cuadrícula
    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        let neighbors = 0;
        // Calcular el número de vecinos vivos
        for (let x = -1; x <= 1; x += 1) {
          for (let y = -1; y <= 1; y += 1) {
            if (x === 0 && y === 0) {
              // debugger;
              continue;
            } // Saltar la célula actual
            const r = i + x;
            const c = j + y;
            // Verificar si la célula está dentro de la cuadrícula
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
              neighbors += grid[r][c];
            }
          }
        }
        // Aplicar las reglas del juego de la vida
        if (grid[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
          counter *= neighbors;
          newGrid[i][j] = 0;
        } else if (grid[i][j] === 0 && neighbors === 3) {
          newGrid[i][j] = 1;
          counter += 1;
        } else {
          newGrid[i][j] = grid[i][j];
        }
      }
    }

    // Resto del código...
    // Actualizar la cuadrícula
    // grid = newGrid;
    // setCounter(counter)
    setGrid(newGrid);
    // setIncremental(incremental + 1)
  }

  returnStatement = () => {
    const grid = state();
    // debugger;
    return div(
      () => ["", { className: "container" }],
      [
        tag("h1", "Life game"),
        ...grid.map((row, i) => {
          return tag("span", () => ["", { className: "row" }], [
            ...row.map((col, j) => {
              // return tag("span", () => ["klk", {className: "row"}])
              if (grid[i][j]) {
                return tag("span", () => [
                  "",
                  {
                    style: {
                      display: "inline-block",
                      width: `${pxSize}px`,
                      height: `${pxSize}px`,
                      backgroundColor: "green",
                    },
                  },
                ]);
              }
              return tag("span", () => [
                "",
                {
                  style: {
                    display: "inline-block",
                    width: `${pxSize}px`,
                    height: `${pxSize}px`,
                    backgroundColor: "lightgray",
                  },
                },
              ]);
            }),
          ]);
        }),
      ],
      (el) => {
        mainEl = el;
        setTimeout(() => {
          updateGrid();
          // init(mainEl, [returnStatement()]);
        }, 100);
      }
    );
  };

  return returnStatement;
};

const ExampleForm = () => {
  let mainEl;
  let rs; // returnStatement
  const [formState, setFormState] = tinyStore({
    name: "",
    email: "",
    password: "",
  });
  
  rs = () => {
    return div([
    
    ])
  }
}

export const treeV1 = [
  ...manyClusters,
  HelloWorld({ children: cluster }),
  Game(),
];
