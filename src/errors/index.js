class HttpError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
};

const notFoundErrorHandler = (req, res, next) => {
    const err = new HttpError(404, 'Not found');
    next(err);
};

const devErrorHandler = (err, req, res, next) => {
    console.error(err.stack);

    res.status(err.code || 500);
    res.json(buildErrorJsonResponse(err.message, err));
}

const productionErrorHandler = (err, req, res, next) => {
    res.status(err.code || 500);
    res.json(buildErrorJsonResponse(err.message, {}));
}

const buildErrorJsonResponse = (message, error) => ({
    'error': {
        message,
        'code' :error.code
    }
});

module.exports = {
    HttpError,
    notFoundErrorHandler,
    devErrorHandler,
    productionErrorHandler
}
