// core render 1.0

const component = () => {
  let mainEl;
  const { input } = event();
  const [formState, setFormState] = tinyStore({
    name: "name of the user",
  });
  let rs;
  const handleChange = (e, el) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    init(mainEl, [rs()]);
  };
  rs = () => {
    const { name } = formState();
    return div(
      () => [""],
      [
        tag("input", () => [,{ name: "name",value: name }, [input(handleChange)]]),
      ],
      (main) => {
        mainEl = main;
      }
    );
  };


  return rs();
};


// core render 1.5?

const component = () => {
	const [formState, setFormState] = tinyStore({
    name: "name of the user",
  });
  
  return div(`className="class" onChange={}`, [children, etc...])

}


// example
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