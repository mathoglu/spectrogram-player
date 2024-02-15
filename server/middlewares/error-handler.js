function errorHandler(err, req, res) {
    console.error(err);
    res.status(500).json({
        error: "Ooops! Something went wrong. Please try again later.",
    });
}

module.exports = errorHandler;
