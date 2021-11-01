const express = require('express');
const router = express.Router();
const auth = require("../models/auth.model.js");
const tokens = require("../models/tokens.model.js");

const bcrypt = require('bcryptjs');
const saltRounds = 10;

const jwt = require('jsonwebtoken');


router.post("/token", async (request, response) => {
    const refreshToken = request.body.token;

    if (refreshToken == null) {
        return response.sendStatus(401);
    }

    const res1 = await tokens.findToken({ 'token': refreshToken });

    if (res1 == null) {
        return response.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, user) => {
        if (err) {
            return response.sendStatus(403);
        } else {
            const accessToken = generateAccessToken({ email: user.email });

            response.json({ accessToken: accessToken });
        }
    });
});


router.post("/login", async (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    const emailQuery = {
        email: email
    };

    const pods = await auth.login(emailQuery);

    const accessToken = generateAccessToken(emailQuery);

    const refreshToken = jwt.sign(emailQuery, process.env.JWT_SECRET_REFRESH);

    await tokens.insertToken({ 'token': refreshToken });

    var checkEmail = await auth.login({ 'email': email });

    if (checkEmail == null) {
        response.status(401).send({ error: 'Email not found' });
    }

    bcrypt.compare(password, pods.password, function (err, res) {
        if (res == true) {
            response.status(200).send({ 'token': accessToken, 'refreshToken': refreshToken });
        } else {
            response.status(401).send({ error: 'Invalid Password' });
        }
    });
});


function generateAccessToken(emailQuery) {
    return jwt.sign(emailQuery, process.env.JWT_SECRET, { expiresIn: '3h' });
}


router.post("/logout", async (request, response) => {
    const res = await tokens.deleteToken({ 'token': request.body.token });

    if (Object.values(res)[1] == 0) {
        return response.sendStatus(403);
    }
    return response.sendStatus(204);
});



router.post("/register", async (request, response) => {
    const firstName = request.body.firstName;
    const lastName = request.body.lastName;
    const email = request.body.email;
    const password = request.body.password;

    var registerObj;
    var pods;

    const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const checkEmail = await auth.login({ 'email': email });

    if (checkEmail !== null) {
        return response.status(400).send({ error: "User is already registered" });
    } else if (firstName.length >= 2 && lastName.length >= 2 &&
        emailPattern.test(String(email).toLowerCase()) && password.length >= 6) {
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            registerObj = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hash
            };
            pods = await auth.registerAUser(registerObj);
            response.status(200).send(pods);
        });
    } else {
        response.status(400).send({ error: "Not valid registration" });
    }
});

module.exports = router;
