/* eslint-disable no-undef,default-case */
import path from "path";

function getHtmlTemplate(r, c) {
  return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<title>popijs</title>
		<style>
      :root {
        color: #202124;
        background: #f7f8fa;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #f7f8fa;
      }

      #v2render {
        width: min(920px, calc(100vw - 32px));
        margin: 32px auto;
      }

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

      .capability {
        background: #fff;
        border: 1px solid #d9dde3 !important;
        border-radius: 8px;
        box-shadow: 0 1px 2px rgba(12, 18, 28, 0.06);
        margin-top: 14px !important;
        padding: 14px !important;
      }

      .capability h2 {
        font-size: 16px;
        line-height: 1.2;
        margin: 0 0 10px;
      }

      button {
        appearance: none;
        background: #202124;
        border: 1px solid #202124;
        border-radius: 6px;
        color: #fff;
        cursor: pointer;
        font: inherit;
        margin: 6px 6px 6px 0;
        min-height: 34px;
        padding: 6px 12px;
      }

      button:hover {
        background: #3b3d42;
      }

      input {
        border: 1px solid #b8bec8;
        border-radius: 6px;
        font: inherit;
        margin: 6px 0;
        min-height: 34px;
        padding: 6px 10px;
        width: min(320px, 100%);
      }

      p,
      li {
        line-height: 1.5;
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
