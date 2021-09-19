var express = require('express');
var router = express.Router();

router.get('/', function (request, response, next) {
    const data = {
        data: {
            msg: "Hello Webbis"
        }
    };

    response.json(data);
});

module.exports = router;
