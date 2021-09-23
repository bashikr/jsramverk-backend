const mongo = require("mongodb").MongoClient;
var config;

try {
    config = require("./config.json");
} catch (e) {
    console.log(e);
}

async function createConnection(collectionName) {
    let dsn = `mongodb://localhost:27017/test`;

    if (process.env.NODE_ENV !== 'test') {
        dsn = `mongodb+srv://${config.username}:${config.password}` +
            `@cluster0.km3rb.mongodb.net/${config.database}?retryWrites=true&w=majority`;
    }

    const client = await mongo.connect(dsn, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = await client.db();
    const collection = await db.collection(collectionName);

    return {
        db: db,
        collection: collection,
        client: client,
    };
}

module.exports = createConnection;
