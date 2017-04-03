var mongoose = require('mongoose');
var validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
};//SO everytime from the api end points theres a res.send it will only SEND BACK to user the id and email 
//because of the modified toJSON method which in turn modified JSON.stringify which is associated with res.send()

UserSchema.methods.generateAuthToken = function () { //UserSchema.`methods` is an instance method
    //instance methods get called with the individual document 
    //create a variable to make it clear that 'this' was actually just the user instance
    //so instead of this._id or this.tokens or this.save().then(() => {})
    var user = this; //`this` refers to the instance created 
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(), access: access}, process.env.JWT_SECRET).toString();

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
    }) //saves the new generated token to database then returns the token as sucess argument 

};

UserSchema.methods.removeToken = function (token) {
    var user = this;

   return user.update({
        $pull: { //$pull lets you remove items from an array that match certain criteria 
            tokens: { //pulling from the tokens array in the user document 
                //pull any object from the array that has a token property equal to the token argument passed in above
                token: token //if token does match something in the array it will remove the entire object so the _id, access and token property 
            }
        }
    })
};

UserSchema.statics.findByToken = function (token) { //UserSchema.`statics` is a model method not instance 
    var User = this; //model methods get called with the model as `this` binding 
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET); //takes the token and the secret to verify token 
    }catch (err) { //if err in verification reject stop function
        return Promise.reject(); //can add a value which will be used in the catch err argument
        // return new Promise((resolve, reject) => {
        //     reject(); //if there is an error the promise will return reject which will not
        //     //let the success case continue in server.js
        // });
    }

    return User.findOne({ //otherwise find the user by the id provided by jwt.verify method which provides the user id once verified
        _id: decoded._id, //jwt.verify returns id and iat setting the query _id to that value
        'tokens.token': token, //querying a nested document so we wrap it in quotes, so its 'tokens.token'
        //that value is the token from above, this is also a mongoose query syntax where it basically
        //says if any object in the tokens array has a token property equal to x and an access property
        //equal to y then do something
        //syntax specifically looks through all objects in the tokens array thats why we dont
        //specify the index something like 'tokens[0].token'
        'tokens.access': 'auth'
        //querying tokens.token and tokens.access for added measure making sure they are all the same 
        //RETURNS the user document pertaining to the given information 
    }); 

}

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email: email}).then((user) => {
        //grabs the email and password passed in parameters, uses findOne, to see if email exists
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
        //if user exists then we compare the passed in password to the password saved in the specified
        //document (which is hashed) and send back a true or false response
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user); //resolves with the user success case above when the doc is found and
                    //password comparison is true 
                }else {
                    reject(err);
                }
            })
        })
    });
}

UserSchema.pre('save', function (next) {//executed before the 'save' event saving doc to db
//so before the user instance document is saved to db we want to make some changes to the instance 
    var user = this;

   if (user.isModified('password')) { //only want to hash if password property modified
    bcrypt.genSalt(10, (err, salt) => { //generates a salt 10 rounds with callback
        bcrypt.hash(user.password, salt, (err, hash) => { // hashes using the user.password input and generated salt
            user.password = hash; //sets the user.password property to the new hash value
            next();
        });
    });
   }else {  
       next();
   }

}); //before we save the document to db we add some middleware that makes changes to certain properties



var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
}