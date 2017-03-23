const {ObjectID} = require('mongodb');
const {mongoose} = require('../server/db/mongoose.js');
const {Todo} = require('../server/models/todo.js');
const {User} = require('../server/models/user.js')

var id = '58d331a7e7dbe233a8f4fd6b';
var userID = '58d19fb5c21a0b272cd3da56';

if (!ObjectID.isValid(id)) {
    console.log('ID not valid');
}

Todo.find({
    _id: id //mongoose converts the string id into an objectID so we dont have to
}).then((todos) => {
    if (todos.length < 1) {
        return console.log('ID not found');
    }
    console.log('Todos', todos);
});

Todo.findOne({
    _id: id //mongoose converts the string id into an objectID so we dont have to
}).then((todo) => {
    if (!todo) {
        return console.log('ID not found');
    }
    console.log('Todo', todo);
});

Todo.findById({
    _id: id
}).then((todo) => {
    if (!todo) {
        return console.log('ID not found');
    }
    console.log('Todo by ID', todo);
}).catch((err) => {
    console.log(err);
});

User.findById({
    _id: userID
}).then((user) => {
    if (!user) {
        return console.log('No user with that ID found');
    }
    console.log(JSON.stringify(user, undefined, 2))
}, (err) => {
    console.log(err);
});
