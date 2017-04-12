var bodyParser = require('body-parser');
var {User} = require('../models/user.js');
var {authenticate} = require('../middleware/authenticate.js');
const _ = require('lodash');
require('../server.js');

module.exports = function(app) {

app.use(bodyParser.json());

app.post('/users', (req, res) => {
var body = _.pick(req.body, ['email', 'password']);

    var user = new User({
        email: body.email,
        password: body.password
    });
    //Two save requests made, once for the user creation of email and password
    //second request through the generateAuthToken() func which saves the token to that same doc

    user.save().then(() => { //saves the new user to the User collection which then returns a .then call
        //after the doc has been saved, we call the function generateAuthToken() which saves a token 
       return user.generateAuthToken(); //instance of user calling an instance method
       //this is only called once we have a validated succesful creation of a user email and password
       //the function creates an auth token and saves it to the user document (second save request)
       //the success value returned is the token string itself 

    }).then((token) => {
        res.header('x-auth', token).send(user); //custom header with x-, a header we are using for a 
        //specific purpose, we are using a jwt scheme so we using a custom header 
        //takes the token value from the previous success value and sends to user 
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => { //provide validate x-auth token, find the associated user and send that user back
    res.send(req.user);//sending back the user available on req.user we specified in authenticate func
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
   
    User.findByCredentials(body.email, body.password).then((user) => { //send the entered email and password
        //get back the found user 
        user.generateAuthToken().then((token) => {
        //call the function to generate an auth token with the user information the (_id)
            res.header('x-auth', token).send(user); //send the user body back with the auth token
        })
    }).catch((err) => {
        res.status(400).send(err);
    });
   
});

app.delete('/users/me/token', authenticate, (req, res) => {
    //authenticate sends user as req.user, calling removeToken function passing in the req.token
    req.user.removeToken(req.token).then(() => {
        res.status(200).send('Succesfully deleted token');
    }, () => {
        res.status(400).send();
    });
});


}