/* eslint-disable no-undef */
import path from "path";

const port = Bun.env.POPI_PORT || 1420;
const assetRoots = new Set(["public", "build"]);

const contentTypes = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const bootScript = `
  import render, { objTree, setObjTree } from "/build/index.js";
  import MainComponent from "/build/assets/MainComponent.js";

  const tree = MainComponent(render, objTree);
  setObjTree(tree);
  render(objTree());
`;

function renderHtmlShell() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>popijs</title>
    <link rel="stylesheet" href="/public/demo.css">
    <script type="module">${bootScript}</script>
  </head>
  <body>
    <div id="v2render"></div>
  </body>
</html>`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getMockUsersResponse() {
  await delay(400 + Math.floor(Math.random() * 1200));

  return Response.json({
    message: "Loaded from mock server",
    users: [
      { id: 1, name: "Ada Lovelace", role: "Compiler" },
      { id: 2, name: "Grace Hopper", role: "Runtime" },
      { id: 3, name: "Edsger Dijkstra", role: "Algorithms" },
    ],
  });
}

function isAssetPath(pathname) {
  const [, root] = pathname.split("/");
  return assetRoots.has(root);
}

async function serveAsset(pathname) {
  if (!isAssetPath(pathname) || !path.extname(pathname)) {
    return undefined;
  }

  const filePath = path.join(import.meta.dir, pathname);

  try {
    const fileData = Bun.file(filePath);
    if (!(await fileData.exists())) return undefined;

    const contentType =
      contentTypes[path.extname(filePath)] || "application/octet-stream";
    return new Response(fileData.stream(), {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return undefined;
  }
}

Bun.serve({
  port,
  error: () => new Response(undefined, { status: 500 }),
  fetch: async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/api/mock/users") {
      return await getMockUsersResponse();
    }

    const assetResponse = await serveAsset(url.pathname);
    if (assetResponse) return assetResponse;

    return new Response(renderHtmlShell(), {
      headers: { "Content-Type": "text/html" },
    });
  },
});
