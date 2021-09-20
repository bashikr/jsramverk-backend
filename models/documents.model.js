const createConnection = require('../connection-mongodb/db.js');
const config = require("../connection-mongodb/config.json");

let db;

(async function () {
    db = await createConnection(config.docsCollection);

    process.on("exit", () => {
        db.end();
    });
})();

async function printAllDocs() {
    const res = await db.collection.find().toArray();

    return res;
}

async function printOneDoc(id) {
    const res = await db.collection.find(id).toArray();

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
