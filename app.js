/**
 * app.js is the main file that takes the responsibility of turning the server on.
 */
"use strict";

const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const middleWare = require('./middleware/error.handler.js');
const index = require('./routes/index.route.js');
const documents = require('./routes/documents.route.js');
const authRoute = require('./routes/auth.route.js');
const path = require('path');
const httpServer = require("http").createServer(app);
var { graphqlHTTP } = require('express-graphql');
const {GraphQLSchema} = require("graphql");
const RootQueryType = require("./graphql/root.js");
const authHandler = require('./middleware/auth.handler');

app.use(express.static(path.join(__dirname, '../editor-angular-frontend/dist/editor-angular')));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const schema = new GraphQLSchema({
    query: RootQueryType
});

app.use('/graphql', authHandler.checkToken, graphqlHTTP({
    schema: schema,
    graphiql: false, // Visual är satt till true under utveckling
}));



const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});


io.on("connection", (socket) => {
    socket.on('openDoc', function (docId) {
        socket.join(docId);
    });

    socket.on('updateDocument', (doc) => {
        socket.to(doc._id).emit("updateDocument", doc);
    });

    socket.on('updateContent', (object) => {
        socket.to(object.id).emit("updateDocument", object.content);
    });

    socket.on('closeDoc', (docId) => {
        socket.leave(docId);
    });
});


app.use('/', authRoute);
app.use('/', index);
app.use('/documents', documents);
app.use(middleWare.middleWare), app.use(middleWare.notFoundError), app.use(middleWare.errorResult);

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

const server = httpServer.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;
