require('./config/config.js'); 

var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
const _ = require('lodash');
const hbs = require('hbs');
const path = require('path');

const publicPath = path.join(__dirname, '../public');

var {mongoose} = require('./db/mongoose.js');

var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');
var {authenticate} = require('./middleware/authenticate.js');

var app = express();
const port = process.env.PORT; 


app.set('view engine', 'hbs');
//setting view engine


app.use(bodyParser.json());//converts JSON to JS object. So the JSON string that returns from
//the client gets converted into JS object and gets attached to req.body and then we display that

app.use(bodyParser.urlencoded({extended: true})); //pulls http POST content

app.use(express.static(publicPath));


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

    res.render('user.hbs', {
        userEmail: body.email,
        password: body.password
    })
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

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {
    app: app
}