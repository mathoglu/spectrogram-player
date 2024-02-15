function postUrlValidator(req, res, next) {
    const regex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/;
    const { url } = req.body;
    if (url.length < 1000 && regex.test(url)) {
        next();
    } else {
        console.error("Request error: Invalid URL");
        res.status(403).send({ error: "Invalid URL" });
    }
}

module.exports = {
    postUrlValidator,
};
