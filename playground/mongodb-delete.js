// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); //creates a new variable called MongoClient, setting it to


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
      return console.log('Unable to connect to mongodb server');

    }
    console.log('Connected to MongoDb server');

// db.collection('Todos').find().toArray().then((result) => {
//     console.log(JSON.stringify(result, undefined, 2));
// })

//#deleteMany - deletes all with the specified criteria in the query 

// db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
//     console.log(result);
// });

//#deleteOne - deletes the first item it sees that matches the criteria

// db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
//     console.log(result);
// });

//#findOneAndDelete - Deletes by finding one and shows the document

    // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // })

// db.collection('Users').deleteMany({name: 'Tesla'}).then((result) => {
//     console.log('Deleted successfuly', result.result);
// })

db.collection('Users').findOneAndDelete({_id: new ObjectID('58d1931c9e1413ad08a7c8ba')}).then((result) => {
    console.log(result);
})


   // db.close();
});
