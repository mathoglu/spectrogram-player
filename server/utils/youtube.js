const ytdl = require("ytdl-core");

function getVideoAudio(videoURL, res) {
    ytdl(videoURL, {
        quality: "highestaudio",
        filter: "audioonly",
    }).pipe(res);
}

async function getVideoDetails(videoURL) {
    const { videoDetails } = await ytdl.getInfo(videoURL);
    return videoDetails;
}

module.exports = {
    getVideoAudio,
    getVideoDetails,
};
