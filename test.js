import { createHtmlFromArray, serverRender, treeV1 } from "./lib/";

console.log(createHtmlFromArray(serverRender(treeV1)))