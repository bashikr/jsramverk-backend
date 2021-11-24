var express = require('express');
var router = express.Router();
const urlencodedParser = express.urlencoded({ extended: true });
const authHandler = require('../middleware/auth.handler');
const emailService = require('../models/sendgrid.model.js');


router.post("/", authHandler.checkToken, urlencodedParser, async (request, response) => {
    const email = request.body.email;
    const title = request.body.title;
    const userEmail = request.user.email;
    const userId = request.body.id;

    const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (typeof (request.body.email) === 'string' &&
        emailPattern.test(String(email).toLowerCase())) {
        const pods = await emailService.sendEmail(email, userEmail, title, userId);

        response.status(201).send(pods);
    } else {
        response.status(400).send({ error: 'Email should be of type string with correct format' });
    }
});

module.exports = router;
