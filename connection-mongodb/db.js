const mongo = require("mongodb").MongoClient;
const config = require("./config.json");

async function createConnection(collectionName) {
    let dsn = `mongodb+srv://${config.username}:${config.password}` +
        `@cluster0.km3rb.mongodb.net/${config.database}?retryWrites=true&w=majority`;

    if (process.env.NODE_ENV === 'test') {
        dsn = process.env.DBWEBB_DSN || `mongodb://localhost:27017/${config.database}`;
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
