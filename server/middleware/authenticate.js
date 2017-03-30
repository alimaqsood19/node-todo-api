var {User} = require('../models/user');

module.exports = {
    authenticate: function (req, res, next) {
    var token = req.header('x-auth') //fetches the header sent by user to verify token to fetch user info

    User.findByToken(token).then((user) => { //calls findByToken gets back user Document from DB
        if (!user) {
            return Promise.reject(); //if no user found reject
        }
        req.user = user; //sets req.user to the user we just found from the promise then call 
        req.token = token; //sets req.token to the token from the promise call 
        next(); //calls next for the middle ware to continue
    }).catch((err) => {
        res.status(401).send('Unauthorized')
    });
    }
}
