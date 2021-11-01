var express = require('express');
var router = express.Router();
const urlencodedParser = express.urlencoded({ extended: true });
const { ObjectId } = require('bson');

const documents = require("../models/documents.model.js");
const authHandler = require('../middleware/auth.handler');


router.get("/", authHandler.checkToken, async (request, response) => {
    const email = request.user.email;

    const pods = await documents.printAllDocs({ email });


    if (pods.length > 0) {
        response.status(200).send(pods);
    } else {
        response.status(400).send({ error: 'Document collection is empty' });
    }
});


router.get("/:id", authHandler.checkToken, async (request, response) => {
    const email = request.user.email;

    let idObj = ObjectId(request.params.id);

    var query = { 'email': email, 'docsId': idObj };

    let pods = await documents.printOneDoc(query);

    if (pods === null) {
        return response.status(404).send({ error: 'Requested document is not found' });
    } else {
        return response.status(200).send(pods);
    }
});



router.post("/create-doc", authHandler.checkToken, urlencodedParser, async (request, response) => {
    const docInsertionOrder = {
        '_id': new ObjectId(),
        'title': request.body.title,
        'content': request.body.content,
        'creationDate': new Date(),
        'updateDate': null,
    };

    request.body.createDate = Date();
    const user = { 'email': request.user.email };

    if (typeof (request.body.title) === 'string' && typeof (request.body.content) === 'string') {
        const pods = await documents.insertADoc(docInsertionOrder, user);

        response.status(201).send(pods);
    } else {
        response.status(400).send({ error: 'Title and content should be of type string' });
    }
});

router.put("/update-doc", authHandler.checkToken, urlencodedParser, async (request, response) => {
    let idObj = ObjectId(request.body._id);
    var query = { 'email': request.user.email, 'docs._id': idObj };
    var update = {
        $set: {
            'docs.$': {
                '_id': idObj,
                'title': request.body.title,
                'content': request.body.content,
                'creationDate': request.body.creationDate,
                'updateDate': new Date(),
            },
        },
    };
    var options = {
        $set: { 'upsert': true },
    };

    if (typeof (request.body.title) === 'string' && typeof (request.body.content) === 'string') {
        const pods = await documents.updateADoc(query, update, options);

        response.status(201).send(pods);
    } else {
        response.status(400).send({ error: 'Title and content should be of type string' });
    }
});

router.delete("/delete-doc/:id",
    authHandler.checkToken, urlencodedParser, async (request, response) => {
        var res = ObjectId(request.params.id);
        var query = { 'email': request.user.email, 'docs._id': res };
        var update = {
            "$pull": {
                "docs": {
                    "_id": res
                }
            }
        };
        var options = {
            $set: { 'upsert': false },
        };

        const pods = await documents.deleteADoc(query, update, options);

        if (pods.deletedCount === 1) {
            response.status(200).send(pods);
        } else {
            response.status(404).send({ error: 'The given document id is not found' });
        }
    });


router.post("/users", authHandler.checkToken, async (request, response) => {
    const pods = await documents.printAllUsersEmails(request.user.email);

    if (pods.length > 0) {
        response.status(200).send(pods);
    } else {
        response.status(400).send({ error: 'There is no users!' });
    }
});


router.post("/allow-user", authHandler.checkToken, async (request, response) => {
    var idObj = ObjectId(request.body.id);
    var allowedEmail = request.body.email;
    var query = { 'email': request.user.email, 'docs._id': idObj };
    var update = {
        $addToSet: { 'docs.$.allowed_users': allowedEmail },
        $set: { 'docs.$.updateDate': new Date() }
    };

    const pods = await documents.giveUserPermission(query, update);

    if (pods.length > 0) {
        response.status(200).send(pods);
    } else {
        response.status(400).send({ error: 'There given user is not found!' });
    }
});

router.post("/shared-documents", authHandler.checkToken, async (request, response) => {
    var query = { 'email': request.user.email };
    var pods = await documents.getSharedDocuments(query); // i get an error message

    if (pods.length > 0) {
        response.status(200).send(pods);
    } else {
        response.status(400).send({ error: 'There is no users!' });
    }
});

router.put("/modify-shared-documents", authHandler.checkToken, async (request, response) => {
    var idObj = ObjectId(request.body._id);
    var query = { 'docs._id': idObj };
    var update = {
        $set: {
            'docs.$.title': request.body.title,
            'docs.$.content': request.body.content,
            'docs.$.updateDate': new Date(),
        },
    };
    var options = {
        $set: { 'upsert': true },
    };

    const pods = await documents.modifySharedDocuments(query, update, options);

    if (pods.length > 0) {
        response.status(200).send(pods);
    } else {
        response.status(400).send({ error: 'There is no users!' });
    }
});

module.exports = router;
