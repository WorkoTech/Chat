const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    path: '/chat'
});
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const chatHandler = require('./chatHandler');
const {
    notFoundErrorHandler,
    devErrorHandler,
    productionErrorHandler
} = require('./errors');
const routes = require('./routes');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/ping', (req, res) => {
    return res.status(200).end();
});

app.use(routes);
app.use(notFoundErrorHandler); // catch 404 and forward to error handler

const isProduction = process.env.NODE_ENV === 'production';

// Error handlers
if (!isProduction) {
    app.use(devErrorHandler);
} else {
    app.use(productionErrorHandler);
}

io.on('connection', chatHandler.handler(io));

db.initSequelize().then(() => {
    http.listen(process.env.CHAT_PORT || 3006, () => {
        console.log('Express server listening on '
            + (http.address().address == '::' ? '127.0.0.1' : http.address().address)
            + ':'
            + http.address().port
            + '...'
        );
    });
});
