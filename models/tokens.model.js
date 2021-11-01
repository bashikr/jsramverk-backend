const createConnection = require('../connection-mongodb/db.js');
var config;

try {
    config = require("../connection-mongodb/config.json");
} catch (e) {
    console.log(e);
}

let db;

(async function () {
    db = await createConnection(config.tokensCollection);

    process.on("exit", () => {
        db.client.close();
    });
})();

async function insertToken(token) {
    const res = await db.collection.insertOne(token);

    return res;
}

async function findToken(token) {
    const res = await db.collection.findOne(token);

    return res;
}

async function deleteToken(token) {
    const res = await db.collection.deleteOne(token);

    return res;
}

module.exports = {
    insertToken: insertToken,
    findToken: findToken,
    deleteToken: deleteToken
};
