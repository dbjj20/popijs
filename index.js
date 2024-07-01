import path from "path";
import { createHtmlFromArray, serverRender, treeV1 } from "./lib";

function getHtmlTemplate(r, c){
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<title>popijs</title>
    <script type="module">
      import tinyStore from '/public/tinyStore.js'
      window.tinyStore = tinyStore
    </script>
    <script type="module">
      import render from '/public/render.js'
      window.render = render
      render()
    </script>
		</head>
		
		<body>
    <button onclick="render()">render</button>
		<p id="juan"></p>
    <div id="root">
    ${ r }
    </div>
		</body>
		</html>
		`
}

const port = Bun.env.POPI_PORT || 4321

Bun.serve({
  port,
  error: () => {
    return new Response(undefined, { status: 500 });
  },
  fetch: async ( req, server ) => {
  
    const url = new URL(req.url);
    console.log(url.href);
    const whiteListPaths = ['public'];
    if (whiteListPaths.some((url) => req.url.includes(url))) {
      const ext = path.extname(req.url);
      if (ext) {
        const { pathname } = new URL(req.url);
        
        const filePath = path.join(import.meta.dir, pathname.includes("?") ? pathname.split("?")[0] : pathname);
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
                contentType = "font/woff2"; // Establecer el tipo de contenido para archivos woff2
                break;
              case ".woff":
                contentType = "font/woff"; // Establecer el tipo de contenido para archivos woff
                break;
            }
          
            return new Response(await fileData.stream(), { headers: { "Content-Type": contentType } });
          } catch (e) {
            // continue render
          }
        }
      }
    }
    
    const context = {TestComponent_STATE: {count: 0}}
    
    const html = createHtmlFromArray(serverRender(treeV1))
    const ren = getHtmlTemplate(html, JSON.stringify(context));
    
    return new Response(ren, {headers: { "Content-Type": "text/html" }})
  }
});
