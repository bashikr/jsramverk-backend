const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function checkToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];

        jwt.verify(bearerToken, secret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            } else {
                req.user = user;
                // res.json({ user });
                next();
            }
        });
    } else {
        return res.sendStatus(401);
    }
}

module.exports = {
    checkToken: checkToken
};
