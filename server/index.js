const http = require("http");
const Express = require("express");
const compress = require("compression");
const path = require("path");

let static = Express.static(path.resolve(path.dirname(module.filename), "../public"));

if (require.main === module) {
    let app = new Express();
    app.use(compress());
    app.use("/", static);

    const settings = require("../settings.json");
    http.createServer(app).listen(settings.port);
} else {
    module.exports = static;
}
