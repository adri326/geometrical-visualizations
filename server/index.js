const http = require("http");
const Express = require("express");
const compress = require("compression");
const minify = require("express-minify");
const settings = require("../settings.json");

let app = new Express();

app.use(compress());
app.use(minify());
app.use("/node_modules", Express.static("node_modules"));
app.get("/", (req, res) => {
    res.redirect("/index.html");
});
app.use("/", Express.static("./src/"));
app.use("/static", Express.static("./static/"));

http.createServer(app).listen(settings.port);
