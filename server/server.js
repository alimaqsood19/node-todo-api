var express = require('express');
var bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose.js');

var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

var app = express();

app.use(bodyParser.json());//converts JSON to JS object. So the JSON string that returns from
//the client gets converted into JS object and gets attached to req.body and then we display that

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((doc) => {
        res.send({
            doc: doc //Creating an object that allows us to add other properties 
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {
    app: app
}