// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); //creates a new variable called MongoClient, setting it to


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
      return console.log('Unable to connect to mongodb server');

    }
    console.log('Connected to MongoDb server');

    // db.collection('Todos').find({
    //     _id: new ObjectID('58d0bf389576c440cf748f9b')
    // }).toArray().then((docs) => {//grabs all documents and returns an array of documents or specific queries
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // }) 

    db.collection('Todos').find().count().then((count) => {//grabs all documents and returns an array of documents or specific queries
    console.log(`Todos count: ${count}`);

    }, (err) => {
        console.log('Unable to fetch todos', err);
    }) 

    db.collection('Users').find({name: 'Boob'}).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    })

   // db.close();
});
