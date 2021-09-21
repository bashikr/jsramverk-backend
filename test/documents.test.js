process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();
chai.use(chaiHttp);

const createConnection = require("../connection-mongodb/db");

let config;

try {
    config = require("../connection-mongodb/config.json");
} catch (err) {
    console.error(err);
}

const collectionName = config.docsCollection;

let id = '';

describe('Test the functionality of documents API', () => {
    before(() => {
        return new Promise(async (resolve) => {
            const db = await createConnection(collectionName);

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
                    resolve();
                });
        });
    });

    describe('GET /documents', () => {
        it('400 SAD PATH (Throws an error when the documents collection is empty)', (done) => {
            chai.request(server)
                .get("/documents")
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error').eq('Document collection is empty');
                    done();
                });
        });
    });

    describe('POST /documents/create-doc', () => {
        it('201 HAPPY PATH', (done) => {
            let document = {
                '_method': 'post',
                'title': 'Test create document',
                'content': 'creation content',
                'creationDate': new Date()
            };

            chai.request(server)
                .post("/documents/create-doc")
                .send(document)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    done();
                });
        });
        it('400 BAD PATH (Title and content should be of type string)', (done) => {
            let wrongTitleType = 123;
            let document = {
                '_method': 'post',
                'title': wrongTitleType,
                'content': 'creation content',
                'creationDate': new Date()
            };

            chai.request(server)
                .post("/documents/create-doc")
                .send(document)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error')
                        .eq('Title and content should be of type string');
                    done();
                });
        });
    });

    describe('GET /documents', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/documents")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.length.should.be.above(0);
                    for (let item in res.body) {
                        res.body[item].should.be.an("object");
                        id = res.body[0]._id;
                    }

                    done();
                });
        });
    });




    describe('GET /documents/:id', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/documents/" + id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("_id");
                    res.body.should.have.property("title");
                    res.body.should.have.property("content");
                    res.body.should.have.property("creationDate");
                    done();
                });
        });
        it('404 SAD PATH (Requested document is not found)', (done) => {
            let fakeId = "123456789123";

            chai.request(server)
                .get("/documents/" + fakeId)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error').eq('Requested document is not found');
                    done();
                });
        });
    });

    describe('PUT /documents/update-doc', () => {
        it('201 HAPPY PATH', (done) => {
            let updateDocument = {
                '_method': 'put',
                '_id': id,
                'title': 'Test update document',
                'content': 'update content',
                'updateDate': new Date()
            };

            chai.request(server)
                .put("/documents/update-doc")
                .send(updateDocument)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    done();
                });
        });
        var invalidTitle = 1;
        var invalidContent = 1;

        it('400 SAD PATH (title and content not of type string)', (done) => {
            let updateDocument = {
                '_method': 'put',
                '_id': id,
                'title': invalidTitle,
                'content': invalidContent,
                'updateDate': new Date()
            };

            chai.request(server)
                .put("/documents/update-doc")
                .send(updateDocument)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error')
                        .eq('Title and content should be of type string');
                    done();
                });
        });
    });

    describe('DELETE /documents/delete-doc', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .delete("/documents/delete-doc/" + id)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('400 SAD PATH', (done) => {
            chai.request(server)
                .delete("/documents/delete-doc/" + id)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('error');
                    res.body.should.have.property('error')
                        .eq('The given document id is invalid');
                    done();
                });
        });
    });
});
