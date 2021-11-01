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

async function registerAUser(user) {
    const res = await db.collection.insertOne(user);

    return res;
}

async function login(emailQuery) {
    const res = await db.collection.findOne(emailQuery);

    return res;
}

module.exports = {
    registerAUser: registerAUser,
    login: login,
};
