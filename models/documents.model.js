const createConnection = require('../connection-mongodb/db.js');
var config;

try {
    config = require("../connection-mongodb/config.json");
} catch (e) {
    console.log(e);
}

let db;

(async function () {
    db = await createConnection(config.docsCollection);

    process.on("exit", () => {
        db.client.close();
    });
})();

async function printAllDocs() {
    const res = await db.collection.find().toArray();

    return res;
}

async function printOneDoc(id) {
    const res = await db.collection.findOne(id);

    return res;
}

async function insertADoc(docInsertionOrder) {
    const res = await db.collection.insertOne(docInsertionOrder);

    return res;
}

async function updateADoc(query, update, options) {
    const res = await db.collection.updateOne(query, update, options);

    return res;
}

async function deleteADoc(query) {
    const res = await db.collection.deleteOne(query);

    return res;
}

module.exports = {
    printAllDocs: printAllDocs,
    insertADoc: insertADoc,
    updateADoc: updateADoc,
    deleteADoc: deleteADoc,
    printOneDoc: printOneDoc
};
