var {User} = require('../models/user');

module.exports = {
    authenticate: function (req, res, next) {
    var token = req.header('x-auth') //fetches the header to verify token to fetch user

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user; //sets req.user to the user we just found from the promise then call 
        req.token = token;
        next();
    }).catch((err) => {
        res.status(401).send('Unauthorized')
    });
    }
}
