function errorHandler(err, req, res, next) {
    const statuscode = err.statusCode ? err.statusCode : 500;
    if (statuscode === 400) {
        res.status(400).json({ message: err.message });
    } else {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = errorHandler;