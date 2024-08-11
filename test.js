// import { createHtmlFromArray, serverRender, treeV1 } from "./lib";

// console.log(createHtmlFromArray(serverRender(treeV1)));
//
// const deeplyNestedArray = [
//   1,
//   [2, [3, [4, [5]]]],
//   [6, [7, [8, [9, [10]]]]],
//   11,
//   [12, [13, [14, [15, [16, [17]]]]]],
//   [18, 19, 20],
// ];
//
// const stack = [deeplyNestedArray];
//
// while (stack.length > 0) {
//   console.log(stack);
//   const current = stack.pop();
//   for (let i = 0; i < current.length; i += 1) {
//     if (Array.isArray(current[i])) {
//       stack.push(current[i]);
//     } else {
//       console.log(current[i]);
//     }
//   }
// }

// const myArray = [
//   "div",
//   [
//     "div",
//     [
//       ["h1", "klk"],
//       ["h1", "klk"],
//     ],
//   ],
// ];
//
// function iterateArray(arr, depth = 0) {
//   for (let i = 0; i < arr.length; i += 1) {
//     if (Array.isArray(arr[i])) {
//       iterateArray(arr[i], depth + 1);
//     } else {
//       console.log("  ".repeat(depth) + arr[i]);
//     }
//   }
// }
//
// iterateArray(myArray);

// const myArray = [
//   [
//     "div",
//     [
//       "div",
//       [
//         ["h1", "klk"],
//         ["h2", "klk"],
//       ],
//     ],
//   ],
// ];
//
// for (let i = 0; i < myArray.length; i += 1) {
//   console.log("level 0");
//   let children = myArray[0];
//   if (Array.isArray(children) && children[0]) {
//     for (let t = 0; t < children.length; t += 1) {
//       console.log("level 1");
//       // console.log("iterations");
//       // child = child[1];
//       // console.log(child);
//       const child = children[1];
//       if (Array.isArray(child[1] && child[1])) {
//         for (let y = 0; y < child[1].length; y += 1) {
//           // console.log(child[0]);
//           children = child[1];
//           // console.log(children);
//         }
//       }
//     }
//   }
//   if (!Array.isArray(children) && children[0]) {
//     console.log(children[0]);
//   }
// }

class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  // Subscribe to the observable
  subscribe(observer) {
    return this._subscribe(observer);
  }

  // Create an observable from an array
  // static fromArray(array) {
  //   return new Observable((observer) => {
  //     array.forEach((item) => observer.next(item));
  //     observer.complete();
  //   });
  // }
}
// Example usage
const observable = new Observable((observer) => {
  // Emit some values
  observer.next(1);
  observer.next(2);
  observer.next(3);
  // Emit an error
  // observer.error('Something went wrong');
  // Complete the observable
  observer.complete();
  // Cleanup function (optional)
  return {
    unsubscribe: () => console.log("Observer unsubscribed"),
  };
});
// Subscribe to the observable
const subscription = observable.subscribe({
  next: (value) => console.log("Received:", value),
  error: (err) => console.error("Error occurred:", err),
  complete: () => console.log("Observable completed"),
});
// Unsubscribe (cleanup)
subscription.unsubscribe();
