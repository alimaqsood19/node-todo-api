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

UserSchema.methods.generateAuthToken = function () { //UserSchema.`methods` is an instance method
    //instance methods get called with the individual document 
    //create a variable to make it clear that 'this' was actually just the user instance
    //so instead of this._id or this.tokens or this.save().then(() => {})
    var user = this; //`this` refers to the instance created 
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

UserSchema.statics.findByToken = function (token) { //UserSchema.`statics` is a model method not instance 
    var User = this; //model methods get called with the model as `this` binding 
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    }catch (err) {
        return Promise.reject(); //can add a value which will be used in the catch err argument
        // return new Promise((resolve, reject) => {
        //     reject(); //if there is an error the promise will return reject which will not
        //     //let the success case continue in server.js
        // });
    }

    return User.findOne({
        _id: decoded._id, //jwt.verify returns id and iat setting the query _id to that value
        'tokens.token': token, //querying a nested document so we wrap it in quotes, so its 'tokens.token'
        //that value is the token from above, this is also a mongoose query syntax where it basically
        //says if any object in the tokens array has a token property equal to x and an access property
        //equal to y then do something
        //syntax specifically looks through all objects in the tokens array thats why we dont
        //specify the index something like 'tokens[0].token'
        'tokens.access': 'auth'
    }); 

}

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
}