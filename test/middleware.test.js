process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();
chai.use(chaiHttp);

describe('Test the functionality of middleware', () => {
    describe('GET /f', () => {
        it('404 PATH NOT FOUND', (done) => {
            chai.request(server)
                .get("/f")
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    done();
                });
        });
    });
});
