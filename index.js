import {html, render} from "./main";
import { TestComponent } from "./routes";
import path from "path";

function getHtmlTemplate(r, c){
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<title>popijs</title>
		</head>
		
		<body id="root">
		${ r }
		</body>
		<script type="module">
      import tinyStore from '/public/tinyStore.js'
      window.tinyStore = tinyStore
    </script>
		<script type="module">
		  
		  const [state, setState] = tinyStore()
		  window.document.popijs_STATE = ${c}
		  let comida = 0
		  
		  function updateTextElement(el, str){
		    // function to update element text
		    el.innerText = el.innerText + String(str)
		  }
		  
		  function doclick(){
		    // function to do logic
		    // do front or back logic
		    console.log('clicked')
		    comida += 1
		  }
		
		  const htmlTree = [
		    ['h1', 'klk h1', {events:[], children: [], props: {}}],
		    ['h2', 'klk h2', {events:[], children: [], props: {}}],
		    ['button', 'click me', {
		      events: [
		          ["click", doclick]
		        ],
		      children: [],
		      props: {}
		    }]
		  ]
		 
		  // debugger
		  function init(){
		    // debugger
		    htmlTree.forEach((treeElement) => {
		      // debugger;
		      // 0 = tag name
		      // 1 = element text
		      // 2 = element events|children|props
		      
          const el = document.createElement(treeElement[0])
          treeElement[2].events.forEach((event) => {
            // debugger;
            el.addEventListener(event[0], () => {
              const fn = event[1]
              fn()
              // pass the state value
              updateTextElement(el, 'k')
            })
          })
          el.innerText = treeElement[1]
          document.getElementById("root").appendChild(el)
		    })
		    // const button = document.createElement("button")
		    // button.addEventListener('click', () => {
		    //   doclick()
		    //   updateTextElement(button, comida)
		    // })
		    // button.innerText = 'click me'
		    // document.getElementById("root").appendChild(button)2
		  }
		  init()
    </script>
		</html>
		`
}

// const result = h("div", {id: "test"}, "hello")

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
    
    const ren = getHtmlTemplate('', JSON.stringify(context));
    
    return new Response(ren, {headers: { "Content-Type": "text/html" }})
  }
});
