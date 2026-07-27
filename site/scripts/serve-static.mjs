// Простейший статический сервер для приёмки собранной папки out/ (Task 6.1).
//
// Намеренно БЕЗ SPA-фолбэка: если файла нет — отдаём 404.html с кодом 404, ровно как это
// сделает nginx с `error_page 404 /404.html`. Иначе проверка ничего не докажет: dev-сервер
// Next сам разрулит любой адрес, а настоящий веб-сервер — нет, и расхождение вылезет только
// на проде. Так же обрабатывается trailingSlash: /news/ → out/news/index.html.
//
// Сервер сжимает текстовые ответы и проставляет Cache-Control — как это делает боевой nginx
// (конфиг в README). Без этого Lighthouse меряет не сайт, а неправильно настроенный сервер:
// на несжатом ответе он снимает ~2 секунды и 30+ баллов.
import http from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon", ".woff2": "font/woff2",
};

export function startStatic(root, port = 4321) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    // Защита от выхода за пределы каталога
    const rel = path.normalize(url).replace(/^([/\\])+/, "");
    let file = path.join(root, rel);
    if (path.relative(root, file).startsWith("..")) {
      res.writeHead(403).end("forbidden");
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");

    if (!existsSync(file) || statSync(file).isDirectory()) {
      const notFound = path.join(root, "404.html");
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      if (existsSync(notFound)) createReadStream(notFound).pipe(res);
      else res.end("404");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const type = TYPES[ext] ?? "application/octet-stream";
    // Хешированные ассеты Next неизменяемы — их можно кэшировать навсегда; остальное на час
    const cache = url.startsWith("/_next/static/")
      ? "public, max-age=31536000, immutable"
      : /\.(png|jpe?g|webp|avif|svg|ico|woff2)$/.test(ext)
        ? "public, max-age=86400"
        : "public, max-age=3600";
    const compressible = /^(text\/|application\/(json|xml|javascript))/.test(type);
    const acceptsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] || "");

    if (compressible && acceptsGzip) {
      const body = gzipSync(readFileSync(file));
      res.writeHead(200, { "content-type": type, "content-encoding": "gzip", "cache-control": cache, vary: "Accept-Encoding" });
      res.end(body);
      return;
    }
    res.writeHead(200, { "content-type": type, "cache-control": cache });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${port}` }));
  });
}
