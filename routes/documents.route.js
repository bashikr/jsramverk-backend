var express = require('express');
var router = express.Router();
const urlencodedParser = express.urlencoded({ extended: true });

const documents = require("../models/documents.model.js");
const { ObjectId } = require('bson');

router.get("/", async (request, response) => {
    const pods = await documents.printAllDocs();

    if (pods.length > 0) {
        response.status(200).send(pods);
    } else {
        response.status(400).send({ error: 'Document collection is empty' });
    }
});

router.get("/:id", async (request, response) => {
    let idObj = ObjectId(request.params.id);
    var query = { '_id': idObj };

    let pods = await documents.printOneDoc(query);

    if (pods === null) {
        return response.status(404).send({ error: 'Requested document is not found' });
    } else {
        return response.status(200).send(pods);
    }
});

router.post("/create-doc", urlencodedParser, async (request, response) => {
    const docInsertionOrder = {
        'title': request.body.title,
        'content': request.body.content,
        'creationDate': new Date()
    };

    if (typeof (request.body.title) === 'string' && typeof (request.body.content) === 'string') {
        const pods = await documents.insertADoc(docInsertionOrder);

        response.status(201).send(pods);
    } else {
        response.status(400).send({ error: 'Title and content should be of type string' });
    }
});

router.put("/update-doc", urlencodedParser, async (request, response) => {
    let idObj = ObjectId(request.body._id);
    var query = { '_id': idObj };

    var update = {
        $set: {
            'title': request.body.title,
            'content': request.body.content,
            'updateDate': new Date(),
        }
    };
    var options = {
        $set: { 'upsert': false }
    };

    if (typeof (request.body.title) === 'string' && typeof (request.body.content) === 'string') {
        const pods = await documents.updateADoc(query, update, options);

        response.status(201).send(pods);
    } else {
        response.status(400).send({ error: 'Title and content should be of type string' });
    }
});

router.delete("/delete-doc/:id", urlencodedParser, async (request, response) => {
    let res = ObjectId(request.params.id);
    var query = { '_id': res };

    const pods = await documents.deleteADoc(query);

    if (pods.deletedCount === 1) {
        response.status(200).send(pods);
    } else {
        response.status(404).send({ error: 'The given document id is not found' });
    }
});

module.exports = router;
