const {ObjectID} = require('mongodb');
const {mongoose} = require('../server/db/mongoose.js');
const {Todo} = require('../server/models/todo.js');
const {User} = require('../server/models/user.js')

// Todo.remove similar to Todo.find() you pass in a query that removes those specifically 

// Todo.remove({}).then((result) => {
//     console.log(result);
// });

//Todo.findOneAndRemove  //Queries the first document it finds and removes it, then returns that 
                        //object back as a result to let us print to screen or return to user to show
                        //what was removed 

//Todo.findByIdAndRemove //Finds ID and removes it by ID

Todo.findOneAndRemove({_id: '58d6ee999e1413ad08a844c8'}).then((todo) => {

});

Todo.findByIdAndRemove('58d6ee999e1413ad08a844c8').then((todo) => { //works same as FindOneAndRemove
    console.log(todo);
});