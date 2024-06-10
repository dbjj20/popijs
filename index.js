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
		<p id="juan"></p>
		</body>
		<script type="module">
      import tinyStore from '/public/tinyStore.js'
      window.tinyStore = tinyStore
    </script>
		<script type="module">
		  
		  const [state, setState] = tinyStore({comida: 0})
		  const [com, setComida] = tinyStore({comida: 0})
		  window.document.popijs_STATE = ${c}
		  let comida = 0
		  
		  function updateTextElement(el, str){
		    // function to update element text
		    el.innerText = el.innerText + String(str)
		  }
		  
		  function doclick(){
		    // function to do logic
		    // do front or back logic
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
		    }],
		    ['p', '', {events:[], children: [], props: {}}],
		    ['p', '', {events:[], children: [], props: {}}],
		    ['div', 'un div', {events: [['click', () => {alert('el div')}]], children: [
		      ['button', 'under div', {
		      events: [
		          ["click", () => {
		            console.log('ui')
		          }]
		        ],
		      children: [],
		      props: {}
		    }]
		    ], props: {}}]
		  ]
		 
		  function render(tree, node='root'){
		    tree.forEach((treeElement) => {
		      // 0 = tag name
		      // 1 = element text
		      // 2 = element events|children|props
		      let el;
		      let first_child;
		      if (Array.isArray(treeElement[2].children) && treeElement[2].children[0]){
		        // create the fragment, then append the element, the append the child el...
		        // then append to root elemnt
		        el = document.createDocumentFragment()
		        first_child = document.createElement(treeElement[0])
		        first_child.innerText = treeElement[1]
		        el.appendChild(first_child)
		      }
		      if (!el){
		        el = document.createElement(treeElement[0])
		      }
		      
          treeElement[2].events.forEach((event) => {
            // debugger;
            el.addEventListener(event[0], () => {
              const fn = event[1]
              fn()
              // pass the state value
              updateTextElement(el, 'd')
            })
          })
          // debugger;
          if (Array.isArray(treeElement[2].children) && treeElement[2].children[0]){
            // debugger;
            if (first_child){
              const fu = document.createElement(treeElement[2].children[0][0])
              fu.innerText = treeElement[2].children[0][1]
              // debugger
              first_child.appendChild(fu)
            }
            // render(treeElement[2].children, el)
          }
		      
          el.innerText = treeElement[1]
          if (node === 'root'){
           document.getElementById(node).appendChild(el)
           return
          }
          // debugger
          // console.log(node.parentNode)
          // node.appendChild(el)
		    })
		  }
		  function init(){
		    render(htmlTree)
		  }
		  init()
    </script>
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
    
    const ren = getHtmlTemplate('', JSON.stringify(context));
    
    return new Response(ren, {headers: { "Content-Type": "text/html" }})
  }
});
