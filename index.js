/* eslint-disable no-undef,default-case */
import path from "path";
import { createHtmlFromArray, serverRender } from "./lib";
import { treeV1 } from "./public/tree";

function getHtmlTemplate(r, c) {
  return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<title>popijs</title>
		<style>
      .container {
        margin: 0;
        padding-top: 10vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
      }
      .row {
        display: flex;
        justify-content: center;
      }
    </style>
    <script type="module">
      import tinyStore from '/public/tinyStore.js'
      import { treeV1 } from '/public/tree.js'
      import render from '/public/render.js'
      import {renderV2} from '/public/renderv2.js'
      import {place} from '/public/renderv3.js'
      
      window.tinyStore = tinyStore
      window.treeV1 = treeV1
      window.render = render
      // window.renderV2 = renderV2
      render(treeV1)
      
      renderV2()
      
      
      // basicRender()
    </script>
   
		</head>
		
		<body>
    <button onclick="render(treeV1)">Re-render</button>
		<p id="juan"></p>
		<div id="v2render"></div>
    ${r}
    </div>
		</body>
		</html>
		`;
}

const port = Bun.env.POPI_PORT || 5173;

Bun.serve({
  port,
  error: () => {
    return new Response(undefined, { status: 500 });
  },
  fetch: async (req, server) => {
    const url = new URL(req.url);
    console.log(url.href);
    const whiteListPaths = ["public"];
    if (whiteListPaths.some((url) => req.url.includes(url))) {
      const ext = path.extname(req.url);
      if (ext) {
        const { pathname } = new URL(req.url);

        const filePath = path.join(
          import.meta.dir,
          pathname.includes("?") ? pathname.split("?")[0] : pathname
        );
        if (filePath) {
          console.log(filePath);
          try {
            const fileData = await Bun.file(filePath);
            let contentType = "text/html";
            const extname = path.extname(filePath);
            switch (extname) {
              case ".css":
                contentType = "text/css";
                break;
              case ".js":
                contentType = "text/javascript";
                break;
              case ".png":
                contentType = "image/png";
                break;
              case ".jpg":
                contentType = "image/jpeg";
                break;
              case ".jpeg":
                contentType = "image/jpeg";
                break;
              case ".woff2":
                contentType = "font/woff2";
                break;
              case ".woff":
                contentType = "font/woff";
                break;
            }

            return new Response(await fileData.stream(), {
              headers: { "Content-Type": contentType },
            });
          } catch (e) {
            // continue render
          }
        }
      }
    }

    const context = { TestComponent_STATE: { count: 0 } };

    const html = createHtmlFromArray(serverRender(treeV1));
    // <div id="root">${html}</div>
    const ren = getHtmlTemplate(
      ``,
      JSON.stringify(context)
    );

    return new Response(ren, { headers: { "Content-Type": "text/html" } });
  },
});
