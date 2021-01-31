const http = require("http");
const Express = require("express");
const compress = require("compression");
const settings = require("../settings.json");

let app = new Express();

app.use(compress());
app.use("/node_modules", Express.static("node_modules"));
app.use(Express.static("public"));

http.createServer(app).listen(settings.port);
