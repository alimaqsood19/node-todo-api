const {ObjectID} = require('mongodb');
const {Todo} = require('../../models/todo.js');
const {User} = require('../../models/user.js');
const jwt = require('jsonwebtoken');

const todos = [{ //seed data 
    _id: new ObjectID(),
    text: 'Walk your dog'
}, {
    _id: new ObjectID(),
    text: 'Walk your alligator',
    completed: true,
    completedAt: 123
}];

const userOneId = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'alimaq@hotmail.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoID,
    email: 'ali2@hotmail.com',
    password: 'userTwoPass'
    //This one gets no token cuz the second user case is supposed to fail 
}];

const populateTodos = (done) => { //data base gets emptied before every request 
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => {
        done();
    });
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save(); //creates new instance of User from the model, grabs
        //userOne seed data from above by indicating the index of the users array and then 
        //calling the mongoose .save() method which will trigger the pre(save) event middleware 
        //which will in turn hash the password 
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]); //Promise.all waits for all the promises to be resolved or rejected
        //and then once both promises are finished we can call .then and call done();
        //promise.all waits for all promises to be completed rejected or resolved 
    }).then(() => {
        done();
    });
};

module.exports = {
    todos: todos,
    populateTodos: populateTodos,
    populateUsers: populateUsers,
    users: users
}