// dist/script.js

import { createRequire as t } from "node:module";
const e = t(import.meta.url)("http"),
  r = t(import.meta.url)("fs/promises"),
  a = t(import.meta.url)("path"),
  o = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
  };
e.createServer(async (t, e) => {
  const n = "/" === t.url ? "/index.html" : t.url,
    i = a.join("./", n);
  try {
    const t = await r.readFile(i),
      n = a.extname(i);
    e.writeHead(200, { "Content-Type": o[n] || "application/octet-stream" }),
      e.end(t);
  } catch (t) {
    e.writeHead(404), e.end("File not found");
  }
}).listen(3e3, () => {
  console.log("Server running at http://localhost:3000/");
});
