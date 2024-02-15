const fs = require('fs');
const ytdl = require("ytdl-core");
const express = require("express");
var cors = require("cors");
var path = require("path");
const app = express();

var http = require("http").createServer(app);

const port = process.env.PORT || 3333;


getAudio = (videoURL, res) => {
  ytdl(videoURL, {
    quality: "highestaudio",
    filter: "audioonly",
  }).pipe(res);
};

getInfo = (videoURL, res) => {
  ytdl.getInfo(videoURL).then(({ videoDetails }) => res.send({ title: videoDetails.title }));
}

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(cors());

//root handler that sends the parameters to getAudio function
app.post("/audio", (req, res) => {
  console.log(req.body)
  try {
    getAudio(req.body.url, res);
  } catch(e) {  
    console.log(e)
  }
});

app.post("/info", (req, res) => {
  console.log(req.body)
  try {
    getInfo(req.body.url, res);
  } catch(e) {  
    console.log(e)
  }
});


http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});