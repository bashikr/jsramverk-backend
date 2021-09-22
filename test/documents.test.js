process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const createConnection = require("../connection-mongodb/db.js");

chai.should();
chai.use(chaiHttp);

var collectionName= "docs";
var db;
var id = '';


// get sure that the collection you want to test is empty before you execute this test
describe('Test the functionality of documents API', () => {
    before(() => {
        async () => {
            db = await createConnection(collectionName);

            db.db.listCollections(
                { name: collectionName }
            )
                .next()
                .then(async function (info) {
                    if (info) {
                        await db.collection.drop();
                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
                .finally(async function () {
                    await db.client.close();
                });
        };
    });

    describe('GET /documents', () => {
        it('400 BAD PATH (Throws an error when the documents collection is empty)', async () => {
            const res = await chai.request(server)
                .get("/documents");

            console.log(res.body);
            res.should.have.status(400);
            res.body.should.be.an("object");
            res.body.should.have.property('error');
            res.body.should.have.property('error').eq('Document collection is empty');
        });
    });

    describe('POST /documents/create-doc', () => {
        it('201 HAPPY PATH', async () => {
            let document = {
                '_method': 'post',
                'title': 'Test create document',
                'content': 'creation content',
                'creationDate': new Date()
            };

            const res = await chai.request(server)
                .post("/documents/create-doc")
                .send(document);

            res.should.have.status(201);
            res.body.should.be.an("object");
        });
        it('400 BAD PATH (Title and content should be of type string)', async () => {
            let wrongTitleType = 123;
            let document = {
                '_method': 'post',
                'title': wrongTitleType,
                'content': 'creation content',
                'creationDate': new Date()
            };

            const res = await chai.request(server)
                .post("/documents/create-doc")
                .send(document);

            res.should.have.status(400);
            res.body.should.be.an("object");
            res.body.should.have.property('error');
            res.body.should.have.property('error')
                .eq('Title and content should be of type string');
        });
    });

    describe('GET /documents', () => {
        it('200 HAPPY PATH', async () => {
            const res = await chai.request(server)
                .get("/documents");

            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.above(0);
            for (let item in res.body) {
                res.body[item].should.be.an("object");
                id = res.body[0]._id;
            }
        });
    });

    describe('GET /documents/:id', () => {
        it('200 HAPPY PATH', async () => {
            const res = await chai.request(server)
                .get("/documents/" + id);

            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.should.have.property("_id");
            res.body.should.have.property("title");
            res.body.should.have.property("content");
            res.body.should.have.property("creationDate");
        });
        it('404 SAD PATH (Requested document is not found)', async () => {
            let fakeId = "123456789123";

            const res = await chai.request(server)
                .get("/documents/" + fakeId);

            res.should.have.status(404);
            res.body.should.be.an("object");
            res.body.should.have.property('error');
            res.body.should.have.property('error').eq('Requested document is not found');
        });
    });

    describe('PUT /documents/update-doc', () => {
        it('201 HAPPY PATH', async () => {
            let updateDocument = {
                '_method': 'put',
                '_id': id,
                'title': 'Test update document',
                'content': 'update content',
                'updateDate': new Date()
            };

            const res = await chai.request(server)
                .put("/documents/update-doc")
                .send(updateDocument);

            res.should.have.status(201);
            res.body.should.be.an("object");
        });
        var invalidTitle = 1;
        var invalidContent = 1;

        it('400 SAD PATH (title and content not of type string)', async () => {
            let updateDocument = {
                '_method': 'put',
                '_id': id,
                'title': invalidTitle,
                'content': invalidContent,
                'updateDate': new Date()
            };

            const res = await chai.request(server)
                .put("/documents/update-doc")
                .send(updateDocument);

            res.should.have.status(400);
            res.body.should.be.an("object");
            res.body.should.have.property('error');
            res.body.should.have.property('error')
                .eq('Title and content should be of type string');
        });
    });

    describe('DELETE /documents/delete-doc', () => {
        it('200 HAPPY PATH', async () => {
            const res = await chai.request(server)
                .delete("/documents/delete-doc/" + id);

            res.should.have.status(200);
        });

        it('404 SAD PATH', async () => {
            let fakeId = "123456789123";

            const res = await chai.request(server)
                .delete("/documents/delete-doc/" + fakeId);

            res.should.have.status(404);
            res.body.should.have.property('error');
            res.body.should.have.property('error')
                .eq('The given document id is not found');
        });
    });
});
