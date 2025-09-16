/* eslint-disable no-undef,default-case */
import path from "path";

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
      import render, { objTree, setObjTree } from '/build/index.js'
      import MainComponent from "/build/assets/MainComponent.js";
      const tree = MainComponent(render, objTree)
      setObjTree(tree)
      render(objTree())
      
    </script>
   
		</head>
		
		<body>
		<div id="v2render"></div>
    ${r}
    </div>
		</body>
		</html>
		`;
}

const port = Bun.env.POPI_PORT || 1420;

Bun.serve({
  port,
  error: () => {
    return new Response(undefined, { status: 500 });
  },
  fetch: async (req, server) => {
    const url = new URL(req.url);
    console.log(url.href);
    const whiteListPaths = ["public", "build"];
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

    const ren = getHtmlTemplate("", JSON.stringify(context));

    return new Response(ren, { headers: { "Content-Type": "text/html" } });
  },
});
