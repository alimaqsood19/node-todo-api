// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); //creates a new variable called MongoClient and ObjectID, setting it to
//the property inside the require mongodb 

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
      return console.log('Unable to connect to mongodb server');

    }
    console.log('Connected to MongoDb server');

//#findOneAndUpdate 

db.collection('Todos').findOneAndUpdate({
    _id: new ObjectID('58d0bf389576c440cf748f9b')
}, {
    $set: {
        completed: false
    }
}, {
    returnOriginal: false //gives back updated document 
}).then((result) => {
    console.log(result);
});

db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('58d1932e9e1413ad08a7c8c7')
}, {
    $set: {
        name: 'Alfred'
    },
    $inc: {age: +2}
}, {
    returnOriginal: false
}).then((result) => {
    console.log(result);
});

   // db.close();
});
