var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
const _ = require('lodash');



var {mongoose} = require('./db/mongoose.js');

var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

var app = express();
const port = process.env.PORT || 3000; 

app.use(bodyParser.json());//converts JSON to JS object. So the JSON string that returns from
//the client gets converted into JS object and gets attached to req.body and then we display that

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((todos) => {
        res.send(todos);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos: todos //Creating an object that allows us to add other properties 
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid User');
    }

    Todo.findById({_id: id}).then((todo) => {
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

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid User ID');
    }

    Todo.findByIdAndRemove(id).then((todo) => {
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

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']); //_.pick picks properties off a specified obj
    var invalidFields = _.pick(req.body, ['_id', 'completedAt']);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid User ID');
    }

    if (invalidFields._id || invalidFields.completedAt) {
            return res.status(404).send('Denied request to change _id and completedAt fields');
        }

    if (_.isBoolean(body.completed) && body.completed) {
        
        //this will run if body.completed is a boolean and is true
        body.completedAt = new Date().getTime(); //returns a JS timestamp 
        //if conditionals met then body.completedAt will give user a timestamp of completion
    }else {
        body.completed = false;
        body.completedAt = null;
        //otherwise set the completed and completedAt properties to default
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send('No Todo Found');
        }

        res.send({
            todo:todo 
        });
    }).catch((err) => {
        res.status(400).send('Invalid ID');
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {
    app: app
}