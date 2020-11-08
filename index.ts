import * as http from "http";
import * as fs from "fs";
import * as p from "path";
import * as url from "url";
const filePath = p.resolve(__dirname, "public");

const server = http.createServer();
let cacheAge = 1 * 24 * 3600;
server.on(
  "request",
  (request: http.IncomingMessage, response: http.ServerResponse) => {
    let { url: path, method } = request;
    if (method !== "GET") {
      response.setHeader("Content-Type", 'text/html;charset="utf-8"');
      response.statusCode = 405;
      response.end("不能处理非GET请求奥，换个方式叭！");
    } else {
      let { pathname, query } = url.parse(path);
      pathname = pathname.substr(1);
      pathname = pathname === "" ? "index.html" : pathname;
      fs.readFile(p.resolve(filePath, pathname), (error, data) => {
        // response.setHeader("Content-Type", 'text/html;charset="utf-8"');
        if (error) {
          if (error.errno === -4058) {
            response.statusCode = 404;
            fs.readFile(p.resolve(filePath, "404.html"), (error, data) => {
              if (error) throw error;
              response.end(data.toString());
            });
          } else if (error.errno === -4068) {
            response.setHeader("Content-Type", 'text/html;charset="utf-8"');
            response.end("无权访问这个文件目录，联系网站管理员申请⑧");
          } else {
            response.statusCode = 500;
            response.end("服务器问题鸭，稍后再来试下吧");
          }
        } else {
          response.setHeader("Cache-Control", `${cacheAge}`);
          response.end(data.toString());
        }
      });
    }
  }
);
server.listen(8888);
