const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${host}:${port}`);
    let requestedPath = decodeURIComponent(url.pathname);
    if (requestedPath.endsWith("/")) requestedPath += "index.html";

    const filePath = path.resolve(
      root,
      path.normalize(requestedPath).replace(/^([\\/])+/, "")
    );

    if (!filePath.startsWith(root)) {
      res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    });
    stream.once("open", () => {
      res.writeHead(200, {
        "content-type":
          mimeTypes[path.extname(filePath).toLowerCase()] ||
          "application/octet-stream",
      });
    });
    stream.pipe(res);
  })
  .listen(port, host, () => {
    console.log(`Serving ${root} at http://${host}:${port}/`);
  });
