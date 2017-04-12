var {Todo} = require('../models/todo.js')
var bodyParser = require('body-parser');
var {authenticate} = require('../middleware/authenticate.js');
const _ = require('lodash');
require('../server.js');

module.exports = function(app) {

    app.use(bodyParser.json());

    app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id //this information passed in from authenticate, since authenticate 
        //authenticates the token and passes back the user id associated with that token 
        //When we create a user, it generates an authentication token, that token gets saved to the DB
        //That token also gets sent back to the client to make other requests
        //So when the client requests to posts todos, it has to send the same token where it gets
        //authenticated by the authenticate middlware and then sets the newly created Todo field value
        //_creator to equal that Users ID
    });
    todo.save().then((todos) => {
        res.send(todos);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        //same here, the authentication token sent through header, gets verified and sets the id of the user
        //to equal the _creator field so todo documents only with that specified USER (_creator) id get shown
        _creator: req.user._id //only returning todos that the user who is logged in created - pertaining to ID
    }).then((todos) => {
        res.send({
            todos: todos //Creating an object that allows us to add other properties 
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid User');
    }

    Todo.findOne({
        _id: id, //id of the todo document 
        _creator: req.user._id //from the authenticate middleware the _id returned 
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send('Not found');
        }
        res.send({
            todo: todo
        });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid User ID');
    }

    Todo.findOneAndRemove({ //querying based on todo id and user (_creator) id
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send('User not found');
        }
        res.send({
            todo: todo
        });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

//When you wanna update a resource

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']); //_.pick picks properties off a specified obj
    var invalidFields = _.pick(req.body, ['_id', 'completedAt']);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid User ID');
    }

    if (invalidFields._id || invalidFields.completedAt) {
            return res.status(404).send('Denied request to change _id and completedAt fields');
        }//making sure client does not try and alter the id or completedAt fields 

    if (_.isBoolean(body.completed) && body.completed) {
        
        //this will run if body.completed is a boolean and is true
        body.completedAt = new Date().getTime(); //returns a JS timestamp 
        //if conditionals met then body.completedAt will give user a timestamp of completion
    }else {
        body.completed = false;
        body.completedAt = null;
        //otherwise set the completed and completedAt properties to default
    }

    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
      // The $set operator replaces the value of a field with the specified value
      // find by the specified id, {parameter to be changed in this case setting entire body, if fields dont exist it will still add}
      // {new: true} returns the modified document rather the original
        if (!todo) {
            return res.status(404).send('No Todo Found');
        }
        res.send({
            todo:todo //sends updated document 
        });
    }).catch((err) => {
        res.status(400).send('Invalid ID');
    });
});

    
}