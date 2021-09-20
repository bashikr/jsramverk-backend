/**
 * app.js is the main file that takes the responsibility of turning the server on.
 */
"use strict";

const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const morgan = require('morgan');
const cors = require('cors');

const middleWare = require('./middleware/error.handler.js');
const index = require('./routes/index.route.js');
const documents = require('./routes/documents.route.js');
const path = require('path');

app.use(express.static(path.join(__dirname, '../editor-angular-frontend/dist/editor-angular')));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', index);
app.use('/documents', documents);

app.use(middleWare.middleWare), app.use(middleWare.notFoundError), app.use(middleWare.errorResult);

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;
