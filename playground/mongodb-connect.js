// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); //creates a new variable called MongoClient, setting it to
//the property 'MongoClient' in require mongodb, same thing as line above 

// var obj = new ObjectID(); //creates a new instance of ObjectID or a new object created 
// console.log(obj); //can generate our own ObjectId 

// var user = {name: "Greg", age: 25};
// var {name} = user;
// console.log(name);
// var {age} = user;
// console.log(age);
//Object deconstruction, grabbing a value from an object and setting it to a new variable 

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
      return console.log('Unable to connect to mongodb server');
      //using a return statement, if err does exist anything after the conditional will not execute
      //nothing executes after a return statement 
    }
    console.log('Connected to MongoDb server');

    // db.collection('Todos').insertOne({ //inserts a document into the collection Todos, takes the
    //     //object to be inserted and then a callback
    //     text: 'Something to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //       return console.log('Unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2)) //ops attribute stores all the documents 
    // });

    // db.close();

    // db.collection('Users').insertOne({
    //     name: 'Boob',
    //     age: 23,
    //     location: 'Canada'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert User');
    //     }
    //     console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
    // });

    db.close();
});
//connects to the database, can be local or heroku