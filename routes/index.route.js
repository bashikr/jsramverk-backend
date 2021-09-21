var express = require('express');
var router = express.Router();

router.get('/',  (request, response) => {
    response.status(200).send({ message: 'Hello Webbis' });
});

module.exports = router;
