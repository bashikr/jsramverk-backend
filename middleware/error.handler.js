function middleWare(req, res, next) {
    console.info(`Got request on ${req.path} (${req.method}).`);
    next();
}

function notFoundError(req, res, next) {
    var err = new Error("Not Found");

    err.status = 404;
    next(err);
}

function errorResult(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title": err.message,
                "detail": err.message
            }
        ]
    });
}

module.exports = {
    notFoundError: notFoundError,
    errorResult: errorResult,
    middleWare: middleWare
};
