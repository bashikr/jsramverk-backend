process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const createConnection = require("../connection-mongodb/db.js");
const sinon = require('sinon');

chai.should();
chai.use(chaiHttp);

var collectionName = "docs";

describe('Test the functionality of documents API', () => {
    var id = '';
    var correctUser = true;
    var auth = require('../middleware/auth.handler');

    sinon.stub(auth, 'checkToken')
        .callsFake(function (req, res, next) {
            if (correctUser == true) {
                req.user = { 'email': 'test@test.se' };
            } else {
                req.user = { 'email': 'unauthorized user' };
            }
            return next();
        });

    // after you can create app:
    var server = require('../app.js');


    before(async () => {
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
            });
    });

    // get sure that the collection you want to test is empty before you execute this test
    // install sinon or nock
    describe('GET /documents', () => {
        it('400 BAD PATH (Throws an error when the documents collection is empty)', () => {
            chai.request(server)
                .get("/documents")
                .then(function (res) {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error').eq('Document collection is empty');
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    describe('POST /documents/create-doc', () => {
        it('201 HAPPY PATH', () => {
            let document = {
                '_method': 'post',
                'title': 'Test create document',
                'content': 'creation content',
                'docType': 'text',
                'creationDate': new Date()
            };

            chai.request(server)
                .post("/documents/create-doc")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .send(document)
                .then(function (res) {
                    res.should.have.status(201);
                }).catch(function (err) {
                    throw err;
                });
        });

        it('400 BAD PATH (Title and content should be of type string)', () => {
            let wrongTitleType = 123;
            let document = {
                '_method': 'post',
                'title': wrongTitleType,
                'content': 'creation content',
                'creationDate': new Date()
            };

            chai.request(server)
                .post("/documents/create-doc")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .send(document)
                .then(function (res) {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error')
                        .eq('Title and content should be of type string');
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    describe('GET /documents', () => {
        it('200 HAPPY PATH', () => {
            chai.request(server)
                .get("/documents")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.length.should.be.above(0);
                    for (let item in res.body) {
                        res.body[item].should.be.an("object");
                        id = res.body[0]._id;
                    }
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    console.log(id);
    describe('GET /documents/:id', () => {
        it('200 HAPPY PATH', () => {
            chai.request(server)
                .get("/documents/" + id)
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("_id");
                    res.body.should.have.property("title");
                    res.body.should.have.property("content");
                    res.body.should.have.property("creationDate");
                }).catch(function (err) {
                    throw err;
                });
        });
        it('404 SAD PATH (Requested document is not found)', () => {
            let fakeId = "123456789123";

            chai.request(server)
                .get("/documents/" + fakeId)
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error').eq('Requested document is not found');
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    describe('PUT /documents/update-doc', () => {
        it('201 HAPPY PATH', () => {
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
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                }).catch(function (err) {
                    throw err;
                });
        });
        var invalidTitle = 1;
        var invalidContent = 1;

        it('400 SAD PATH (title and content not of type string)', () => {
            let updateDocument = {
                '_method': 'put',
                '_id': id,
                'title': invalidTitle,
                'content': invalidContent,
                'updateDate': new Date()
            };

            chai.request(server)
                .put("/documents/update-doc")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .send(updateDocument)
                .then(function (res) {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property('error');
                    res.body.should.have.property('error')
                        .eq('Title and content should be of type string');
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    describe('GET allow-user/:id/:emailSender/:emailReceiver', () => {
        it('200 HAPPY PATH', () => {
            var emailSender = 'test@test.se';
            var emailReceiver = 'bashikr@gmail.com';

            chai.request(server)
                .get("/documents/allow-user/" + id + "/" + emailSender + "/" + emailReceiver)
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(200);
                    res.redirects.should.include(
                        'http://www.student.bth.se/~baaa19/editor-angular/');
                })
                .catch(function (err) {
                    throw err;
                });
        });
    });

    describe('POST shared-documents', () => {
        it('200 HAPPY PATH', () => {
            chai.request(server)
                .post("/documents/shared-documents")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(200);
                })
                .catch(function (err) {
                    throw err;
                });
        });

        it('400 BAD PATH', () => {
            correctUser = false;
            chai.request(server)
                .post("/documents/shared-documents")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(400);
                })
                .catch(function (err) {
                    throw err;
                });
        });
    });

    describe('DELETE /documents/delete-doc', () => {
        it('200 HAPPY PATH', () => {
            chai.request(server)
                .delete("/documents/delete-doc/" + id)
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(200);
                })
                .catch(function (err) {
                    throw err;
                });
        });

        it('404 SAD PATH', () => {
            let fakeId = "123456789123";

            chai.request(server)
                .delete("/documents/delete-doc/" + fakeId)
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .then(function (res) {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    res.body.should.have.property('error')
                        .eq('The given document id is not found');
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    describe('Send Emails', () => {
        it('Send Email succeed 201', () => {
            let document = {
                'id': '123123123123',
                '_method': 'post',
                'title': 'test email ',
                'email': 'bashikr@gmail.com',
            };

            chai.request(server)
                .post("/collaboration-invite")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .send(document)
                .then(function (res) {
                    res.should.have.status(201);
                }).catch(function (err) {
                    throw err;
                });
        });

        it('Send Email fail 400', () => {
            let document = {
                'id': '123123123123',
                '_method': 'post',
                'title': 'test email ',
                'email': 1,
            };

            chai.request(server)
                .post("/collaboration-invite")
                .set('Authorization', 'Bearer ' + auth.checkToken)
                .send(document)
                .then(function (res) {
                    res.should.have.status(400);
                }).catch(function (err) {
                    throw err;
                });
        });
    });
});
