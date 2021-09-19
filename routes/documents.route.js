var express = require('express');
var router = express.Router();
const urlencodedParser = express.urlencoded({ extended: true });

const documents = require("../models/documents.model.js");
const { ObjectId } = require('bson');

router.get("/", async (request, response) => {
    try {
        const pods = await documents.printAllDocs()
        response.status(201).send(pods);
        response.json(pods);
    } catch (err) {
        response.status(400).send({ error: err });
        response.json(err);
    }
});

router.get("/:id", async (request, response) => {
    let idObj = ObjectId(request.params.id)

    var query = { '_id': idObj };
    try {
        const pods = await documents.printOneDoc(query)
        response.status(201).send(pods);
        response.json(pods);
    } catch (err) {
        response.status(400).send({ error: err });
        response.json(err);
    }
});

router.post("/create-doc", urlencodedParser, async (request, response) => {
    const docInsertionOrder = {
        'title': request.body.title,
        'content': request.body.content,
        'creationDate': new Date()
    }

    try {
        const pods = await documents.insertADoc(docInsertionOrder)

        response.status(201).send(pods);
    } catch (err) {
        response.status(400).send({ error: err });
    }
});

router.put("/update-doc", urlencodedParser, async (request, response) => {
    let idObj = ObjectId(request.body._id)
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

    if (request.body._id) {
        try {
            const pods = await documents.updateADoc(query, update, options)
            response.status(201).send(pods);
        } catch (err) {
            response.status(400).send({ error: err });
        }
    }
});

router.delete("/delete-doc/:id", urlencodedParser, async (request, response) => {
    let res = ObjectId(request.params.id)
    var query = { '_id': res };

    try {
        const pods = await documents.deleteADoc(query)
        response.status(201).send(pods);
    } catch (err) {
        response.status(400).send({ error: err });
    }
});

module.exports = router;