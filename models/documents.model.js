const createConnection = require('../connection-mongodb/db.js');
var config;

try {
    config = require("../connection-mongodb/config.json");
} catch (e) {
    console.log(e);
}

let db;

(async function () {
    db = await createConnection(config.usersCollection);

    process.on("exit", () => {
        db.client.close();
    });
})();

async function printAllDocs(user) {
    const res = await db.collection.findOne(user);

    return res['docs'];
}

async function printOneDoc(query) {
    const res = await db.collection.findOne({ "docs._id": query.docsId },
        { projection: { "docs.$": 1, "_id": 0 } });

    return res['docs'][0];
}

async function insertADoc(docInsertionOrder, user) {
    const res = await db.collection.updateOne(user, {
        $push: {
            'docs': docInsertionOrder
        }
    });

    return res;
}

async function updateADoc(query, update, options) {
    const res = await db.collection.updateOne(query,
        update, options);

    return res;
}

async function deleteADoc(query, update, options) {
    const res = await db.collection.updateOne(query, update, options);

    return res;
}

async function printAllUsersEmails(user) {
    const res = await db.collection.find(
        {email: {$ne: user}},
        { 'projection': { 'email': 1, '_id': 0 } }).toArray();

    return res;
}

async function giveUserPermission(user, docInsertionOrder) {
    const res = await db.collection.updateOne(user, docInsertionOrder);

    return res;
}

async function getSharedDocuments(user) {
    const res = await db.collection.find({'docs.allowed_users': user.email},
        { 'projection': { 'email': 0, '_id': 0, 'firstName': 0, 'lastName': 0,
            'password': 0} }).toArray();

    return res[0]['docs'];
}

async function modifySharedDocuments(user, docToUpdate, options) {
    const res = await db.collection.updateOne(user, docToUpdate, options);

    return res;
}

module.exports = {
    printAllDocs: printAllDocs,
    insertADoc: insertADoc,
    updateADoc: updateADoc,
    deleteADoc: deleteADoc,
    printOneDoc: printOneDoc,
    printAllUsersEmails: printAllUsersEmails,
    giveUserPermission: giveUserPermission,
    getSharedDocuments: getSharedDocuments,
    modifySharedDocuments: modifySharedDocuments
};
