const express = require("express");
var cors = require("cors");
var path = require("path");
const app = express();
const errorHandler = require("./middlewares/error-handler");
const { postUrlValidator } = require("./middlewares/validators");
const { getVideoAudio, getVideoDetails } = require("./utils/youtube");

var http = require("http").createServer(app);

const port = process.env.PORT || 3333;
const isProd = process.env.NODE_ENV === "production";

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, "../public")));

if (!isProd) {
    app.use(cors());
}

app.get("/health", (req, res) => {
    res.status(200).send();
});

app.post("/audio", postUrlValidator, (req, res, next) => {
    try {
        getVideoAudio(req.body.url, res);
    } catch (e) {
        next(e);
    }
});

app.post("/info", postUrlValidator, async (req, res, next) => {
    try {
        const details = await getVideoDetails(req.body.url, res);
        res.status(200).send({ title: details.title });
    } catch (e) {
        next(e);
    }
});

app.use(errorHandler);

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
