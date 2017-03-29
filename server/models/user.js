var mongoose = require('mongoose');
var validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true, //Does not have the same value as any other document (the email field)
        validate: {
            validator: (value) => {
              return validator.isEmail(value) //the value gets run by func to see if its an email
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

//overriding the .toJSON method which calls to JSON.stringify
//So this function will automatically be called when we respond to the express request with res.send
//res.send -> converts our object to JSOn string by calling JSON.stringify -> which calls to toJSON
//when you change the toJSON functionality it changes how JSON.stringify works
//So in this case we say when res.send is called which calls JSON.Stringify which uses toJSON
//Instead we only get the specified objects below 
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject(); //takes mongoose variable 'User' (above, the model) and turns it into a regular
    //object where only the properties available on the document exist

    return _.pick(userObject, ['_id', 'email']); //returns only what the user should see, the email and id
};

UserSchema.methods.generateAuthToken = function () {
    //create a variable to make it clear that 'this' was actually just the user instance
    //so instead of this._id or this.tokens or this.save().then(() => {})
    var user = this; 
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(), access: access}, 'abc123').toString();

    user.tokens.push({
        access: access,
        token: token
    }); //pushes an object to the tokens array above

//here we save the user model, then returns a promise where all we do is return the token String
//since this is a function generateAuthToken(), when its called in server.js the return value is 
//the user.save().then(()) promise chain, where in server.js we can then just tack on another
//promise .then statement using the token string as the value to be used 
   return user.save().then(() => { //allows us to chain on a promise in server.js file
        return token; //this value will be passed on as the success argument for the next .then call
    })

};

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
}