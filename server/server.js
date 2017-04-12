require('./config/config.js'); //env variable

var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
const _ = require('lodash');
var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');
var {authenticate} = require('./middleware/authenticate.js');
var todoController = require('./routes/todoController');
var userController = require('./routes/userController');
var app = express();
const port = process.env.PORT; 

app.use(bodyParser.json());//converts JSON to JS object. So the JSON string that returns from
//the client gets converted into JS object and gets attached to req.body and then we display that

todoController(app);
userController(app);

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {
    app: app
}